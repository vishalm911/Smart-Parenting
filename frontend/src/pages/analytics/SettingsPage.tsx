import React, { useState } from 'react';
import { Settings, Globe, Sun, Sparkles, UserCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const [lang, setLang] = useState<string>(localStorage.getItem('edu_lang') || 'en');
  const { theme, setTheme, season, setSeason } = useTheme();
  const [showMascot, setShowMascot] = useState<boolean>(localStorage.getItem('edu_mascot') !== 'false');

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('edu_lang', newLang);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleSeasonChange = (newSeason: string) => {
    setSeason(newSeason);
  };

  const handleMascotToggle = (val: boolean) => {
    setShowMascot(val);
    localStorage.setItem('edu_mascot', String(val));
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto', padding: '10px 0' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Settings size={28} color="var(--color-primary)" />
        <h2 style={{ fontSize: '1.8rem' }}>Settings ⚙️</h2>
      </div>

      {/* Language Box */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} /> Language
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { key: 'en', code: 'GB', name: 'English' },
            { key: 'hi', code: 'IN', name: 'हिन्दी' },
            { key: 'mr', code: 'IN', name: 'मराठी' }
          ].map(l => {
            const isActive = lang === l.key;
            return (
              <button 
                key={l.key}
                onClick={() => handleLangChange(l.key)}
                className={`btn ${isActive ? '' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '12px', minWidth: '100px' }}
              >
                <span style={{ fontSize: '0.9rem', opacity: 0.8, marginRight: '4px' }}>{l.code}</span>
                {l.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Box */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun size={18} /> Theme
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { key: 'light', label: 'Light ☀️' },
            { key: 'dark', label: 'Dark 🌙' },
            { key: 'system', label: 'System 💻' }
          ].map(t => {
            const isActive = theme === t.key;
            return (
              <button 
                key={t.key}
                onClick={() => handleThemeChange(t.key)}
                className={`btn ${isActive ? '' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '12px', minWidth: '100px' }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seasonal Theme Box */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} /> Seasonal Theme
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { key: 'none', label: 'None 🍃' },
            { key: 'diwali', label: 'Diwali 🪔' },
            { key: 'holi', label: 'Holi 🎨' }
          ].map(s => {
            const isActive = season === s.key;
            return (
              <button 
                key={s.key}
                onClick={() => handleSeasonChange(s.key)}
                className={`btn ${isActive ? '' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '12px', minWidth: '100px' }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mascot Companion Switch */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} /> Mascot Companion
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Show friendly mascot guides on dashboards</p>
        </div>
        <label className="switch-container" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
          <input 
            type="checkbox" 
            checked={showMascot}
            onChange={(e) => handleMascotToggle(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }} 
          />
          <span className="switch-slider" style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: showMascot ? 'var(--color-success)' : 'var(--color-border)',
            border: '2px solid var(--outline-dark)',
            borderRadius: '28px',
            transition: '0.2s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <span style={{
              position: 'absolute',
              height: '18px', width: '18px',
              left: showMascot ? '24px' : '4px',
              bottom: '3px',
              backgroundColor: 'white',
              border: '2px solid var(--outline-dark)',
              borderRadius: '50%',
              transition: '0.2s'
            }} />
          </span>
        </label>
      </div>

      {/* Mascot Companion bubble visualization */}
      {showMascot && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <div style={{
            background: 'white',
            border: '3px solid var(--outline-dark)',
            borderRadius: '20px',
            padding: '10px 20px',
            position: 'relative',
            boxShadow: '0 4px 0 var(--outline-dark)',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'var(--outline-dark)'
          }}>
            Let's keep going! 💪
            {/* small arrow pointing right */}
            <div style={{
              position: 'absolute',
              right: '-10px',
              top: '50%',
              transform: 'translateY(-50%) rotate(45deg)',
              width: '12px', height: '12px',
              background: 'white',
              borderRight: '3px solid var(--outline-dark)',
              borderTop: '3px solid var(--outline-dark)'
            }} />
          </div>
          <div style={{
            width: '60px', height: '60px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '3px solid var(--outline-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 0 var(--outline-dark)',
            fontSize: '2rem'
          }}>
            🦁
          </div>
        </div>
      )}

    </div>
  );
};
