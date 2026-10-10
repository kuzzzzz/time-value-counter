const CACHE = 'tvc-v22';
const ASSETS = ['./', './index.html', './app.js', './app.full.js', './app.notes.js', './manifest.json', './FEATURES.md'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/') || url.pathname.endsWith('app.js') || url.pathname.endsWith('app.full.js') || url.pathname.endsWith('app.notes.js')) {
    e.respondWith(fetch(e.request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
});
