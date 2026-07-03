import { NavLink, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { logout, updateUserProfile } from '../../api/services';
import logoImg from '../../assets/logo.jpeg';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/child/dashboard',          label: 'Home',       icon: '🏠' },
  { path: '/child/explore',            label: 'Explore',    icon: '🗺️' },
  { path: '/child/reading-world',      label: 'Reading',    icon: '📖' },
  { path: '/child/story-world',        label: 'Stories',    icon: '🌟' },
  { path: '/child/vocabulary-zone',    label: 'Vocabulary', icon: '🔤' },
  { path: '/child/language-challenges',label: 'Challenges', icon: '🎯' },
  { path: '/child/brain-world',        label: 'Brain',      icon: '🧠' },
  { path: '/child/emotion-world',      label: 'Emotions',   icon: '❤️' },
  { path: '/child/creativity-world',   label: 'Creativity', icon: '🎨' },
  { path: '/child/story-choice-world', label: 'Stories',    icon: '🎭' },
  { path: '/child/awards',             label: 'Awards',     icon: '🏆' },
  { path: '/child/avatar',             label: 'Avatar',     icon: '👤' },
  { path: '/child/settings',           label: 'Settings',   icon: '⚙️' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { profile, user, setProfile, refreshProfile, markLoggedOut } = useUser();

  const handleLogout = async () => {
    try {
      markLoggedOut();
      await logout();
      window.location.href = '/';
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const currentLang = profile?.language || localStorage.getItem('spaceece_language') || 'English';

  const handleLanguageChange = async (langLabel) => {
    localStorage.setItem('spaceece_language', langLabel);
    if (setProfile) {
      setProfile(prev => prev ? { ...prev, language: langLabel } : { language: langLabel });
    }
    if (!user) return;
    try {
      await updateUserProfile(user.uid, { language: langLabel });
    } catch (e) {
      console.warn('Failed to update language in database:', e);
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-mobile-overlay" onClick={onClose} />}

      <nav className={`navbar ${isOpen ? 'open' : ''}`} id="main-navbar">
        <div className="navbar-header">
          <Link to="/child/dashboard" className="navbar-brand" onClick={onClose}>
            <div className="brand-logo">
              <img src={logoImg} alt="SpacECE" className="navbar-logo" />
            </div>
            <div className="brand-text">
              <span className="brand-title">SpacECE</span>
              <span className="brand-tagline">Learning Adventures</span>
            </div>
          </Link>

          <div className="navbar-actions">
            <button className="nav-action-btn" title="Notifications">
              <span className="action-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
            <button className="nav-action-btn" title="Search">
              <span className="action-icon">🔍</span>
            </button>
            <div className="lang-switcher">
              <span
                className={currentLang === 'English' ? 'lang-active' : 'lang-option'}
                onClick={() => handleLanguageChange('English')}
              >
                EN
              </span>
              <span
                className={currentLang === 'हिंदी' ? 'lang-active' : 'lang-option'}
                onClick={() => handleLanguageChange('हिंदी')}
              >
                हि
              </span>
              <span
                className={currentLang === 'मराठी' ? 'lang-active' : 'lang-option'}
                onClick={() => handleLanguageChange('मराठी')}
              >
                मर
              </span>
            </div>
          </div>
        </div>

        <div className="navbar-tabs">
          {NAV_ITEMS.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/child/dashboard'}
              className={({ isActive }) => `navbar-tab ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <span className="tab-indicator"></span>
            </NavLink>
          ))}
        </div>


        <div className="navbar-logout-container">
          <button className="navbar-logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-label">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}