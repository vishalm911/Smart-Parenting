import { useState, useEffect, useRef, useMemo } from 'react';
import ThreeDAdventureMap from '../../components/three/ThreeDAdventureMap';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import ProgressBar from '../../components/common/ProgressBar';
import FloatingElements from '../../components/animations/FloatingElements';
import ConfettiEffect from '../../components/animations/ConfettiEffect';
import useGameState from '../../hooks/useGameState';
import ScoreDisplay from '../../components/common/ScoreDisplay';
import StarAnimation from '../../components/animations/StarAnimation';
import { saveNumeracyScore, awardProgress } from '../../api/services';

import { speakText } from '../../utils/helpers';

const ZONES = [
  { id: 'counting-meadow', name: 'Counting Meadow', emoji: '🌸', description: 'Count flowers, bugs & butterflies!',  xpRequired: 0,   color: '#66BB6A', gradient: 'from-[#66BB6A] to-[#2EC4B6]', activities: ['Count Flowers', 'Bug Hunt', 'Butterfly Match'] },
  { id: 'number-forest',   name: 'Number Forest',   emoji: '🌲', description: 'Explore the forest of numbers!',       xpRequired: 50,  color: '#2EC4B6', gradient: 'from-[#2EC4B6] to-[#4FC3F7]', activities: ['Number Line Walk', 'Tree Counting', 'Forest Puzzle'] },
  { id: 'toy-town',        name: 'Toy Town',         emoji: '🧸', description: 'Count and sort toys of all sizes!',   xpRequired: 120, color: '#F5A623', gradient: 'from-[#FF9A56] to-[#F5A623]', activities: ['Count Toys', 'Size Sort', 'Toy Pairs'] },
  { id: 'ocean-depths',    name: 'Ocean Depths',     emoji: '🐠', description: 'Dive into numbers under the sea!',    xpRequired: 200, color: '#4FC3F7', gradient: 'from-[#4FC3F7] to-[#7C4DFF]', activities: ['Fish Counter', 'Bubble Pop', 'Coral Compare'] },
  { id: 'sky-castle',      name: 'Sky Castle',        emoji: '🏰', description: 'Master numbers at the top of the world!', xpRequired: 350, color: '#7C4DFF', gradient: 'from-[#7C4DFF] to-[#FF6B9D]', activities: ['Cloud Numbers', 'Star Count', 'Castle Quest'] },
  { id: 'space-station',   name: 'Space Station',    emoji: '🚀', description: 'Numbers in outer space!',             xpRequired: 500, color: '#FF6B9D', gradient: 'from-[#FF6B9D] to-[#F5A623]', activities: ['Planet Count', 'Asteroid Math', 'Galaxy Explorer'] },
];

const TOY_EMOJIS = ['🧸', '🎎', '🤖', '🎲', '🪀', '🛸', '🎪', '⚽'];

/* ─── Size Comparison Game ─── */
const SIZE_ROUNDS = [
  { label: 'houses', items: [{ e: '🏠', size: 2 }, { e: '🏡', size: 4 }, { e: '🏗️', size: 1 }, { e: '🏰', size: 3 }] },
  { label: 'animals', items: [{ e: '🐜', size: 1 }, { e: '🐈', size: 2 }, { e: '🐶', size: 3 }, { e: '🐘', size: 4 }] },
  { label: 'fruits',  items: [{ e: '🍇', size: 1 }, { e: '🍎', size: 2 }, { e: '🍉', size: 3 }, { e: '🍍', size: 4 }] },
  { label: 'vehicles',items: [{ e: '🚲', size: 1 }, { e: '🚗', size: 2 }, { e: '🚌', size: 3 }, { e: '🚂', size: 4 }] },
];

// Helper to keep renders pure and ESLint clean
const shuffleSizeItems = (items) => {
  return [...items].sort(() => Math.random() - 0.5);
};

