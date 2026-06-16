import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { updateUserProfile } from '../../firebase/services';
import { logout } from '../../firebase/services';

const LANGUAGES = [
  { code: 'GB', label: 'English', script: 'EN' },
  { code: 'IN', label: 'हिन्दी',  script: 'हि' },
  { code: 'IN', label: 'मराठी',   script: 'मर' },
];

export default function Settings() {
  const { themeMode, setMode, seasonal, setSeasonalTheme } = useTheme();
  const { user, refreshProfile, markLoggedOut } = useUser();
  const [language, setLanguage] = useState('English');
  const [showMascot, setShowMascot] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      markLoggedOut();       // stop auto-anonymous-login BEFORE signOut fires
      await logout();
      // Reload page to fully reset app state
      window.location.href = '/';
    } catch (e) {
      console.error('Logout failed:', e);
      setSigningOut(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await updateUserProfile(user.uid, { language });
    await refreshProfile();
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        Settings ⚙️
      </motion.h1>

      {/* ─── Language ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 mb-5"
      >
        <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Language
        </h2>
        <div className="flex gap-3 flex-wrap">
          {LANGUAGES.map((lang) => (
            <motion.button
              key={lang.label}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setLanguage(lang.label)}
              className={`flex flex-col items-center gap-1 px-5 py-4 rounded-2xl border-2 transition-all ${
                language === lang.label
                  ? 'border-[#E91E8C] bg-[#E91E8C10]'
                  : 'border-[var(--border-default)] bg-[var(--bg-card)]'
              }`}
              style={{ minWidth: 90 }}
            >
              <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{lang.code}</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{lang.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ─── Theme ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-6 mb-5"
      >
        <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Theme
        </h2>
        <div className="flex gap-3">
          {['light', 'dark', 'system'].map((mode) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setMode(mode)}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm capitalize transition-all ${
                themeMode === mode
                  ? 'bg-[#E91E8C] text-white shadow-lg'
                  : 'border-2 border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--bg-card)]'
              }`}
            >
              {mode === 'light' ? '☀️ Light' : mode === 'dark' ? '🌙 Dark' : '💻 System'}
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ─── Seasonal Theme ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 mb-5"
      >
        <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Seasonal Theme
        </h2>
        <div className="flex gap-3">
          {[
            { id: 'none',   label: 'None',      gradient: 'border-2 border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)]' },
            { id: 'diwali', label: '🪔 Diwali', gradient: 'bg-gradient-to-r from-[#FF6B00] to-[#FFD700] text-white' },
            { id: 'holi',   label: '🎨 Holi',   gradient: 'bg-gradient-to-r from-[#E91E8C] to-[#00BCD4] text-white' },
          ].map((theme) => (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSeasonalTheme(theme.id)}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${theme.gradient} ${
                seasonal === theme.id ? 'ring-2 ring-offset-2 ring-[#E91E8C]' : ''
              }`}
            >
              {theme.label}
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ─── Mascot Companion ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card p-6 mb-5"
      >
        <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Mascot Companion
        </h2>
        <div className="flex items-center justify-between">
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Show mascot</span>
          <button
            onClick={() => setShowMascot((v) => !v)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${showMascot ? 'bg-[#E91E8C]' : 'bg-[var(--border-default)]'}`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${showMascot ? 'left-7' : 'left-0.5'}`}
            />
          </button>
        </div>
      </motion.section>

      {/* ─── Account ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6 mb-5"
      >
        <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Account
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {user?.isAnonymous ? '(Anonymous user)' : user?.email ?? 'Not logged in'}
        </p>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-orange text-sm"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            disabled={signingOut}
            className="btn-outline text-sm"
          >
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
