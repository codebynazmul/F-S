/*
 * Field Shift service worker.
 * - Pages: try the network first, fall back to the cached copy when offline.
 * - Built files, fonts, images: serve from cache, fetch once.
 * - Supabase and other sites are not touched; the app keeps its own offline copy of NASA data.
 * Bump VERSION to drop old caches after a big change.
 */
const VERSION = 'v2';
const PAGES = `fs-pages-${VERSION}`;
const ASSETS = `fs-assets-${VERSION}`;
const PRECACHE = ['/', '/manifest.webmanifest', '/icon-192.png', '/login-bg.jpg', '/logo-sm.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  const keep = [PAGES, ASSETS];
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;
  // The login video is large; let the browser stream it normally.
  if (url.pathname.endsWith('.mp4')) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }
  if (url.pathname.startsWith('/_next/static/') || /\.(png|jpg|jpeg|svg|webp|woff2?|ico|webmanifest)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
  }
});

async function networkFirst(req) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req)) || (await cache.match('/')) || Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

