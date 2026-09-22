/* ============================================
   MacroSpots — IndexedDB Persistence Layer
   Persists user state across sessions
   ============================================ */

const DB_NAME = 'macrospots-db';
const DB_VERSION = 1;
const STORE_NAME = 'appState';
const STATE_KEY = 'current';

// Keys worth persisting (exclude ephemeral UI state like sheetState, selectedItem)
const PERSIST_KEYS = [
  'userMacros',
  'remainingMacros',
  'loggedItems',
  'priorityMode',
  'dietaryPrefs',
  'allergens',
];

let dbInstance = null;

function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    req.onerror = () => reject(req.error);
  });
}

/* ---- Read persisted state ---- */
export async function loadPersistedState() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STATE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[Persistence] Failed to load state:', err);
    return null;
  }
}

/* ---- Write current state (debounced externally) ---- */
export async function saveState(fullState) {
  try {
    const db = await openDB();
    // Only persist the keys we care about
    const toPersist = {};
    PERSIST_KEYS.forEach(key => {
      if (key in fullState) toPersist[key] = fullState[key];
    });

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(toPersist, STATE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[Persistence] Failed to save state:', err);
  }
}

/* ---- Clear all persisted data (for "reset" feature) ---- */
export async function clearPersistedState() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(STATE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[Persistence] Failed to clear state:', err);
  }
}

/* ---- Request durable storage (prevents browser eviction) ---- */
export async function requestDurableStorage() {
  if (navigator.storage?.persist) {
    const granted = await navigator.storage.persist();
    console.log(`[Persistence] Durable storage: ${granted ? 'granted' : 'denied'}`);
  }
}
