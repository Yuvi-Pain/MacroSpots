/* ============================================
   MacroSpots — Bottom Sheet Controller
   3-state draggable sheet: collapsed / half / expanded
   ============================================ */

import { store } from '../state/store.js';
import { scoreRestaurantItems, scoreTopItems } from '../api/mockApi.js';
import { iconBadge } from '../data/icons.js';

let sheetEl, contentEl, handleEl, frameEl;
let startY = 0, currentY = 0, isDragging = false;
let lastRenderedState = null;
let sheetHeight = 0;

const SNAP = { collapsed: 0.15, half: 0.50, expanded: 0.90 };

/* ---- Macro Ring (compact, reused from old homeScreen) ---- */
function miniRing(label, value, max, color, id) {
  const sz = 44, r = 16, c = 2 * Math.PI * r;
  const pct = Math.min(1, value / Math.max(1, max));
  return `<div class="mini-ring" data-ring="${id}">
    <svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" style="transform:rotate(-90deg)">
      <circle cx="22" cy="22" r="${r}" fill="none" stroke="var(--color-bg-elevated)" stroke-width="4"/>
      <circle cx="22" cy="22" r="${r}" fill="none" stroke="${color}" stroke-width="4"
        stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"
        stroke-linecap="round" data-circ="${c}"/>
    </svg>
    <div class="mini-ring__label">
      <span class="mini-ring__value">${value}</span>
      <span class="mini-ring__unit">${label}</span>
    </div>
  </div>`;
}

/* ---- Score badge helper ---- */
function scoreClass(s) { return s >= 75 ? 'score-badge--high' : s >= 45 ? 'score-badge--mid' : 'score-badge--low'; }
function barColor(k) { return { calories:'var(--color-calories)', protein:'var(--color-protein)', carbs:'var(--color-carbs)', fat:'var(--color-fat)' }[k] || 'var(--color-accent)'; }

/* ============ PUBLIC: Initialize ============ */
export function initBottomSheet() {
  sheetEl = document.getElementById('bottom-sheet');
  contentEl = document.getElementById('sheet-content');
  handleEl = document.getElementById('sheet-handle');
  frameEl = document.getElementById('app-frame');
  if (!sheetEl || !frameEl) return;

  sheetHeight = frameEl.offsetHeight;
  window.addEventListener('resize', () => { sheetHeight = frameEl.offsetHeight; snapTo(store.getState().sheetState); });

  // Touch events on handle
  handleEl.addEventListener('touchstart', onTouchStart, { passive: true });
  handleEl.addEventListener('touchmove', onTouchMove, { passive: false });
  handleEl.addEventListener('touchend', onTouchEnd, { passive: true });
  // Mouse fallback
  handleEl.addEventListener('mousedown', onMouseDown);

  // Also allow dragging from sheet top area
  sheetEl.addEventListener('touchstart', onSheetTouchStart, { passive: true });
  sheetEl.addEventListener('touchmove', onTouchMove, { passive: false });
  sheetEl.addEventListener('touchend', onTouchEnd, { passive: true });

  // Subscribe to state
  store.subscribe('sheetState', (state) => snapTo(state));
  store.subscribe('remainingMacros', () => { if (store.getState().sheetState === 'collapsed') renderCollapsed(); });
  store.subscribe('selectedRestaurant', (r) => { if (r) renderHalf(); });
  store.subscribe('selectedItem', (item) => { if (item) { store.setSheet('expanded'); renderExpanded(); } });

  // Initial render
  snapTo('collapsed');
  renderCollapsed();
}

/* ============ SNAP POSITIONS ============ */
function getSnapY(state) {
  return sheetHeight * (1 - SNAP[state]);
}

export function snapTo(state) {
  if (!sheetEl) return;
  const y = getSnapY(state);
  sheetEl.style.transition = 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
  sheetEl.style.transform = `translateY(${y}px)`;

  // Only re-render if the sheet state actually changed
  if (state !== lastRenderedState) {
    lastRenderedState = state;
    if (state === 'collapsed') renderCollapsed();
    else if (state === 'half') renderHalf();
    else if (state === 'expanded') renderExpanded();
  }
}

