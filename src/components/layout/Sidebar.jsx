import { NavLink, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import logoImg from '../../assets/logo.jpeg';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/child/dashboard',     label: 'Home',     icon: '🏠' },
  { path: '/child/explore',       label: 'Explore',  icon: '🗺️' },
  { path: '/child/reading-world', label: 'Language', icon: '📖' },
  { path: '/child/awards',        label: 'Awards',   icon: '🏆' },
  { path: '/child/avatar',        label: 'Avatar',   icon: '👤' },
  { path: '/child/settings',      label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { profile } = useUser();

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

        <div className="navbar-stats">
          <div className="stat-item">
            <span className="stat-icon">🪙</span>
            <span className="stat-value">{profile?.coins ?? 50}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{profile?.stars ?? 0}</span>
          </div>
        </div>
      </nav>
    </>
  );
}
