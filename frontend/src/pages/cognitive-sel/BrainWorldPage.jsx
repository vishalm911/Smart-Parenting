import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import FloatingElements from '../../components/animations/FloatingElements';
import ConfettiEffect from '../../components/animations/ConfettiEffect';
import { getTranslation } from '../../utils/translations';
import './BrainWorldPage.css';

/* ─── Animation variants ─── */
const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ============================================================
   1. MEMORY MATCH GAME
   ============================================================ */
const CARD_EMOJIS = ['🐶','🐱','🦁','🐯','🦊','🐺','🦝','🐻'];

function MemoryMatchGame() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const lockRef = useRef(false);

  const initCards = useCallback(() => {
    const pairs = [...CARD_EMOJIS, ...CARD_EMOJIS]
      .map((emoji, i) => ({ id: i, emoji, key: `${emoji}-${i}` }))
      .sort(() => Math.random() - 0.5);
    setCards(pairs);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setWon(false);
    setShowConfetti(false);
  }, []);

  useEffect(() => { initCards(); }, [initCards]);

  const handleFlip = (card) => {
    if (lockRef.current) return;
    if (flipped.includes(card.id) || matched.includes(card.emoji)) return;
    if (flipped.length === 2) return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const first = cards.find(c => c.id === firstId);
      const second = cards.find(c => c.id === secondId);
      if (first.emoji === second.emoji) {
        const newMatched = [...matched, first.emoji];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === CARD_EMOJIS.length) {
          setWon(true);
          setShowConfetti(true);
        }
      } else {
        lockRef.current = true;
        setTimeout(() => { setFlipped([]); lockRef.current = false; }, 900);
      }
    }
  };

  return (
    <div className="game-container">
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/brain-world')} className="game-back-btn">
        ← Back to Brain World
      </button>
      <div className="game-header">
        <h2 className="game-title">🧠 Memory Match</h2>
        <p className="game-stat">Moves: <strong>{moves}</strong> · Pairs: <strong>{matched.length}/{CARD_EMOJIS.length}</strong></p>
      </div>
      {won ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="game-board-card">
          <div style={{ fontSize: '4rem' }}>🏆</div>
          <h3 className="brain-card-title" style={{ fontSize: '1.5rem' }}>You Won!</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>Completed in <strong>{moves}</strong> moves!</p>
          <button onClick={initCards} className="btn-orange" style={{ padding: '10px 24px', borderRadius: '999px', marginTop: '12px' }}>
            Play Again 🔄
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.emoji);
            return (
              <motion.button key={card.key} whileHover={{ scale: isFlipped ? 1 : 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleFlip(card)}
                className="aspect-square rounded-2xl text-4xl flex items-center justify-center font-bold shadow-md transition-all"
                style={{ 
                  background: isFlipped ? 'var(--color-bg-elevated)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)', 
                  border: isFlipped ? '2px solid var(--color-border)' : 'none',
                  color: isFlipped ? 'var(--color-text)' : 'transparent', 
                  cursor: isFlipped ? 'default' : 'pointer' 
                }}
              >
                {isFlipped ? card.emoji : '❓'}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   2. SEQUENCE BUILDER GAME
   ============================================================ */
const SEQ_COLORS = ['#3B82F6','#EF4444','#22C55E','#F59E0B'];
const SEQ_EMOJIS = ['🔵','🔴','🟢','🟡'];

function SequenceBuilderGame() {
  const navigate = useNavigate();
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [phase, setPhase] = useState('show');
  const [activeIdx, setActiveIdx] = useState(-1);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const addAndShow = useCallback((prev) => {
    const next = [...prev, Math.floor(Math.random() * 4)];
    setSequence(next);
    setPhase('show');
    setPlayerSeq([]);
    let i = 0;
    const interval = setInterval(() => {
      setActiveIdx(next[i]);
      setTimeout(() => setActiveIdx(-1), 500);
      i++;
      if (i >= next.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('input'), 800);
      }
    }, 900);
  }, []);

  useEffect(() => { addAndShow([]); }, [addAndShow]);

  const handlePress = (idx) => {
    if (phase !== 'input') return;
    const next = [...playerSeq, idx];
    setPlayerSeq(next);
    const pos = next.length - 1;
    if (next[pos] !== sequence[pos]) {
      setPhase('fail');
      return;
    }
    if (next.length === sequence.length) {
      setScore(s => s + sequence.length * 10);
      setShowConfetti(true);
      setTimeout(() => { setShowConfetti(false); addAndShow(sequence); }, 1200);
    }
  };

  return (
    <div className="game-container">
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/brain-world')} className="game-back-btn">
        ← Back to Brain World
      </button>
      <div className="game-header">
        <h2 className="game-title">✨ Sequence Builder</h2>
        <p className="game-stat">Level: <strong>{sequence.length}</strong> · Score: <strong>{score}</strong></p>
        <p className="mt-2 font-semibold" style={{ color: phase === 'input' ? '#22C55E' : phase === 'fail' ? '#EF4444' : '#F59E0B', fontSize: '1rem' }}>
          {phase === 'show' ? '👀 Watch the pattern!' : phase === 'input' ? '🎯 Your turn!' : phase === 'fail' ? '❌ Oops! Wrong pattern.' : '✅ Perfect!'}
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '360px', margin: '0 auto' }}>
        {SEQ_EMOJIS.map((emoji, idx) => (
          <motion.button key={idx} whileHover={{ scale: phase === 'input' ? 1.08 : 1 }} whileTap={{ scale: 0.92 }}
            onClick={() => handlePress(idx)}
            className="aspect-square rounded-3xl text-5xl flex items-center justify-center font-bold shadow-lg"
            animate={{ scale: activeIdx === idx ? 1.2 : 1, boxShadow: activeIdx === idx ? `0 0 30px ${SEQ_COLORS[idx]}` : 'none' }}
            style={{ background: `${SEQ_COLORS[idx]}22`, border: `3px solid ${SEQ_COLORS[idx]}`, cursor: phase === 'input' ? 'pointer' : 'default' }}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
      {phase === 'fail' && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }}
          onClick={() => { setScore(0); addAndShow([]); }}
          className="btn-orange w-full mt-6" style={{ borderRadius: '12px', padding: '10px' }}
        >
          Try Again 🔄
        </motion.button>
      )}
    </div>
  );
}

