import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing game state within any game component.
 * Handles score, lives, level, timer, and reward animations.
 */
export default function useGameState(initialConfig = {}) {
  const {
    maxLives = 3,
    initialLevel = 1,
    pointsPerCorrect = 10,
    bonusPerStreak = 5,
    timerEnabled = false,
    timerDuration = 60,
  } = initialConfig;

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(maxLives);
  const [level, setLevel] = useState(initialLevel);
  const [streak, setStreak] = useState(0);
  const [stars, setStars] = useState(0);
  const [xp, setXp] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStarAnimation, setShowStarAnimation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const timerRef = useRef(null);
  // Ref to always hold latest score — avoids stale closures in callbacks
  const scoreRef = useRef(0);

  const onCorrectAnswer = useCallback(() => {
    const streakBonus = streak >= 3 ? bonusPerStreak * Math.floor(streak / 3) : 0;
    const earned = pointsPerCorrect + streakBonus;
    const newScore = scoreRef.current + earned;
    scoreRef.current = newScore;
    setScore(newScore);
    setStreak((s) => s + 1);
    setXp((x) => x + earned);

    // Award star every 50 points — use ref to avoid stale closure
    if (Math.floor(newScore / 50) > Math.floor((newScore - earned) / 50)) {
      setStars((s) => s + 1);
      setShowStarAnimation(true);
      setTimeout(() => setShowStarAnimation(false), 1500);
    }
  }, [streak, pointsPerCorrect, bonusPerStreak]);

  const onWrongAnswer = useCallback(() => {
    setStreak(0);
    setLives((l) => {
      if (l <= 1) {
        setIsComplete(true);
        return 0;
      }
      return l - 1;
    });
  }, []);

  const levelUp = useCallback(() => {
    setLevel((l) => l + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const startTimer = useCallback(() => {
    if (!timerEnabled) return;
    setTimeLeft(timerDuration);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setIsComplete(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [timerEnabled, timerDuration]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const resetGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setLives(maxLives);
    setLevel(initialLevel);
    setStreak(0);
    setStars(0);
    setXp(0);
    setIsComplete(false);
    setShowConfetti(false);
    setTimeLeft(timerDuration);
    stopTimer();
  }, [maxLives, initialLevel, timerDuration, stopTimer]);

  return {
    score,
    lives,
    level,
    streak,
    stars,
    xp,
    isComplete,
    showConfetti,
    showStarAnimation,
    timeLeft,
    onCorrectAnswer,
    onWrongAnswer,
    levelUp,
    startTimer,
    stopTimer,
    resetGame,
    setIsComplete,
  };
}
