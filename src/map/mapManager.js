/* ============================================
   MacroSpots — Leaflet Map Manager
   Owns the map instance, tiles, and dynamic pins
   ============================================ */

import { store } from '../state/store.js';
import { restaurants } from '../data/restaurants.js';
import { calculateMacroFitScore } from '../engine/macroMatcher.js';
import { iconSVG } from '../data/icons.js';

let map = null;
let markerLayer = null;
/* PERF: keep one live marker per restaurant instead of clearing/rebuilding
   the whole layer on every render — avoids DOM churn on rapid macro edits. */
const markerRegistry = new Map(); // id -> { marker, iconKey }

/* PERF: memoize per-restaurant best score. It only depends on
   remainingMacros + priorityMode, so search/filter-only renders
   (which happen far more often) can reuse the cached results. */
let scoreCache = { signature: null, scores: new Map() };

function scoreSignature(rm, pm) {
  return `${rm.calories}|${rm.protein}|${rm.carbs}|${rm.fat}|${pm || ''}`;
}

function getBestScores() {
  const rm = store.getState().remainingMacros;
  const pm = store.getState().priorityMode;
  const sig = scoreSignature(rm, pm);
  if (scoreCache.signature === sig) return scoreCache.scores;

  const scores = new Map();
  restaurants.forEach(r => {
    let best = 0;
    r.items.forEach(item => {
      const s = calculateMacroFitScore(item, rm, pm);
      if (s > best) best = s;
    });
    scores.set(r.id, best);
  });
  scoreCache = { signature: sig, scores };
  return scores;
}

/* ---- Custom SVG Pin Icons (category glyph + live macro-fit score) ---- */
function createPinIcon(color, category, score) {
  const bg = color === 'green' ? '#22c55e' : color === 'yellow' ? '#eab308' : '#6b7280';
  const glow = color === 'green' ? 'rgba(34,197,94,0.4)' : color === 'yellow' ? 'rgba(234,179,8,0.3)' : 'none';
  const pulseClass = color === 'green' ? 'pin-pulse-green' : color === 'yellow' ? 'pin-pulse-yellow' : '';

  const html = `
    <div class="map-pin ${pulseClass}" style="--pin-bg:${bg};--pin-glow:${glow}">
      <div class="map-pin__body">
        <span class="map-pin__glyph">${iconSVG(category, 18)}</span>
        <span class="map-pin__score">${score}</span>
      </div>
      <div class="map-pin__tail"></div>
    </div>`;

  return L.divIcon({
    html,
    className: 'map-pin-container',
    iconSize: [54, 64],
    iconAnchor: [27, 64],
    popupAnchor: [0, -64],
  });
}

/* ---- Determine pin color from score ---- */
function pinColor(score) {
  if (score > 80) return 'green';
  if (score >= 50) return 'yellow';
  return 'grey';
}

/* ---- Check quick filter match ---- */
function passesQuickFilters(restaurant) {
  const filters = store.getState().activeQuickFilters;
  if (!filters.length) return true;
  const rm = store.getState().remainingMacros;
  const pm = store.getState().priorityMode;

  for (const f of filters) {
    if (f === 'drive_thru' && !restaurant.driveThru) return false;
    if (f === 'high_protein') {
      const has = restaurant.items.some(i => i.protein >= 25);
      if (!has) return false;
    }
    if (f === 'under500') {
      const has = restaurant.items.some(i => i.calories < 500);
      if (!has) return false;
    }
    if (f === 'low_fat') {
      const has = restaurant.items.some(i => i.fat <= 15);
      if (!has) return false;
    }
  }
  return true;
}

/* ---- Public: Initialize Map ---- */
export function initMap() {
  map = L.map('map-container', {
    center: [43.6510, -79.3880],
    zoom: 15,
    zoomControl: false,
    attributionControl: false,
  });

  // Dark-themed tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(map);

  // Attribution in bottom-right (small)
  L.control.attribution({ position: 'bottomright', prefix: false })
    .addAttribution('© <a href="https://carto.com">CARTO</a> © <a href="https://osm.org">OSM</a>')
    .addTo(map);

  // Zoom control top-right
  L.control.zoom({ position: 'topright' }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);

  renderPins();

  // Re-render pins when macros change
  store.subscribe('remainingMacros', () => renderPins());
  store.subscribe('priorityMode', () => renderPins());
  store.subscribe('activeQuickFilters', () => renderPins());
}

/* ---- Public: Render / Refresh all pins ---- */
export function renderPins() {
  if (!markerLayer) return;

  const query = store.getState().searchQuery?.toLowerCase() || '';
  const scores = getBestScores();
  const seen = new Set();

  restaurants.forEach(r => {
    // Search + quick filters determine visibility
    const matchesSearch = !query || r.name.toLowerCase().includes(query) ||
      r.items.some(i => i.name.toLowerCase().includes(query));
    const visible = matchesSearch && passesQuickFilters(r);

    const existing = markerRegistry.get(r.id);

    if (!visible) {
      if (existing) {
        markerLayer.removeLayer(existing.marker);
        markerRegistry.delete(r.id);
      }
      return;
    }

    seen.add(r.id);
    const score = scores.get(r.id) ?? 0;
    const color = pinColor(score);
    const iconKey = `${color}:${score}`;

    if (existing) {
      // PERF: only touch the DOM if the visual actually changed
      if (existing.iconKey !== iconKey) {
        existing.marker.setIcon(createPinIcon(color, r.category, score));
        existing.iconKey = iconKey;
      }
      return;
    }

    const marker = L.marker([r.lat, r.lng], { icon: createPinIcon(color, r.category, score) })
      .addTo(markerLayer);
    marker.on('click', () => {
      store.setState({ selectedRestaurant: r });
      store.setSheet('half');
    });
    markerRegistry.set(r.id, { marker, iconKey });
  });

  // Clean up any registry entries that fell out of the restaurant list
  markerRegistry.forEach((entry, id) => {
    if (!seen.has(id)) {
      markerLayer.removeLayer(entry.marker);
      markerRegistry.delete(id);
    }
  });
}

/* ---- Public: Fly to a specific restaurant ---- */
export function flyToRestaurant(restaurant) {
  if (map && restaurant) {
    map.flyTo([restaurant.lat, restaurant.lng], 16, { duration: 0.8 });
  }
}

/* ---- Public: Get map ref (for external use) ---- */
export function getMap() { return map; }
