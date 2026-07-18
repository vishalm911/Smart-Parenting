import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { getTranslation } from '../../utils/translations';

const NAV_ITEMS = [
  { path: '/child/dashboard',       label: 'Home',       emoji: '🏠' },
  { path: '/child/reading-world',   label: 'Reading',    emoji: '📖' },
  { path: '/child/vocabulary-zone', label: 'Vocabulary', emoji: '🔤' },
  { path: '/child/explore',         label: 'Explore',    emoji: '🗺️' },
  { path: '/child/awards',          label: 'Awards',     emoji: '🏆' },
];

export default function BottomNav() {
  const { isDark } = useTheme();
  const { profile } = useUser();
  const location = useLocation();
  const currentLang = profile?.language || localStorage.getItem('spaceece_language') || 'English';

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl lg:hidden ${
      isDark ? 'bg-[#1A1A2E]/95 border-white/8' : 'bg-white/95 border-[#F0E8DA]'
    }`}>
      <div className="flex items-center justify-around py-2 px-1 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ path, label, emoji }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink key={path} to={path} className="flex flex-col items-center gap-0.5 relative min-w-[56px]">
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                className={`relative p-2 rounded-2xl transition-all duration-300 ${
                  isActive ? (isDark ? 'bg-[#7C4DFF]/20' : 'bg-[#FFF8EC]') : 'bg-transparent'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F5A623]/20 to-[#FF6B9D]/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="text-xl relative z-10">{emoji}</span>
              </motion.div>
              <span className={`text-[10px] font-semibold transition-colors ${
                isActive
                  ? (isDark ? 'text-[#FFD180]' : 'text-[#F5A623]')
                  : (isDark ? 'text-[#A0A0B0]' : 'text-[#6B6B6B]')
              }`}>
                {getTranslation(label, currentLang)}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}