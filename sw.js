/* sw.js — Service Worker untuk EMPOWER HUB PWA
 * Strategi:
 *  - precache shell aplikasi (index.html, manifest, icons) saat install
 *  - navigasi: network-first, fallback ke cache index.html saat offline
 *  - aset statis (icons): cache-first
 *  - request ke script.google.com: lewati (BIAR ditangani browser), jangan di-cache
 *    (Google Apps Script memerlukan cookie & session, tidak boleh di-cache)
 */

const VERSION   = 'empowerhub-v1';
const SHELL_URL = './';
const PRECACHE  = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon.ico'
];

// Host yang TIDAK boleh di-cache / di-intercept
const PASS_THROUGH_HOSTS = [
  'script.google.com',
  'www.gstatic.com',
  'accounts.google.com',
  'lh3.googleusercontent.com',
  'drive.google.com',
  'docs.google.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      // Cache satu per satu agar satu failure tidak menggagalkan seluruh install
      await Promise.allSettled(
        PRECACHE.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'reload' });
            if (res && res.ok) await cache.put(url, res.clone());
          } catch (e) {
            console.warn('[SW] Gagal precache', url, e.message);
          }
        })
      );
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Hanya tangani GET; lewati POST/PUT dll (GAS butuh POST form submit)
  if (req.method !== 'GET') return;

  // Jangan intervensi request ke Google Apps Script & layanan Google lainnya
  if (PASS_THROUGH_HOSTS.some(h => url.hostname.endsWith(h))) {
    return; // biarkan browser handle
  }

  // Navigasi (HTML page request) -> network-first, fallback ke cache
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(req);
          const cache = await caches.open(VERSION);
          cache.put(SHELL_URL, net.clone()).catch(() => {});
          return net;
        } catch (err) {
          const cached = await caches.match(SHELL_URL) || await caches.match('./index.html');
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Aset statis lain -> cache-first, fallback ke network
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const net = await fetch(req);
        if (net && net.ok && net.type === 'basic') {
          const cache = await caches.open(VERSION);
          cache.put(req, net.clone()).catch(() => {});
        }
        return net;
      } catch (err) {
        return cached || Response.error();
      }
    })()
  );
});

// Komunikasi dari page -> SW (mis. untuk trigger update)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
