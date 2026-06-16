/**
 * Sidebar.jsx - Navigation Sidebar Layout for Child Portal
 *
 * Implements the child navigation panel:
 * - Direct jumping to dashboards, Explore maps, and specific integrated games (Brain, Emotions, Creativity, Stories)
 * - Renders active profile metadata like coins and stars balance dynamically from the global state
 */
import { NavLink, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { logout } from '../../firebase/services';
import logoImg from '../../assets/logo.jpeg';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/child/dashboard',          label: 'Home',       icon: '🏠' },
  { path: '/child/explore',            label: 'Explore',    icon: '🗺️' },
  { path: '/child/reading-world',      label: 'Language',   icon: '📖' },
  { path: '/child/brain-world',        label: 'Brain',      icon: '🧠' },
  { path: '/child/emotion-world',      label: 'Emotions',   icon: '❤️' },
  { path: '/child/creativity-world',   label: 'Creativity', icon: '🎨' },
  { path: '/child/story-choice-world', label: 'Stories',    icon: '🎭' },
  { path: '/child/awards',             label: 'Awards',     icon: '🏆' },
  { path: '/child/avatar',             label: 'Avatar',     icon: '👤' },
  { path: '/child/settings',           label: 'Settings',   icon: '⚙️' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { profile, markLoggedOut } = useUser();

  const handleLogout = async () => {
    try {
      markLoggedOut();
      await logout();
      window.location.href = '/';
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-mobile-overlay" onClick={onClose} />
      )}

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
              <span className="lang-active">EN</span>
              <span className="lang-option">हि</span>
              <span className="lang-option">मर</span>
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
              id={`nav-${tab.path.slice(1) || 'home'}`}
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
