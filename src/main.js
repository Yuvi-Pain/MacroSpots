/* ============================================
   MacroSpots — Main Entry Point
   Map-first architecture orchestrator
   ============================================ */

import { store } from './state/store.js';
import { initMap, renderPins } from './map/mapManager.js';
import { initBottomSheet } from './ui/bottomSheet.js';

import { requestDurableStorage } from './state/persistence.js';

/* ---- Bootstrap (async to allow IndexedDB hydration) ---- */
async function bootstrap() {
  // 1. Hydrate state from IndexedDB before any UI renders
  await store.hydrate();

  // 2. Now initialize UI with correct state
  initMap();
  initBottomSheet();

  // 3. Register Service Worker for tile caching
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err =>
      console.warn('[SW] Registration failed:', err)
    );
  }

  // 4. Request durable storage (best-effort, non-blocking)
  requestDurableStorage();
}

bootstrap();

/* ---- Search Bar ---- */
const searchInput = document.getElementById('map-search-input');
let searchDebounce;
searchInput?.addEventListener('input', (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    store.setState({ searchQuery: e.target.value });
    renderPins();
  }, 300);
});

/* ---- Filter Chips ---- */
document.querySelectorAll('[data-filter]').forEach(chip => {
  chip.addEventListener('click', () => {
    const filter = chip.dataset.filter;
    const current = [...store.getState().activeQuickFilters];
    const idx = current.indexOf(filter);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(filter);
    store.setState({ activeQuickFilters: current });
    chip.classList.toggle('active');
    // renderPins is called reactively via store subscription
  });
});
