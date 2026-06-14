import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  { id: 'jigsaw',         title: 'Jigsaw Puzzles',    description: 'Drag and place pieces to complete pictures!', emoji: '🧩', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#FF9A56] via-[#F5A623] to-[#FFCC02]' },
  { id: 'logic-puzzles',  title: 'Logic Challenges',  description: 'Solve sequence builder, mirror shapes, and odd-one-out puzzles!', emoji: '🧠', ageRange: '7–10', difficulty: 'Hard',  gradient: 'bg-gradient-to-br from-[#FF6B9D] via-[#F5A623] to-[#FFD180]' },
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

/* ══════════════════════════════════════════════════════════════
   GAME 1 — Shape Match Game (Timer Mode Supported)
   ══════════════════════════════════════════════════════════════ */
function ShapeMatchGame({ onBack, timerMode }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 20 });
  const [round, setRound] = useState(0);
  const [targetShape, setTargetShape] = useState(SHAPES[0]);
  const [options, setOptions] = useState(() => shuffleOptions(0));
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const { user, refreshProfile } = useUser();
  const timerRef = useRef(null);

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

  // Timer Integration
  useEffect(() => {
    if (!timerMode || gameState.isComplete || feedback) return;
    Promise.resolve().then(() => {
      setTimeLeft(15);
    });
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setFeedback('wrong');
          gameState.onWrongAnswer();
          setTimeout(() => nextRound(), 1200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [round, timerMode, gameState.isComplete, feedback, nextRound]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} timeLeft={timerMode ? timeLeft : undefined} className="mb-6" />

      <motion.div key={round} initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} className="game-card-viewport p-8 mb-6">
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
                className="text-5xl py-6 rounded-2xl border-2 transition-all cursor-pointer"
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

/* ══════════════════════════════════════════════════════════════
   GAME 2 — Jigsaw Puzzle Game (Framer Motion drag & drop)
   ══════════════════════════════════════════════════════════════ */
const JIGSAW_EMOJIS_EASY   = ['🚀', '🌟', '🌙', '🛸'];
const JIGSAW_EMOJIS_MEDIUM = ['🦁', '🐯', '🐻', '🐨', '🐼', '🐷', '🐸', '🐙', '🐠'];
const JIGSAW_EMOJIS_HARD   = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍓', '🍍', '🍑', '🥝', '🥥', '🍅', '🥕', '🌽', '🥦', '🥬', '🥔'];

const COLOR_SCHEME = ['#FF6B9D', '#7C4DFF', '#2EC4B6', '#F5A623', '#FF8A65', '#EF5350', '#66BB6A', '#4FC3F7'];

function JigsawPuzzleGame({ onBack, timerMode }) {
  const { user, profile, refreshProfile } = useUser();
  
  // Set Jigsaw size K (2x2, 3x3, 4x4) based on child age profile
  const K = useMemo(() => {
    if (profile?.ageGroup === '1–3') return 2;
    if (profile?.ageGroup === '7–10') return 4;
    return 3; // default 4-6 is 3x3
  }, [profile?.ageGroup]);

  const totalSlots = K * K;
  const initialItems = useMemo(() => {
    const emojis = K === 2 ? JIGSAW_EMOJIS_EASY : K === 3 ? JIGSAW_EMOJIS_MEDIUM : JIGSAW_EMOJIS_HARD;
    const list = [];
    for (let r = 0; r < K; r++) {
      for (let c = 0; c < K; c++) {
        const idx = r * K + c;
        list.push({
          id: `p-${r}-${c}`,
          emoji: emojis[idx % emojis.length],
          color: COLOR_SCHEME[idx % COLOR_SCHEME.length],
          correctRow: r,
          correctCol: c
        });
      }
    }
    return list;
  }, [K]);

  const [placed, setPlaced] = useState({}); // key: 'row-col', value: piece object
  const [tray, setTray]     = useState([]); // list of shuffled unplaced pieces
  const [selectedPiece, setSelectedPiece] = useState(null); // Click to place support
  const [score, setScore]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(K === 2 ? 30 : K === 3 ? 60 : 90);
  const [feedback, setFeedback] = useState(null);
  const [isWon, setIsWon]   = useState(false);
  const [isTimeOut, setIsTimeOut] = useState(false);
  
  const gridRef = useRef(null);
  const timerRef = useRef(null);
  const hasSaved = useRef(false);

  const gridCells = useMemo(() => {
    const list = [];
    for (let r = 0; r < K; r++) {
      for (let c = 0; c < K; c++) {
        list.push({ r, c });
      }
    }
    return list;
  }, [K]);

  useEffect(() => {
    // Shuffle tray initially
    Promise.resolve().then(() => {
      setTray([...initialItems].sort(() => Math.random() - 0.5));
      setPlaced({});
      setSelectedPiece(null);
      setIsWon(false);
      setIsTimeOut(false);
    });
    hasSaved.current = false;
  }, [initialItems]);

  // Global game timer (timer mode)
  useEffect(() => {
    if (!timerMode || isWon || isTimeOut) return;
    const initialTime = K === 2 ? 30 : K === 3 ? 60 : 90;
    Promise.resolve().then(() => {
      setTimeLeft(initialTime);
    });
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setIsTimeOut(true);
          setFeedback('Time is up!');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerMode, isWon, isTimeOut, K]);

  const handlePlacePiece = (piece, row, col) => {
    if (piece.correctRow === row && piece.correctCol === col) {
      setPlaced((prev) => ({ ...prev, [`${row}-${col}`]: piece }));
      setTray((prev) => prev.filter((p) => p.id !== piece.id));
      setSelectedPiece(null);
      setFeedback('Great placement!');
      setTimeout(() => setFeedback(null), 850);
      
      const addedPoints = 15;
      setScore((s) => s + addedPoints);

      // Check win condition
      const nextPlacedSize = Object.keys(placed).length + 1;
      if (nextPlacedSize === totalSlots) {
        setIsWon(true);
        clearInterval(timerRef.current);
        const timeBonus = timerMode ? timeLeft * 2 : 0;
        setScore((s) => s + timeBonus);
      }
    } else {
      setFeedback('Oops, that goes somewhere else!');
      setSelectedPiece(null);
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  // Drag and Drop End handler
  const handleDragEnd = (event, info, piece) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    
    // Calculate viewport drop points relative to the grid ref
    const clientX = info.point.x;
    const clientY = info.point.y;
    
    if (
      clientX >= rect.left && clientX <= rect.right &&
      clientY >= rect.top && clientY <= rect.bottom
    ) {
      const cellWidth  = rect.width / K;
      const cellHeight = rect.height / K;
      
      const col = Math.floor((clientX - rect.left) / cellWidth);
      const row = Math.floor((clientY - rect.top) / cellHeight);
      
      if (col >= 0 && col < K && row >= 0 && row < K) {
        handlePlacePiece(piece, row, col);
      }
    }
  };

  useEffect(() => {
    if (isWon && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'jigsaw', score, level: K - 1, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(score / 2), stars: 3, coins: 15, module: 'puzzleWorld' })
        .then(() => refreshProfile());
    }
  }, [isWon, score, user, refreshProfile, K]);

  if (isWon) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <ConfettiEffect active={true} />
        <span className="text-7xl mb-4">🏆</span>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Jigsaw Complete!</h2>
        <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{score}</strong> points</p>
        {timerMode && <p className="text-xs mb-6 text-amber-500">⏱️ Time Bonus Applied!</p>}
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => {
            setPlaced({});
            setTray([...initialItems].sort(() => Math.random() - 0.5));
            setIsWon(false);
            setScore(0);
            hasSaved.current = false;
          }} className="btn-orange">Play Again 🔄</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost">Back</motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="game-viewport-container">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold px-3 py-1 rounded-full text-white text-sm" style={{ background: 'linear-gradient(135deg, #FF9A56, #F5A623)' }}>
          🏆 {score} pts
        </span>
        <span className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
          Grid: {K}x{K} ({totalSlots} pieces)
        </span>
        {timerMode && (
          <span className={`font-bold px-3 py-1 rounded-full text-white text-sm ${timeLeft <= 10 ? 'bg-[#F44336]' : 'bg-[#4CAF50]'}`}>
            ⏱ {timeLeft}s
          </span>
        )}
      </div>

      <div className="game-card-viewport p-6 mb-4">
        <p className="text-base font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          Jigsaw Solver: Drag items to slots, or Tap to select & place! 🧩
        </p>
        {feedback && <p className="text-sm font-bold mb-4" style={{ color: feedback.includes('Oops') ? '#F44336' : '#4CAF50' }}>{feedback}</p>}

        {/* Target Board Grid */}
        <div
          ref={gridRef}
          className="mx-auto border-4 border-dashed rounded-3xl p-2 mb-6"
          style={{
            borderColor: 'var(--border-default)',
            maxWidth: '300px',
            aspectRatio: '1',
            display: 'grid',
            gridTemplateColumns: `repeat(${K}, 1fr)`,
            gridTemplateRows: `repeat(${K}, 1fr)`,
            gap: '6px'
          }}
        >
          {gridCells.map(({ r, c }) => {
            const cellKey = `${r}-${c}`;
            const lockedPiece = placed[cellKey];

            return (
              <div
                key={cellKey}
                onClick={() => {
                  if (selectedPiece && !lockedPiece) {
                    handlePlacePiece(selectedPiece, r, c);
                  }
                }}
                className="rounded-2xl border flex items-center justify-center font-bold text-3xl shadow-sm transition-all"
                style={{
                  background: lockedPiece ? lockedPiece.color : 'rgba(0,0,0,0.04)',
                  borderColor: lockedPiece ? 'transparent' : 'var(--border-default)',
                  color: lockedPiece ? 'white' : 'var(--text-muted)',
                  cursor: selectedPiece && !lockedPiece ? 'pointer' : 'default'
                }}
              >
                {lockedPiece ? lockedPiece.emoji : ''}
              </div>
            );
          })}
        </div>

        {/* Tray of unplaced pieces */}
        <div className="border border-dashed p-4 rounded-2xl" style={{ borderColor: 'var(--border-default)' }}>
          <p className="text-xs font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Tray Pieces (Drag or Tap to Place):</p>
          <div className="flex flex-wrap justify-center gap-3">
            {tray.map((piece) => {
              const isSelected = selectedPiece?.id === piece.id;

              return (
                <motion.div
                  key={piece.id}
                  drag
                  dragSnapToOrigin
                  onDragEnd={(e, info) => handleDragEnd(e, info, piece)}
                  onClick={() => setSelectedPiece(piece)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md cursor-grab active:cursor-grabbing ${
                    isSelected ? 'ring-4 ring-offset-2 ring-amber-500' : ''
                  }`}
                  style={{ background: piece.color }}
                >
                  {piece.emoji}
                </motion.div>
              );
            })}
            {tray.length === 0 && <p className="text-xs" style={{ color: '#4CAF50' }}>All pieces placed! 🎉</p>}
          </div>
        </div>
      </div>

      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Puzzle World</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GAME 3 — Logic Challenges (Sequence, Mirror shapes, Odd-one-out)
   ══════════════════════════════════════════════════════════════ */
const LOGIC_SEQS = [
  { seq: ['🔴', '🔵', '🔴', '🔵', '?'], ans: '🔴', opts: ['🔴', '🔵', '🟢', '🟡'] },
  { seq: ['▲', '■', '▲', '■', '?'],     ans: '▲', opts: ['▲', '■', '●', '◆'] },
  { seq: ['1', '3', '5', '7', '?'],     ans: '9', opts: ['8', '9', '10', '11'] }
];

const LOGIC_MIRROR = [
  { shape: '👉', reflect: '👈', opts: ['👉', '👈', '👆', '👇'] },
  { shape: '🍎 ➡️ 🍌', reflect: '🍌 ⬅️ 🍎', opts: ['🍎 ➡️ 🍌', '🍌 ⬅️ 🍎', '🍎 ⬅️ 🍌'] },
  { shape: '◀️', reflect: '▶️', opts: ['🔼', '◀️', '▶️', '🔽'] }
];

const LOGIC_ODD = [
  { items: ['🍎', '🍌', '🍇', '🚗'], odd: '🚗', label: 'Car (not a fruit!)' },
  { items: ['🐶', '🐱', '🐼', '🌻'], odd: '🌻', label: 'Sunflower (not an animal!)' },
  { items: ['🎸', '🎻', '🎹', '🍔'], odd: '🍔', label: 'Burger (not an instrument!)' }
];

function LogicChallengesGame({ onBack, timerMode }) {
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);
  const timerRef = useRef(null);

  // Challenge mapping: Round 0-1 = Sequence, 2-3 = Mirror, 4-5 = Odd One Out
  const qType = round <= 1 ? 'sequence' : round <= 3 ? 'mirror' : 'odd';
  
  const currentQ = useMemo(() => {
    if (qType === 'sequence') return LOGIC_SEQS[round % LOGIC_SEQS.length];
    if (qType === 'mirror') return LOGIC_MIRROR[(round - 2) % LOGIC_MIRROR.length];
    return LOGIC_ODD[(round - 4) % LOGIC_ODD.length];
  }, [round, qType]);

  const handleSelect = (opt) => {
    if (feedback) return;
    const ans = qType === 'sequence' ? currentQ.ans : qType === 'mirror' ? currentQ.reflect : currentQ.odd;

    if (opt === ans) {
      setFeedback('correct');
      setScore((s) => s + 25);
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= 6) {
        setIsComplete(true);
      } else {
        setRound((r) => r + 1);
      }
    }, 1200);
  };

  // Timer mode tick
  useEffect(() => {
    if (!timerMode || isComplete || feedback) return;
    Promise.resolve().then(() => {
      setTimeLeft(15);
    });
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setFeedback('wrong');
          setTimeout(() => {
            setFeedback(null);
            if (round + 1 >= 6) setIsComplete(true);
            else setRound((r) => r + 1);
          }, 1200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [round, timerMode, isComplete, feedback]);

  useEffect(() => {
    if (isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'logic-puzzles', score, level: 3, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(score / 2), stars: 3, coins: 15, module: 'puzzleWorld' })
        .then(() => refreshProfile());
    }
  }, [isComplete, score, user, refreshProfile]);

  if (isComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <ConfettiEffect active={true} />
        <span className="text-7xl mb-4">🧠</span>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Logic Complete!</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{score}</strong> points</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => {
            setRound(0);
            setIsComplete(false);
            setScore(0);
            hasSaved.current = false;
          }} className="btn-orange">Play Again 🔄</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost">Back</motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="game-viewport-container">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold px-3 py-1 rounded-full text-white text-sm" style={{ background: 'linear-gradient(135deg, #FF6B9D, #7C4DFF)' }}>
          🏆 {score} pts
        </span>
        <span className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
          Challenge {round + 1}/6 ({qType.toUpperCase()})
        </span>
        {timerMode && (
          <span className={`font-bold px-3 py-1 rounded-full text-white text-sm ${timeLeft <= 5 ? 'bg-[#F44336]' : 'bg-[#4CAF50]'}`}>
            ⏱ {timeLeft}s
          </span>
        )}
      </div>

      <motion.div key={round} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="game-card-viewport p-6 mb-6">
        {/* Title instructions */}
        {qType === 'sequence' && (
          <>
            <p className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
              Complete the sequence pattern:
            </p>
            <div className="flex justify-center gap-2 mb-6 text-4xl">
              {currentQ.seq.map((item, i) => (
                <span key={i} className="p-2 bg-black/5 rounded-2xl">{item}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {currentQ.opts.map((opt) => (
                <button key={opt} onClick={() => handleSelect(opt)} className="font-bold py-4 bg-black/5 rounded-2xl text-2xl transition-all cursor-pointer">{opt}</button>
              ))}
            </div>
          </>
        )}

        {qType === 'mirror' && (
          <>
            <p className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
              Choose the correct mirrored reflection:
            </p>
            <div className="flex justify-center items-center gap-8 mb-6 text-4xl">
              <div className="p-3 border rounded-2xl">{currentQ.shape}</div>
              <div className="w-1 h-12 bg-slate-400 rounded-full" /> {/* Mirror line */}
              <div className="p-3 border border-dashed rounded-2xl text-slate-300">?</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {currentQ.opts.map((opt) => (
                <button key={opt} onClick={() => handleSelect(opt)} className="font-bold py-4 bg-black/5 rounded-2xl text-xl transition-all cursor-pointer">{opt}</button>
              ))}
            </div>
          </>
        )}

        {qType === 'odd' && (
          <>
            <p className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
              Find the odd one out that doesn't belong:
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentQ.items.map((item) => (
                <button key={item} onClick={() => handleSelect(item)} className="py-6 rounded-2xl text-6xl shadow-sm bg-black/5 transition-all cursor-pointer">{item}</button>
              ))}
            </div>
          </>
        )}

        {feedback && (
          <p className="mt-4 text-lg font-bold" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>
            {feedback === 'correct' ? '🎉 Great Logic!' : '❌ Let\'s try another one!'}
          </p>
        )}
      </motion.div>

      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Puzzle World</motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PUZZLE WORLD DASHBOARD
   ══════════════════════════════════════════════════════════════ */
export default function PuzzleWorld() {
  const { user, refreshProfile } = useUser();
  const [activeGame, setActiveGame] = useState(null);
  const [timerMode, setTimerMode] = useState(false);
  const [games, setGames] = useState(FALLBACK_PUZZLE_GAMES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPuzzleGames().then((data) => { if (data.length > 0) setGames(data); }).finally(() => setLoading(false));
  }, []);

  // Page Routing
  if (activeGame) {
    if (activeGame === 'jigsaw' || activeGame === 'drag-puzzle') {
      return <JigsawPuzzleGame timerMode={timerMode} onBack={() => setActiveGame(null)} />;
    }
    if (activeGame === 'logic-puzzles') {
      return <LogicChallengesGame timerMode={timerMode} onBack={() => setActiveGame(null)} />;
    }
    return <ShapeMatchGame timerMode={timerMode} onBack={() => setActiveGame(null)} />;
  }

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
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
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