/* ============================================================
   3. PATTERN FINDER GAME (Previously "Coming Soon" - Now Fully Active!)
   ============================================================ */
const PATTERN_SETS = [
  { common: '🐱', odd: '🐶' },
  { common: '🍎', odd: '🍏' },
  { common: '🚗', odd: '🚲' },
  { common: '🦁', odd: '🐯' },
  { common: '🎈', odd: '🎨' },
];

function PatternFinderGame() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [items, setItems] = useState([]);
  const [won, setWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const initLevel = useCallback((lvl) => {
    const currentSet = PATTERN_SETS[(lvl - 1) % PATTERN_SETS.length];
    const gridItems = Array(8).fill(currentSet.common);
    gridItems.push(currentSet.odd);
    
    // Shuffle positions
    const shuffled = gridItems
      .map((emoji, index) => ({ id: index, emoji, isOdd: emoji === currentSet.odd }))
      .sort(() => Math.random() - 0.5);
      
    setItems(shuffled);
    setWon(false);
    setShowConfetti(false);
  }, []);

  useEffect(() => { initLevel(level); }, [level, initLevel]);

  const handleSelect = (item) => {
    if (item.isOdd) {
      setShowConfetti(true);
      if (level >= 5) {
        setWon(true);
      } else {
        setTimeout(() => {
          setLevel(l => l + 1);
        }, 1000);
      }
    }
  };

  return (
    <div className="game-container">
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/brain-world')} className="game-back-btn">
        ← Back to Brain World
      </button>
      <div className="game-header">
        <h2 className="game-title">🔍 Pattern Finder</h2>
        <p className="game-stat">Level: <strong>{level}/5</strong></p>
        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 800, marginTop: '8px' }}>
          Find the item that looks different! 🧐
        </p>
      </div>

      {won ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="game-board-card">
          <div style={{ fontSize: '4rem' }}>🏆🏆</div>
          <h3 className="brain-card-title" style={{ fontSize: '1.5rem' }}>Splendid Job!</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>You passed all 5 levels!</p>
          <button 
            onClick={() => { setLevel(1); initLevel(1); }} 
            className="btn-orange" 
            style={{ padding: '10px 24px', borderRadius: '999px', marginTop: '12px' }}
          >
            Play Again 🔄
          </button>
        </motion.div>
      ) : (
        <div className="pattern-grid">
          {items.map((item, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleSelect(item)}
              className="pattern-btn"
            >
              {item.emoji}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   4. MAZE CHALLENGE GAME (Previously "Coming Soon" - Now Fully Active!)
   ============================================================ */
const MAZE_LAYOUT = [
  [0, 0, 1, 0, 0],
  [1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 1, 0],
]; // 0: path, 1: wall

function MazeChallengeGame() {
  const navigate = useNavigate();
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });
  const [won, setWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const initGame = () => {
    setPlayerPos({ r: 0, c: 0 });
    setWon(false);
    setShowConfetti(false);
  };

  const movePlayer = (dr, dc) => {
    if (won) return;
    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;

    // Check bounds
    if (nr < 0 || nr >= 5 || nc < 0 || nc >= 5) return;
    // Check wall
    if (MAZE_LAYOUT[nr][nc] === 1) return;

    setPlayerPos({ r: nr, c: nc });

    // Check exit
    if (nr === 4 && nc === 4) {
      setWon(true);
      setShowConfetti(true);
    }
  };

  return (
    <div className="game-container">
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/brain-world')} className="game-back-btn">
        ← Back to Brain World
      </button>
      <div className="game-header">
        <h2 className="game-title">🏝️ Maze Challenge</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 800, marginTop: '4px' }}>
          Guide the rocket 🚀 to the planet 🪐!
        </p>
      </div>

      {won ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="game-board-card">
          <div style={{ fontSize: '4.5rem' }}>🚀✨🪐</div>
          <h3 className="brain-card-title" style={{ fontSize: '1.5rem' }}>Incredible!</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>You navigated the space maze successfully!</p>
          <button 
            onClick={initGame} 
            className="btn-orange" 
            style={{ padding: '10px 24px', borderRadius: '999px', marginTop: '12px' }}
          >
            Play Again 🔄
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Maze Grid */}
          <div className="maze-board">
            {MAZE_LAYOUT.map((row, rIdx) => 
              row.map((cell, cIdx) => {
                const isPlayer = playerPos.r === rIdx && playerPos.c === cIdx;
                const isExit = rIdx === 4 && cIdx === 4;
                return (
                  <div 
                    key={`${rIdx}-${cIdx}`} 
                    className={`maze-cell ${cell === 1 ? 'wall' : 'path'}`}
                  >
                    {isPlayer ? '🚀' : isExit ? '🪐' : ''}
                  </div>
                );
              })
            )}
          </div>

          {/* Navigation Controls */}
          <div className="maze-controls">
            <button className="maze-ctrl-btn maze-ctrl-up" onClick={() => movePlayer(-1, 0)}>⬆️</button>
            <button className="maze-ctrl-btn maze-ctrl-left" onClick={() => movePlayer(0, -1)}>⬅️</button>
            <button className="maze-ctrl-btn maze-ctrl-down" onClick={() => movePlayer(1, 0)}>⬇️</button>
            <button className="maze-ctrl-btn maze-ctrl-right" onClick={() => movePlayer(0, 1)}>➡️</button>
          </div>
        </div>
      )}
    </div>
  );
}

