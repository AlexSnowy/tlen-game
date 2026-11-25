// Земли Тлена — сервер: раздаёт игру и держит комнаты кооператива (до 3 игроков)
import { DurableObject } from 'cloudflare:workers';
const MAX = 3;


// ---------- Оплата звёздами Telegram (Stars) ----------
// Нужны: секрет BOT_TOKEN (токен бота игры), секрет WEBHOOK_SECRET (любая длинная строка), KV-хранилище PAY.
const ITEMS = { founder: ['Набор основателя', 299], ny: ['Новогодний набор', 59], dyes: ['Краски брони', 49], fx: ['Стихии умений', 79], aura: ['Ауры и следы', 79], pet: ['Спутники-огоньки', 99], portal: ['Облик портала', 49], tab: ['+1 вкладка хранилища', 39], slot: ['+1 место для героя', 39] };
const itemInfo = id => ITEMS[id] || (/^pass_s\d+$/.test(id) ? ['Пропуск сезона', 149] : null);
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, X-Init', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const json = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { 'Content-Type': 'application/json', ...CORS } });
async function hmac(key, data) { const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? new TextEncoder().encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return new Uint8Array(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data))); }
async function tgUser(initData, token) {
  if (!initData || !token) return null;
  const p = new URLSearchParams(initData); const hash = p.get('hash'); p.delete('hash');
  const dcs = [...p.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, v]) => k + '=' + v).join('\n');
  const sec = await hmac('WebAppData', token); const h = [...await hmac(sec, dcs)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (h !== hash) return null; if (Date.now() / 1000 - (+p.get('auth_date') || 0) > 86400 * 7) return null;
  try { return JSON.parse(p.get('user')); } catch { return null; }
}
const bot = (env, m, body) => fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${m}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());
async function payRoute(url, req, env) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (url.pathname === '/tg/webhook') {
    if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) return new Response('no', { status: 403 });
    const u = await req.json();
    if (u.pre_checkout_query) { const q = u.pre_checkout_query; let ok = false; try { ok = !!itemInfo(JSON.parse(q.invoice_payload).i); } catch {} await bot(env, 'answerPreCheckoutQuery', ok ? { pre_checkout_query_id: q.id, ok: true } : { pre_checkout_query_id: q.id, ok: false, error_message: 'Товар не найден' }); }
    const sp = u.message && u.message.successful_payment;
    if (sp) { let pl = {}; try { pl = JSON.parse(sp.invoice_payload); } catch {} const uid = String(pl.u || u.message.from.id); const key = 'u:' + uid; const list = JSON.parse(await env.PAY.get(key) || '[]'); if (!list.some(x => x.c === sp.telegram_payment_charge_id)) { list.push({ i: pl.i, c: sp.telegram_payment_charge_id, t: Date.now() }); await env.PAY.put(key, JSON.stringify(list)); } }
    return new Response('ok');
  }
  if (url.pathname === '/tg/setup') { if (url.searchParams.get('s') !== env.WEBHOOK_SECRET) return new Response('no', { status: 403 }); return json(await bot(env, 'setWebhook', { url: url.origin + '/tg/webhook', secret_token: env.WEBHOOK_SECRET, allowed_updates: ['pre_checkout_query', 'message'] })); }
  const user = await tgUser(req.headers.get('X-Init'), env.BOT_TOKEN);
  if (!user) return json({ error: 'auth' }, 401);
  if (url.pathname === '/tg/invoice' && req.method === 'POST') {
    const { item } = await req.json(); const info = itemInfo(item); if (!info) return json({ error: 'item' }, 400);
    const r = await bot(env, 'createInvoiceLink', { title: info[0], description: 'Земли Тлена: ' + info[0] + '. Только облик и удобство, без влияния на силу героя.', payload: JSON.stringify({ u: user.id, i: item }), currency: 'XTR', prices: [{ label: info[0], amount: info[1] }] });
    return r.ok ? json({ link: r.result }) : json({ error: 'tg' }, 502);
  }
  if (url.pathname === '/tg/purchases') { const list = JSON.parse(await env.PAY.get('u:' + user.id) || '[]'); return json({ items: list.map(x => x.i) }); }
  return json({ error: 'path' }, 404);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/ws\/([A-Z0-9]{4,8})$/i);
    if (m) {
      if (req.headers.get('Upgrade') !== 'websocket') return new Response('Expected websocket', { status: 426 });
      const stub = env.ROOMS.get(env.ROOMS.idFromName(m[1].toUpperCase()));
      return stub.fetch(req);
    }
    if (url.pathname.startsWith('/tg/')) return payRoute(url, req, env);
    if (url.pathname === '/health') return new Response('ok');
    return env.ASSETS.fetch(req);
  }
};

export class Room extends DurableObject {
  sockets() { return this.ctx.getWebSockets().filter(w => { try { return w.deserializeAttachment(); } catch { return false; } }); }
  members() { return this.sockets().map(w => w.deserializeAttachment()).sort((a, b) => a.t - b.t); }
  hostId() { const m = this.members(); return m.length ? m[0].id : null; }
  send(ws, o) { try { ws.send(typeof o === 'string' ? o : JSON.stringify(o)); } catch {} }
  broadcast(o, except) { const s = typeof o === 'string' ? o : JSON.stringify(o); for (const w of this.sockets()) if (w !== except) this.send(w, s); }

  async fetch(req) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    if (this.sockets().length >= MAX) {
      this.ctx.acceptWebSocket(server);
      this.send(server, { t: 'full' });
      server.close(4000, 'full');
      return new Response(null, { status: 101, webSocket: client });
    }
    this.ctx.acceptWebSocket(server);
    const id = crypto.randomUUID().slice(0, 8);
    server.serializeAttachment({ id, t: Date.now() });
    const peers = this.members().map(m => m.id).filter(x => x !== id);
    this.send(server, { t: 'hello', id, host: this.hostId(), peers });
    this.broadcast({ t: 'join', id, host: this.hostId() }, server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, msg) {
    let a; try { a = ws.deserializeAttachment(); } catch { return; }
    if (!a || typeof msg !== 'string' || msg.length > 200000) return;
    let o; try { o = JSON.parse(msg); } catch { return; }
    o.from = a.id;
    if (o.to) { for (const w of this.sockets()) { const b = w.deserializeAttachment(); if (b && b.id === o.to) this.send(w, o); } return; }
    this.broadcast(o, ws);
  }

  async webSocketClose(ws) { this.leave(ws); }
  async webSocketError(ws) { this.leave(ws); }
  leave(ws) {
    let a; try { a = ws.deserializeAttachment(); } catch {}
    try { ws.serializeAttachment(null); } catch {}
    try { ws.close(1000, 'bye'); } catch {}
    if (a) this.broadcast({ t: 'leave', id: a.id, host: this.hostId() }, ws);
  }
}
