import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Animated score display — uses CSS vars for theme consistency.
 */
export default function ScoreDisplay({
  score = 0,
  level = 1,
  lives = 3,
  maxLives = 3,
  streak = 0,
  timeLeft,
  className = '',
}) {
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    let start = displayScore;
    const end = score;
    if (start === end) return;
    const range = end - start;
    let current = start;
    // Step by a proportion to complete within 600ms
    const stepTime = Math.max(16, Math.floor(600 / Math.abs(range || 1)));
    const increment = end > start ? 1 : -1;
    
    const timer = setInterval(() => {
      current += increment;
      setDisplayScore(current);
      if (current === end) {
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [score]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-3 p-4 rounded-2xl shadow-lg ${className}`}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
    >
      {/* Score */}
      <motion.div
        key={displayScore}
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-white"
        style={{ background: 'linear-gradient(135deg, #F5A623, #FFCC02)' }}
      >
        <span className="text-lg">🏆</span>
        <span className="font-bold text-sm">{displayScore}</span>
      </motion.div>

      {/* Level */}
      <div
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
        style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)' }}
      >
        <span className="text-lg">📊</span>
        <span className="font-bold text-sm">Lvl {level}</span>
      </div>

      {/* Lives */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxLives }).map((_, i) => (
          <motion.span key={i} animate={i >= lives ? { scale: [1, 0.5], opacity: [1, 0.3] } : {}} className="text-lg">
            {i < lives ? '❤️' : '🤍'}
          </motion.span>
        ))}
      </div>

      {/* Streak */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 text-white rounded-xl px-3 py-1.5"
          style={{ background: 'linear-gradient(135deg, #FF6B9D, #7C4DFF)' }}
        >
          <span className="text-lg">🔥</span>
          <span className="font-bold text-sm">{streak}x</span>
        </motion.div>
      )}

      {/* Timer */}
      {timeLeft !== undefined && (
        <div
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono font-bold text-sm"
          style={{
            background: timeLeft <= 10 ? '#F44336' : 'var(--bg-accent)',
            color: timeLeft <= 10 ? 'white' : 'var(--text-primary)',
          }}
        >
          <span>⏱️</span>
          <span>{timeLeft}s</span>
        </div>
      )}
    </div>
  );
}
