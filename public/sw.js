/* ============================================
   MacroSpots — Service Worker
   Caches Leaflet map tiles for offline/instant loads
   ============================================ */

const TILE_CACHE = 'macrospots-tiles-v1';
const TILE_DOMAINS = ['basemaps.cartocdn.com'];
const MAX_TILE_CACHE_SIZE = 500; // Cap at ~50MB (tiles are ~100KB each)

/* ---- Install: pre-cache nothing, just activate immediately ---- */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    // Clean up old cache versions
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('macrospots-tiles-') && k !== TILE_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---- Fetch: cache-first for map tiles, network-first for everything else ---- */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Only intercept tile requests
  if (!TILE_DOMAINS.some(d => url.hostname.includes(d))) return;

  e.respondWith(
    caches.open(TILE_CACHE).then(async (cache) => {
      // Try cache first
      const cached = await cache.match(e.request);
      if (cached) return cached;

      // Cache miss — fetch from network
      try {
        const response = await fetch(e.request);
        if (response.ok) {
          // Clone before consuming (response body can only be read once)
          cache.put(e.request, response.clone());

          // Evict oldest entries if cache is too large
          trimCache(cache);
        }
        return response;
      } catch (err) {
        // Network failed and no cache — return transparent 1x1 PNG
        // (prevents Leaflet from showing broken tile images)
        return new Response(
          Uint8Array.from(atob(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg=='
          ), c => c.charCodeAt(0)),
          { headers: { 'Content-Type': 'image/png' } }
        );
      }
    })
  );
});

/* ---- Trim cache to MAX_TILE_CACHE_SIZE entries ---- */
async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_TILE_CACHE_SIZE) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - MAX_TILE_CACHE_SIZE);
    await Promise.all(toDelete.map(k => cache.delete(k)));
  }
}
