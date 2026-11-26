/* Scriptorium — fonctionnement hors ligne. Changez VERSION à chaque mise à jour du site. */
const VERSION = 'scriptorium-v4';
const FILES = ['./', './index.html', './guide/', './guide/index.html', './app/', './app/index.html',
  './app/css/scriptorium.css', './app/js/fonts.js', './app/js/scriptorium.js',
  './assets/icon.svg', './assets/site.css', './manifest.webmanifest', './docs/prompt-roman-sms.md'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Réseau d’abord (pour toujours avoir la dernière version), cache si hors ligne. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r => {
    const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
