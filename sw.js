const CACHE = 'finance-v2';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.add('/Finance-Tracker/index.html'))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only cache the main HTML page
  if (e.request.url.includes('Finance-Tracker') && !e.request.url.includes('.')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/Finance-Tracker/index.html'))
    );
    return;
  }
  if (e.request.url.endsWith('index.html') || e.request.url.endsWith('/Finance-Tracker/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Everything else — network first
  e.respondWith(fetch(e.request).catch(() => new Response('')));
});
