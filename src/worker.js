// Земли Тлена — сервер: раздаёт игру и держит комнаты кооператива (до 3 игроков)
import { DurableObject } from 'cloudflare:workers';
const MAX = 3;


// ---------- Оплата звёздами Telegram (Stars) ----------
// Нужен только секрет BOT_TOKEN (токен бота игры). Покупки читаются из истории звёзд бота — отдельная база не нужна.
const ITEMS = { founder: ['Набор основателя', 299], ny: ['Новогодний набор', 59], dyes: ['Краски брони', 49], fx: ['Стихии умений', 79], aura: ['Ауры и следы', 79], pet: ['Спутники-огоньки', 99], portal: ['Облик портала', 49], tab: ['+1 вкладка хранилища', 39], slot: ['+1 место для героя', 39] };
const GAME_URL = 'https://alexsnowy.github.io/tlen-game/';
const itemInfo = id => ITEMS[id] || (/^pass_s\d+$/.test(id) ? ['Пропуск сезона', 149] : null);
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, X-Init', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const json = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { 'Content-Type': 'application/json', ...CORS } });
const hex = a => [...a].map(b => b.toString(16).padStart(2, '0')).join('');
async function hmac(key, data) { const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? new TextEncoder().encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return new Uint8Array(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data))); }
const hookSecret = async env => hex(await hmac('tlen-webhook', env.BOT_TOKEN)).slice(0, 48);
async function tgUser(initData, token) {
  if (!initData || !token) return null;
  const p = new URLSearchParams(initData); const hash = p.get('hash'); p.delete('hash');
  const dcs = [...p.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, v]) => k + '=' + v).join('\n');
  const h = hex(await hmac(await hmac('WebAppData', token), dcs));
  if (h !== hash) return null; if (Date.now() / 1000 - (+p.get('auth_date') || 0) > 86400 * 7) return null;
  try { return JSON.parse(p.get('user')); } catch { return null; }
}
const bot = (env, m, body) => fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${m}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }).then(r => r.json());
async function boughtBy(env, uid) {
  const out = []; const refunded = new Set();
  for (let off = 0; off < 5000; off += 100) {
    const r = await bot(env, 'getStarTransactions', { offset: off, limit: 100 }); const tx = (r.ok && r.result && r.result.transactions) || [];
    for (const t of tx) {
      const pt = t.source && t.source.type === 'user' ? t.source : t.receiver && t.receiver.type === 'user' ? t.receiver : null; if (!pt || !pt.user || pt.user.id !== uid) continue;
      if (t.receiver && t.receiver.type === 'user') { refunded.add(t.id); continue; }
      let pl = {}; try { pl = JSON.parse(pt.invoice_payload || '{}'); } catch {} if (pl.i) out.push({ id: t.id, i: pl.i });
    }
    if (tx.length < 100) break;
  }
  return out.filter(x => !refunded.has(x.id)).map(x => x.i);
}
async function payRoute(url, req, env) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (!env.BOT_TOKEN) return json({ error: 'not configured' }, 503);
  if (url.pathname === '/tg/webhook') {
    if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') !== await hookSecret(env)) return new Response('no', { status: 403 });
    const u = await req.json();
    if (u.pre_checkout_query) { const q = u.pre_checkout_query; let ok = false; try { ok = !!itemInfo(JSON.parse(q.invoice_payload).i); } catch {} await bot(env, 'answerPreCheckoutQuery', ok ? { pre_checkout_query_id: q.id, ok: true } : { pre_checkout_query_id: q.id, ok: false, error_message: 'Товар не найден' }); }
    const msg = u.message;
    if (msg && msg.chat && !msg.successful_payment) {
      const ru = !/^(en|de|fr|es|it|pt|pl|tr|ja|ko|zh)/.test((msg.from && msg.from.language_code) || 'ru');
      await bot(env, 'sendPhoto', { chat_id: msg.chat.id, photo: GAME_URL + 'press/cover-' + (ru ? 'ru' : 'en') + '.jpg', caption: ru ? '⚔️ Земли Тлена — тёмная 3D ARPG прямо в Telegram.\nДобыча, камни умений, древо пассивов, боссы и кооператив до 3 игроков.\n\nЖми «Играть»!' : '⚔️ Lands of Decay — a dark 3D action RPG right in Telegram.\nLoot, skill gems, a passive tree, bosses and co-op for up to 3 players.\n\nTap “Play”!', reply_markup: { inline_keyboard: [[{ text: ru ? '▶️ Играть' : '▶️ Play', web_app: { url: GAME_URL } }]] } });
    }
    return new Response('ok');
  }
  if (url.pathname === '/tg/links') { const ids = [...Object.keys(ITEMS), 'pass_s1', 'pass_s2', 'pass_s3']; const out = {};
    for (const id of ids) { const info = itemInfo(id); const r = await bot(env, 'createInvoiceLink', { title: info[0], description: 'Земли Тлена: ' + info[0] + '. Только облик и удобство, без влияния на силу героя.', payload: JSON.stringify({ i: id }), currency: 'XTR', prices: [{ label: info[0], amount: info[1] }] }); if (r.ok) out[id] = r.result; }
    return json(out); }
  if (url.pathname === '/tg/check') { const me = await bot(env, 'getMe'); const wh = await bot(env, 'getWebhookInfo'); const d = await bot(env, 'getMyDescription'); const mb = await bot(env, 'getChatMenuButton'); return json({ bot: me.result && me.result.username, upd: wh.result && wh.result.allowed_updates, pending: wh.result && wh.result.pending_update_count, err: wh.result && wh.result.last_error_message, desc: d.result && d.result.description, menu: mb.result, webhook: wh.result && wh.result.url || '', ours: (wh.result && wh.result.url || '') === url.origin + '/tg/webhook' }); }
  if (url.pathname === '/tg/setup') { const info = await bot(env, 'getWebhookInfo'); await bot(env, 'deleteWebhook', {}); const set = await bot(env, 'setWebhook', { url: url.origin + '/tg/webhook', secret_token: await hookSecret(env), allowed_updates: ['pre_checkout_query', 'message'] });
    const menu = await bot(env, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'Играть', web_app: { url: GAME_URL } } });
    await bot(env, 'setMyDescription', { description: 'Тёмная 3D ARPG: сражайся с ордами мертвецов, собирай добычу и играй с друзьями. Нажми «Играть».' });
    await bot(env, 'setMyShortDescription', { short_description: 'Земли Тлена — тёмная 3D ARPG с кооперативом' });
    await bot(env, 'setMyDescription', { description: 'A dark 3D action RPG: fight hordes of the dead, collect loot and play with friends. Tap “Play”.', language_code: 'en' });
    await bot(env, 'setMyCommands', { commands: [{ command: 'start', description: 'Играть / Play' }] });
    return json({ before: info.result && info.result.url, set, menu }); }
  const user = await tgUser(req.headers.get('X-Init'), env.BOT_TOKEN);
  if (!user) return json({ error: 'auth' }, 401);
  if (url.pathname === '/tg/invoice' && req.method === 'POST') {
    const { item } = await req.json(); const info = itemInfo(item); if (!info) return json({ error: 'item' }, 400);
    const r = await bot(env, 'createInvoiceLink', { title: info[0], description: 'Земли Тлена: ' + info[0] + '. Только облик и удобство, без влияния на силу героя.', payload: JSON.stringify({ u: user.id, i: item }), currency: 'XTR', prices: [{ label: info[0], amount: info[1] }] });
    return r.ok ? json({ link: r.result }) : json({ error: 'tg' }, 502);
  }
  if (url.pathname === '/tg/purchases') return json({ items: await boughtBy(env, user.id) });
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