/* ============ TOUCH HANDLERS ============ */
function onTouchStart(e) {
  isDragging = true;
  startY = e.touches[0].clientY;
  currentY = getComputedTranslateY();
  sheetEl.style.transition = 'none';
}

function onSheetTouchStart(e) {
  // Only start drag if at top of scroll or touching handle area
  if (contentEl.scrollTop > 5 && store.getState().sheetState !== 'collapsed') return;
  onTouchStart(e);
}

function onTouchMove(e) {
  if (!isDragging) return;
  const touch = e.touches[0];
  const delta = touch.clientY - startY;
  const newY = Math.max(getSnapY('expanded'), Math.min(getSnapY('collapsed'), currentY + delta));
  sheetEl.style.transform = `translateY(${newY}px)`;
  if (Math.abs(delta) > 5) e.preventDefault();
}

/* FIX [B3]: Shared snap resolution — event-agnostic so both touch and mouse
   paths can call it safely without routing through each other. */
function resolveSnap() {
  const endY = getComputedTranslateY();
  const velocity = endY - currentY; // positive = moved down

  // Determine which snap point is closest, biased by velocity
  const expanded = getSnapY('expanded');
  const half = getSnapY('half');
  const collapsed = getSnapY('collapsed');
  const current = store.getState().sheetState;

  let target;
  if (velocity < -60) {
    // Fast swipe up
    target = current === 'collapsed' ? 'half' : 'expanded';
  } else if (velocity > 60) {
    // Fast swipe down
    target = current === 'expanded' ? 'half' : 'collapsed';
  } else {
    // Snap to nearest
    const dists = [
      { state: 'collapsed', d: Math.abs(endY - collapsed) },
      { state: 'half', d: Math.abs(endY - half) },
      { state: 'expanded', d: Math.abs(endY - expanded) },
    ];
    dists.sort((a, b) => a.d - b.d);
    target = dists[0].state;
  }

  store.setSheet(target);
}

function onTouchEnd(e) {
  if (!isDragging) return;
  isDragging = false;
  resolveSnap();
}

function onMouseDown(e) {
  isDragging = true;
  startY = e.clientY;
  currentY = getComputedTranslateY();
  sheetEl.style.transition = 'none';

  const onMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientY - startY;
    const newY = Math.max(getSnapY('expanded'), Math.min(getSnapY('collapsed'), currentY + delta));
    sheetEl.style.transform = `translateY(${newY}px)`;
  };
  const onUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    resolveSnap();
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function getComputedTranslateY() {
  const st = window.getComputedStyle(sheetEl);
  const m = st.transform.match(/matrix\((.+)\)/);
  return m ? parseFloat(m[1].split(',')[5]) : getSnapY('collapsed');
}

/* ============ COLLAPSED STATE CONTENT ============ */
function renderCollapsed() {
  if (!contentEl) return;
  const rm = store.getState().remainingMacros;
  const um = store.getState().userMacros;

  // First run: build the full DOM structure once
  if (!contentEl.querySelector('.sheet-collapsed')) {
    contentEl.innerHTML = `
      <div class="sheet-collapsed">
        <div class="sheet-collapsed__rings">
          ${miniRing('kcal', rm.calories, um.calories, 'var(--color-calories)', 'calories')}
          ${miniRing('pro', rm.protein, um.protein, 'var(--color-protein)', 'protein')}
          ${miniRing('carb', rm.carbs, um.carbs, 'var(--color-carbs)', 'carbs')}
          ${miniRing('fat', rm.fat, um.fat, 'var(--color-fat)', 'fat')}
        </div>
        <div class="sheet-collapsed__hint">Swipe up to explore</div>
      </div>`;
    return;
  }

  /* FIX [M1]: Subsequent runs — surgically update only the changing values.
     No innerHTML nuke, no DOM rebuild, no re-triggered stagger animations.
     Just 4 setAttribute + 4 textContent writes per update. */
  const keys = [
    { id: 'calories', rem: rm.calories, max: um.calories },
    { id: 'protein',  rem: rm.protein,  max: um.protein },
    { id: 'carbs',    rem: rm.carbs,    max: um.carbs },
    { id: 'fat',      rem: rm.fat,      max: um.fat },
  ];

  keys.forEach(({ id, rem, max }) => {
    const ring = contentEl.querySelector(`[data-ring="${id}"]`);
    if (!ring) return;

    // Update the SVG arc fill
    const circ = ring.querySelector('[data-circ]');
    if (circ) {
      const circumference = parseFloat(circ.dataset.circ);
      const pct = Math.min(1, rem / Math.max(1, max));
      circ.setAttribute('stroke-dashoffset', circumference * (1 - pct));
    }

    // Update the numeric label
    const val = ring.querySelector('.mini-ring__value');
    if (val) val.textContent = rem;
  });
}

