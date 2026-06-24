/**
 * SpacECE Design System — Color Tokens
 * Matches the reference UI with warm cream background, orange primary,
 * pink/purple accents, and clean sidebar layout.
 */

export const colors = {
  /* ─── Brand ─── */
  brand: {
    orange: '#F5A623',
    orangeLight: '#FFD180',
    orangeDark: '#E08E00',
    pink: '#E91E8C',
    pinkLight: '#FF6BB5',
    purple: '#7C4DFF',
    purpleLight: '#B39DFF',
  },

  /* ─── Light Mode ─── */
  light: {
    bg: {
      page: '#FDF6EE',       // warm cream — main page bg
      sidebar: '#FFFFFF',    // white sidebar
      card: '#FFFFFF',       // white cards
      cardHover: '#FFF8EC',  // warm card hover
      accent: '#FFF3E0',     // warm accent sections
      input: '#F5F5F5',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#5A5A5A',
      muted: '#9E9E9E',
      accent: '#F5A623',
      onDark: '#FFFFFF',
    },
    border: {
      default: '#EDE8E0',
      focus: '#F5A623',
      card: '#F0EBE0',
    },
    nav: {
      active: '#FFF3E0',
      activeBorder: '#F5A623',
      icon: '#8C8C8C',
      iconActive: '#1A1A1A',
    },
    streak: '#FF6B35',
    stars: '#F5A623',
    badges: '#C0872A',
    xp: '#E91E8C',
  },

  /* ─── Dark Mode ─── */
  dark: {
    bg: {
      page: '#1A1A2E',
      sidebar: '#16213E',
      card: '#1E2A3A',
      cardHover: '#243447',
      accent: '#243447',
      input: '#243447',
    },
    text: {
      primary: '#E8E8E8',
      secondary: '#A0A0B0',
      muted: '#6B6B7B',
      accent: '#FFD180',
      onDark: '#FFFFFF',
    },
    border: {
      default: 'rgba(255,255,255,0.08)',
      focus: '#F5A623',
      card: 'rgba(255,255,255,0.06)',
    },
    nav: {
      active: 'rgba(245,166,35,0.15)',
      activeBorder: '#F5A623',
      icon: '#6B6B7B',
      iconActive: '#E8E8E8',
    },
  },

  /* ─── Seasonal Themes ─── */
  seasonal: {
    diwali: {
      primary: '#FF6B00',
      secondary: '#FFD700',
      accent: '#FF3D00',
      bg: 'linear-gradient(135deg, #1a0a00, #3d1a00)',
      card: '#2D1500',
    },
    holi: {
      primary: '#E91E8C',
      secondary: '#00BCD4',
      accent: '#76FF03',
      bg: 'linear-gradient(135deg, #ff9a9e, #a1c4fd)',
      card: '#FFFFFF',
    },
  },

  /* ─── Game Gradients ─── */
  gradients: {
    mathWorld:    'linear-gradient(135deg, #FF9A56, #F5A623, #FFCC02)',
    puzzleWorld:  'linear-gradient(135deg, #2EC4B6, #4FC3F7)',
    numberAdv:    'linear-gradient(135deg, #7C4DFF, #FF6B9D)',
    logicIsland:  'linear-gradient(135deg, #FF6B9D, #F5A623, #FFD180)',
    warm:         'linear-gradient(135deg, #FF9A56, #F5A623, #FFCC02)',
    cool:         'linear-gradient(135deg, #2EC4B6, #4FC3F7)',
    cosmic:       'linear-gradient(135deg, #7C4DFF, #FF6B9D)',
    sunset:       'linear-gradient(135deg, #FF6B9D, #F5A623, #FFD180)',
    nature:       'linear-gradient(135deg, #66BB6A, #2EC4B6)',
    orange:       'linear-gradient(135deg, #F5A623, #FF6B9D)',
    diwali:       'linear-gradient(135deg, #FF6B00, #FFD700)',
    holi:         'linear-gradient(135deg, #E91E8C, #00BCD4)',
  },

  /* ─── Status ─── */
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  /* ─── Coins/XP ─── */
  coin: '#F5A623',
  xp: '#E91E8C',
};

export default colors;
