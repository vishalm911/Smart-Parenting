import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { HiOutlineBars3, HiOutlineChevronLeft } from 'react-icons/hi2';

const PAGE_TITLES = {
  '/':             null,          // home shows greeting, not title
  '/adventure':    'Adventure Island',
  '/awards':       'Achievements',
  '/avatar':       'Create Your Avatar',
  '/settings':     'Settings',
  '/math-world':   'Math World',
  '/puzzle-world':  'Puzzle World',
  '/number-adventure': 'Number Adventure',
  '/logic-island': 'Logic Island',
};

/**
 * Top header bar:
 * - Left: hamburger (mobile) or back button on sub-pages
 * - Right: Stat chips (Day Streak / Stars / Badges / XP) + Avatar
 * Matches reference design exactly.
 */
export default function Header({ onMenuToggle }) {
  const { profile } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const pageTitle = PAGE_TITLES[location.pathname];

  const stats = [
    { icon: '🔥', value: profile?.dayStreak ?? 15,  label: 'DAY STREAK', color: '#FF6B35' },
    { icon: '⭐', value: profile?.stars ?? 120,     label: 'STARS',      color: '#F5A623' },
    { icon: '🏆', value: profile?.badges ?? 5,      label: 'BADGES',     color: '#C0872A' },
    { icon: '⚡', value: profile?.xp ?? 850,        label: 'XP',         color: '#E91E8C' },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between border-b"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-default)',
        boxShadow: '0 1px 0 var(--border-default)',
      }}
    >
      {/* ─── Left ─── */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl"
          style={{ background: 'var(--bg-accent)' }}
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <HiOutlineBars3 size={22} style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* Back button on sub-pages */}
        {!isHome && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="hidden md:flex p-2 rounded-xl"
            style={{ background: 'var(--bg-accent)' }}
            aria-label="Go back"
          >
            <HiOutlineChevronLeft size={20} style={{ color: 'var(--text-primary)' }} />
          </motion.button>
        )}

        {/* Sub-page title */}
        {pageTitle && (
          <h2 className="hidden sm:block font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {pageTitle}
          </h2>
        )}
      </div>

      {/* ─── Right: Stats + Avatar ─── */}
      <div className="flex items-center gap-2">
        {/* Stat chips */}
        {stats.map((s) => (
          <div key={s.label} className="stat-chip hidden sm:flex">
            <span className="text-xl">{s.icon}</span>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}

        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white cursor-pointer ml-2"
          style={{ background: 'linear-gradient(135deg, #F5A623, #FF6B9D)' }}
          onClick={() => navigate('/avatar')}
          title="My Avatar"
        >
          {profile?.name?.[0]?.toUpperCase() ?? 'A'}
        </motion.div>
      </div>
    </motion.header>
  );
}
