/* ============================================
   MacroSpots — Mock API Layer
   Simulates network delay for realistic UX
   ============================================ */

import { restaurants } from '../data/restaurants.js';
import { calculateMacroFitScore } from '../engine/macroMatcher.js';
import { iconBadge } from '../data/icons.js';

function delay(ms) {
  const jitter = Math.random() * 400 - 200; // ±200ms
  return new Promise(resolve => setTimeout(resolve, Math.max(300, ms + jitter)));
}

/* ---- Shared item enrichment (single source of truth for score + pct) ---- */
function enrichItem(item, restaurant, remainingMacros, priorityMode) {
  const score = calculateMacroFitScore(item, remainingMacros, priorityMode);
  return {
    ...item,
    restaurantName: restaurant.name,
    restaurantEmoji: restaurant.emoji,
    restaurantCategory: restaurant.category,
    restaurantIcon: iconBadge(restaurant.category, 26),
    restaurantId: restaurant.id,
    score,
    pctCalories: Math.round((item.calories / Math.max(1, remainingMacros.calories)) * 100),
    pctProtein: Math.round((item.protein / Math.max(1, remainingMacros.protein)) * 100),
    pctCarbs: Math.round((item.carbs / Math.max(1, remainingMacros.carbs)) * 100),
    pctFat: Math.round((item.fat / Math.max(1, remainingMacros.fat)) * 100),
  };
}

/* ---- Synchronous: score a single restaurant's items (for bottom sheet half-view) ---- */
export function scoreRestaurantItems(restaurant, remainingMacros, priorityMode) {
  return restaurant.items
    .map(item => enrichItem(item, restaurant, remainingMacros, priorityMode))
    .sort((a, b) => b.score - a.score);
}

/* ---- Synchronous: score top items across all restaurants (for discovery view) ---- */
export function scoreTopItems(remainingMacros, priorityMode, limit = 15) {
  const allItems = [];
  restaurants.forEach(r => {
    r.items.forEach(item => {
      allItems.push(enrichItem(item, r, remainingMacros, priorityMode));
    });
  });
  allItems.sort((a, b) => b.score - a.score);
  return allItems.slice(0, limit);
}

/* ---- Async API endpoints (with simulated network delay) ---- */

export async function getNearbyRestaurants(filters = {}) {
  await delay(800);
  let results = [...restaurants];
  if (filters.cuisine) {
    results = results.filter(r => r.cuisine.toLowerCase() === filters.cuisine.toLowerCase());
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.items.some(i => i.name.toLowerCase().includes(q))
    );
  }
  return results;
}

export async function getMenuItems(restaurantId, filters = {}) {
  await delay(600);
  const restaurant = restaurants.find(r => r.id === restaurantId);
  if (!restaurant) return [];
  let items = [...restaurant.items];

  if (filters.dietaryTags?.length) {
    items = items.filter(item =>
      filters.dietaryTags.every(tag => item.dietaryTags.includes(tag))
    );
  }
  if (filters.maxCalories) items = items.filter(i => i.calories <= filters.maxCalories);
  if (filters.minProtein) items = items.filter(i => i.protein >= filters.minProtein);
  return items;
}

export async function getRecommendations(remainingMacros, priorityMode = null, dietaryPrefs = []) {
  await delay(1200);
  const allItems = [];
  restaurants.forEach(r => {
    r.items.forEach(item => {
      // Filter by dietary prefs
      if (dietaryPrefs.length) {
        const hasVeg = dietaryPrefs.includes('vegetarian');
        const hasVegan = dietaryPrefs.includes('vegan');
        if (hasVeg && !item.dietaryTags.includes('vegetarian') && !item.dietaryTags.includes('vegan')) return;
        if (hasVegan && !item.dietaryTags.includes('vegan')) return;
      }
      allItems.push(enrichItem(item, r, remainingMacros, priorityMode));
    });
  });
  // Sort by score descending
  allItems.sort((a, b) => b.score - a.score);
  return allItems;
}

