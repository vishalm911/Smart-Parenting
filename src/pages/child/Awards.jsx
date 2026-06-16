import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { getUnlockedAchievements } from '../../firebase/services';

const CATEGORIES = ['All', 'Literacy', 'Math', 'Creative', 'Emotion', 'Brain', 'Science'];

const TROPHY_SHELF = [
  { id: 'first-steps',    label: 'First Steps',    emoji: '🏅', locked: true },
  { id: 'rising-star',    label: 'Rising Star',    emoji: '🌟', locked: true },
  { id: 'rocket-learner', label: 'Rocket Learner', emoji: '🚀', locked: true },
  { id: 'knowledge-king', label: 'Knowledge King', emoji: '👑', locked: true },
];

const BADGES = [
  { id: 'first-game',     title: 'First Game!',      desc: 'Play your first learning game',    emoji: '🎮', cat: 'Brain',   locked: true },
  { id: 'streak-3',       title: '3-Day Streak',     desc: 'Log in 3 days in a row',           emoji: '🔥', cat: 'Emotion', locked: true },
  { id: 'streak-7',       title: 'Week Warrior',     desc: 'Log in 7 days in a row',           emoji: '⚡', cat: 'Emotion', locked: true },
  { id: 'xp-100',         title: 'XP Hunter',        desc: 'Earn 100 Experience Points',        emoji: '💫', cat: 'Brain',   locked: true },
  { id: 'xp-500',         title: 'Math Master',      desc: 'Reach 500 Experience Points',        emoji: '🏆', cat: 'Math',    locked: true },
  { id: 'stars-10',       title: 'Star Collector',   desc: 'Collect 10 stars in games',        emoji: '⭐', cat: 'Brain',   locked: true },
  { id: 'coins-100',      title: 'Coin Champion',    desc: 'Amass 100 gold coins',             emoji: '🪙', cat: 'Brain',   locked: true },
  { id: 'numeracy-pro',   title: 'Numeracy Pro',     desc: 'Get 200 XP in Math World',          emoji: '🔢', cat: 'Math',    locked: true },

  // existing hardcoded badges for other domains
  { id: 'literacy-star',  title: 'Literacy Star',    desc: 'Complete 5 reading activities',   emoji: '📚', cat: 'Literacy', locked: true },
  { id: 'creative-mind',  title: 'Creative Mind',    desc: 'Finish 5 creative projects',      emoji: '🎨', cat: 'Creative', locked: true },
  { id: 'emotion-exp',    title: 'Emotion Explorer', desc: 'Complete emotional learning path', emoji: '💖', cat: 'Emotion', locked: true },
  { id: 'science-whiz',   title: 'Science Whiz',     desc: 'Do 5 science experiments',        emoji: '🔬', cat: 'Science', locked: true },
  { id: 'puzzle-master',  title: 'Puzzle Master',    desc: 'Solve 20 puzzles',                emoji: '🧩', cat: 'Brain',   locked: true },
  { id: 'bookworm',       title: 'Bookworm',         desc: 'Read 10 stories',                 emoji: '📖', cat: 'Literacy', locked: true },
  { id: 'music-maker',    title: 'Music Maker',      desc: 'Complete all music activities',   emoji: '🎵', cat: 'Creative', locked: true },
];

export default function Awards() {
  const { user } = useUser();
  const [activeCategory, setActiveCategory] = useState('All');
  const [unlockedIds, setUnlockedIds] = useState([]);

  useEffect(() => {
    if (user) {
      getUnlockedAchievements(user.uid).then((ids) => {
        setUnlockedIds(ids || []);
      });
    }
  }, [user]);

  // Dynamically map trophy locking
  const trophies = TROPHY_SHELF.map((t) => {
    let unlocked = false;
    if (t.id === 'first-steps') unlocked = unlockedIds.includes('first-game');
    if (t.id === 'rising-star') unlocked = unlockedIds.includes('xp-100');
    if (t.id === 'rocket-learner') unlocked = unlockedIds.includes('stars-10');
    if (t.id === 'knowledge-king') unlocked = unlockedIds.includes('xp-500');
    return { ...t, locked: !unlocked };
  });

  // Dynamically map badge locking
  const badges = BADGES.map((b) => {
    const isUnlocked = unlockedIds.includes(b.id);
    return { ...b, locked: !isUnlocked };
  });

  const filtered = activeCategory === 'All'
    ? badges
    : badges.filter((b) => b.cat === activeCategory);

  const totalUnlocked = badges.filter((b) => !b.locked).length;
  const percentage = Math.min(100, Math.round((totalUnlocked / badges.length) * 100));

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Achievements 🏆
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {totalUnlocked}/{badges.length} badges unlocked
        </p>
        <div className="mt-3 max-w-xs mx-auto">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, #F5A623, #E91E8C)' }} />
          </div>
        </div>
      </motion.div>

      {/* Trophy Shelf */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 mb-6"
      >
        <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Trophy Shelf ✨
        </h2>
        <div className="relative">
          {/* Shelf line */}
          <div
            className="absolute bottom-8 left-0 right-0 h-1 rounded-full"
            style={{ background: 'var(--border-default)' }}
          />
          <div className="flex justify-around pb-2">
            {trophies.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="text-5xl"
                  style={{ opacity: t.locked ? 0.3 : 1, filter: t.locked ? 'grayscale(1)' : 'none' }}
                >
                  {t.emoji}
                </div>
                {t.locked && (
                  <div className="text-base -mt-2">🔒</div>
                )}
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--text-muted)' }}>
                  {t.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveCategory(cat)}
            className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat === 'All' && '⭐ '}{cat}
          </motion.button>
        ))}
      </div>

      {/* Badge Grid */}
      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((badge, i) => (
            <motion.div
              key={badge.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
              className="card p-4 flex flex-col items-center text-center gap-2"
              style={{ opacity: badge.locked ? 0.6 : 1 }}
            >
              <div className="relative">
                <div
                  className="text-4xl"
                  style={{ filter: badge.locked ? 'grayscale(0.8)' : 'none' }}
                >
                  {badge.emoji}
                </div>
                {badge.locked && (
                  <div className="absolute -bottom-1 -right-1 text-sm">🔒</div>
                )}
              </div>
              <h4 className="font-bold text-xs leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {badge.title}
              </h4>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{badge.desc}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
