import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import GameCard from '../../components/common/GameCard';
import ScoreDisplay from '../../components/common/ScoreDisplay';
import ConfettiEffect from '../../components/animations/ConfettiEffect';
import StarAnimation from '../../components/animations/StarAnimation';
import FloatingElements from '../../components/animations/FloatingElements';
import useGameState from '../../hooks/useGameState';
import { getMathGames, saveNumeracyScore, awardProgress } from '../../firebase/services';
import ThreeDAbacus from '../../components/three/ThreeDAbacus';

/* ─── Fallback static data if Firestore empty ─── */
const FALLBACK_MATH_GAMES = [
  { id: 'counting-1-3',   title: 'Counting Fun',      description: 'Count colourful objects and learn numbers 1–10!', emoji: '🐻', ageRange: '1–3', difficulty: 'Easy',   gradient: 'bg-gradient-to-br from-[#FF9A56] via-[#F5A623] to-[#FFCC02]', type: 'counting' },
  { id: 'shape-numbers',  title: 'Shape Numbers',     description: 'Count the sides and corners of shapes!',        emoji: '🔷', ageRange: '1–3', difficulty: 'Easy',   gradient: 'bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF]',                type: 'counting' },
  { id: 'size-compare',   title: 'Size Compare',      description: 'Drag and order items from smallest to largest!', emoji: '📏', ageRange: '1–3', difficulty: 'Easy',   gradient: 'bg-gradient-to-br from-[#A8E6CF] to-[#56CCF2]',                type: 'ordering' },
  { id: 'number-match',   title: 'Number Match',      description: 'Match numbers to the right group of objects!',   emoji: '🎯', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#2EC4B6] to-[#4FC3F7]',                type: 'matching' },
  { id: 'number-order',   title: 'Number Order',      description: 'Tap numbers in the correct ascending order!',    emoji: '📊', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#66BB6A] to-[#2EC4B6]',                type: 'ordering' },
  { id: 'math-story',     title: 'Math Stories',      description: 'Solve fun maths problems hidden in stories!',    emoji: '📖', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#FDDB92] to-[#D1FDFF]',                type: 'story' },
  { id: 'abacus-simulation', title: '3D Abacus',      description: 'Interactive 3D abacus! Master place values and counting!', emoji: '🧮', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#7C4DFF] via-[#FF6B9D] to-[#F5A623]', type: 'abacus' },
  { id: 'add-sub',        title: 'Add & Subtract',    description: 'Master addition and subtraction!',              emoji: '➕', ageRange: '7–10', difficulty: 'Hard',   gradient: 'bg-gradient-to-br from-[#7C4DFF] to-[#FF6B9D]',                type: 'arithmetic' },
  { id: 'times-tables',   title: 'Times Tables',      description: 'Beat the clock! Speed through multiplications!', emoji: '✖️', ageRange: '7–10', difficulty: 'Hard',   gradient: 'bg-gradient-to-br from-[#FF6B9D] via-[#F5A623] to-[#FFD180]', type: 'arithmetic' },
];

/* ══════════════════════════════════════════════════════════════
   GAME 1 — Counting Fun (Age 1–3)
══════════════════════════════════════════════════════════════ */
function CountingGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 15 });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const { user, refreshProfile } = useUser();

  const questions = [
    { emoji: '🍎', count: 3, options: [2, 3, 4, 5] },
    { emoji: '🌟', count: 5, options: [3, 4, 5, 6] },
    { emoji: '🐶', count: 2, options: [1, 2, 3, 4] },
    { emoji: '🦋', count: 7, options: [5, 6, 7, 8] },
    { emoji: '🚗', count: 4, options: [2, 3, 4, 5] },
    { emoji: '🎈', count: 6, options: [4, 5, 6, 7] },
    { emoji: '🐱', count: 1, options: [1, 2, 3, 4] },
    { emoji: '🌺', count: 8, options: [6, 7, 8, 9] },
    { emoji: '🍭', count: 9, options: [7, 8, 9, 10] },
    { emoji: '🦄', count: 10, options: [8, 9, 10, 11] },
  ];
  const q = questions[currentQuestion % questions.length];

  const handleAnswer = useCallback((answer) => {
    if (feedback) return;
    setSelectedAnswer(answer);
    if (answer === q.count) { setFeedback('correct'); gameState.onCorrectAnswer(); }
    else { setFeedback('wrong'); gameState.onWrongAnswer(); }
    setTimeout(() => {
      setSelectedAnswer(null); setFeedback(null);
      if (currentQuestion + 1 >= questions.length) { gameState.levelUp(); setCurrentQuestion(0); }
      else setCurrentQuestion(c => c + 1);
    }, 1200);
  }, [feedback, q.count, currentQuestion, questions.length, gameState]);

  const hasSaved = useRef(false);
  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'counting-1-3', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'mathWorld' }).then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  if (gameState.isComplete) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <motion.span className="text-7xl mb-4" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>🎉</motion.span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Great Counting!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong> points!</p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={gameState.resetGame} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="btn-ghost">Back</motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />
      <motion.div key={currentQuestion} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="game-card-viewport p-8 mb-6">
        <p className="text-lg font-semibold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>How many {q.emoji} do you see?</p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Array.from({ length: q.count }).map((_, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: 'spring' }} className="text-5xl">{q.emoji}</motion.span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt) => {
            let style = { background: 'var(--bg-accent)', color: 'var(--text-primary)' };
            if (selectedAnswer !== null) {
              if (opt === q.count) style = { background: '#4CAF50', color: 'white' };
              else if (opt === selectedAnswer) style = { background: '#F44336', color: 'white' };
            }
            return (
              <motion.button key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => handleAnswer(opt)} disabled={feedback !== null}
                className="font-bold text-2xl rounded-2xl py-4 transition-colors shadow-md" style={{ ...style, fontFamily: 'var(--font-display)' }}>
                {opt}
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 text-lg font-bold"
              style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336', fontFamily: 'var(--font-display)' }}>
              {feedback === 'correct' ? '🎉 Correct! Amazing!' : '😢 Oops! Try again!'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Math World</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GAME 2 — Shape Numbers (Age 1–3): count sides of shapes
══════════════════════════════════════════════════════════════ */
const SHAPE_QUESTIONS = [
  { label: 'Triangle', svg: <polygon points="50,5 95,90 5,90" fill="#FF6B9D" stroke="#fff" strokeWidth="2" />, sides: 3, options: [2, 3, 4, 5], fun: '🔺' },
  { label: 'Square',   svg: <rect x="10" y="10" width="80" height="80" fill="#7C4DFF" stroke="#fff" strokeWidth="2" />, sides: 4, options: [3, 4, 5, 6], fun: '🟪' },
  { label: 'Pentagon', svg: <polygon points="50,5 95,35 78,90 22,90 5,35" fill="#2EC4B6" stroke="#fff" strokeWidth="2" />, sides: 5, options: [4, 5, 6, 7], fun: '⬠' },
  { label: 'Hexagon',  svg: <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="#F5A623" stroke="#fff" strokeWidth="2" />, sides: 6, options: [5, 6, 7, 8], fun: '⬡' },
  { label: 'Circle',   svg: <circle cx="50" cy="50" r="45" fill="#66BB6A" stroke="#fff" strokeWidth="2" />, sides: 0, options: [0, 1, 2, 3], fun: '⭕' },
  { label: 'Star',     svg: <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#FF9A56" stroke="#fff" strokeWidth="2" />, sides: 10, options: [8, 9, 10, 12], fun: '⭐' },
];

function ShapeNumbersGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 20 });
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);
  const q = SHAPE_QUESTIONS[round % SHAPE_QUESTIONS.length];

  const handle = (opt) => {
    if (feedback) return;
    if (opt === q.sides) { setFeedback('correct'); gameState.onCorrectAnswer(); }
    else { setFeedback('wrong'); gameState.onWrongAnswer(); }
    setTimeout(() => { setFeedback(null); setRound(r => r + 1); }, 1000);
  };

  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'shape-numbers', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'mathWorld' }).then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  if (gameState.isComplete) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <span className="text-7xl mb-4">🔷</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Shape Expert!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong></p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.05 }} onClick={gameState.resetGame} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost">Back</motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />
      <motion.div key={round} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="game-card-viewport p-6 mb-4">
        <p className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          How many sides does the <strong style={{ color: 'var(--text-primary)' }}>{q.label}</strong> have?
        </p>
        <div className="flex justify-center mb-6">
          <motion.svg width="120" height="120" viewBox="0 0 100 100" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            {q.svg}
          </motion.svg>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(opt => (
            <motion.button key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => handle(opt)} disabled={!!feedback}
              className="font-black text-3xl rounded-2xl py-4 shadow-md"
              style={{ background: feedback && opt === q.sides ? '#4CAF50' : 'var(--bg-accent)', color: feedback && opt === q.sides ? 'white' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {opt}
            </motion.button>
          ))}
        </div>
        {feedback && <p className="mt-3 font-bold text-lg" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Correct!' : `❌ It has ${q.sides} sides!`}</p>}
      </motion.div>
      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Math World</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GAME 3 — Size Compare (Age 1–3): tap items smallest→largest
══════════════════════════════════════════════════════════════ */
const SIZE_ROUNDS = [
  { label: 'fruits', items: [{ emoji: '🍓', label: 'Strawberry', size: 1 }, { emoji: '🍊', label: 'Orange', size: 2 }, { emoji: '🍉', label: 'Watermelon', size: 3 }] },
  { label: 'animals', items: [{ emoji: '🐭', label: 'Mouse', size: 1 }, { emoji: '🐶', label: 'Dog', size: 2 }, { emoji: '🐘', label: 'Elephant', size: 3 }] },
  { label: 'vehicles', items: [{ emoji: '🛴', label: 'Scooter', size: 1 }, { emoji: '🚗', label: 'Car', size: 2 }, { emoji: '🚌', label: 'Bus', size: 3 }] },
  { label: 'buildings', items: [{ emoji: '🏠', label: 'House', size: 1 }, { emoji: '🏢', label: 'Office', size: 2 }, { emoji: '🏰', label: 'Castle', size: 3 }] },
  { label: 'stars', items: [{ emoji: '⭐', label: 'Star', size: 1 }, { emoji: '🌟', label: 'Bright Star', size: 2 }, { emoji: '☀️', label: 'Sun', size: 3 }] },
];

function SizeCompareGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 20 });
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);
  const data = SIZE_ROUNDS[round % SIZE_ROUNDS.length];
  const shuffled = useMemo(() => {
    const arr = [...data.items];
    let s = round + 1;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((Math.abs(Math.sin(s++)) * 1000) % (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [data.items, round]);

  const handleTap = (item) => {
    if (feedback) return;
    const next = [...selected, item];
    setSelected(next);
    if (next.length === data.items.length) {
      const correct = next.every((it, i) => it.size === i + 1);
      if (correct) { setFeedback('correct'); gameState.onCorrectAnswer(); }
      else { setFeedback('wrong'); gameState.onWrongAnswer(); }
      setTimeout(() => { setFeedback(null); setSelected([]); setRound(r => r + 1); }, 1200);
    }
  };

  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'size-compare', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'mathWorld' }).then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  if (gameState.isComplete) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <span className="text-7xl mb-4">📏</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Size Master!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong></p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.05 }} onClick={gameState.resetGame} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost">Back</motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />
      <motion.div key={round} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="game-card-viewport p-6 mb-4">
        <p className="text-center text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>Tap them <strong style={{ color: '#FF9A56' }}>smallest → largest</strong>!</p>
        {/* Order bar */}
        <div className="flex justify-center gap-3 mb-6 min-h-[60px] items-center">
          {selected.map((it, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl">{it.emoji}</motion.span>
          ))}
          {Array.from({ length: data.items.length - selected.length }).map((_, i) => (
            <span key={i} className="w-12 h-12 rounded-full border-2 border-dashed" style={{ borderColor: 'var(--text-muted)', display: 'inline-block' }} />
          ))}
        </div>
        {/* Shuffle options */}
        <div className="flex justify-center gap-4">
          {shuffled.map((item) => {
            const picked = selected.find(s => s.label === item.label);
            return (
              <motion.button key={item.label} whileHover={{ scale: picked ? 1 : 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => !picked && handleTap(item)} disabled={!!picked || !!feedback}
                className="flex flex-col items-center gap-1 p-3 rounded-2xl shadow-md"
                style={{ background: picked ? 'var(--bg-muted)' : 'var(--bg-accent)', opacity: picked ? 0.35 : 1, cursor: picked ? 'not-allowed' : 'pointer' }}>
                <span style={{ fontSize: `${1.5 + item.size * 0.6}rem` }}>{item.emoji}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
        {feedback && <p className="text-center mt-4 font-bold text-lg" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Perfect Order!' : '❌ Not quite! Try again!'}</p>}
      </motion.div>
      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Math World</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GAME 4 — Number Match (Age 4–6)
══════════════════════════════════════════════════════════════ */
function NumberMatchGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 15 });
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);

  const QUESTIONS = [
    { digit: 3, groups: [{ emoji: '🍎', count: 3 }, { emoji: '🍌', count: 5 }, { emoji: '🍇', count: 2 }, { emoji: '🍓', count: 4 }] },
    { digit: 5, groups: [{ emoji: '⭐', count: 2 }, { emoji: '🌸', count: 5 }, { emoji: '🎈', count: 3 }, { emoji: '🦋', count: 6 }] },
    { digit: 4, groups: [{ emoji: '🚗', count: 4 }, { emoji: '🏠', count: 2 }, { emoji: '🌙', count: 6 }, { emoji: '🎯', count: 3 }] },
    { digit: 7, groups: [{ emoji: '🐟', count: 3 }, { emoji: '🐢', count: 7 }, { emoji: '🦆', count: 4 }, { emoji: '🐝', count: 5 }] },
    { digit: 2, groups: [{ emoji: '🎪', count: 5 }, { emoji: '🎭', count: 2 }, { emoji: '🎨', count: 4 }, { emoji: '🎬', count: 3 }] },
    { digit: 6, groups: [{ emoji: '🍕', count: 4 }, { emoji: '🍔', count: 6 }, { emoji: '🌮', count: 2 }, { emoji: '🍜', count: 8 }] },
    { digit: 8, groups: [{ emoji: '🌈', count: 8 }, { emoji: '☁️', count: 3 }, { emoji: '⚡', count: 5 }, { emoji: '❄️', count: 6 }] },
  ];
  const q = QUESTIONS[round % QUESTIONS.length];

  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'number-match', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'mathWorld' }).then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  const handle = (count) => {
    if (feedback) return;
    if (count === q.digit) { setFeedback('correct'); gameState.onCorrectAnswer(); }
    else { setFeedback('wrong'); gameState.onWrongAnswer(); }
    setTimeout(() => { setFeedback(null); setRound(r => r + 1); }, 900);
  };

  if (gameState.isComplete) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <span className="text-7xl mb-4">🎯</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Number Match Complete!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong></p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.05 }} onClick={gameState.resetGame} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost">Back</motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />
      <motion.div key={round} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="game-card-viewport p-6 mb-4">
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Which group has exactly</p>
        <motion.p className="text-7xl font-black mb-6" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
          style={{ color: '#7C4DFF', fontFamily: 'var(--font-display)' }}>{q.digit}</motion.p>
        <div className="grid grid-cols-2 gap-3">
          {q.groups.map((g, i) => (
            <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => handle(g.count)} disabled={!!feedback}
              className="rounded-2xl p-4 shadow-md flex flex-col items-center gap-2"
              style={{ background: feedback && g.count === q.digit ? '#4CAF50' : 'var(--bg-accent)', color: 'var(--text-primary)' }}>
              <div className="flex flex-wrap justify-center gap-1">{Array.from({ length: g.count }).map((_, j) => <span key={j} className="text-xl">{g.emoji}</span>)}</div>
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{g.count} items</span>
            </motion.button>
          ))}
        </div>
        {feedback && <p className="mt-3 font-bold text-lg" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Correct!' : '❌ Wrong!'}</p>}
      </motion.div>
      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Math World</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GAME 5 — Number Order (Age 4–6): tap numbers ascending
══════════════════════════════════════════════════════════════ */
function NumberOrderGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 15 });
  const [round, setRound] = useState(0);
  const [tapped, setTapped] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);

  const generateRound = useCallback((r) => {
    const base = (r % 5) * 2;
    const nums = Array.from({ length: 5 }, (_, i) => base + i + 1);
    return nums.sort(() => Math.random() - 0.5);
  }, []);

  const shuffled = useMemo(() => generateRound(round), [round, generateRound]);
  const sorted = useMemo(() => [...shuffled].sort((a, b) => a - b), [shuffled]);

  const handleTap = (num) => {
    if (feedback) return;
    if (tapped.includes(num)) return;
    const nextExpected = sorted[tapped.length];
    const next = [...tapped, num];
    if (num === nextExpected) {
      setTapped(next);
      if (next.length === sorted.length) {
        setFeedback('correct'); gameState.onCorrectAnswer();
        setTimeout(() => { setFeedback(null); setTapped([]); setRound(r => r + 1); if ((round + 1) % 5 === 0) gameState.levelUp(); }, 1200);
      }
    } else {
      setFeedback('wrong'); gameState.onWrongAnswer();
      setTimeout(() => { setFeedback(null); setTapped([]); }, 1000);
    }
  };

  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'number-order', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'mathWorld' }).then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  if (gameState.isComplete) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <span className="text-7xl mb-4">📊</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Number Order Pro!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong></p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.05 }} onClick={gameState.resetGame} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost">Back</motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />
      <motion.div key={round} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="game-card-viewport p-6 mb-4">
        <p className="text-center text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          Tap numbers <strong style={{ color: '#2EC4B6' }}>smallest → largest</strong>!
        </p>
        {/* Progress row */}
        <div className="flex justify-center gap-3 mb-6">
          {sorted.map((num, i) => (
            <motion.div key={i} animate={{ scale: tapped[i] === num ? 1.2 : 1 }}
              className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2"
              style={{ background: tapped[i] !== undefined ? '#4CAF50' : 'var(--bg-muted)', borderColor: tapped[i] !== undefined ? '#4CAF50' : 'var(--text-muted)', color: tapped[i] !== undefined ? 'white' : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              {tapped[i] ?? '?'}
            </motion.div>
          ))}
        </div>
        {/* Number buttons */}
        <div className="grid grid-cols-5 gap-2">
          {shuffled.map(num => (
            <motion.button key={num} whileHover={{ scale: tapped.includes(num) ? 1 : 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => handleTap(num)} disabled={tapped.includes(num) || !!feedback}
              className="font-black text-xl rounded-xl py-3 shadow-md"
              style={{
                background: tapped.includes(num) ? '#A5D6A7' : (feedback === 'wrong' ? '#FFCDD2' : 'var(--bg-accent)'),
                color: tapped.includes(num) ? '#2E7D32' : 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                opacity: tapped.includes(num) ? 0.5 : 1,
              }}>
              {num}
            </motion.button>
          ))}
        </div>
        {feedback && <p className="text-center mt-4 font-bold text-lg" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Perfect!' : '❌ Wrong order!'}</p>}
      </motion.div>
      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Math World</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GAME 6 — Math Stories (Age 4–6): word problems with scenes
══════════════════════════════════════════════════════════════ */
const STORIES = [
  { scene: '🛒🍎🍎🍎', story: 'Priya has 3 apples. Raju gives her 2 more. How many apples does Priya have now?', answer: 5, options: [3, 4, 5, 6], emoji: '🍎' },
  { scene: '🐦🐦🐦🐦🐦', story: '5 birds sit on a branch. 2 birds fly away. How many birds are left?', answer: 3, options: [2, 3, 4, 5], emoji: '🐦' },
  { scene: '🍬🍬🍬', story: 'Meena has 3 sweets. She gets 4 more from her friend. How many sweets in total?', answer: 7, options: [5, 6, 7, 8], emoji: '🍬' },
  { scene: '🐠🐠🐠🐠🐠🐠🐠', story: 'There are 7 fish in a pond. 3 fish swim into a cave. How many are still visible?', answer: 4, options: [3, 4, 5, 6], emoji: '🐠' },
  { scene: '🌸🌸🌸🌸', story: 'A garden has 4 red flowers and 3 yellow flowers. How many flowers altogether?', answer: 7, options: [6, 7, 8, 9], emoji: '🌸' },
  { scene: '🍪🍪🍪🍪🍪🍪', story: 'Arjun baked 6 cookies. He ate 2. How many cookies are left?', answer: 4, options: [2, 3, 4, 5], emoji: '🍪' },
  { scene: '⭐⭐⭐', story: 'Tara earns 3 stars on Monday and 5 stars on Tuesday. How many stars total?', answer: 8, options: [6, 7, 8, 9], emoji: '⭐' },
];

function MathStoryGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 20 });
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);
  const q = STORIES[round % STORIES.length];

  const handle = (opt) => {
    if (feedback) return;
    if (opt === q.answer) { setFeedback('correct'); gameState.onCorrectAnswer(); }
    else { setFeedback('wrong'); gameState.onWrongAnswer(); }
    setTimeout(() => { setFeedback(null); setRound(r => r + 1); if ((round + 1) % 5 === 0) gameState.levelUp(); }, 1200);
  };

  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'math-story', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 8, module: 'mathWorld' }).then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  if (gameState.isComplete) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <span className="text-7xl mb-4">📖</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Story Solver!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong></p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.05 }} onClick={gameState.resetGame} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost">Back</motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />
      <motion.div key={round} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="game-card-viewport p-6 mb-4">
        {/* Scene illustration */}
        <div className="flex justify-center gap-1 mb-4 flex-wrap">
          {q.scene.split('').filter(c => c.trim()).map((ch, i) => (
            <motion.span key={i} initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="text-4xl">{ch}</motion.span>
          ))}
        </div>
        {/* Story text */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(245,166,35,0.08)', border: '1.5px solid rgba(245,166,35,0.2)' }}>
          <p className="text-base font-semibold text-center leading-relaxed" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            📖 {q.story}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(opt => (
            <motion.button key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => handle(opt)} disabled={!!feedback}
              className="font-black text-2xl rounded-2xl py-4 shadow-md"
              style={{ background: feedback && opt === q.answer ? '#4CAF50' : 'var(--bg-accent)', color: feedback && opt === q.answer ? 'white' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {opt} {q.emoji}
            </motion.button>
          ))}
        </div>
        {feedback && <p className="mt-3 text-center font-bold text-lg" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Brilliant!' : `❌ The answer is ${q.answer}!`}</p>}
      </motion.div>
      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Math World</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GAME 7 — Add & Subtract (Age 7–10)
══════════════════════════════════════════════════════════════ */
function ArithmeticGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 20 });
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);

  const generate = useCallback((r) => {
    const ops = ['+', '-'];
    const op = ops[r % 2];
    const a = 5 + (r % 10);
    const b = op === '-' ? Math.floor(Math.random() * a) + 1 : 3 + (r % 8);
    const ans = op === '+' ? a + b : a - b;
    const opts = new Set([ans]);
    while (opts.size < 4) { const w = ans + Math.floor(Math.random() * 9) - 4; if (w >= 0) opts.add(w); }
    return { a, b, op, ans, opts: [...opts].sort(() => Math.random() - 0.5) };
  }, []);

  const q = useMemo(() => generate(round), [round, generate]);

  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'add-sub', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'mathWorld' }).then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  const handle = (opt) => {
    if (feedback) return;
    if (opt === q.ans) { setFeedback('correct'); gameState.onCorrectAnswer(); }
    else { setFeedback('wrong'); gameState.onWrongAnswer(); }
    setTimeout(() => { setFeedback(null); setRound(r => r + 1); if ((round + 1) % 5 === 0) gameState.levelUp(); }, 900);
  };

  if (gameState.isComplete) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <span className="text-7xl mb-4">➕</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Arithmetic Complete!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong></p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.05 }} onClick={gameState.resetGame} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost">Back</motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />
      <motion.div key={round} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="game-card-viewport p-8 mb-4">
        <p className="text-5xl font-black mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {q.a} <span style={{ color: q.op === '+' ? '#4CAF50' : '#F44336' }}>{q.op}</span> {q.b} = ?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {q.opts.map(opt => (
            <motion.button key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => handle(opt)} disabled={!!feedback}
              className="font-black text-2xl rounded-2xl py-4 shadow-md"
              style={{ background: feedback && opt === q.ans ? '#4CAF50' : 'var(--bg-accent)', color: feedback && opt === q.ans ? 'white' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {opt}
            </motion.button>
          ))}
        </div>
        {feedback && <p className="mt-3 font-bold text-lg" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Correct!' : '❌ Wrong!'}</p>}
      </motion.div>
      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Math World</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GAME 8 — Times Tables (Age 7–10): timed multiplication
══════════════════════════════════════════════════════════════ */
const TIMER_SECONDS = 15;

function TimesTablesGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 25 });
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);
  const timerRef = useRef(null);

  const generate = useCallback((r) => {
    const table = (r % 9) + 2; // tables 2–10
    const mult = Math.floor(Math.random() * 10) + 1;
    const ans = table * mult;
    const opts = new Set([ans]);
    while (opts.size < 4) { const w = ans + (Math.floor(Math.random() * 6) - 3) * table; if (w > 0) opts.add(w); }
    return { table, mult, ans, opts: [...opts].sort(() => Math.random() - 0.5) };
  }, []);

  const q = useMemo(() => generate(round), [round, generate]);

  // Countdown timer
  useEffect(() => {
    if (gameState.isComplete || feedback) return;
    Promise.resolve().then(() => setTimeLeft(TIMER_SECONDS));
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setFeedback('wrong');
          gameState.onWrongAnswer();
          setTimeout(() => { setFeedback(null); setRound(r => r + 1); }, 900);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [round, gameState.isComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      clearInterval(timerRef.current);
      saveNumeracyScore({ child_id: user.uid, game_id: 'times-tables', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 10, module: 'mathWorld' }).then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  const handle = (opt) => {
    if (feedback) return;
    clearInterval(timerRef.current);
    if (opt === q.ans) { setFeedback('correct'); gameState.onCorrectAnswer(); }
    else { setFeedback('wrong'); gameState.onWrongAnswer(); }
    setTimeout(() => { setFeedback(null); setRound(r => r + 1); if ((round + 1) % 5 === 0) gameState.levelUp(); }, 900);
  };

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 10 ? '#4CAF50' : timeLeft > 5 ? '#F5A623' : '#F44336';

  if (gameState.isComplete) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <span className="text-7xl mb-4">✖️</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Times Tables Champion!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong></p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.05 }} onClick={gameState.resetGame} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost">Back</motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />

      {/* Timer bar */}
      <div className="relative h-3 rounded-full mb-4 overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
        <motion.div className="absolute inset-y-0 left-0 rounded-full" animate={{ width: `${timerPct}%` }} transition={{ duration: 0.3 }}
          style={{ background: timerColor }} />
      </div>
      <p className="text-right text-sm font-bold mb-4" style={{ color: timerColor }}>⏱ {timeLeft}s</p>

      <motion.div key={round} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="game-card-viewport p-8 mb-4">
        <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>Table of {q.table}</p>
        <p className="text-5xl font-black mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {q.table} <span style={{ color: '#FF9A56' }}>×</span> {q.mult} = ?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {q.opts.map(opt => (
            <motion.button key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => handle(opt)} disabled={!!feedback}
              className="font-black text-2xl rounded-2xl py-4 shadow-md"
              style={{ background: feedback && opt === q.ans ? '#4CAF50' : 'var(--bg-accent)', color: feedback && opt === q.ans ? 'white' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {opt}
            </motion.button>
          ))}
        </div>
        {feedback && <p className="mt-3 font-bold text-lg" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '⚡ Correct!' : `❌ It's ${q.ans}!`}</p>}
      </motion.div>
      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Math World</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MATH WORLD HUB