/* ============ HALF STATE CONTENT ============ */
function renderHalf() {
  if (!contentEl) return;
  const s = store.getState();
  const rm = s.remainingMacros;
  const pm = s.priorityMode;
  const selected = s.selectedRestaurant;

  /* FIX [M6]: UI delegates scoring to the API layer — no engine import needed.
     Items arrive pre-enriched with .score, .pctCalories, .pctProtein, etc. */
  let items = selected
    ? scoreRestaurantItems(selected, rm, pm)
    : scoreTopItems(rm, pm, 15);

  const title = selected
    ? `<span class="title-with-badge">${iconBadge(selected.category, 30)}<span>${selected.name}</span></span>`
    : '<span class="title-with-badge"><span class="title-trophy">🏆</span><span>Top Matches</span></span>';
  const subtitle = selected ? `${selected.distance} away · ${selected.items.length} items` : `Based on your remaining macros`;

  contentEl.innerHTML = `
    <div class="sheet-half">
      <div class="sheet-half__header">
        <div>
          <div class="sheet-half__title">${title}</div>
          <div class="sheet-half__subtitle">${subtitle}</div>
        </div>
        ${selected ? '<button class="sheet-half__close" id="sheet-close-restaurant" aria-label="Show all">✕</button>' : ''}
      </div>
      <div class="sheet-half__remaining">
        Remaining: <strong>${rm.calories}</strong> kcal · <strong>${rm.protein}</strong>g P · <strong>${rm.carbs}</strong>g C · <strong>${rm.fat}</strong>g F
      </div>
      <div class="sheet-half__list stagger-children">
        ${items.map((item, i) => `
          <div class="card result-card" data-item-idx="${i}" tabindex="0" role="button" aria-label="View ${item.name}">
            <div class="result-card__top">
              <div class="score-badge ${scoreClass(item.score)} result-card__score">${item.score}</div>
              <div class="result-card__info">
                <div class="result-card__name">${item.name}</div>
                <div class="result-card__restaurant">${iconBadge(item.restaurantCategory, 20)}<span>${item.restaurantName}</span></div>
              </div>
            </div>
            <div class="result-card__macros">
              ${macroCell('Cal', item.calories, item.pctCalories, 'calories')}
              ${macroCell('Pro', item.protein, item.pctProtein, 'protein')}
              ${macroCell('Carb', item.carbs, item.pctCarbs, 'carbs')}
              ${macroCell('Fat', item.fat, item.pctFat, 'fat')}
            </div>
          </div>`).join('')}
      </div>
    </div>`;

  // Store items for click binding

  bindHalfEvents(items);
}

function macroCell(label, val, pct, key) {
  const unit = key === 'calories' ? '' : 'g';
  return `<div class="result-card__macro">
    <div class="result-card__macro-header">
      <span class="result-card__macro-label">${label}</span>
      <span class="result-card__macro-value">${val}${unit}</span>
    </div>
    <div class="progress-bar"><div class="progress-bar__fill" style="width:${Math.min(100,pct)}%;background:${barColor(key)}"></div></div>
    <span class="result-card__macro-pct">${pct}%</span>
  </div>`;
}

