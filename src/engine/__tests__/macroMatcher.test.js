/* ============================================
   MacroSpots — macroMatcher.js Property-Based Tests
   Uses fast-check to verify scoring invariants
   across thousands of random input combinations
   ============================================ */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateMacroFitScore } from '../macroMatcher.js';

/* ---- Arbitraries: generate realistic random inputs ---- */

/** A random menu item with non-negative macro values */
const arbItem = fc.record({
  calories: fc.integer({ min: 0, max: 2000 }),
  protein:  fc.integer({ min: 0, max: 150 }),
  carbs:    fc.integer({ min: 0, max: 300 }),
  fat:      fc.integer({ min: 0, max: 100 }),
});

/** Remaining macros (what the user has left for the day) */
const arbRemaining = fc.record({
  calories: fc.integer({ min: 0, max: 4000 }),
  protein:  fc.integer({ min: 0, max: 300 }),
  carbs:    fc.integer({ min: 0, max: 500 }),
  fat:      fc.integer({ min: 0, max: 200 }),
});

/** Non-zero remaining macros (for ratio-based tests) */
const arbRemainingPositive = fc.record({
  calories: fc.integer({ min: 100, max: 4000 }),
  protein:  fc.integer({ min: 10, max: 300 }),
  carbs:    fc.integer({ min: 10, max: 500 }),
  fat:      fc.integer({ min: 5, max: 200 }),
});

/** Valid priority modes including null */
const arbPriorityMode = fc.constantFrom(null, 'high_protein', 'low_cal', 'low_fat');


/* ============================================
   Property 1: Score is ALWAYS in [0, 100]
   ============================================ */
describe('Invariant: Score range', () => {
  it('always returns an integer in [0, 100] for any non-negative inputs', () => {
    fc.assert(
      fc.property(arbItem, arbRemaining, arbPriorityMode, (item, remaining, mode) => {
        const score = calculateMacroFitScore(item, remaining, mode);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(Number.isInteger(score)).toBe(true);
      }),
      { numRuns: 5000 }
    );
  });
});


/* ============================================
   Property 2: Exceeding ALL macros → score ≤ 40
   ============================================ */
describe('Invariant: Exceeds cap', () => {
  it('scores ≤ 40 when item exceeds every remaining macro', () => {
    fc.assert(
      fc.property(arbRemainingPositive, arbPriorityMode, (remaining, mode) => {
        // Construct an item that exceeds every macro dimension
        const item = {
          calories: remaining.calories + 100,
          protein:  remaining.protein + 10,
          carbs:    remaining.carbs + 20,
          fat:      remaining.fat + 10,
        };
        const score = calculateMacroFitScore(item, remaining, mode);
        expect(score).toBeLessThanOrEqual(40);
      }),
      { numRuns: 2000 }
    );
  });
});


/* ============================================
   Property 3: Determinism — same inputs → same output
   ============================================ */
describe('Invariant: Determinism', () => {
  it('returns identical scores for identical inputs', () => {
    fc.assert(
      fc.property(arbItem, arbRemaining, arbPriorityMode, (item, remaining, mode) => {
        const score1 = calculateMacroFitScore(item, remaining, mode);
        const score2 = calculateMacroFitScore(item, remaining, mode);
        expect(score1).toBe(score2);
      }),
      { numRuns: 2000 }
    );
  });
});


/* ============================================
   Property 4: Zero remaining macros → no crash
   ============================================ */
describe('Invariant: Zero-division safety', () => {
  it('never throws when remaining macros are all zero', () => {
    const zeroRemaining = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    fc.assert(
      fc.property(arbItem, arbPriorityMode, (item, mode) => {
        expect(() => {
          calculateMacroFitScore(item, zeroRemaining, mode);
        }).not.toThrow();

        const score = calculateMacroFitScore(item, zeroRemaining, mode);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }),
      { numRuns: 1000 }
    );
  });

  it('never throws when a single remaining macro is zero', () => {
    fc.assert(
      fc.property(arbItem, arbPriorityMode, (item, mode) => {
        const partialZero = { calories: 0, protein: 50, carbs: 100, fat: 30 };
        expect(() => {
          calculateMacroFitScore(item, partialZero, mode);
        }).not.toThrow();
      }),
      { numRuns: 1000 }
    );
  });
});


/* ============================================
   Property 5: high_protein mode rewards protein
   ============================================ */
describe('Priority mode: high_protein', () => {
  it('scores a high-protein item >= a low-protein item (all else equal)', () => {
    fc.assert(
      fc.property(arbRemainingPositive, (remaining) => {
        // Build items as safe fractions of remaining so neither exceeds any macro
        const baseCal = Math.round(remaining.calories * 0.3);
        const baseCarb = Math.round(remaining.carbs * 0.3);
        const baseFat = Math.round(remaining.fat * 0.3);

        const highProtein = { calories: baseCal, protein: Math.round(remaining.protein * 0.5), carbs: baseCarb, fat: baseFat };
        const lowProtein  = { calories: baseCal, protein: Math.round(remaining.protein * 0.1), carbs: baseCarb, fat: baseFat };

        const scoreHigh = calculateMacroFitScore(highProtein, remaining, 'high_protein');
        const scoreLow  = calculateMacroFitScore(lowProtein, remaining, 'high_protein');

        expect(scoreHigh).toBeGreaterThanOrEqual(scoreLow);
      }),
      { numRuns: 2000 }
    );
  });
});


