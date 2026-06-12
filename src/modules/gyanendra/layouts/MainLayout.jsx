import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';
import Breadcrumb from '../components/shared/Breadcrumb';

/* Subtle floating decorations — match reference style */
const FloatingStars = () => (
  <>
    {[
      { emoji: '⭐', top: '8%',  right: '4%',  size: '1.1rem', delay: '0s',   dur: '4s'   },
      { emoji: '✨', top: '25%', right: '2%',  size: '0.85rem',delay: '1.5s', dur: '3.5s' },
      { emoji: '🌟', top: '55%', right: '3%',  size: '0.95rem',delay: '0.8s', dur: '5s'   },
      { emoji: '💫', top: '78%', right: '5%',  size: '0.8rem', delay: '2.2s', dur: '3.8s' },
    ].map((star, i) => (
      <Box key={i} sx={{
        position: 'fixed',
        fontSize: star.size,
        top: star.top, right: star.right,
        animation: `twinkle ${star.dur} ease-in-out infinite`,
        animationDelay: star.delay,
        zIndex: 0, pointerEvents: 'none',
        opacity: 0.5,
      }}>
        {star.emoji}
      </Box>
    ))}
  </>
);

/**
 * MainLayout — Authenticated pages layout
 * Background: warm cream (matches reference screenshots)
 */
const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: '#FFF9F0',
      position: 'relative',
    }}>
      <FloatingStars />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Toolbar />

        {/* Breadcrumb trail — sits above page content, below the fixed AppBar */}
        <Breadcrumb />

        <Box sx={{
          flex: 1,
          p: { xs: 2, sm: 3, md: 3.5 },
          pb: isMobile ? 10 : 4,
          animation: 'fadeIn 0.4s ease-out',
        }}>
          <Outlet />
        </Box>
      </Box>

      {isMobile && <BottomNav />}
    </Box>
  );
};

export default MainLayout;
