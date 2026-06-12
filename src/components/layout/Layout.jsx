import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Mascot from './Mascot';
import { useUser } from '../../context/UserContext';

/**
 * App shell matching Pratiush's layout:
 * - Bottom navbar on mobile, left sidebar on desktop
 * - main-content shifts right on desktop
 * - Floating mascot
 */
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { newAchievements, clearNewAchievements } = useUser();
  const showNavbar = true; // Always show nav (no onboarding flow in this module)

  return (
    <>
      {/* Sidebar / Navbar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Main content area */}
      <div className={`main-content ${showNavbar ? 'has-navbar' : ''}`}>
        <main style={{ minHeight: '100dvh', paddingBottom: '140px' }}>
          <Outlet />
        </main>
      </div>

      {/* Floating mascot */}
      {showNavbar && <Mascot />}

      {/* Achievement Unlock Toasts */}
      {newAchievements.length > 0 && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 500,
          display: 'flex', flexDirection: 'column', gap: '12px',
          pointerEvents: 'none'
        }}>
          {newAchievements.map((ach, i) => (
            <div
              key={ach.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #7C4DFF, #E91E8C)',
                color: 'white',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                minWidth: 220,
                animation: 'bounce-in 0.5s var(--ease-spring)',
                animationDelay: `${i * 0.15}s`,
              }}
              onAnimationEnd={() => setTimeout(clearNewAchievements, 4000)}
            >
              <span style={{ fontSize: '1.8rem' }}>{ach.emoji}</span>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🏅 Achievement Unlocked!
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {ach.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
