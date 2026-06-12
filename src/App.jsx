import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/layout/Layout';

/* Pages */
import Home from './pages/Home';
import Adventure from './pages/Adventure';
import Awards from './pages/Awards';
import AvatarPage from './pages/AvatarPage';
import Settings from './pages/Settings';
import MathWorld from './pages/MathWorld';
import PuzzleWorld from './pages/PuzzleWorld';
import NumberAdventure from './pages/NumberAdventure';
import LogicIsland from './pages/LogicIsland';
import AdminPanel from './pages/AdminPanel';
import { useUser } from './context/UserContext';
import { getUserRole } from './firebase/services';
import { useEffect, useState } from 'react';

/**
 * Protects the /admin route — only accessible if the user has role === 'admin'
 * in the user_accounts collection (managed by Gyanendra's auth module).
 * When his login page merges, it will redirect admins here directly.
 */
function AdminRoute() {
  const { user } = useUser();
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => {
        setChecking(false);
      });
      return;
    }
    getUserRole(user.uid).then(r => { setRole(r); setChecking(false); });
  }, [user]);

  if (checking) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--text-muted)' }}>Checking permissions…</p>
    </div>
  );

  if (role !== 'admin') return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <span className="text-6xl">🔒</span>
      <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        Admin Access Only
      </h2>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        This page is accessible to administrators only via the login portal.
      </p>
    </div>
  );

  return <AdminPanel />;
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              {/* Primary nav pages */}
              <Route index               element={<Home />} />
              <Route path="adventure"    element={<Adventure />} />
              <Route path="awards"       element={<Awards />} />
              <Route path="avatar"       element={<AvatarPage />} />
              <Route path="settings"     element={<Settings />} />

              {/* Game world pages */}
              <Route path="math-world"        element={<MathWorld />} />
              <Route path="puzzle-world"      element={<PuzzleWorld />} />
              <Route path="number-adventure"  element={<NumberAdventure />} />
              <Route path="logic-island"      element={<LogicIsland />} />
              {/* Admin panel — role-guarded, navigated to via login page */}
              <Route path="admin" element={<AdminRoute />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}
