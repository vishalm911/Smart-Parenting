/**
 * BrainWorldPage.jsx
 * Yogashwar — Cognitive, Creativity & Social Emotional Universe
 * Brain World: Memory Match, Sequence Builder, Pattern Finder, Maze Challenge
 * Ported from TypeScript and adapted for integration-lead (JSX + our design tokens)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingElements from '../../../components/animations/FloatingElements';
import ConfettiEffect from '../../../components/animations/ConfettiEffect';

/* ─── Animation variants (from Yogashwar's utils/animations) ─── */
const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ═══════════════════════════════════════════════════════
   MEMORY MATCH GAME
═══════════════════════════════════════════════════════ */
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/brain-world')} className="flex items-center gap-2 mb-6 font-semibold" style={{ color: 'var(--text-muted)' }}>
        ← Back to Brain World
      </button>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>🧠 Memory Match</h2>
        <p style={{ color: 'var(--text-muted)' }}>Moves: <strong>{moves}</strong> · Pairs: <strong>{matched.length}/{CARD_EMOJIS.length}</strong></p>
      </div>
      {won ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card text-center p-8">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>You Won!</h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Completed in <strong>{moves}</strong> moves!</p>
          <motion.button whileHover={{ scale: 1.05 }} onClick={initCards} className="btn-orange">Play Again 🔄</motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.emoji);
            return (
              <motion.button key={card.key} whileHover={{ scale: isFlipped ? 1 : 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleFlip(card)}
                className="aspect-square rounded-2xl text-3xl flex items-center justify-center font-bold shadow-md transition-all"
                style={{ background: isFlipped ? 'var(--bg-accent)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: isFlipped ? 'var(--text-primary)' : 'transparent', cursor: isFlipped ? 'default' : 'pointer' }}>
                {isFlipped ? card.emoji : '❓'}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SEQUENCE BUILDER GAME
═══════════════════════════════════════════════════════ */
const SEQ_COLORS = ['#3B82F6','#EF4444','#22C55E','#F59E0B'];
const SEQ_EMOJIS = ['🔵','🔴','🟢','🟡'];

function SequenceBuilderGame() {
  const navigate = useNavigate();
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [phase, setPhase] = useState('show'); // show | input | win | fail
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
    <div className="max-w-lg mx-auto px-4 py-6">
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/brain-world')} className="flex items-center gap-2 mb-6 font-semibold" style={{ color: 'var(--text-muted)' }}>
        ← Back to Brain World
      </button>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>✨ Sequence Builder</h2>
        <p style={{ color: 'var(--text-muted)' }}>Level: <strong>{sequence.length}</strong> · Score: <strong>{score}</strong></p>
        <p className="mt-2 font-semibold" style={{ color: phase === 'input' ? '#22C55E' : phase === 'fail' ? '#EF4444' : '#F59E0B' }}>
          {phase === 'show' ? '👀 Watch the sequence!' : phase === 'input' ? '🎯 Your turn!' : phase === 'fail' ? '❌ Wrong! Restarting…' : '✅ Perfect!'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {SEQ_EMOJIS.map((emoji, idx) => (
          <motion.button key={idx} whileHover={{ scale: phase === 'input' ? 1.08 : 1 }} whileTap={{ scale: 0.92 }}
            onClick={() => handlePress(idx)}
            className="aspect-square rounded-3xl text-5xl flex items-center justify-center font-bold shadow-lg"
            animate={{ scale: activeIdx === idx ? 1.2 : 1, boxShadow: activeIdx === idx ? `0 0 30px ${SEQ_COLORS[idx]}` : 'none' }}
            style={{ background: `${SEQ_COLORS[idx]}22`, border: `3px solid ${SEQ_COLORS[idx]}`, cursor: phase === 'input' ? 'pointer' : 'default' }}>
            {emoji}
          </motion.button>
        ))}
      </div>
      {phase === 'fail' && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }}
          onClick={() => { setScore(0); addAndShow([]); }}
          className="btn-orange w-full mt-6">
          Try Again 🔄
        </motion.button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BRAIN WORLD HOME
═══════════════════════════════════════════════════════ */
const BrainWorldHome = () => {
  const navigate = useNavigate();

  const activities = [
    { id: 'memory-match',      title: 'Memory Match',      description: 'Flip cards and find matching pairs', emoji: '🃏', color: '#3B82F6' },
    { id: 'sequence-builder',  title: 'Sequence Builder',  description: 'Remember and repeat the colour pattern', emoji: '✨', color: '#8B5CF6' },
    { id: 'pattern-finder',    title: 'Pattern Finder',    description: 'Find the different item in the grid', emoji: '🔍', color: '#F59E0B', comingSoon: true },
    { id: 'maze-challenge',    title: 'Maze Challenge',    description: 'Navigate through the maze to exit', emoji: '🏃', color: '#10B981', comingSoon: true },
  ];

  return (
    <div className="relative min-h-screen">
      <FloatingElements count={3} />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-6">
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.span className="text-6xl inline-block mb-3" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>🧠</motion.span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
            Brain World
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Boost your cognitive skills with fun challenges! 💪</p>
        </motion.section>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid md:grid-cols-2 gap-5">
          {activities.map(act => (
            <motion.div key={act.id} variants={staggerItem}
              whileHover={!act.comingSoon ? { y: -8, scale: 1.02 } : {}} whileTap={!act.comingSoon ? { scale: 0.98 } : {}}
              onClick={() => !act.comingSoon && navigate(`/child/brain-world/${act.id}`)}
              className="card relative overflow-hidden"
              style={{ borderTop: `4px solid ${act.color}`, cursor: act.comingSoon ? 'not-allowed' : 'pointer', opacity: act.comingSoon ? 0.8 : 1 }}>
              {act.comingSoon && (
                <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${act.color}22`, color: act.color }}>Coming Soon</span>
              )}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: `${act.color}18` }}>
                  {act.emoji}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{act.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{act.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-8 card text-center" style={{ background: 'linear-gradient(135deg, #EFF6FF, #EDE9FE)', border: '2px solid #BFDBFE' }}>
          <div className="text-4xl mb-3">🧠✨</div>
          <h3 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Keep Your Brain Active!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Play daily to improve memory, focus, and problem-solving skills.</p>
        </motion.div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════════════════ */
const BrainWorldPage = () => (
  <Routes>
    <Route index element={<BrainWorldHome />} />
    <Route path="memory-match"     element={<MemoryMatchGame />} />
    <Route path="sequence-builder" element={<SequenceBuilderGame />} />
    <Route path="*"                element={<BrainWorldHome />} />
  </Routes>
);

export default BrainWorldPage;
