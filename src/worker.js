// Земли Тлена — сервер: раздаёт игру и держит комнаты кооператива (до 3 игроков)
import { DurableObject } from 'cloudflare:workers';
const MAX = 3;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/ws\/([A-Z0-9]{4,8})$/i);
    if (m) {
      if (req.headers.get('Upgrade') !== 'websocket') return new Response('Expected websocket', { status: 426 });
      const stub = env.ROOMS.get(env.ROOMS.idFromName(m[1].toUpperCase()));
      return stub.fetch(req);
    }
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
