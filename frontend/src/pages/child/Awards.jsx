import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { getUnlockedAchievements } from '../../api/services';
import { getTranslation } from '../../utils/translations';
import './Awards.css';

const CATEGORIES = ['All', 'Literacy', 'Math', 'Creative', 'Emotion', 'Brain', 'Science'];

const TROPHY_SHELF = [
  { id: 'first-steps',    label: 'First Steps',    emoji: '🏆', locked: true, color: '#FFD700' },
  { id: 'rising-star',    label: 'Rising Star',    emoji: '⭐', locked: true, color: '#FF7F50' },
  { id: 'rocket-learner', label: 'Rocket Learner', emoji: '🚀', locked: true, color: '#40E0D0' },
  { id: 'knowledge-king', label: 'Knowledge King', emoji: '👑', locked: true, color: '#DA70D6' },
];

const BADGES = [
  { id: 'first-game',     title: 'First Game!',      desc: 'Play your first learning game',    emoji: '🎮', cat: 'Brain',   locked: true, color: '#FF8A80' },
  { id: 'streak-3',       title: '3-Day Streak',     desc: 'Log in 3 days in a row',           emoji: '🔥', cat: 'Emotion', locked: true, color: '#FFD180' },
  { id: 'streak-7',       title: 'Week Warrior',     desc: 'Log in 7 days in a row',           emoji: '⚡', cat: 'Emotion', locked: true, color: '#80D8FF' },
  { id: 'xp-100',         title: 'XP Hunter',        desc: 'Earn 100 Experience Points',        emoji: '💫', cat: 'Brain',   locked: true, color: '#B9F6CA' },
  { id: 'xp-500',         title: 'Math Master',      desc: 'Reach 500 Experience Points',        emoji: '🏆', cat: 'Math',    locked: true, color: '#FFE082' },
  { id: 'stars-10',       title: 'Star Collector',   desc: 'Collect 10 stars in games',        emoji: '⭐', cat: 'Brain',   locked: true, color: '#A7FFEB' },
  { id: 'coins-100',      title: 'Coin Champion',    desc: 'Amass 100 gold coins',             emoji: '🪙', cat: 'Brain',   locked: true, color: '#FFD180' },
  { id: 'numeracy-pro',   title: 'Numeracy Pro',     desc: 'Get 200 XP in Math World',          emoji: '🔢', cat: 'Math',    locked: true, color: '#EA80FC' },
  { id: 'literacy-star',  title: 'Literacy Star',    desc: 'Complete 5 reading activities',   emoji: '📚', cat: 'Literacy', locked: true, color: '#CCFF90' },
  { id: 'creative-mind',  title: 'Creative Mind',    desc: 'Finish 5 creative projects',      emoji: '🎨', cat: 'Creative', locked: true, color: '#FF8A80' },
  { id: 'emotion-exp',    title: 'Emotion Explorer', desc: 'Complete emotional learning path', emoji: '💖', cat: 'Emotion', locked: true, color: '#FF80AB' },
  { id: 'science-whiz',   title: 'Science Whiz',     desc: 'Do 5 science experiments',        emoji: '🔬', cat: 'Science', locked: true, color: '#A7FFEB' },
  { id: 'puzzle-master',  title: 'Puzzle Master',    desc: 'Solve 20 puzzles',                emoji: '🧩', cat: 'Brain',   locked: true, color: '#CFD8DC' },
  { id: 'bookworm',       title: 'Bookworm',         desc: 'Read 10 stories',                 emoji: '📖', cat: 'Literacy', locked: true, color: '#FFD180' },
  { id: 'music-maker',    title: 'Music Maker',      desc: 'Complete all music activities',   emoji: '🎵', cat: 'Creative', locked: true, color: '#B9F6CA' },
];

export default function Awards() {
  const { user, profile } = useUser();
  const currentLang = profile?.language || localStorage.getItem('spaceece_language') || 'English';
  const [activeCategory, setActiveCategory] = useState('All');
  const [unlockedIds, setUnlockedIds] = useState([]);

  useEffect(() => {
    if (user) {
      getUnlockedAchievements(user.uid).then((result) => {
        const ids = Array.isArray(result?.data)
          ? result.data.map((item) => item?.id).filter(Boolean)
          : [];
        setUnlockedIds(ids);
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
    <div className="awards-container">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="awards-header"
      >
        <h1 className="awards-title">
          {getTranslation('My Awards', currentLang)} 🏆
        </h1>
        <p className="awards-subtitle">
          {getTranslation('Play games, read stories and complete challenges to unlock badges!', currentLang)}
        </p>
        
        <div className="awards-progress-box">
          <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-text-secondary)' }}>
            🎉 {totalUnlocked} {getTranslation('of', currentLang)} {badges.length} {getTranslation('Badges Unlocked', currentLang)} ({percentage}%)
          </span>
          <div className="progress-track-large">
            <div 
              className="progress-fill-large" 
              style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, #FF6B00, #E91E8C)' }} 
            />
          </div>
        </div>
      </motion.div>

      {/* 3D Wooden Shelf for Trophies */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="trophy-section"
      >
        <h2 className="section-title">
          <span>✨</span> {getTranslation('My Trophy Shelf', currentLang)}
        </h2>
        <div className="shelf-wrapper">
          <div className="trophy-grid">
            {trophies.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className={`trophy-item ${t.locked ? 'locked' : ''}`}
              >
                <div className="trophy-icon-container">
                  {t.emoji}
                  {t.locked && (
                    <div className="trophy-lock-sticker">🔒</div>
                  )}
                </div>
                <span className="trophy-label">
                  {getTranslation(t.label, currentLang)}
                </span>
              </motion.div>
            ))}
          </div>
          {/* Wood Shelf Line */}
          <div className="wood-shelf" />
        </div>
      </motion.section>

      {/* Category Filters */}
      <div className="category-scroller">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`award-filter-btn ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat === 'All' ? '⭐ ' + getTranslation('All Badges', currentLang) : getTranslation(cat, currentLang)}
          </button>
        ))}
      </div>

      {/* Badge Grid with Large Readable Texts */}
      <motion.div layout className="badges-grid">
        <AnimatePresence mode="popLayout">
          {filtered.map((badge, i) => (
            <motion.div
              key={badge.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.02, type: 'spring', stiffness: 300, damping: 25 }}
              className={`badge-card ${badge.locked ? 'locked' : 'unlocked'}`}
            >
              {!badge.locked && <span className="unlocked-sticker-sparkle">✨</span>}
              
              <div className="badge-icon-box">
                {badge.emoji}
                {badge.locked && (
                  <div className="badge-lock-overlay">🔒</div>
                )}
              </div>

              <h4 className="badge-card-title">
                {getTranslation(badge.title, currentLang)}
              </h4>
              <p className="badge-card-desc">
                {getTranslation(badge.desc, currentLang)}
              </p>

              <span 
                className="badge-card-category-tag" 
                style={{ 
                  color: badge.locked ? 'var(--color-text-muted)' : badge.color, 
                  background: badge.locked ? 'var(--color-border)' : `${badge.color}15` 
                }}
              >
                {getTranslation(badge.cat, currentLang)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
