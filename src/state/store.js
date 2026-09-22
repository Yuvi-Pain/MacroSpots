/* ============================================
   MacroSpots — Centralized State Store
   Pub/Sub pattern for reactive state management
   ============================================ */
import { loadPersistedState, saveState } from './persistence.js';

const initialState = {
  userMacros: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
  remainingMacros: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
  priorityMode: null, // 'high_protein' | 'low_cal' | 'low_fat'
  dietaryPrefs: [],    // ['vegetarian','halal','dairy-free']
  allergens: [],       // ['peanuts','gluten']
  loggedItems: [],
  selectedItem: null,
  selectedRestaurant: null,  // restaurant object when map pin clicked
  sheetState: 'collapsed',   // 'collapsed' | 'half' | 'expanded'
  activeQuickFilters: [],     // ['drive_thru','high_protein','under500']
  currentScreen: 'home',
  searchQuery: '',
  cuisineFilter: null,
  macroFilter: null,
};

class Store {
  constructor() {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.listeners = new Map();
    this._saveTimer = null;
  }

  /* Load persisted state from IndexedDB before first render.
     Returns a Promise so main.js can await it. */
  async hydrate() {
    const persisted = await loadPersistedState();
    if (persisted) {
      // Merge persisted keys into initial state (don't overwrite ephemeral keys)
      Object.assign(this.state, persisted);

      // Check if loggedItems are from a previous day — auto-reset
      if (this.state.loggedItems.length > 0) {
        const lastLog = this.state.loggedItems[this.state.loggedItems.length - 1];
        const lastDate = new Date(lastLog.loggedAt).toDateString();
        const today = new Date().toDateString();
        if (lastDate !== today) {
          // New day — keep history but reset remaining macros
          this.state.remainingMacros = { ...this.state.userMacros };
          this.state.loggedItems = [];
        }
      }
    }
    return this.state;
  }

  getState() { return this.state; }

  setState(partial) {
    const prev = { ...this.state };
    Object.assign(this.state, partial);
    this.listeners.forEach((callbacks, key) => {
      if (key in partial) callbacks.forEach(cb => cb(this.state[key], prev[key]));
    });
    // Also fire wildcard listeners
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(cb => cb(this.state, prev));
    }

    // Auto-persist (debounced to 500ms to batch rapid changes)
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => saveState(this.state), 500);
  }

  /* Reset for a new day — clear logged items, restore full macro budget */
  resetDay() {
    this.setState({
      loggedItems: [],
      remainingMacros: { ...this.state.userMacros },
    });
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key).add(callback);
    return () => this.listeners.get(key)?.delete(callback);
  }

  logItem(item) {
    const logged = [...this.state.loggedItems, { ...item, loggedAt: Date.now() }];
    const remaining = {
      calories: Math.max(0, this.state.remainingMacros.calories - item.calories),
      protein: Math.max(0, this.state.remainingMacros.protein - item.protein),
      carbs: Math.max(0, this.state.remainingMacros.carbs - item.carbs),
      fat: Math.max(0, this.state.remainingMacros.fat - item.fat),
    };
    this.setState({ loggedItems: logged, remainingMacros: remaining });
  }

  updateRemainingMacros(macros) {
    this.setState({ remainingMacros: { ...this.state.remainingMacros, ...macros } });
  }

  setTotalMacros(macros) {
    this.setState({
      userMacros: { ...this.state.userMacros, ...macros },
      remainingMacros: { ...this.state.userMacros, ...macros }
    });
    // Recalculate remaining after logged items
    const r = { ...this.state.userMacros };
    this.state.loggedItems.forEach(item => {
      r.calories = Math.max(0, r.calories - item.calories);
      r.protein = Math.max(0, r.protein - item.protein);
      r.carbs = Math.max(0, r.carbs - item.carbs);
      r.fat = Math.max(0, r.fat - item.fat);
    });
    this.setState({ remainingMacros: r });
  }

  navigate(screen) {
    this.setState({ currentScreen: screen });
  }

  setSheet(state) {
    this.setState({ sheetState: state });
  }
}

export const store = new Store();
