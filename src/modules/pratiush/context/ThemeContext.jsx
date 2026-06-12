import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'spacece_theme';
const SEASON_KEY = 'spacece_season';

export function ThemeProvider({ children }) {
  // Force light mode and clear any old dark mode preference
  const [theme, setThemeState] = useState(() => {
    try { 
      localStorage.removeItem(THEME_KEY); // Clear old preference
      return 'light'; 
    } catch { 
      return 'light'; 
    }
  });
  const [season, setSeasonState] = useState(() => {
    try { return localStorage.getItem(SEASON_KEY) || 'none'; } catch { return 'none'; }
  });

  // Resolve effective theme (light/dark) from system preference
  const [systemDark, setSystemDark] = useState(false); // Force false

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(false); // Always return false
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const effectiveTheme = 'light'; // Always light mode

  // Apply to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    if (season && season !== 'none') {
      document.documentElement.setAttribute('data-season', season);
    } else {
      document.documentElement.removeAttribute('data-season');
    }
  }, [season]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    try { localStorage.setItem(THEME_KEY, t); } catch {}
  }, []);

  const setSeason = useCallback((s) => {
    setSeasonState(s);
    try { localStorage.setItem(SEASON_KEY, s); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme, season, setSeason }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
