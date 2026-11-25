// Офлайн-кэш: страница и код — из сети (с запасным кэшем), модели/шрифты/картинки — из кэша.
const C = 'tlen-v2';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const heavy = /\/(assets|vendor|fonts)\/|\.(png|jpg|glb|woff2)$/.test(u.pathname);
  if (heavy) {
    e.respondWith(caches.open(C).then(c => c.match(e.request).then(r => r || fetch(e.request).then(n => { if (n.ok) c.put(e.request, n.clone()); return n; }))));
  } else {
    e.respondWith(fetch(e.request).then(n => { if (n.ok) caches.open(C).then(c => c.put(e.request, n.clone())); return n; }).catch(() => caches.match(e.request)));
  }
});