const MascotCompanion = () => {
  const mascot = localStorage.getItem('spaceece_mascot') || '🦁';
  const mascotNames = { '🦁': 'Leo the Lion', '🐯': 'Toby the Tiger', '🐼': 'Penny the Panda', '🦊': 'Felix the Fox', '🐱': 'Cleo the Cat', '🐶': 'Buddy the Dog' };
  const mascotName = mascotNames[mascot] || 'My Companion';
  
  const [bubbleText, setBubbleText] = useState(`Hi there! I am ${mascotName}. Let's learn and play together today! ✨`);
  const [sparkle, setSparkle] = useState(false);
  const [heart, setHeart] = useState(false);

  const handlePet = () => {
    setHeart(true);
    setSparkle(false);
    const reactions = [
      `Aww, that tickles! 🥰`,
      `You are my best friend! ❤️`,
      `Hehe, thank you! I love pet sessions! 😄`
    ];
    setBubbleText(reactions[Math.floor(Math.random() * reactions.length)]);
    setTimeout(() => setHeart(false), 1500);
  };

  const handleFeed = () => {
    setSparkle(true);
    setHeart(false);
    const foods = ['🍌', '🍎', '🥕', '🍪', '🍓'];
    const selectedFood = foods[Math.floor(Math.random() * foods.length)];
    setBubbleText(`Nom nom nom! That ${selectedFood} was super tasty! 😋`);
    setTimeout(() => setSparkle(false), 1500);
  };

  const handleTalk = () => {
    setSparkle(false);
    setHeart(false);
    const facts = [
      `Did you know that honeybees can dance to talk to each other? 🐝💃`,
      `Every puzzle you solve makes our brains grow bigger! 🧠✨`,
      `Being kind to a friend is like giving them a bright sunshine! ☀️`,
      `You are doing amazing today! Keep going! 🌟`
    ];
    setBubbleText(facts[Math.floor(Math.random() * facts.length)]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="brain-sidebar-card"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px' }}
    >
      <h3 className="sidebar-title" style={{ width: '100%', justifyContent: 'center' }}>🐾 Mascot Companion</h3>
      
      <div style={{ position: 'relative', margin: '16px 0' }}>
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: '5rem', cursor: 'pointer', userSelect: 'none', lineHeight: 1 }}
          onClick={handlePet}
        >
          {mascot}
        </motion.div>
        
        <AnimatePresence>
          {heart && (
            <motion.span 
              initial={{ scale: 0, y: 0, opacity: 1 }}
              animate={{ scale: 1.5, y: -45, opacity: 0 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: '-10px', left: '30px', zIndex: 10, fontSize: '2rem' }}
            >
              💖
            </motion.span>
          )}
          {sparkle && (
            <motion.span 
              initial={{ scale: 0, y: 0, opacity: 1 }}
              animate={{ scale: 1.5, y: -45, opacity: 0 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: '-10px', left: '30px', zIndex: 10, fontSize: '2rem' }}
            >
              ✨
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
        {mascotName}
      </div>

      <div 
        style={{
          background: 'linear-gradient(135deg, #FFFDF0 0%, #FFEEDD 100%)',
          border: '2px solid #FFE4B5',
          borderRadius: '16px',
          padding: '12px 16px',
          fontSize: '0.88rem',
          fontWeight: 700,
          color: '#1A1A1A',
          textAlign: 'center',
          lineHeight: 1.45,
          position: 'relative',
          width: '100%',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {bubbleText}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%', marginTop: '8px' }}>
        <button onClick={handlePet} className="btn-ghost" style={{ padding: '8px 4px', fontSize: '0.78rem', fontWeight: 800, borderRadius: '12px', cursor: 'pointer' }}>
          Pet 💖
        </button>
        <button onClick={handleFeed} className="btn-ghost" style={{ padding: '8px 4px', fontSize: '0.78rem', fontWeight: 800, borderRadius: '12px', cursor: 'pointer' }}>
          Feed 🍎
        </button>
        <button onClick={handleTalk} className="btn-orange" style={{ padding: '8px 4px', fontSize: '0.78rem', fontWeight: 800, borderRadius: '12px', cursor: 'pointer' }}>
          Talk 🗣️
        </button>
      </div>
    </motion.div>
  );
};

/* ============================================================
   5. BRAIN WORLD INDEX / HOMEPAGE
   ============================================================ */
const BrainWorldHome = () => {
  const navigate = useNavigate();
  const { profile } = useUser();
  const currentLang = profile?.language || localStorage.getItem('spaceece_language') || 'English';

  const activities = [
    { id: 'memory-match',      title: 'Memory Match',      description: 'Flip cards and find matching pairs', emoji: '🃏', color: '#3B82F6' },
    { id: 'sequence-builder',  title: 'Sequence Builder',  description: 'Remember and repeat the color pattern', emoji: '✨', color: '#8B5CF6' },
    { id: 'pattern-finder',    title: 'Pattern Finder',    description: 'Find the odd emoji out in the grid', emoji: '🔍', color: '#F59E0B' },
    { id: 'maze-challenge',    title: 'Maze Challenge',    description: 'Navigate the rocket safely to the planet', emoji: '🏝️', color: '#10B981' },
  ];

  return (
    <div className="brain-world-container">
      <FloatingElements count={3} />
      
      {/* Title Header */}
      <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="brain-header">
        <motion.span className="text-6xl inline-block mb-3" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 3, repeat: Infinity }}>🧠</motion.span>
        <h1 className="brain-title">
          {getTranslation('Brain World', currentLang)}
        </h1>
        <p className="brain-subtitle">{getTranslation('Boost your cognitive skills with fun, interactive quests! 💪', currentLang)}</p>
      </motion.section>

      {/* Two column layout to utilise side blank space */}
      <div className="brain-layout-wrapper">
        
        {/* Left Side: Games & active box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="brain-grid">
            {activities.map(act => (
              <motion.div 
                key={act.id} 
                variants={staggerItem}
                whileHover={{ y: -6, scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/child/brain-world/${act.id}`)}
                className="brain-activity-card"
                style={{ borderTop: `4px solid ${act.color}` }}
              >
                <div className="brain-card-icon" style={{ background: `${act.color}15`, color: act.color }}>
                  {act.emoji}
                </div>
                <div className="brain-card-info">
                  <h3 className="brain-card-title">{getTranslation(act.title, currentLang)}</h3>
                  <p className="brain-card-desc">{getTranslation(act.description, currentLang)}</p>
                </div>
                <span style={{ fontSize: '1.25rem' }}>🚀</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Active container box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="brain-active-box"
          >
            <div style={{ fontSize: '2.5rem' }}>🧠✨🌟</div>
            <h3 className="brain-active-title">{getTranslation('Keep Your Brain Active!', currentLang)}</h3>
            <p className="brain-active-desc">{getTranslation('Play daily to improve memory recall, spatial focus, matching speed, and logic problem-solving skills.', currentLang)}</p>
          </motion.div>
        </div>

        {/* Right Side: Interactive Mascot companion (utilises side margins) */}
        <MascotCompanion />

      </div>
    </div>
  );
};

/* ============================================================
   ROUTER PATH COMPONENT
   ============================================================ */
const BrainWorldPage = () => (
  <Routes>
    <Route index element={<BrainWorldHome />} />
    <Route path="memory-match"     element={<MemoryMatchGame />} />
    <Route path="sequence-builder" element={<SequenceBuilderGame />} />
    <Route path="pattern-finder"   element={<PatternFinderGame />} />
    <Route path="maze-challenge"   element={<MazeChallengeGame />} />
    <Route path="*"                element={<BrainWorldHome />} />
  </Routes>
);

export default BrainWorldPage;
