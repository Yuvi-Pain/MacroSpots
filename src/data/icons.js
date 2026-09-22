/* ============================================
   MacroSpots — Restaurant Icon System
   Custom-drawn category glyphs (no third-party
   brand marks) so every store gets a crisp,
   consistent icon instead of a stray emoji.
   ============================================ */

/* ---- Raw glyph paths per food category ---- */
const GLYPHS = {
  burger: `<path d="M4 11h16a1 1 0 0 1 1 1v.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 12.5V12a1 1 0 0 1 1-1Z" fill="currentColor"/>
    <path d="M5 9.5C5 6.5 8.1 4 12 4s7 2.5 7 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="3.5" y="14.5" width="17" height="2" rx="1" fill="currentColor" opacity="0.9"/>
    <path d="M4 18h16a1 1 0 0 1 1 1v.2A1.8 1.8 0 0 1 19.2 21H4.8A1.8 1.8 0 0 1 3 19.2V19a1 1 0 0 1 1-1Z" fill="currentColor"/>`,

  chicken: `<path d="M9 4.5c1.7-1 3.6-1 5 .3 1.6 1.5 1.7 3.9.6 6.1l3.9 4.9a2 2 0 0 1-.2 2.6l-.4.4a2 2 0 0 1-2.7 0l-4.3-4.3c-2.1.7-4.3.2-5.6-1.3-1.6-1.9-1.5-4.9.4-6.7Z" fill="currentColor"/>
    <circle cx="9.3" cy="8.4" r="0.9" fill="var(--color-bg-primary)"/>`,

  sub: `<rect x="2.5" y="10" width="19" height="6" rx="3" fill="currentColor"/>
    <path d="M4 10.2c1.8-2.4 14.2-2.4 16 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
    <path d="M6 12.3h.01M9.4 12.3h.01M12.8 12.3h.01M16.2 12.3h.01" stroke="var(--color-bg-primary)" stroke-width="1.6" stroke-linecap="round"/>`,

  coffee: `<path d="M5 8h11.5a1 1 0 0 1 1 1v5.5A4.5 4.5 0 0 1 13 19H9a4.5 4.5 0 0 1-4.5-4.5V8Z" fill="currentColor"/>
    <path d="M17.5 9.5H19a2.2 2.2 0 0 1 0 4.4h-1.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <path d="M8 5.2c0 .9-1 .9-1 1.8M11.3 5.2c0 .9-1 .9-1 1.8M14.6 5.2c0 .9-1 .9-1 1.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.8"/>`,

  pizza: `<path d="M12 3 21 19H3Z" fill="currentColor"/>
    <circle cx="12" cy="10.5" r="1.1" fill="var(--color-bg-primary)"/>
    <circle cx="9.4" cy="14" r="1.1" fill="var(--color-bg-primary)"/>
    <circle cx="14.6" cy="14" r="1.1" fill="var(--color-bg-primary)"/>`,

  taco: `<path d="M3 13a9 9 0 0 1 18 0 2.5 2.5 0 0 1-2.5 2.5c-.9 0-1.3-.6-2-.6s-1.1.6-2 .6-1.3-.6-2-.6-1.1.6-2 .6-1.3-.6-2-.6-1.1.6-2 .6A2.5 2.5 0 0 1 3 13Z" fill="currentColor"/>
    <path d="M6.5 12.2h.01M10 11.6h.01M13.7 11.6h.01M17.2 12.2h.01" stroke="var(--color-bg-primary)" stroke-width="1.6" stroke-linecap="round"/>`,

  fries: `<path d="M6 9v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9l-1.4-4.6A1 1 0 0 0 15.6 3H8.4a1 1 0 0 0-1 .4L6 9Z" fill="currentColor" opacity="0.25"/>
    <rect x="7.5" y="6" width="2" height="12" rx="1" fill="currentColor"/>
    <rect x="11" y="4.5" width="2" height="13.5" rx="1" fill="currentColor"/>
    <rect x="14.5" y="6" width="2" height="12" rx="1" fill="currentColor"/>`,

  bowl: `<path d="M3 11h18a9 9 0 0 1-18 0Z" fill="currentColor"/>
    <path d="M9 11c.2-1.6 1.4-2.8 3-2.8s2.8 1.2 3 2.8" fill="none" stroke="var(--color-bg-primary)" stroke-width="1.4" stroke-linecap="round"/>`,
};

/* ---- Per-category accent color (food-type based, not brand-specific) ---- */
const CATEGORY_COLOR = {
  burger:  '#f59e0b',
  chicken: '#f97316',
  sub:     '#22c55e',
  coffee:  '#a16207',
  pizza:   '#ef4444',
  taco:    '#eab308',
  fries:   '#facc15',
  bowl:    '#34d399',
};

const FALLBACK_CATEGORY = 'bowl';

export function categoryColor(category) {
  return CATEGORY_COLOR[category] || CATEGORY_COLOR[FALLBACK_CATEGORY];
}

/** Raw inner-SVG markup for a category glyph (no wrapping <svg>). */
export function glyphPath(category) {
  return GLYPHS[category] || GLYPHS[FALLBACK_CATEGORY];
}

/** Standalone <svg> icon, sized for inline use (score badges, pins, etc). */
export function iconSVG(category, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${glyphPath(category)}</svg>`;
}

/**
 * A small circular badge combining the glyph + its category color.
 * Used anywhere a restaurant needs a compact visual identity:
 * list cards, sheet headers, detail hero.
 */
export function iconBadge(category, size = 28) {
  const color = categoryColor(category);
  const iconSize = Math.round(size * 0.6);
  return `<span class="restaurant-badge" style="--badge-color:${color};width:${size}px;height:${size}px">
    <span class="restaurant-badge__glyph" style="color:${color}">${iconSVG(category, iconSize)}</span>
  </span>`;
}