function bindHalfEvents(items) {
  document.querySelectorAll('.result-card[data-item-idx]').forEach(card => {
    card.addEventListener('click', () => {
      const item = items[parseInt(card.dataset.itemIdx)];
      store.setState({ selectedItem: item });
    });
  });
  document.getElementById('sheet-close-restaurant')?.addEventListener('click', () => {
    store.setState({ selectedRestaurant: null });
    renderHalf();
  });
}

/* ============ EXPANDED STATE CONTENT ============ */
function renderExpanded() {
  if (!contentEl) return;
  const item = store.getState().selectedItem;
  if (!item) { store.setSheet('half'); return; }
  const rm = store.getState().remainingMacros;

  const macros = [
    { key: 'calories', label: 'Calories', value: item.calories, rem: rm.calories, unit: 'kcal' },
    { key: 'protein', label: 'Protein', value: item.protein, rem: rm.protein, unit: 'g' },
    { key: 'carbs', label: 'Carbs', value: item.carbs, rem: rm.carbs, unit: 'g' },
    { key: 'fat', label: 'Fat', value: item.fat, rem: rm.fat, unit: 'g' },
  ];

  const modsHTML = (item.modifications?.length) ? item.modifications.map((mod, i) => `
    <div class="mod-item toggle">
      <div class="toggle__label">
        <div>${mod.name}</div>
        <div class="toggle__sublabel">${mod.calDiff > 0 ? '+' : ''}${mod.calDiff} kcal${mod.protDiff ? `, ${mod.protDiff > 0 ? '+' : ''}${mod.protDiff}g P` : ''}${mod.fatDiff ? `, ${mod.fatDiff > 0 ? '+' : ''}${mod.fatDiff}g F` : ''}</div>
      </div>
      <div class="toggle__switch" data-mod-idx="${i}" role="switch" aria-checked="false" tabindex="0"></div>
    </div>`).join('') : '<p style="color:var(--color-text-muted);font-size:var(--font-size-sm)">No modifications available.</p>';

  contentEl.innerHTML = `
    <div class="sheet-expanded">
      <button class="detail-back" id="sheet-back-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Results
      </button>
      <div class="detail-hero">
        <div class="score-badge ${scoreClass(item.score)} detail-hero__score">${item.score}</div>
        <h2 class="detail-hero__name" id="detail-item-name">${item.name}</h2>
        <div class="detail-hero__restaurant">${item.restaurantCategory ? iconBadge(item.restaurantCategory, 22) : ''}<span>${item.restaurantName || ''}</span></div>
      </div>
      <div class="detail-macros">
        <div class="section-header"><span class="section-header__title">Macro Breakdown</span></div>
        <div class="detail-macro-bars" id="detail-macro-bars">
          ${macros.map(m => {
            const pct = m.rem > 0 ? Math.round((m.value / m.rem) * 100) : 0;
            return `<div class="detail-macro-row">
              <div class="detail-macro-row__header">
                <span class="detail-macro-row__label" style="color:${barColor(m.key)}">${m.label}</span>
                <div class="detail-macro-row__values">
                  <span class="detail-macro-row__amount">${m.value} ${m.unit}</span>
                  <span class="detail-macro-row__pct">${pct}% of remaining</span>
                </div>
              </div>
              <div class="progress-bar" style="height:8px"><div class="progress-bar__fill" style="width:${Math.min(100,pct)}%;background:${barColor(m.key)}"></div></div>
            </div>`;}).join('')}
        </div>
      </div>
      <div class="detail-nutrition">
        <div class="section-header"><span class="section-header__title">Nutrition Facts</span></div>
        <div class="card"><table class="nutrition-table">
          <tr><th>Calories</th><td id="nf-calories">${item.calories} kcal</td></tr>
          <tr><th>Total Fat</th><td id="nf-fat">${item.fat} g</td></tr>
          <tr><th>Carbohydrates</th><td id="nf-carbs">${item.carbs} g</td></tr>
          <tr><th>Protein</th><td id="nf-protein">${item.protein} g</td></tr>
        </table></div>
      </div>
      <div class="detail-mods">
        <div class="section-header"><span class="section-header__title">Common Modifications</span></div>
        <div class="card"><div class="mod-list">${modsHTML}</div></div>
      </div>
      <div class="detail-log-section">
        <button class="btn btn--log btn--block" id="log-item-btn">✓ Log This Item</button>
      </div>
    </div>`;

  bindExpandedEvents(item);
}

