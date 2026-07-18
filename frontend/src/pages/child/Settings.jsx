import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { updateUserProfile, logout } from '../../api/services';
import { getTranslation } from '../../utils/translations';
import './Settings.css';

const LANGUAGES = [
  { code: 'EN', label: 'English', emoji: '🇬🇧' },
  { code: 'हि', label: 'हिंदी',   emoji: '🇮🇳' },
  { code: 'मर', label: 'मराठी',   emoji: '🇮🇳' },
];

const MASCOTS = [
  { id: '🦁', label: 'Leo the Lion', icon: '🦁' },
  { id: '🐼', label: 'Penny Panda', icon: '🐼' },
  { id: '🦊', label: 'Felix Fox', icon: '🦊' },
  { id: '🚀', label: 'Rocky Rocket', icon: '🚀' },
  { id: '🏠', label: 'SpacECE', icon: '🏠' },
];

export default function Settings() {
  const { themeMode, setMode, seasonal, setSeasonalTheme } = useTheme();
  const { user, profile, setProfile, markLoggedOut } = useUser();
  const currentLang = profile?.language || localStorage.getItem('spaceece_language') || 'English';
  
  // Custom Settings States
  const [language, setLanguage] = useState('English');
  const [selectedMascot, setSelectedMascot] = useState('🦁');
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('Medium');
  
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load initial values
    if (profile?.language) {
      setLanguage(profile.language);
    }
    setSelectedMascot(localStorage.getItem('spaceece_mascot') || '🦁');
    setSfxEnabled(localStorage.getItem('spaceece_sfx_enabled') !== 'false');
    setBgmEnabled(localStorage.getItem('spaceece_bgm_enabled') !== 'false');
    setDifficulty(localStorage.getItem('spaceece_difficulty') || 'Medium');
  }, [profile?.language]);

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      markLoggedOut();
      await logout();
      window.location.href = '/';
    } catch (e) {
      console.error('Logout failed:', e);
      setSigningOut(false);
    }
  };

  const handleMascotSelect = (mascotId) => {
    setSelectedMascot(mascotId);
    localStorage.setItem('spaceece_mascot', mascotId);
    // Notify the Mascot component overlay immediately
    window.dispatchEvent(new Event('spaceece_mascot_updated'));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    
    // Save to local storage
    localStorage.setItem('spaceece_language', language);
    localStorage.setItem('spaceece_sfx_enabled', String(sfxEnabled));
    localStorage.setItem('spaceece_bgm_enabled', String(bgmEnabled));
    localStorage.setItem('spaceece_difficulty', difficulty);
    
    if (setProfile) {
      setProfile(prev => prev ? { ...prev, language } : { language });
    }
    
    try {
      await updateUserProfile(user.uid, { language });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.warn('Failed to update language in database:', e);
    }
    setSaving(false);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="settings-title"
        >
          {getTranslation('Settings', currentLang)} ⚙️
        </motion.h1>
      </div>

      {/* ─── Language ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="settings-section"
      >
        <h2 className="section-title">
          <span>🗣️</span> {getTranslation('Select Language', currentLang)}
        </h2>
        <div className="choice-grid">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.label}
              onClick={() => setLanguage(lang.label)}
              className={`choice-btn ${language === lang.label ? 'active' : ''}`}
            >
              <span className="choice-icon">{lang.emoji}</span>
              <span className="choice-label">{lang.label} ({lang.code})</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* ─── Choose Mascot ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="settings-section"
      >
        <h2 className="section-title">
          <span>🦁</span> {getTranslation('Companion Mascot', currentLang)}
        </h2>
        <div className="choice-grid">
          {MASCOTS.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMascotSelect(m.id)}
              className={`choice-btn ${selectedMascot === m.id ? 'active' : ''}`}
            >
              <span className="choice-icon">{m.icon}</span>
              <span className="choice-label">{getTranslation(m.label, currentLang)}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* ─── Theme ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="settings-section"
      >
        <h2 className="section-title">
          <span>🎨</span> {getTranslation('Portal Theme', currentLang)}
        </h2>
        <div className="choice-grid">
          {[
            { id: 'light', label: 'Light Mode', icon: '☀️' },
            { id: 'dark', label: 'Dark Mode', icon: '🌙' },
            { id: 'system', label: 'System Theme', icon: '💻' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setMode(mode.id)}
              className={`choice-btn ${themeMode === mode.id ? 'active' : ''}`}
            >
              <span className="choice-icon">{mode.icon}</span>
              <span className="choice-label">{getTranslation(mode.label, currentLang)}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* ─── Difficulty Level ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="settings-section"
      >
        <h2 className="section-title">
          <span>🎯</span> {getTranslation('Learning Challenge Level', currentLang)}
        </h2>
        <div className="choice-grid">
          {[
            { id: 'Easy', label: 'Easy Mode', icon: '🟢' },
            { id: 'Medium', label: 'Medium Mode', icon: '🟡' },
            { id: 'Hard', label: 'Hard Mode', icon: '🔴' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setDifficulty(lvl.id)}
              className={`choice-btn ${difficulty === lvl.id ? 'active' : ''}`}
            >
              <span className="choice-icon">{lvl.icon}</span>
              <span className="choice-label">{getTranslation(lvl.label, currentLang)}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* ─── Sounds and Music ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="settings-section"
      >
        <h2 className="section-title">
          <span>🔊</span> {getTranslation('Audio & Sound Settings', currentLang)}
        </h2>
        <div className="settings-row">
          <span className="settings-row-label">🔊 {getTranslation('Game Sound Effects', currentLang)}</span>
          <button
            onClick={() => setSfxEnabled(!sfxEnabled)}
            className={`toggle-switch ${sfxEnabled ? 'active' : ''}`}
          >
            <div className="toggle-knob" />
          </button>
        </div>
        <div className="settings-row">
          <span className="settings-row-label">🎵 {getTranslation('Ambient Background Music', currentLang)}</span>
          <button
            onClick={() => setBgmEnabled(!bgmEnabled)}
            className={`toggle-switch ${bgmEnabled ? 'active' : ''}`}
          >
            <div className="toggle-knob" />
          </button>
        </div>
      </motion.section>

      {/* ─── Seasonal Theme ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="settings-section"
      >
        <h2 className="section-title">
          <span>✨</span> {getTranslation('Festive Season Decor', currentLang)}
        </h2>
        <div className="choice-grid">
          {[
            { id: 'none', label: 'None', icon: '❌' },
            { id: 'diwali', label: 'Diwali Sparkle', icon: '🪔' },
            { id: 'holi', label: 'Holi Colors', icon: '🎨' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSeasonalTheme(theme.id)}
              className={`choice-btn ${seasonal === theme.id ? 'active' : ''}`}
            >
              <span className="choice-icon">{theme.icon}</span>
              <span className="choice-label">{getTranslation(theme.label, currentLang)}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* ─── Account Actions ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="settings-section"
      >
        <h2 className="section-title">
          <span>👤</span> {getTranslation('Account Actions', currentLang)}
        </h2>
        <p className="settings-row-label" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
          {user?.isAnonymous
            ? getTranslation('Logged in as guest child profile', currentLang)
            : `${getTranslation('Parent Account', currentLang)}: ${user?.email ?? ''}`}
        </p>

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#E8F5E9',
              color: '#2E7D32',
              fontWeight: 800,
              padding: '12px',
              borderRadius: '12px',
              margin: '0 auto 16px',
              textAlign: 'center',
              fontSize: '0.9rem',
              border: '2px solid #A5D6A7',
              width: '100%',
              maxWidth: '380px'
            }}
          >
            🎉 {getTranslation('Settings Saved Successfully!', currentLang)}
          </motion.div>
        )}

        <div className="settings-footer">
          <button
            onClick={handleSave}
            disabled={saving}
            className="settings-btn-save"
          >
            <span>{saving ? `⏳ ${getTranslation('Saving...', currentLang)}` : `💾 ${getTranslation('Save Settings', currentLang)}`}</span>
          </button>
          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="settings-btn-logout"
          >
            <span>{signingOut ? `🚪 ${getTranslation('Leaving...', currentLang)}` : `🚪 ${getTranslation('Sign Out', currentLang)}`}</span>
          </button>
        </div>
      </motion.section>
    </div>
  );
}
