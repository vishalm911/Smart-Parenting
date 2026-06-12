import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, languageNames } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import ParentPinLock, { hasPinSet, removeParentPin } from '../components/ParentPinLock';
import { getAllChildProfiles, switchChildProfile, deleteChildProfile, getAvatar } from '../utils/firestoreHelpers';
import './Settings.css';

export default function Settings() {
  const { t, language, setLanguage, languages } = useTranslation();
  const { theme, setTheme, season, setSeason } = useTheme();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState('set');
  const [profiles, setProfiles] = useState([]);
  const [mascotVisible, setMascotVisible] = useState(() => {
    try { return localStorage.getItem('spacece_mascot') !== 'false'; } catch { return true; }
  });

  useEffect(() => {
    setProfiles(getAllChildProfiles());
  }, []);

  function handlePinAction(action) {
    if (action === 'remove') {
      removeParentPin();
      return;
    }
    setPinMode(action === 'change' ? 'set' : 'set');
    setShowPinModal(true);
  }

  function handleSwitchProfile(childId) {
    switchChildProfile(childId);
    window.location.reload(); // Reload to apply new profile
  }

  function handleDeleteProfile(childId) {
    if (profiles.length <= 1) return;
    deleteChildProfile(childId);
    setProfiles(getAllChildProfiles());
    if (childId === state.childProfile?.id) {
      window.location.reload();
    }
  }

  function handleMascotToggle(show) {
    setMascotVisible(show);
    localStorage.setItem('spacece_mascot', show ? 'true' : 'false');
    dispatch({ type: 'SET_MASCOT_VISIBLE', payload: show });
  }

  return (
    <div className="settings-page">
      <div className="settings-inner">
        <h1>{t('settingsTitle')}</h1>

        {/* Language */}
        <section className="settings-section">
          <h2>{t('language')}</h2>
          <div className="settings-lang-options">
            {languages.map(lang => (
              <button
                key={lang}
                className={`settings-lang-btn ${language === lang ? 'active' : ''}`}
                onClick={() => setLanguage(lang)}
                id={`settings-lang-${lang}`}
              >
                <span className="lang-flag">{lang === 'en' ? '🇬🇧' : lang === 'hi' ? '🇮🇳' : '🇮🇳'}</span>
                <span className="lang-name">{languageNames[lang]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Theme */}
        <section className="settings-section">
          <h2>{t('theme')}</h2>
          <div className="settings-theme-options">
            {['light', 'dark', 'system'].map(th => (
              <button
                key={th}
                className={`settings-theme-btn ${theme === th ? 'active' : ''}`}
                onClick={() => setTheme(th)}
                id={`settings-theme-${th}`}
              >
                {th === 'light' ? t('themeLight') : th === 'dark' ? t('themeDark') : t('themeSystem')}
              </button>
            ))}
          </div>
        </section>

        {/* Seasonal Theme */}
        <section className="settings-section">
          <h2>{t('seasonalTheme')}</h2>
          <div className="settings-season-options">
            {[
              { id: 'none', label: t('seasonNone'), preview: 'linear-gradient(135deg, #FFFDF7, #FFF8EC)' },
              { id: 'diwali', label: t('seasonDiwali'), preview: 'linear-gradient(135deg, #4A148C, #FF6F00, #FFD54F)' },
              { id: 'holi', label: t('seasonHoli'), preview: 'linear-gradient(135deg, #E91E63, #00BCD4, #FFEB3B)' },
            ].map(s => (
              <button
                key={s.id}
                className={`season-card ${season === s.id ? 'active' : ''}`}
                style={{ background: s.preview }}
                onClick={() => setSeason(s.id)}
                id={`settings-season-${s.id}`}
              >
                <span className="season-label">{s.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Mascot */}
        <section className="settings-section">
          <h2>{t('mascotSettings')}</h2>
          <div className="settings-toggle-row">
            <span>{t('mascotShow')}</span>
            <button
              className={`toggle-switch ${mascotVisible ? 'on' : ''}`}
              onClick={() => handleMascotToggle(!mascotVisible)}
              id="settings-mascot-toggle"
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </section>

        {/* Child Profiles */}
        <section className="settings-section">
          <h2>{t('childProfiles')}</h2>
          <div className="profile-list">
            {profiles.map(p => {
              const av = getAvatar(p.id);
              const isCurrent = p.id === state.childProfile?.id;
              return (
                <div key={p.id} className={`profile-item ${isCurrent ? 'current' : ''}`}>
                  <span className="profile-avatar-mini">
                    {av?.avatarId ? '👤' : '👤'}
                  </span>
                  <div className="profile-info">
                    <span className="profile-name">{p.name}</span>
                    <span className="profile-age">{p.ageGroup}</span>
                  </div>
                  {isCurrent ? (
                    <span className="profile-current-tag">Active</span>
                  ) : (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleSwitchProfile(p.id)}
                    >
                      {t('switchProfile')}
                    </button>
                  )}
                  {profiles.length > 1 && (
                    <button
                      className="profile-delete-btn"
                      onClick={() => handleDeleteProfile(p.id)}
                      aria-label="Delete profile"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              localStorage.removeItem('current_child_id');
              dispatch({ type: 'LOAD_STATE', payload: { isOnboarded: false, childProfile: null } });
              navigate('/welcome');
            }}
            id="settings-add-profile"
          >
            {t('addProfile')}
          </button>
        </section>

        {/* Parent PIN */}
        <section className="settings-section">
          <h2>{t('parentPin')}</h2>
          <div className="pin-actions">
            {hasPinSet() ? (
              <>
                <button className="btn btn-sm btn-primary" onClick={() => handlePinAction('change')}>
                  {t('changePin')}
                </button>
                <button className="btn btn-sm" onClick={() => handlePinAction('remove')} style={{ background: 'var(--color-error)', color: 'white' }}>
                  {t('removePin')}
                </button>
              </>
            ) : (
              <button className="btn btn-sm btn-primary" onClick={() => handlePinAction('set')}>
                {t('setPin')}
              </button>
            )}
          </div>
        </section>

        {/* Admin Panel Link */}
        <section className="settings-section">
          <h2>{t('adminTitle')}</h2>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => navigate('/admin')}
            id="settings-admin-btn"
          >
            {t('adminTitle')}
          </button>
        </section>

        {/* About */}
        <section className="settings-section settings-about">
          <h2>{t('about')}</h2>
          <p>{t('version')}</p>
          <p>{t('credits')}</p>
        </section>
      </div>

      <ParentPinLock
        isOpen={showPinModal}
        mode={pinMode}
        onSuccess={() => setShowPinModal(false)}
        onCancel={() => setShowPinModal(false)}
      />
    </div>
  );
}
