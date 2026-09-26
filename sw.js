// Hora do Sol 0.3 — service worker
// Páginas e estilos: tenta sempre a rede primeiro (para as atualizações chegarem logo) e usa a cópia guardada sem internet.
// Imagens e fontes: usa a cópia guardada primeiro.
const CACHE = 'hora-do-sol-v03-1';
const ASSETS = ['./', './index.html', './v02.css?v=3', './manifest.webmanifest?v=4',
  './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('hora-do-sol-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const fresh = req.mode === 'navigate' || (url.origin === location.origin && (/\.(html|css|js|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/')));
  if (fresh){
    e.respondWith(fetch(req).then(res => {
      if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy));
    return res;
  })));
});