function SizeComparisonGame({ onBack, zoneId }) {
  const [round, setRound]   = useState(0);
  const [order, setOrder]   = useState([]);
  const [done, setDone]     = useState(false);
  const [score, setScore]   = useState(0);
  const [feedback, setFeedback] = useState(null);
  const { user, refreshProfile } = useUser();
  const hasSaved = useRef(false);

  const rnd = SIZE_ROUNDS[round % SIZE_ROUNDS.length];
  const shuffled = useMemo(() => shuffleSizeItems(rnd.items), [rnd.items]);

  const handleClick = (item) => {
    if (feedback) return;
    const nextSize = order.length + 1;
    if (item.size === nextSize) {
      const newOrder = [...order, item];
      setOrder(newOrder);
      if (newOrder.length === rnd.items.length) {
        setScore(s => s + 30);
        setFeedback('correct');
        setTimeout(() => {
          setFeedback(null);
          setOrder([]);
          if (round + 1 >= SIZE_ROUNDS.length) setDone(true);
          else setRound(r => r + 1);
        }, 1000);
      }
    } else {
      setFeedback('wrong');
      setOrder([]);
      setTimeout(() => setFeedback(null), 800);
    }
  };

  useEffect(() => {
    if (done && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: zoneId || 'size-comparison', score, level: 1, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(score / 2), stars: 1, coins: 5, module: 'numberAdventure' }).then(() => refreshProfile());
    }
  }, [done, score, user, refreshProfile, zoneId]);

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ConfettiEffect active />
      <span className="text-7xl mb-4">🏆</span>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Size Master!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{score}</strong></p>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setRound(0); setOrder([]); setScore(0); setDone(false); hasSaved.current = false; }} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost">Back</motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="game-viewport-container">
      <div className="game-card-viewport p-4 mb-4">
        <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Round {round + 1} / {SIZE_ROUNDS.length}</p>
        <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Tap the {rnd.label} from ⬅️ smallest to largest ➡️
        </p>
        {feedback && <p className="mt-2 font-bold" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Perfect!' : '❌ Start over!'}</p>}
      </div>

      {/* Order so far */}
      <div className="flex justify-center gap-2 mb-4 min-h-[60px] items-center">
        {order.map((item, i) => (
          <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="text-3xl">{item.e}</motion.span>
        ))}
        {order.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tap items below in order…</p>}
      </div>

      {/* Item choices */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {shuffled.map((item, i) => {
          const picked = order.some(o => o.size === item.size);
          return (
            <motion.button key={i} whileHover={picked ? {} : { scale: 1.05 }} whileTap={picked ? {} : { scale: 0.95 }}
              onClick={() => handleClick(item)} disabled={picked}
              className="rounded-3xl p-5 flex flex-col items-center gap-2"
              style={{
                background: picked ? '#4CAF5020' : 'var(--bg-accent)',
                border: picked ? '2px solid #4CAF50' : '2px solid var(--border-default)',
                opacity: picked ? 0.5 : 1,
              }}>
              <span style={{ fontSize: 32 + item.size * 8 }}>{item.e}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{picked ? '✓ Placed' : 'Tap me'}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.button whileHover={{ scale: 1.05 }} onClick={onBack} className="btn-ghost w-full py-3">← Back to Map</motion.button>
    </div>
  );
}

// Helper to keep renders pure and ESLint clean
const generateCountQuestion = (round) => {
  const toy = TOY_EMOJIS[round % TOY_EMOJIS.length];
  const count = 2 + (round % 7);
  const opts = new Set([count]);
  while (opts.size < 4) {
    opts.add(Math.max(1, count + Math.floor(Math.random() * 5) - 2));
  }
  const options = [...opts].sort(() => Math.random() - 0.5);
  return { toy, count, options };
};

function CountToysGame({ onBack, zoneId }) {
  const gameState = useGameState({ maxLives: 3, pointsPerCorrect: 15 });
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [tappedIndices, setTappedIndices] = useState([]);
  const { user, refreshProfile } = useUser();

  const q = useMemo(() => generateCountQuestion(round), [round]);

  const speakCount = (c) => {
    speakText(c.toString(), { rate: 1.1, pitch: 1.4 });
  };

  const handleAnswer = (answer) => {
    if (feedback) return;
    if (answer === q.count) {
      setFeedback('correct');
      gameState.onCorrectAnswer();
    } else {
      setFeedback('wrong');
      gameState.onWrongAnswer();
    }
    setTimeout(() => {
      setFeedback(null);
      setRound((r) => r + 1);
      setTappedIndices([]); // Reset here
      if ((round + 1) % 5 === 0) gameState.levelUp();
    }, 1200);
  };

  const hasSaved = useRef(false);
  useEffect(() => {
    if (gameState.isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({ child_id: user.uid, game_id: zoneId || 'toy-town', score: gameState.score, level: gameState.level, time_taken: 0 });
      awardProgress(user.uid, { xp: Math.floor(gameState.score / 2), stars: gameState.stars, coins: 5, module: 'numberAdventure' })
        .then(() => refreshProfile());
    }
  }, [gameState.isComplete, gameState.score, gameState.level, gameState.stars, user, refreshProfile, zoneId]);

  if (gameState.isComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <ConfettiEffect active={true} />
        <span className="text-7xl mb-4">🧸</span>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Toy Counting Complete!</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{gameState.score}</strong> | XP: <strong>{gameState.xp}</strong></p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { gameState.resetGame(); setTappedIndices([]); }} className="btn-orange">Play Again 🔄</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="btn-ghost">Back</motion.button>
        </div>
      </motion.div>
    );
  }

  const allToysTapped = tappedIndices.length === q.count;

  return (
    <div className="game-viewport-container">
      <ConfettiEffect active={gameState.showConfetti} />
      <StarAnimation show={gameState.showStarAnimation} />
      <ScoreDisplay score={gameState.score} level={gameState.level} lives={gameState.lives} streak={gameState.streak} className="mb-6" />

      <motion.div key={round} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="game-card-viewport p-8 mb-6">
        <p className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          Tap each toy to count it aloud! 📢
        </p>
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          (Tapped: {tappedIndices.length} of {q.count})
        </p>
        
        {/* Interactive Toy Row */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 min-h-[100px] items-center">
          {Array.from({ length: q.count }).map((_, i) => {
            const isTapped = tappedIndices.includes(i);
            return (
              <motion.button
                key={i}
                onClick={() => {
                  if (!isTapped) {
                    const nextCount = tappedIndices.length + 1;
                    setTappedIndices(prev => [...prev, i]);
                    speakCount(nextCount);
                  }
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1, filter: isTapped ? 'none' : 'grayscale(100%) opacity(0.35)' }}
                whileHover={{ scale: isTapped ? 1 : 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="text-5xl p-2 rounded-2xl bg-transparent transition-all cursor-pointer"
              >
                {q.toy}
              </motion.button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt) => (
            <motion.button
              key={opt}
              whileHover={allToysTapped ? { scale: 1.05 } : {}}
              whileTap={allToysTapped ? { scale: 0.9 } : {}}
              onClick={() => handleAnswer(opt)}
              disabled={!allToysTapped || !!feedback}
              className={`font-bold text-2xl rounded-2xl py-4 shadow-md transition-colors ${
                !allToysTapped ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{
                background: feedback && opt === q.count ? '#4CAF50' : 'var(--bg-accent)',
                color: feedback && opt === q.count ? 'white' : 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {opt}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-4 text-lg font-bold" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336', fontFamily: 'var(--font-display)' }}
            >
              {feedback === 'correct' ? '🎉 Correct!' : '❌ Try again!'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="btn-ghost w-full py-3">
        ← Back to Map
      </motion.button>
    </div>
  );
}

export default function NumberAdventure() {
  const { profile } = useUser();
  const [activeZone, setActiveZone] = useState(null);
  const playerXp = profile?.xp ?? 85;

  // Number Line Interactive States
  const [startNum, setStartNum] = useState(3);
  const [operation, setOperation] = useState('+');
  const [steps, setSteps] = useState(4);
  const [frogPos, setFrogPos] = useState(3);
  const [isHopping, setIsHopping] = useState(false);
  const [hopSeq, setHopSeq] = useState([]);
  const [seqIndex, setSeqIndex] = useState(0);

  const startHopping = () => {
    if (isHopping) return;
    let target = startNum;
    const seq = [startNum];
    for (let i = 0; i < steps; i++) {
      const nextVal = operation === '+' ? target + 1 : target - 1;
      if (nextVal >= 0 && nextVal <= 10) {
        target = nextVal;
        seq.push(target);
      }
    }
    setHopSeq(seq);
    setSeqIndex(0);
    setFrogPos(startNum);
    setIsHopping(true);
  };

  useEffect(() => {
    if (!isHopping || hopSeq.length === 0) return;
    if (seqIndex >= hopSeq.length - 1) {
      Promise.resolve().then(() => {
        setIsHopping(false);
      });
      return;
    }
    const timer = setTimeout(() => {
      setSeqIndex((p) => p + 1);
      setFrogPos(hopSeq[seqIndex + 1]);
    }, 600);
    return () => clearTimeout(timer);
  }, [isHopping, seqIndex, hopSeq]);

  if (activeZone === 'ocean-depths' || activeZone === 'sky-castle') return <SizeComparisonGame zoneId={activeZone} onBack={() => setActiveZone(null)} />;
  if (activeZone) return <CountToysGame zoneId={activeZone} onBack={() => setActiveZone(null)} />;

  return (
    <div className="relative min-h-screen">
      <FloatingElements count={5} />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6">
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.span className="text-6xl inline-block mb-3" animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>🗺️</motion.span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#7C4DFF] to-[#FF6B9D] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
            Number Adventure
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Explore the world map and unlock new zones! 🌍</p>
        </motion.section>

        {/* XP Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>🏅 Explorer Level</span>
            <span className="text-sm font-semibold" style={{ color: '#7C4DFF' }}>{playerXp} XP</span>
          </div>
          <ProgressBar value={playerXp} max={500} color="#7C4DFF" showPercentage={false} />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{500 - playerXp} XP until max level!</p>
        </motion.div>

        {/* ─── Three.js 3D Adventure Map ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <ThreeDAdventureMap
            playerXp={playerXp}
            onZoneClick={(zone) => setActiveZone(zone.id)}
          />
        </motion.div>

        {/* Zone cards */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#66BB6A] via-[#F5A623] to-[#FF6B9D] rounded-full hidden md:block" />
          <div className="space-y-4">
            {ZONES.map((zone, i) => {
              const unlocked = playerXp >= zone.xpRequired;
              return (
                <motion.div key={zone.id} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="relative md:pl-16"
                >
                  <div className="hidden md:flex absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-white z-10 shadow-md"
                    style={{ background: unlocked ? zone.color : '#9E9E9E' }}
                  />
                  <motion.div
                    whileHover={unlocked ? { scale: 1.02, y: -3 } : {}}
                    whileTap={unlocked ? { scale: 0.98 } : {}}
                    onClick={() => unlocked && setActiveZone(zone.id)}
                    className={`rounded-3xl overflow-hidden ${!unlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`bg-gradient-to-r ${zone.gradient} p-5 relative`}>
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-3xl z-20">
                          <div className="text-center text-white">
                            <span className="text-4xl block mb-1">🔒</span>
                            <span className="text-sm font-bold">Need {zone.xpRequired} XP</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 text-6xl opacity-15 select-none pointer-events-none">{zone.emoji}</div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-3xl">{zone.emoji}</span>
                          <div>
                            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{zone.name}</h3>
                            <p className="text-white/80 text-sm">{zone.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {zone.activities.map((a) => (
                            <span key={a} className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full px-3 py-1">{a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Number Line */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-10 card p-6">
          <h3 className="text-xl font-bold mb-4 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>📏 Interactive Number Line</h3>

          {/* Equation Display */}
          <div className="text-center mb-6">
            <span className="text-3xl font-black bg-gradient-to-r from-[#7C4DFF] to-[#FF6B9D] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
              {startNum} {operation} {isHopping ? (hopSeq.length - 1) : steps} = {isHopping ? '❓' : frogPos}
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8 p-4 rounded-3xl bg-black/5 border border-dashed" style={{ borderColor: 'var(--border-default)' }}>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Start</span>
              <select value={startNum} onChange={(e) => {
                const val = parseInt(e.target.value);
                setStartNum(val);
                if (!isHopping) setFrogPos(val);
              }} className="p-2 rounded-xl border font-bold text-sm" style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}>
                {Array.from({ length: 11 }).map((_, i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Hop Action</span>
              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-default)' }}>
                <button onClick={() => setOperation('+')} className={`px-4 py-2 font-bold text-xs transition-colors cursor-pointer ${operation === '+' ? 'bg-[#4CAF50] text-white' : 'bg-transparent text-primary'}`}>Add (+)</button>
                <button onClick={() => setOperation('-')} className={`px-4 py-2 font-bold text-xs transition-colors cursor-pointer ${operation === '-' ? 'bg-[#F44336] text-white' : 'bg-transparent text-primary'}`}>Sub (-)</button>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Hops Count</span>
              <select value={steps} onChange={(e) => setSteps(parseInt(e.target.value))} className="p-2 rounded-xl border font-bold text-sm" style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}>
                {Array.from({ length: 5 }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} steps</option>)}
              </select>
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startHopping} disabled={isHopping} className="btn-orange text-xs py-2.5 px-5 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              🐸 Hop, Froggy, Hop!
            </motion.button>
          </div>

          {/* Hopper Track */}
          <div className="relative py-8 px-4 border rounded-3xl" style={{ background: 'var(--bg-accent)', borderColor: 'var(--border-default)' }}>
            <div className="h-2 rounded-full relative" style={{ background: 'var(--border-default)' }}>
              {/* Animated Frog Mascot */}
              <motion.div
                className="absolute text-5xl"
                animate={{
                  left: `${(frogPos / 10) * 100}%`,
                  y: isHopping ? [0, -45, 0] : 0,
                  scale: isHopping ? [1, 1.25, 1] : 1,
                }}
                transition={{
                  left: { type: 'spring', stiffness: 90, damping: 11 },
                  y: { duration: 0.55, ease: 'easeOut' },
                  scale: { duration: 0.55 }
                }}
                style={{ bottom: '8px', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10 }}
              >
                🐸
              </motion.div>
            </div>

            <div className="flex justify-between mt-4">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-1.5 h-3 bg-slate-400 rounded-full mb-1" />
                  <span className="text-sm font-black" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{i}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
