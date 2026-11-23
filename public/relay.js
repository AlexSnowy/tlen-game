// Комната кооператива поверх публичного MQTT-брокера (WebSocket).
// Ведёт себя как WebSocket к серверу Cloudflare: шлёт те же hello/join/leave/full.
const BROKERS = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt'];
const PFX = 'zemlitlena/tlen1/';
const MAX = 3, HB = 4000, DEAD = 13000, GATHER = 1500;
const te = new TextEncoder(), td = new TextDecoder();

function str(s) { const b = te.encode(s); return [b.length >> 8, b.length & 255, ...b]; }
function pkt(type, body) {
  const out = [type]; let n = body.length;
  do { let d = n % 128; n = Math.floor(n / 128); if (n > 0) d |= 128; out.push(d); } while (n > 0);
  const a = new Uint8Array(out.length + body.length); a.set(out); a.set(body, out.length); return a;
}

export class RelaySocket {
  constructor(room, brokers = BROKERS, opt = {}) {
    this.max = opt.max || MAX;
    this.room = room; this.id = Math.random().toString(36).slice(2, 10); this.ts = Date.now();
    this.peers = {}; this.readyState = 0; this.started = false; this.pend = [];
    this.onopen = this.onmessage = this.onclose = this.onerror = null;
    this.brokers = brokers.slice(); this.tryNext();
  }
  get tb() { return PFX + this.room + '/b'; }
  tryNext() {
    const url = this.brokers.shift();
    if (!url) { this.readyState = 3; this.onerror && this.onerror({}); this.onclose && this.onclose({}); return; }
    let ws; try { ws = new WebSocket(url, 'mqtt'); } catch { return this.tryNext(); }
    ws.binaryType = 'arraybuffer'; this.ws = ws; let ok = false;
    const to = setTimeout(() => { if (!ok) { try { ws.close() } catch {} } }, 5000);
    ws.onopen = () => {
      const will = te.encode(JSON.stringify({ t: '_bye', from: this.id }));
      const body = [...str('MQTT'), 4, 0x02 | 0x04, 0, 30, ...str('tl' + this.id), ...str(this.tb), will.length >> 8, will.length & 255, ...will];
      ws.send(pkt(0x10, body));
    };
    ws.onmessage = e => {
      const d = new Uint8Array(e.data); let i = 0;
      while (i < d.length) {
        const t = d[i] >> 4; let mul = 1, len = 0, j = i + 1, c;
        do { c = d[j++]; len += (c & 127) * mul; mul *= 128; } while (c & 128);
        const p = d.subarray(j, j + len); i = j + len;
        if (t === 2) { // CONNACK
          if (p[1] !== 0) { try { ws.close() } catch {} return; }
          ok = true; clearTimeout(to);
          ws.send(pkt(0x82, [0, 1, ...str(this.tb), 0, ...str(PFX + this.room + '/d/' + this.id), 0]));
        } else if (t === 9) { this.begin(); }
        else if (t === 3) {
          const tl = (p[0] << 8) | p[1]; // подписка с QoS 0 — без packet id
          try { this.recv(JSON.parse(td.decode(p.subarray(2 + tl)))); } catch {}
        }
      }
    };
    ws.onclose = () => {
      clearTimeout(to);
      if (this.ws !== ws) return;
      if (!ok && this.readyState === 0) return this.tryNext();
      this.shut();
    };
    ws.onerror = () => {};
  }
  pub(topic, o) { if (this.ws && this.ws.readyState === 1) this.ws.send(pkt(0x30, [...str(topic), ...te.encode(JSON.stringify(o))])); }
  begin() {
    this.pub(this.tb, { t: '_hi', from: this.id, _ts: this.ts });
    this.hb = setInterval(() => {
      if (this.ws && this.ws.readyState === 1) this.ws.send(new Uint8Array([0xC0, 0]));
      this.pub(this.tb, { t: '_hb', from: this.id, _ts: this.ts });
      const now = Date.now();
      for (const id in this.peers) if (now - this.peers[id].seen > DEAD) this.gone(id);
    }, HB);
    setTimeout(() => this.ready(), GATHER);
  }
  hostId() { let h = this.id, ht = this.ts; for (const id in this.peers) { const p = this.peers[id]; if (p.ts < ht || (p.ts === ht && id < h)) { h = id; ht = p.ts; } } return h; }
  emit(o) { this.onmessage && this.onmessage({ data: JSON.stringify(o) }); }
  ready() {
    if (this.readyState !== 0) return;
    const ids = Object.keys(this.peers);
    if (ids.length >= this.max && ids.some(id => this.peers[id].ts <= this.ts)) {
      this.readyState = 1; this.emit({ t: 'full' }); this.close(); return;
    }
    this.readyState = 1; this.started = true;
    this.onopen && this.onopen({});
    this.emit({ t: 'hello', id: this.id, host: this.hostId(), peers: ids });
    for (const m of this.pend) this.emit(m); this.pend = [];
  }
  add(id, ts) {
    const p = this.peers[id];
    if (p) {
      p.seen = Date.now();
      if (ts != null && p.ts !== ts) { const h = this.hostId(); p.ts = ts; if (this.started && this.hostId() !== h) this.emit({ t: 'join', id, host: this.hostId() }); }
      return;
    }
    this.peers[id] = { ts: ts != null ? ts : Date.now(), seen: Date.now() };
    if (this.started) this.emit({ t: 'join', id, host: this.hostId() });
  }
  gone(id) {
    if (!this.peers[id]) return; delete this.peers[id];
    if (this.started) this.emit({ t: 'leave', id, host: this.hostId() });
  }
  recv(o) {
    if (!o || !o.from || o.from === this.id) return;
    if (o.to && o.to !== this.id) return;
    if (o.t === '_hi') { this.add(o.from, o._ts); this.pub(PFX + this.room + '/d/' + o.from, { t: '_here', from: this.id, to: o.from, _ts: this.ts }); return; }
    if (o.t === '_here' || o.t === '_hb') { this.add(o.from, o._ts); return; }
    if (o.t === '_bye') { this.gone(o.from); return; }
    if (!this.peers[o.from]) this.add(o.from, null);
    else this.peers[o.from].seen = Date.now();
    if (this.started) this.emit(o); else this.pend.push(o);
  }
  send(s) {
    let o; try { o = JSON.parse(s); } catch { return; }
    o.from = this.id;
    this.pub(o.to ? PFX + this.room + '/d/' + o.to : this.tb, o);
  }
  close() {
    if (this.readyState === 3) return;
    this.pub(this.tb, { t: '_bye', from: this.id });
    try { this.ws && this.ws.send(new Uint8Array([0xE0, 0])); } catch {}
    const w = this.ws; setTimeout(() => { try { w && w.close(); } catch {} }, 50);
    this.shut();
  }
  shut() {
    if (this.readyState === 3) return;
    this.readyState = 3; clearInterval(this.hb);
    const w = this.ws; this.ws = null; try { w && w.close(); } catch {}
    this.onclose && this.onclose({});
  }
}

