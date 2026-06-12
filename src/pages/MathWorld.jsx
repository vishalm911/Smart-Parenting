import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import GameCard from '../components/common/GameCard';
import ScoreDisplay from '../components/common/ScoreDisplay';
import ConfettiEffect from '../components/animations/ConfettiEffect';
import StarAnimation from '../components/animations/StarAnimation';
import FloatingElements from '../components/animations/FloatingElements';
import useGameState from '../hooks/useGameState';
import { getMathGames, saveNumeracyScore, awardProgress } from '../firebase/services';

/* ─── Fallback static data if Firestore empty ─── */
const FALLBACK_MATH_GAMES = [
  { id: 'counting-1-3',   title: 'Counting Fun',      description: 'Count colourful objects and learn numbers 1–10!', emoji: '🐻', ageRange: '1–3', difficulty: 'Easy',   gradient: 'bg-gradient-to-br from-[#FF9A56] via-[#F5A623] to-[#FFCC02]', type: 'counting' },
  { id: 'number-match',   title: 'Number Match',      description: 'Match numbers to the right group of objects!',   emoji: '🎯', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#2EC4B6] to-[#4FC3F7]',                type: 'matching' },
  { id: 'add-sub',        title: 'Add & Subtract',    description: 'Master addition and subtraction!',              emoji: '➕', ageRange: '7–10', difficulty: 'Hard',   gradient: 'bg-gradient-to-br from-[#7C4DFF] to-[#FF6B9D]',                type: 'arithmetic' },
  { id: 'times-tables',   title: 'Times Tables',      description: 'Speed through multiplication timed rounds!',    emoji: '✖️', ageRange: '7–10', difficulty: 'Hard',   gradient: 'bg-gradient-to-br from-[#FF6B9D] via-[#F5A623] to-[#FFD180]', type: 'arithmetic' },
  { id: 'number-order',   title: 'Number Order',      description: 'Put numbers in the right order!',               emoji: '📊', ageRange: '4–6', difficulty: 'Medium', gradient: 'bg-gradient-to-br from-[#66BB6A] to-[#2EC4B6]',                type: 'ordering' },
  { id: 'shape-numbers',  title: 'Shape Numbers',     description: 'Count the sides and corners of shapes!',        emoji: '🔷', ageRange: '1–3', difficulty: 'Easy',   gradient: 'bg-gradient-to-br from-[#4FC3F7] to-[#7C4DFF]',                type: 'counting' },
];

/* ─── Number Match Game (Age 4-6) ─── */
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
    { digit: 6, groups: [{ emoji: '🐟', count: 3 }, { emoji: '🐢', count: 6 }, { emoji: '🦆', count: 4 }, { emoji: '🐝', count: 5 }] },
    { digit: 2, groups: [{ emoji: '🎪', count: 5 }, { emoji: '🎭', count: 2 }, { emoji: '🎨', count: 4 }, { emoji: '🎬', count: 3 }] },
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
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={gameState.resetGame} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="btn-ghost">Back</motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />
      <motion.div key={round} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="card p-6 mb-4 text-center">
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

/* ─── Arithmetic Game (Age 7-10) ─── */
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
    <div className="max-w-lg mx-auto px-4 py-6">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />
      <motion.div key={round} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 mb-4 text-center">
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

/* ─── Counting Mini-Game ─── */
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
  ];
  const q = questions[currentQuestion % questions.length];

  const handleAnswer = useCallback(
    (answer) => {
      if (feedback) return;
      setSelectedAnswer(answer);
      if (answer === q.count) {
        setFeedback('correct');
        gameState.onCorrectAnswer();
      } else {
        setFeedback('wrong');
        gameState.onWrongAnswer();
      }
      setTimeout(() => {
        setSelectedAnswer(null);
        setFeedback(null);
        if (currentQuestion + 1 >= questions.length) {
          gameState.levelUp();
          setCurrentQuestion(0);
        } else {
          setCurrentQuestion((c) => c + 1);
        }
      }, 1200);
    },
    [feedback, q.count, currentQuestion, questions.length, gameState]
  );

  // Guard prevents double-save if isComplete flips multiple times
  const hasSaved = useRef(false);
  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: 'counting-1-3', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'mathWorld' })
        .then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile]);

  if (gameState.isComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <ConfettiEffect active={true} />
        <motion.span className="text-7xl mb-4" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>🎉</motion.span>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Great Job!</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>You scored <strong>{gameState.score}</strong> points!</p>
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

      <motion.div key={currentQuestion} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
        className="card p-8 mb-6 text-center"
      >
        <p className="text-lg font-semibold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          How many {q.emoji} do you see?
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Array.from({ length: q.count }).map((_, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: 'spring' }} className="text-5xl">
              {q.emoji}
            </motion.span>
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
              <motion.button key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleAnswer(opt)} disabled={feedback !== null}
                className="font-bold text-2xl rounded-2xl py-4 transition-colors shadow-md"
                style={{ ...style, fontFamily: 'var(--font-display)' }}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 text-lg font-bold"
              style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336', fontFamily: 'var(--font-display)' }}
            >
              {feedback === 'correct' ? '🎉 Correct! Amazing!' : '😢 Oops! Try again!'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="btn-ghost w-full py-3">
        ← Back to Math World
      </motion.button>
    </div>
  );
}

/* ─── Math World Hub ─── */
export default function MathWorld() {
  const [activeGame, setActiveGame] = useState(null);
  const [selectedAge, setSelectedAge] = useState('all');
  const [games, setGames] = useState(FALLBACK_MATH_GAMES);
  const [loading, setLoading] = useState(true);

  const ageGroups = ['all', '1–3', '4–6', '7–10'];

  // Load from Firebase, fall back to static
  useEffect(() => {
    getMathGames()
      .then((data) => { if (data.length > 0) setGames(data); })
      .finally(() => setLoading(false));
  }, []);

  const filteredGames = selectedAge === 'all' ? games : games.filter((g) => g.ageRange === selectedAge);

  if (activeGame === 'counting-1-3' || activeGame === 'shape-numbers') return <CountingGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'number-match' || activeGame === 'number-order') return <NumberMatchGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'add-sub' || activeGame === 'times-tables') return <ArithmeticGame onBack={() => setActiveGame(null)} />;
  if (activeGame) return <CountingGame onBack={() => setActiveGame(null)} />;

  return (
    <div className="relative min-h-screen">
      <FloatingElements count={4} />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6">
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.span className="text-6xl inline-block mb-3" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>🔢</motion.span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#FF9A56] via-[#F5A623] to-[#FFCC02] bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-display)' }}>Math World</h1>
          <p style={{ color: 'var(--text-muted)' }}>Pick a game and start your math adventure! 🚀</p>
        </motion.section>

        {/* Age Filter */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {ageGroups.map((age) => (
            <motion.button key={age} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAge(age)}
              className={`filter-pill ${selectedAge === age ? 'active' : ''}`}
            >
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
