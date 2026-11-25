# Земли Тлена

Тёмная 3D ARPG для браузера и Telegram Mini App. Кооператив до 3 игроков.

- `public/` — клиент (three.js, модели KayKit CC0 в `public/assets`).
- `src/worker.js` — Cloudflare Worker: раздаёт игру и держит комнаты кооператива (Durable Objects, WebSocket).
- Деплой: Cloudflare Workers Builds из этого репозитория (`npx wrangler deploy`).
- Локально: `npm i && npx wrangler dev`.
