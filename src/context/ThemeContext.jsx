import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'spacece_theme';
const SEASON_KEY = 'spacece_season';

/**
 * Manages light/dark mode and seasonal themes.
 * Uses data-theme attribute on <html> to match Pratiush's design system.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'light'; } catch { return 'light'; }
  });
  const [season, setSeasonState] = useState(() => {
    try { return localStorage.getItem(SEASON_KEY) || 'none'; } catch { return 'none'; }
  });

  // Resolve effective theme from system preference
  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const effectiveTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  const isDark = effectiveTheme === 'dark';

  // Apply to <html> via data-theme attribute (matches Pratiush's approach)
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
    try { localStorage.setItem(THEME_KEY, t); } catch (err) { console.warn('LocalStorage error:', err); }
  }, []);

  const setSeason = useCallback((s) => {
    setSeasonState(s);
    try { localStorage.setItem(SEASON_KEY, s); } catch (err) { console.warn('LocalStorage error:', err); }
  }, []);

  // Backward-compatible API
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const setMode = (mode) => setTheme(mode);
  const setSeasonalTheme = (theme) => setSeason(theme);

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, effectiveTheme, season, setSeason,
      isDark, themeMode: theme, seasonal: season,
      toggleTheme, setMode, setSeasonalTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