/* ============================================
   Property 6: low_cal mode penalizes high calories
   ============================================ */
describe('Priority mode: low_cal', () => {
  it('scores a low-calorie item >= a high-calorie item (all else equal)', () => {
    fc.assert(
      fc.property(arbRemainingPositive, (remaining) => {
        // Keep non-calorie macros at safe 30% of remaining
        const basePro = Math.round(remaining.protein * 0.3);
        const baseCarb = Math.round(remaining.carbs * 0.3);
        const baseFat = Math.round(remaining.fat * 0.3);

        const lowCal  = { calories: Math.round(remaining.calories * 0.15), protein: basePro, carbs: baseCarb, fat: baseFat };
        const highCal = { calories: Math.round(remaining.calories * 0.8),  protein: basePro, carbs: baseCarb, fat: baseFat };

        const scoreLow  = calculateMacroFitScore(lowCal, remaining, 'low_cal');
        const scoreHigh = calculateMacroFitScore(highCal, remaining, 'low_cal');

        expect(scoreLow).toBeGreaterThanOrEqual(scoreHigh);
      }),
      { numRuns: 2000 }
    );
  });
});


/* ============================================
   Property 7: low_fat mode penalizes high fat
   ============================================ */
describe('Priority mode: low_fat', () => {
  it('scores a low-fat item >= a high-fat item (all else equal)', () => {
    fc.assert(
      fc.property(arbRemainingPositive, (remaining) => {
        // Keep non-fat macros at safe 30% of remaining
        const baseCal = Math.round(remaining.calories * 0.3);
        const basePro = Math.round(remaining.protein * 0.3);
        const baseCarb = Math.round(remaining.carbs * 0.3);

        const lowFat  = { calories: baseCal, protein: basePro, carbs: baseCarb, fat: Math.round(remaining.fat * 0.1) };
        const highFat = { calories: baseCal, protein: basePro, carbs: baseCarb, fat: Math.round(remaining.fat * 0.8) };

        const scoreLowFat  = calculateMacroFitScore(lowFat, remaining, 'low_fat');
        const scoreHighFat = calculateMacroFitScore(highFat, remaining, 'low_fat');

        expect(scoreLowFat).toBeGreaterThanOrEqual(scoreHighFat);
      }),
      { numRuns: 2000 }
    );
  });
});


/* ============================================
   Property 8: Sweet-spot scoring
   An item using 30–60% of remaining should score
   higher than one using <10% (under-utilization)
   ============================================ */
describe('Scoring curve: sweet spot vs under-utilization', () => {
  it('sweet-spot items outscore tiny items (no priority mode)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 500, max: 3000 }),  // remaining calories
        fc.integer({ min: 50, max: 200 }),    // remaining protein
        fc.integer({ min: 80, max: 400 }),    // remaining carbs
        fc.integer({ min: 20, max: 150 }),    // remaining fat
        (remCal, remPro, remCarb, remFat) => {
          const remaining = { calories: remCal, protein: remPro, carbs: remCarb, fat: remFat };

          // Sweet spot: ~40% of each remaining macro
          const sweetSpot = {
            calories: Math.round(remCal * 0.4),
            protein:  Math.round(remPro * 0.4),
            carbs:    Math.round(remCarb * 0.4),
            fat:      Math.round(remFat * 0.4),
          };

          // Tiny: ~5% of each remaining macro
          const tiny = {
            calories: Math.round(remCal * 0.05),
            protein:  Math.round(remPro * 0.05),
            carbs:    Math.round(remCarb * 0.05),
            fat:      Math.round(remFat * 0.05),
          };

          const scoreSweetSpot = calculateMacroFitScore(sweetSpot, remaining, null);
          const scoreTiny      = calculateMacroFitScore(tiny, remaining, null);

          expect(scoreSweetSpot).toBeGreaterThan(scoreTiny);
        }
      ),
      { numRuns: 2000 }
    );
  });
});


/* ============================================
   Concrete regression tests (known-good values)
   ============================================ */
describe('Regression: known-good scores', () => {
  const defaultRemaining = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

  it('Big Mac scores in a reasonable range with default macros', () => {
    const bigMac = { calories: 590, protein: 25, carbs: 46, fat: 34 };
    const score = calculateMacroFitScore(bigMac, defaultRemaining, null);
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThanOrEqual(85);
  });

  it('6" Turkey Breast from Subway scores well (low cal, decent protein)', () => {
    const turkey = { calories: 280, protein: 18, carbs: 40, fat: 4 };
    const score = calculateMacroFitScore(turkey, defaultRemaining, null);
    expect(score).toBeGreaterThanOrEqual(50);
  });

  it('zero-calorie item with zero remaining does not crash and returns valid score', () => {
    const nothing = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const zeroRem = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const score = calculateMacroFitScore(nothing, zeroRem, null);
    // ratio=0 for all dims → under-utilization branch → ~55 (not 0)
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('high_protein mode boosts a protein-heavy item', () => {
    const proteinBomb = { calories: 300, protein: 45, carbs: 10, fat: 8 };
    const scoreDefault = calculateMacroFitScore(proteinBomb, defaultRemaining, null);
    const scoreHP      = calculateMacroFitScore(proteinBomb, defaultRemaining, 'high_protein');
    expect(scoreHP).toBeGreaterThanOrEqual(scoreDefault);
  });
});
