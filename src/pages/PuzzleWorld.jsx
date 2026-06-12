import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import GameCard from '../components/common/GameCard';
import ThreeDPuzzle from '../components/three/ThreeDPuzzle';
import ScoreDisplay from '../components/common/ScoreDisplay';
import ConfettiEffect from '../components/animations/ConfettiEffect';
import StarAnimation from '../components/animations/StarAnimation';
import FloatingElements from '../components/animations/FloatingElements';
import useGameState from '../hooks/useGameState';
import { getPuzzleGames, saveNumeracyScore, awardProgress } from '../firebase/services';

const FALLBACK_PUZZLE_GAMES = [
  { id: 'shape-match',    title: 'Shape Matching',    description: 'Match shapes to their shadows!',     emoji: '🔷', ageRange: '1–3', difficulty: 'Easy',   gradient: 'bg-gradient-to-br from-[#2EC4B6] to-[#4FC3F7]' },
  { id: 'drag-puzzle',    title: 'Drag & Drop',       description: 'Drag pieces to complete pictures!',  emoji: '🧩', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#7C4DFF] to-[#FF6B9D]' },
  { id: 'logic-puzzles',  title: 'Logic Challenges',  description: 'Solve tricky logic puzzles!',        emoji: '🧠', ageRange: '7–10', difficulty: 'Hard',  gradient: 'bg-gradient-to-br from-[#FF6B9D] via-[#F5A623] to-[#FFD180]' },
  { id: 'jigsaw',         title: 'Jigsaw Puzzles',    description: 'Put together beautiful pictures!',   emoji: '🖼️', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#FF9A56] via-[#F5A623] to-[#FFCC02]' },
  { id: 'pattern-puzzle', title: 'Pattern Puzzles',   description: 'Find the missing piece!',            emoji: '🔮', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#66BB6A] to-[#2EC4B6]' },
  { id: 'color-sort',     title: 'Color Sorting',     description: 'Sort objects by color, shape, size!',emoji: '🎨', ageRange: '1–3', difficulty: 'Easy',   gradient: 'bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF]' },
];

const SHAPES = [
  { name: 'Circle',   shape: '⬤', color: '#FF6B9D' },
  { name: 'Square',   shape: '⬛', color: '#7C4DFF' },
  { name: 'Triangle', shape: '▲', color: '#2EC4B6' },
  { name: 'Star',     shape: '★', color: '#F5A623' },
  { name: 'Diamond',  shape: '◆', color: '#FF8A65' },
  { name: 'Heart',    shape: '♥', color: '#EF5350' },
];

function shuffleOptions(roundIdx) {
  const target = SHAPES[roundIdx % SHAPES.length];
  const others = SHAPES.filter((s) => s.name !== target.name).sort(() => Math.random() - 0.5).slice(0, 3);
  return [...others, target].sort(() => Math.random() - 0.5);
}

function ShapeMatchGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 20 });
  const [round, setRound] = useState(0);
  const [targetShape, setTargetShape] = useState(SHAPES[0]);
  const [options, setOptions] = useState(() => shuffleOptions(0));
  const [feedback, setFeedback] = useState(null);
  const { user, refreshProfile } = useUser();

  const nextRound = useCallback(() => {
    setRound((r) => {
      const next = r + 1;
      const nextTarget = SHAPES[next % SHAPES.length];
      setTargetShape(nextTarget);
      setOptions(shuffleOptions(next));
      setFeedback(null);
      if (next % SHAPES.length === 0) gameState.levelUp();
      return next;
    });
  }, [gameState]);

  const handleSelect = useCallback(
    (shape) => {
      if (feedback) return;
      if (shape.name === targetShape.name) {
        setFeedback('correct');
        gameState.onCorrectAnswer();
      } else {
        setFeedback('wrong');
        gameState.onWrongAnswer();
      }
      setTimeout(() => nextRound(), 1200);
    },
    [feedback, targetShape, gameState, nextRound]
  );

  const hasSaved = useRef(false);
  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'shape-match', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'puzzleWorld' })
        .then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  if (gameState.isComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <ConfettiEffect active={true} />
        <span className="text-7xl mb-4">🧩</span>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Puzzle Complete!</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong> points</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={gameState.resetGame} className="btn-orange">Play Again 🔄</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="btn-ghost">Back</motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />

      <motion.div key={round} initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} className="card p-8 mb-6 text-center">
        <p className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          Find the <span style={{ color: '#F5A623' }}>{targetShape.name}</span>!
        </p>
        <motion.div className="text-8xl mb-8 drop-shadow-xl" style={{ color: targetShape.color }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          {targetShape.shape}
        </motion.div>
        <div className="grid grid-cols-2 gap-4">
          {options.map((opt, i) => {
            let borderColor = 'var(--border-default)';
            if (feedback && opt.name === targetShape.name) borderColor = '#4CAF50';
            return (
              <motion.button key={opt.name} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                onClick={() => handleSelect(opt)} disabled={!!feedback}
                className="text-5xl py-6 rounded-2xl border-2 transition-all"
                style={{ borderColor, background: 'var(--bg-accent)', color: opt.color }}
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              >
                {opt.shape}
                <div className="text-xs mt-2 font-semibold" style={{ color: 'var(--text-muted)' }}>{opt.name}</div>
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 text-lg font-bold" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336', fontFamily: 'var(--font-display)' }}
            >
              {feedback === 'correct' ? '✅ Perfect Match!' : '❌ Not quite!'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="btn-ghost w-full py-3">
        ← Back to Puzzle World
      </motion.button>
    </div>
  );
}

export default function PuzzleWorld() {
  const { user, refreshProfile } = useUser();
  const [activeGame, setActiveGame] = useState(null);
  const [timerMode, setTimerMode] = useState(false);
  const [games, setGames] = useState(FALLBACK_PUZZLE_GAMES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPuzzleGames().then((data) => { if (data.length > 0) setGames(data); }).finally(() => setLoading(false));
  }, []);

  if (activeGame) return <ShapeMatchGame onBack={() => setActiveGame(null)} />;

  return (
    <div className="relative min-h-screen">
      <FloatingElements count={4} />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6">
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.span className="text-6xl inline-block mb-3" animate={{ rotateZ: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>🧩</motion.span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#2EC4B6] to-[#4FC3F7] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
            Puzzle World
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Solve puzzles and train your brain! 🧠</p>
        </motion.section>

        {/* Timer Mode Toggle */}
        <div className="flex justify-center mb-6">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setTimerMode(!timerMode)}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all ${
              timerMode ? 'bg-[#F44336] text-white shadow-lg' : 'btn-ghost'
            }`}
          >
            <span>⏱️</span> {timerMode ? 'Timer Mode ON' : 'Timer Mode OFF'}
          </motion.button>
        </div>

        {/* ─── Three.js 3D Puzzle ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            🎮 3D Shape Challenge
          </h3>
          <ThreeDPuzzle user={user} refreshProfile={refreshProfile} />
        </motion.div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading games…</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {games.map((game, i) => (
              <GameCard key={game.id} title={game.title} description={game.description} emoji={game.emoji}
                ageRange={game.ageRange} difficulty={game.difficulty} gradient={game.gradient}
                stars={game.stars ?? 0} index={i} onClick={() => setActiveGame(game.id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
