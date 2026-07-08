import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import GameCard from '../../components/common/GameCard';
import { MultiplicationQuestGame } from '../../components/common/NumberArray';
import ScoreDisplay from '../../components/common/ScoreDisplay';
import ConfettiEffect from '../../components/animations/ConfettiEffect';
import StarAnimation from '../../components/animations/StarAnimation';
import FloatingElements from '../../components/animations/FloatingElements';
import useGameState from '../../hooks/useGameState';
import { getLogicGames, saveNumeracyScore, awardProgress } from '../../api/services';

const FALLBACK_LOGIC_GAMES = [
  { id: 'odd-one-out',         title: 'Odd One Out',       description: 'Find the item that doesn\'t belong in the group!', emoji: '🎭', ageRange: '1–3', difficulty: 'Easy',   gradient: 'bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF]' },
  { id: 'pattern-recognition', title: 'Pattern Spotter',   description: 'Find the pattern and choose what comes next!',   emoji: '🔍', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#7C4DFF] to-[#FF6B9D]' },
  { id: 'maze-challenge',      title: 'Maze Runner',       description: 'Navigate through tricky mazes!',                 emoji: '🏃', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#2EC4B6] to-[#4FC3F7]' },
  { id: 'sequence-complete',   title: 'Sequence Builder',  description: 'Complete the number sequence correctly!',         emoji: '🧬', ageRange: '7–10', difficulty: 'Hard',  gradient: 'bg-gradient-to-br from-[#FF9A56] via-[#F5A623] to-[#FFCC02]' },
  { id: 'word-problems',       title: 'Word Problems',     description: 'Solve illustrated real-world logic problems!',    emoji: '📖', ageRange: '7–10', difficulty: 'Hard',  gradient: 'bg-gradient-to-br from-[#66BB6A] to-[#2EC4B6]' },
  { id: 'multiplication-quest',title: 'Multiply Quest',    description: 'Master multiplication through epic quests!',     emoji: '⚔️', ageRange: '7–10', difficulty: 'Hard',  gradient: 'bg-gradient-to-br from-[#FF6B9D] via-[#F5A623] to-[#FFD180]' },
];

/* ─── Maze Game ─── */
const MAZES = [
  { grid: 5, walls: new Set(['0,1','1,1','1,3','2,1','2,3','3,0','3,3','4,2']), start: [0,0], end: [4,4] },
  { grid: 5, walls: new Set(['0,2','1,0','1,2','2,2','2,4','3,1','3,4','4,1']), start: [0,0], end: [4,4] },
  { grid: 5, walls: new Set(['0,3','1,1','1,3','2,0','2,2','3,2','3,4','4,0']), start: [0,0], end: [4,4] },
];

function MazeGame({ onBack }) {
  const [level, setLevel] = useState(0);
  const [pos, setPos]     = useState([0, 0]);
  const [won, setWon]     = useState(false);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);
  const maze = MAZES[level % MAZES.length];

  const move = (dr, dc) => {
    if (won) return;
    const [r, c] = pos;
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= maze.grid || nc < 0 || nc >= maze.grid) return;
    if (maze.walls.has(`${nr},${nc}`)) return;
    const newPos = [nr, nc];
    setPos(newPos);
    setMoves(m => m + 1);
    if (nr === maze.end[0] && nc === maze.end[1]) {
      const pts = Math.max(50 - moves * 2, 10);
      setScore(s => s + pts);
      setWon(true);
    }
  };

  const nextLevel = () => {
    setLevel(l => l + 1);
    setPos([0, 0]);
    setMoves(0);
    setWon(false);
  };

  useEffect(() => {
    if (won && level >= 2 && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user?.uid, game_id: 'maze-challenge', score, level, time_taken: 0 });
      awardProgress(user?.uid, { xp: Math.floor(score / 2), stars: level >= 2 ? 1 : 0, coins: 5, module: 'logicIsland' }).then(() => refreshProfile?.());
    }
  }, [won, level, score, user, refreshProfile]);

  return (
    <div className="game-viewport-container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>Maze {level + 1} of {MAZES.length}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Moves: {moves} · Score: {score}</p>
        </div>
        <span className="text-3xl">🏃</span>
      </div>

      {/* Grid */}
      <div className="game-card-viewport p-4 mb-4">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${maze.grid}, 1fr)`, gap: 4 }}>
          {Array.from({ length: maze.grid }).map((_, r) =>
            Array.from({ length: maze.grid }).map((_, c) => {
              const isPlayer = pos[0] === r && pos[1] === c;
              const isEnd    = maze.end[0] === r && maze.end[1] === c;
              const isWall   = maze.walls.has(`${r},${c}`);
              return (
                <motion.div key={`${r},${c}`}
                  animate={{ scale: isPlayer ? 1.2 : 1 }}
                  style={{
                    width: '100%', aspectRatio: '1',
                    borderRadius: 8,
                    background: isWall ? '#374151' : isEnd ? '#10B981' : isPlayer ? '#7C4DFF' : 'var(--bg-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isPlayer || isEnd ? 16 : 10,
                  }}>
                  {isPlayer ? '😊' : isEnd ? '🏆' : ''}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Arrow controls */}
      <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto mb-4">
        <div />
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => move(-1, 0)} className="aspect-square rounded-2xl font-bold text-xl flex items-center justify-center" style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)' }}>↑</motion.button>
        <div />
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => move(0, -1)} className="aspect-square rounded-2xl font-bold text-xl flex items-center justify-center" style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)' }}>←</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => move(1, 0)} className="aspect-square rounded-2xl font-bold text-xl flex items-center justify-center" style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)' }}>↓</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => move(0, 1)} className="aspect-square rounded-2xl font-bold text-xl flex items-center justify-center" style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)' }}>→</motion.button>
      </div>

      <AnimatePresence>
        {won && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="card p-5 mb-4 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Maze Solved in {moves} moves!</p>
            {level < MAZES.length - 1 ? (
              <motion.button whileHover={{ scale: 1.05 }} onClick={nextLevel} className="btn-orange mt-3 text-sm">Next Maze →</motion.button>
            ) : (
              <p className="mt-2 text-sm font-bold" style={{ color: '#10B981' }}>All mazes complete! 🏆 Score: {score}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Logic Island</motion.button>
    </div>
  );
}

const PATTERN_QUESTIONS = [
  { pattern: ['🔴', '🔵', '🔴', '🔵', '🔴'], answer: '🔵', options: ['🔴', '🔵', '🟢', '🟡'] },
  { pattern: ['🌟', '🌟', '🌙', '🌟', '🌟'], answer: '🌙', options: ['🌟', '🌙', '☀️', '⭐'] },
  { pattern: ['1', '2', '3', '4'],             answer: '5',   options: ['5', '6', '3', '7'] },
  { pattern: ['🐶', '🐱', '🐶', '🐱', '🐶'], answer: '🐱', options: ['🐶', '🐱', '🐰', '🐻'] },
  { pattern: ['▲', '■', '●', '▲', '■'],       answer: '●',   options: ['▲', '■', '●', '◆'] },
  { pattern: ['2', '4', '6', '8'],             answer: '10',  options: ['9', '10', '11', '12'] },
  { pattern: ['🎵', '🎵', '🎶', '🎵', '🎵'], answer: '🎶', options: ['🎵', '🎶', '🎤', '🎸'] },
  { pattern: ['A', 'B', 'C', 'D'],             answer: 'E',   options: ['E', 'F', 'D', 'G'] },
];

function PatternGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 25 });
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const { user, refreshProfile } = useUser();
  const q = PATTERN_QUESTIONS[round % PATTERN_QUESTIONS.length];

  const handleAnswer = useCallback(
    (answer) => {
      if (feedback) return;
      if (answer === q.answer) { setFeedback('correct'); gameState.onCorrectAnswer(); }
      else { setFeedback('wrong'); gameState.onWrongAnswer(); }
      setTimeout(() => {
        setFeedback(null);
        setRound((r) => r + 1);
        if ((round + 1) % PATTERN_QUESTIONS.length === 0) gameState.levelUp();
      }, 1000);
    },
    [feedback, q.answer, round, gameState]
  );

  const hasSaved = useRef(false);
  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'pattern-recognition', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'logicIsland' })
        .then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  if (gameState.isComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <ConfettiEffect active={true} />
        <span className="text-7xl mb-4">🧠</span>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Logic Master!</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong> points</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { gameState.resetGame(); setRound(0); }} className="btn-orange">Play Again 🔄</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="btn-ghost">Back</motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />

      <motion.div key={round} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="game-card-viewport p-8 mb-6">
        <p className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          What comes next in the pattern?
        </p>
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {q.pattern.map((item, i) => (
            <motion.div key={i} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.1 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md"
              style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)' }}
            >
              {item}
            </motion.div>
          ))}
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border-3 border-dashed"
            style={{ borderColor: '#F5A623', color: '#F5A623' }}
          >?</motion.div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            let style = { background: 'var(--bg-accent)', color: 'var(--text-primary)' };
            if (feedback && opt === q.answer) style = { background: '#4CAF50', color: 'white' };
            return (
              <motion.button key={`${opt}-${i}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleAnswer(opt)} disabled={!!feedback}
                className="font-bold text-2xl rounded-2xl py-4 shadow-md transition-colors"
                style={{ ...style, fontFamily: 'var(--font-display)' }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 text-lg font-bold" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336', fontFamily: 'var(--font-display)' }}
            >
              {feedback === 'correct' ? '🧠 Brilliant!' : '🤔 Not quite!'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="btn-ghost w-full py-3">
        ← Back to Logic Island
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ODD ONE OUT GAME (Age 1–3)
══════════════════════════════════════════════════════════════ */
const ODD_ONE_OUT_ROUNDS = [
  { items: ['🍎','🍊','🍋','🚗'], odd: '🚗', hint: "Vehicles don't belong with fruits!" },
  { items: ['🐶','🐱','🐰','🌸'], odd: '🌸', hint: "A flower doesn't belong with animals!" },
  { items: ['📚','✏️','🎒','🍕'], odd: '🍕', hint: "Food doesn't belong with school things!" },
  { items: ['🔵','🔴','🟡','⭐'], odd: '⭐', hint: "A star isn't a colour circle!" },
  { items: ['🚌','🚗','✈️','🍌'], odd: '🍌', hint: "A banana doesn't belong with vehicles!" },
  { items: ['🎸','🎺','🥁','🍔'], odd: '🍔', hint: "Food doesn't belong with musical instruments!" },
  { items: ['🌧️','☀️','⛅','🐊'], odd: '🐊', hint: "A crocodile isn't weather!" },
  { items: ['🍕','🍔','🌮','🏀'], odd: '🏀', hint: "A ball doesn't belong with food!" },
];

function OddOneOutGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 20 });
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);
  const data = ODD_ONE_OUT_ROUNDS[round % ODD_ONE_OUT_ROUNDS.length];
  // shuffle each round — derive from round index so useMemo dep is stable
  const shuffled = useMemo(() => {
    const arr = [...data.items];
    let s = round + 1;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((Math.abs(Math.sin(s++)) * 1000) % (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [data.items, round]);

  const handle = (item) => {
    if (feedback) return;
    if (item === data.odd) { setFeedback('correct'); gameState.onCorrectAnswer(); }
    else { setFeedback('wrong'); gameState.onWrongAnswer(); setShowHint(true); }
    setTimeout(() => { setFeedback(null); setShowHint(false); setRound(r => r + 1); }, 1400);
  };

  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'odd-one-out', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'logicIsland' }).then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  if (gameState.isComplete) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <span className="text-7xl mb-4">🎭</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Sharp Eye!</h2>
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
        <p className="text-lg font-semibold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          🔍 Which one does <strong style={{ color: 'var(--text-primary)' }}>NOT</strong> belong?
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4 w-full max-w-4xl flex-1 items-stretch">
          {shuffled.map((item) => (
            <motion.button key={item} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => handle(item)} disabled={!!feedback}
              className="rounded-2xl py-6 text-6xl shadow-md min-h-[140px] md:min-h-[180px] flex items-center justify-center"
              style={{ background: feedback && item === data.odd ? '#4CAF50' : (feedback && item !== data.odd ? '#FFCDD2' : 'var(--bg-accent)') }}>
              {item}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {showHint && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-sm font-semibold rounded-xl p-3 mt-2" style={{ background: 'rgba(245,166,35,0.12)', color: '#B7791F' }}>
              💡 {data.hint}
            </motion.p>
          )}
        </AnimatePresence>
        {feedback && <p className="mt-3 font-bold text-lg" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Correct!' : `❌ The odd one was ${data.odd}!`}</p>}
      </motion.div>
      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Logic Island</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WORD PROBLEMS GAME (Age 7–10)
══════════════════════════════════════════════════════════════ */
const WORD_PROBLEMS = [
  { scene: '🏪', problem: 'A shop has 24 pencils. A teacher buys 8. A student buys 7. How many pencils are left?', answer: 9, options: [7, 8, 9, 10], explanation: '24 − 8 − 7 = 9' },
  { scene: '🚌', problem: 'A bus had 35 passengers. At the first stop, 12 got off and 8 got on. How many are on the bus now?', answer: 31, options: [29, 30, 31, 32], explanation: '35 − 12 + 8 = 31' },
  { scene: '🍰', problem: 'A baker makes 5 cakes, each cut into 6 pieces. If 14 pieces are eaten, how many are left?', answer: 16, options: [14, 15, 16, 17], explanation: '5 × 6 − 14 = 16' },
  { scene: '📦', problem: 'Reema has 48 stickers. She gives equal shares to 6 friends. How many does each friend get?', answer: 8, options: [6, 7, 8, 9], explanation: '48 ÷ 6 = 8' },
  { scene: '🌳', problem: 'Ravi plants 7 rows with 9 trees each, then plants 15 more. How many trees in total?', answer: 78, options: [63, 72, 78, 84], explanation: '7 × 9 + 15 = 78' },
  { scene: '🐄', problem: 'A farm has 4 cows, each giving 12 litres of milk per day. How many litres in 3 days?', answer: 144, options: [120, 132, 144, 156], explanation: '4 × 12 × 3 = 144' },
];

function WordProblemsGame({ onBack }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 30 });
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);
  const q = WORD_PROBLEMS[round % WORD_PROBLEMS.length];

  const handle = (opt) => {
    if (feedback) return;
    const correct = opt === q.answer;
    if (correct) { setFeedback('correct'); gameState.onCorrectAnswer(); }
    else { setFeedback('wrong'); gameState.onWrongAnswer(); setShowExplanation(true); }
    setTimeout(() => { setFeedback(null); setShowExplanation(false); setRound(r => r + 1); if ((round + 1) % 3 === 0) gameState.levelUp(); }, 2000);
  };

  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'word-problems', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 12, module: 'logicIsland' }).then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  if (gameState.isComplete) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <span className="text-7xl mb-4">📖</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Problem Solver!</h2>
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
        <div className="text-center text-6xl mb-4">{q.scene}</div>
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(124,77,255,0.07)', border: '1.5px solid rgba(124,77,255,0.18)' }}>
          <p className="text-base font-semibold text-center leading-relaxed" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            🧩 {q.problem}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(opt => (
            <motion.button key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => handle(opt)} disabled={!!feedback}
              className="font-black text-2xl rounded-2xl py-4 shadow-md"
              style={{ background: feedback && opt === q.answer ? '#4CAF50' : 'var(--bg-accent)', color: feedback && opt === q.answer ? 'white' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {opt}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {showExplanation && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-3 rounded-xl p-3 text-center" style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)' }}>
              <p className="text-sm font-bold" style={{ color: '#2E7D32' }}>💡 Solution: {q.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {feedback && <p className="mt-3 text-center font-bold text-lg" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Excellent Logic!' : '❌ Not quite!'}</p>}
      </motion.div>
      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Logic Island</motion.button>
    </div>
  );
}

const getLogicSlug = (game) => {
  if (!game) return '';
  const title = game.title.toLowerCase();
  if (title.includes('multiplication')) return 'multiplication-quest';
  if (title.includes('maze')) return 'maze-challenge';
  if (title.includes('pattern') || title.includes('sequence')) return 'sequence-complete';
  if (title.includes('odd')) return 'odd-one-out';
  if (title.includes('word')) return 'word-problems';
  return game.id || game._id || '';
};

export default function LogicIsland() {
  const [activeGame, setActiveGame] = useState(null); // 'pattern' | 'multiplication'
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [games, setGames] = useState(FALLBACK_LOGIC_GAMES);
  const [loading, setLoading] = useState(true);

  const difficulties = ['all', 'Easy', 'Medium', 'Hard'];
  const filteredGames = selectedDifficulty === 'all' ? games : games.filter((g) => g.difficulty === selectedDifficulty);

  useEffect(() => {
    getLogicGames().then((data) => { if (data.length > 0) setGames(data); }).finally(() => setLoading(false));
  }, []);

  // Page Routing
  if (activeGame) {
    const selectedGameObject = games.find(g => (g.id || g._id) === activeGame);
    const slug = getLogicSlug(selectedGameObject);
    if (slug === 'multiplication-quest') return <MultiplicationQuestGame onBack={() => setActiveGame(null)} onScoreUpdate={(s, l) => console.log('mult score:', s, l)} />;
    if (slug === 'maze-challenge') return <MazeGame onBack={() => setActiveGame(null)} />;
    if (slug === 'sequence-complete') return <PatternGame onBack={() => setActiveGame(null)} />;
    if (slug === 'odd-one-out') return <OddOneOutGame onBack={() => setActiveGame(null)} />;
    if (slug === 'word-problems') return <WordProblemsGame onBack={() => setActiveGame(null)} />;
    return <PatternGame onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="relative" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <FloatingElements count={4} />
      <div className="relative z-10 w-full px-8 md:px-12 lg:px-16 py-8" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.span className="text-6xl inline-block mb-3" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>🧠</motion.span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#FF6B9D] via-[#F5A623] to-[#FFD180] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
            Logic Island
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Sharpen your brain with logic challenges! 🏝️</p>
        </motion.section>

        {/* Difficulty filter */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {difficulties.map((diff) => (
            <motion.button key={diff} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDifficulty(diff)}
              className={`filter-pill ${selectedDifficulty === diff ? 'active' : ''}`}
            >
              {diff === 'all' ? '🌈 All' : diff === 'Easy' ? '🌱 Easy' : diff === 'Medium' ? '🌿 Medium' : '🌶️ Hard'}
            </motion.button>
          ))}
        </div>

        {/* Difficulty progression */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card mb-8" style={{ padding: '20px 28px' }}
        >
          <h3 className="font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1rem' }}>🏆 Difficulty Progression</h3>
          <div className="flex items-center gap-3">
            {['Beginner', 'Explorer', 'Thinker', 'Master', 'Genius'].map((level, i) => (
              <motion.div key={level} whileHover={{ y: -3 }}
                className="flex-1 text-center rounded-xl font-semibold"
                style={{
                  padding: '10px 8px',
                  fontSize: '0.8rem',
                  background: i <= 2 ? 'linear-gradient(135deg, #66BB6A, #2EC4B6)' : 'var(--bg-accent)',
                  color: i <= 2 ? 'white' : 'var(--text-muted)',
                  boxShadow: i <= 2 ? '0 3px 12px rgba(102,187,106,0.25)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {level}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading games…</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7" style={{ flex: 1 }}>
            <AnimatePresence mode="popLayout">
              {filteredGames.map((game, i) => (
                <GameCard key={game.id || game._id} title={game.title} description={game.description} emoji={game.emoji}
                  ageRange={game.ageRange} difficulty={game.difficulty} gradient={game.gradient}
                  stars={game.stars ?? 0} index={i} onClick={() => setActiveGame(game.id || game._id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