// Глобальная таблица рекордов: retained-сообщения на брокере
export function leaderboard(entry, onList, brokers = BROKERS) {
  const list = {}; let ws, done = false; const url = brokers[0];
  try { ws = new WebSocket(url, 'mqtt'); } catch { return () => {}; }
  ws.binaryType = 'arraybuffer';
  ws.onopen = () => { const id = 'lb' + Math.random().toString(36).slice(2, 9); ws.send(pkt(0x10, [...str('MQTT'), 4, 0x02, 0, 30, ...str(id)])); };
  ws.onmessage = e => {
    const d = new Uint8Array(e.data); let i = 0;
    while (i < d.length) {
      const t = d[i] >> 4; let mul = 1, len = 0, j = i + 1, c;
      do { c = d[j++]; len += (c & 127) * mul; mul *= 128; } while (c & 128);
      const p = d.subarray(j, j + len); i = j + len;
      if (t === 2) {
        ws.send(pkt(0x82, [0, 2, ...str(PFX + 'lb/#'), 0]));
        if (entry) { const pl = entry.del ? [] : [...te.encode(JSON.stringify(entry))]; ws.send(pkt(0x31, [...str(PFX + 'lb/' + entry.id), ...pl])); }
      } else if (t === 3) {
        const tl = (p[0] << 8) | p[1];
        try { const raw = td.decode(p.subarray(2 + tl)); if (!raw) continue; const o = JSON.parse(raw); if (o && o.id && !o.del) { list[o.id] = o; onList(Object.values(list)); } } catch {}
      }
    }
  };
  const stop = () => { if (done) return; done = true; try { ws.send(new Uint8Array([0xE0, 0])); ws.close(); } catch {} };
  setTimeout(stop, 8000); return stop;
}