function bindExpandedEvents(item) {
  const activeMods = new Set();

  document.getElementById('sheet-back-btn')?.addEventListener('click', () => {
    store.setState({ selectedItem: null });
    store.setSheet('half');
  });

  document.querySelectorAll('[data-mod-idx]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const idx = parseInt(toggle.dataset.modIdx);
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-checked', toggle.classList.contains('active'));
      if (activeMods.has(idx)) activeMods.delete(idx); else activeMods.add(idx);
      updateNutritionDisplay(item, activeMods);
    });
  });

  document.getElementById('log-item-btn')?.addEventListener('click', () => {
    const adj = getAdjustedItem(item, activeMods);
    store.logItem(adj);
    showLogConfirmation(adj);
  });
}

function getAdjustedItem(item, activeMods) {
  let c = item.calories, p = item.protein, cb = item.carbs, f = item.fat;
  activeMods.forEach(idx => {
    const m = item.modifications[idx];
    c += m.calDiff; p += m.protDiff; cb += m.carbDiff; f += m.fatDiff;
  });
  return { ...item, calories: Math.max(0,c), protein: Math.max(0,p), carbs: Math.max(0,cb), fat: Math.max(0,f) };
}

function updateNutritionDisplay(item, activeMods) {
  const adj = getAdjustedItem(item, activeMods);
  const rm = store.getState().remainingMacros;
  const nf = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  nf('nf-calories', `${adj.calories} kcal`);
  nf('nf-fat', `${adj.fat} g`);
  nf('nf-carbs', `${adj.carbs} g`);
  nf('nf-protein', `${adj.protein} g`);

  const nameEl = document.getElementById('detail-item-name');
  if (nameEl) {
    const mods = [...activeMods].map(i => item.modifications[i].name);
    nameEl.textContent = mods.length ? `${item.name} (${mods.join(', ')})` : item.name;
  }

  const bars = document.getElementById('detail-macro-bars');
  if (bars) {
    const macros = [
      { key: 'calories', value: adj.calories, rem: rm.calories, unit: 'kcal' },
      { key: 'protein', value: adj.protein, rem: rm.protein, unit: 'g' },
      { key: 'carbs', value: adj.carbs, rem: rm.carbs, unit: 'g' },
      { key: 'fat', value: adj.fat, rem: rm.fat, unit: 'g' },
    ];
    const rows = bars.querySelectorAll('.detail-macro-row');
    macros.forEach((m, i) => {
      const pct = m.rem > 0 ? Math.round((m.value / m.rem) * 100) : 0;
      if (rows[i]) {
        rows[i].querySelector('.detail-macro-row__amount').textContent = `${m.value} ${m.unit}`;
        rows[i].querySelector('.detail-macro-row__pct').textContent = `${pct}% of remaining`;
        rows[i].querySelector('.progress-bar__fill').style.width = `${Math.min(100,pct)}%`;
      }
    });
  }
}

function showLogConfirmation(item) {
  const overlay = document.createElement('div');
  overlay.className = 'log-confirmation';
  overlay.innerHTML = `
    <div class="log-confirmation__check">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <div class="log-confirmation__text">Item Logged!</div>
    <div class="log-confirmation__sub">${item.name} — ${item.calories} kcal</div>`;
  (frameEl || document.body).appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      overlay.remove();
      store.setState({ selectedItem: null, selectedRestaurant: null });
      store.setSheet('collapsed');
    }, 300);
  }, 1400);
}