══════════════════════════════════════════════════════════════ */
const GAME_ROUTER = {
  'counting-1-3':   (back) => <CountingGame onBack={back} />,
  'shape-numbers':  (back) => <ShapeNumbersGame onBack={back} />,
  'size-compare':   (back) => <SizeCompareGame onBack={back} />,
  'number-match':   (back) => <NumberMatchGame onBack={back} />,
  'number-order':   (back) => <NumberOrderGame onBack={back} />,
  'math-story':     (back) => <MathStoryGame onBack={back} />,
  'add-sub':        (back) => <ArithmeticGame onBack={back} />,
  'times-tables':   (back) => <TimesTablesGame onBack={back} />,
};

export default function MathWorld() {
  const { user, refreshProfile } = useUser();
  const [activeGame, setActiveGame] = useState(null);
  const [selectedAge, setSelectedAge] = useState('all');
  const [games, setGames] = useState(FALLBACK_MATH_GAMES);
  const [loading, setLoading] = useState(true);

  const ageGroups = ['all', '1–3', '4–6', '7–10'];

  useEffect(() => {
    getMathGames()
      .then(data => { if (data.length > 0) setGames(data); })
      .finally(() => setLoading(false));
  }, []);

  const filteredGames = selectedAge === 'all' ? games : games.filter(g => g.ageRange === selectedAge);

  // Route to the active game
  if (activeGame) {
    if (activeGame === 'abacus-simulation') {
      return <ThreeDAbacus user={user} refreshProfile={refreshProfile} onBack={() => setActiveGame(null)} />;
    }
    const renderer = GAME_ROUTER[activeGame];
    if (renderer) return renderer(() => setActiveGame(null));
    // Fallback
    return <CountingGame onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="relative min-h-screen">
      <FloatingElements count={4} />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6">
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.span className="text-6xl inline-block mb-3" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>🔢</motion.span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#FF9A56] via-[#F5A623] to-[#FFCC02] bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-display)' }}>Math World</h1>
          <p style={{ color: 'var(--text-muted)' }}>Pick a game and start your math adventure! 🚀</p>
          <div className="flex justify-center gap-4 mt-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span>🟢 3 Easy</span><span>🟡 3 Medium</span><span>🔴 2 Hard</span>
          </div>
        </motion.section>

        {/* Age Filter */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {ageGroups.map(age => (
            <motion.button key={age} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAge(age)}
              className={`filter-pill ${selectedAge === age ? 'active' : ''}`}>
              {age === 'all' ? '🌈 All Ages' : `👶 Age ${age}`}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading games…</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredGames.map((game, i) => (
                <GameCard key={game.id} title={game.title} description={game.description} emoji={game.emoji}
                  ageRange={game.ageRange} difficulty={game.difficulty} gradient={game.gradient}
                  stars={game.stars ?? 0} index={i} onClick={() => setActiveGame(game.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
