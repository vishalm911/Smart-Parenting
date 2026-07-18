import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Visual Number Array — shows dots grouped into rows/columns
 * for multiplication understanding (e.g., 3×4 = 12 dots in 3 rows of 4)
 */
export default function NumberArray({ rows, cols, color = '#7C4DFF', animate = true }) {
  const [revealed, setRevealed] = useState([]);

  useEffect(() => {
    Promise.resolve().then(() => {
      setRevealed([]);
    });
    const total = rows * cols;
    let i = 0;
    const timer = setInterval(() => {
      if (i >= total) { clearInterval(timer); return; }
      setRevealed((prev) => [...prev, i]);
      i++;
    }, animate ? 80 : 0);
    return () => clearInterval(timer);
  }, [rows, cols, animate]);

  return (
    <div className="flex flex-col items-center gap-1">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-1">
          {Array.from({ length: cols }).map((_, c) => {
            const idx = r * cols + c;
            const isVisible = revealed.includes(idx);
            return (
              <motion.div
                key={c}
                initial={{ scale: 0, opacity: 0 }}
                animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                style={{ background: color }}
              >
                •
              </motion.div>
            );
          })}
        </div>
      ))}
      <div className="mt-2 text-center">
        <span className="text-sm font-bold" style={{ color, fontFamily: 'var(--font-display)' }}>
          {rows} × {cols} = {rows * cols}
        </span>
      </div>
    </div>
  );
}

/* ─── Multiplication Quest Game using Visual Arrays ─── */
const MULT_QUESTIONS = [
  { rows: 2, cols: 3, ans: 6  },
  { rows: 3, cols: 3, ans: 9  },
  { rows: 2, cols: 4, ans: 8  },
  { rows: 3, cols: 4, ans: 12 },
  { rows: 4, cols: 4, ans: 16 },
  { rows: 2, cols: 5, ans: 10 },
  { rows: 3, cols: 5, ans: 15 },
  { rows: 4, cols: 5, ans: 20 },
];

const COLORS = ['#7C4DFF', '#E91E8C', '#F5A623', '#2EC4B6', '#FF6B9D', '#66BB6A'];

// Pure function helper to generate multiplication options
const generateMultOptions = (ans) => {
  const opts = new Set([ans]);
  while (opts.size < 4) {
    const wrong = ans + Math.floor(Math.random() * 7) - 3;
    if (wrong > 0 && wrong !== ans) opts.add(wrong);
  }
  return [...opts].sort(() => Math.random() - 0.5);
};

export function MultiplicationQuestGame({ onBack, onScoreUpdate }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showArray, setShowArray] = useState(true);

  const q = MULT_QUESTIONS[round % MULT_QUESTIONS.length];
  const color = COLORS[round % COLORS.length];

  const timeoutFiredRef = useRef(false);

  // Memoize options so they don't reshuffle on every render
  const options = useMemo(() => generateMultOptions(q.ans), [q.ans]);

  const handleAnswer = useCallback((answer) => {
    if (feedback) return;
    if (answer === q.ans) {
      const pts = 30 * level;
      const ns = score + pts;
      setScore(ns);
      setFeedback('correct');
      const newStreak = perfectStreak + 1;
      setPerfectStreak(newStreak);
      if (newStreak >= 3 && level < 5) {
        setLevel((l) => l + 1);
        setPerfectStreak(0);
      }
      onScoreUpdate?.(ns, level);
    } else {
      setFeedback('wrong');
      setPerfectStreak(0);
    }
    setTimeout(() => {
      setFeedback(null);
      setShowArray(false);
      setTimeout(() => {
        setRound((r) => r + 1);
        setShowArray(true);
      }, 200);
    }, 1200);
  }, [feedback, q.ans, level, score, perfectStreak, onScoreUpdate]);

  // Timer useEffect hook
  useEffect(() => {
    if (feedback) return;
    Promise.resolve().then(() => {
      setTimeLeft(15);
    });
    timeoutFiredRef.current = false;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1 && !timeoutFiredRef.current) {
          timeoutFiredRef.current = true;
          clearInterval(timer);
          setTimeout(() => handleAnswer(-1), 0);
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [round, feedback, handleAnswer]);

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold px-3 py-1 rounded-full text-white text-sm" style={{ background: 'linear-gradient(135deg, #7C4DFF, #FF6B9D)' }}>
          🏆 {score}
        </span>
        <span className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
          Level {level} · Streak {perfectStreak}/3
        </span>
        <span
          className="font-bold px-3 py-1 rounded-full text-white text-sm"
          style={{ background: timeLeft <= 5 ? '#F44336' : '#4CAF50' }}
        >
          ⏱ {timeLeft}s
        </span>
      </div>

      <div className="card p-6 mb-4 text-center">
        <p className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          What is <span style={{ color }}>{q.rows} × {q.cols}</span>?
        </p>

        {/* Visual Array */}
        <div className="flex justify-center mb-4">
          {showArray && (
            <NumberArray rows={q.rows} cols={q.cols} color={color} animate={true} />
          )}
        </div>

        {/* Toggle hint */}
        <button
          onClick={() => setShowArray((v) => !v)}
          className="text-xs font-semibold mb-4 underline"
          style={{ color: 'var(--text-muted)' }}
        >
          {showArray ? 'Hide dots' : 'Show dots hint'}
        </button>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
              className="font-bold text-2xl rounded-2xl py-4 shadow-md transition-colors"
              style={{
                background: feedback && opt === q.ans ? '#4CAF50'
                  : 'var(--bg-accent)',
                color: feedback && opt === q.ans ? 'white' : 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {opt}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-lg font-bold"
              style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336', fontFamily: 'var(--font-display)' }}
            >
              {feedback === 'correct' ? `✅ Correct! +${30 * level} pts` : `❌ Answer: ${q.ans}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Difficulty Ladder */}
      <div className="card p-3">
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Difficulty Ladder</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((l) => (
            <div
              key={l}
              className="flex-1 h-2 rounded-full"
              style={{ background: l <= level ? color : 'var(--border-default)' }}
            />
          ))}
        </div>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
          3 perfect answers → Level up! ({perfectStreak}/3)
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="btn-ghost w-full py-3 mt-4"
      >
        ← Back to Logic Island
      </motion.button>
    </div>
  );
}
