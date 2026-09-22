/* ============================================
   MacroSpots — Macro Fit Score Engine
   Calculates how well a menu item fits
   within the user's remaining daily macros
   ============================================ */

/**
 * Calculates a 0–100 "Macro Fit Score" for a menu item.
 *
 * Algorithm:
 * 1. For each macro dimension, calculate usage ratio (item / remaining)
 * 2. Ideal ratio is 0.3–0.6 (uses a reasonable portion of remaining)
 * 3. Apply priority weighting if user has a priority mode
 * 4. Heavy penalty for exceeding any remaining macro (ratio > 1.0)
 * 5. Bonus for balanced macro consumption
 */
export function calculateMacroFitScore(item, remaining, priorityMode = null) {
  const dims = [
    { key: 'calories', val: item.calories, rem: remaining.calories, weight: 1.0 },
    { key: 'protein',  val: item.protein,  rem: remaining.protein,  weight: 1.0 },
    { key: 'carbs',    val: item.carbs,    rem: remaining.carbs,    weight: 0.8 },
    { key: 'fat',      val: item.fat,      rem: remaining.fat,      weight: 0.9 },
  ];

  // Apply priority weighting
  if (priorityMode === 'high_protein') {
    dims.find(d => d.key === 'protein').weight = 2.0;
    dims.find(d => d.key === 'calories').weight = 0.8;
  } else if (priorityMode === 'low_cal') {
    dims.find(d => d.key === 'calories').weight = 2.0;
  } else if (priorityMode === 'low_fat') {
    dims.find(d => d.key === 'fat').weight = 2.0;
    dims.find(d => d.key === 'calories').weight = 0.8;
  }

  let totalScore = 0;
  let totalWeight = 0;
  let anyExceeds = false;

  dims.forEach(d => {
    const ratio = d.rem > 0 ? d.val / d.rem : (d.val > 0 ? 2 : 0);
    let dimScore;

    if (ratio > 1.0) {
      // Exceeds remaining — heavy penalty
      anyExceeds = true;
      dimScore = Math.max(0, 100 - (ratio - 1) * 150);
    } else if (ratio >= 0.3 && ratio <= 0.65) {
      // Sweet spot — high score
      dimScore = 85 + (1 - Math.abs(ratio - 0.475) / 0.175) * 15;
    } else if (ratio < 0.3) {
      // Under-utilizes remaining — moderate score
      dimScore = 50 + (ratio / 0.3) * 35;
    } else {
      // 0.65 to 1.0 — still good but leaves less room
      dimScore = 85 - ((ratio - 0.65) / 0.35) * 40;
    }

    // For high_protein, reward high protein ratios
    if (priorityMode === 'high_protein' && d.key === 'protein') {
      if (ratio >= 0.3 && ratio <= 1.0) dimScore = Math.min(100, dimScore + 15);
    }
    // For low_cal, reward low calorie usage
    if (priorityMode === 'low_cal' && d.key === 'calories') {
      if (ratio < 0.5) dimScore = Math.min(100, dimScore + 10);
    }
    // For low_fat, reward low fat usage
    if (priorityMode === 'low_fat' && d.key === 'fat') {
      if (ratio < 0.4) dimScore = Math.min(100, dimScore + 10);
    }

    totalScore += dimScore * d.weight;
    totalWeight += d.weight;
  });

  let finalScore = totalScore / totalWeight;

  // Balance bonus: reward items that use macros proportionally
  const ratios = dims.map(d => d.rem > 0 ? d.val / d.rem : 0);
  const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const variance = ratios.reduce((a, r) => a + Math.pow(r - avgRatio, 2), 0) / ratios.length;
  if (variance < 0.02 && !anyExceeds) finalScore = Math.min(100, finalScore + 5);

  // Hard cap
  if (anyExceeds) finalScore = Math.min(finalScore, 40);

  return Math.round(Math.max(0, Math.min(100, finalScore)));
}
