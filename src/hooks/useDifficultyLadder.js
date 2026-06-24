import { useState, useCallback } from 'react';

/**
 * useDifficultyLadder
 * ─────────────────────
 * Tracks perfect score streaks and auto-advances difficulty level (1→5).
 * Per spec: "auto-advances on 3 perfect scores"
 *
 * Returns:
 *  - level: current difficulty level (1–5)
 *  - perfectStreak: how many consecutive perfect answers
 *  - onPerfect(): call when player answers correctly
 *  - onMistake(): call on wrong answer (resets streak)
 *  - progressToNextLevel: 0–1 float for progress bar
 *  - isMaxLevel: true if at level 5
 */
export default function useDifficultyLadder(perfectsNeeded = 3, maxLevel = 5) {
  const [level, setLevel] = useState(1);
  const [perfectStreak, setPerfectStreak] = useState(0);

  const onPerfect = useCallback(() => {
    setPerfectStreak((prev) => {
      const next = prev + 1;
      if (next >= perfectsNeeded) {
        setLevel((l) => Math.min(l + 1, maxLevel));
        return 0; // reset streak
      }
      return next;
    });
  }, [perfectsNeeded, maxLevel]);

  const onMistake = useCallback(() => {
    setPerfectStreak(0);
  }, []);

  const reset = useCallback(() => {
    setLevel(1);
    setPerfectStreak(0);
  }, []);

  return {
    level,
    perfectStreak,
    onPerfect,
    onMistake,
    reset,
    progressToNextLevel: perfectStreak / perfectsNeeded,
    isMaxLevel: level >= maxLevel,
    pointMultiplier: level, // score multiplier based on level
  };
}
