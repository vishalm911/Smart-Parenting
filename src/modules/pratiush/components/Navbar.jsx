import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n';
import LanguageToggle from './LanguageToggle';
import './Navbar.css';

export default function Navbar() {
  const { state } = useApp();
  const { t } = useTranslation();
  const [notificationCount] = useState(3);

  const tabs = [
    { path: '/dashboard', icon: '🏠', label: t('navHome') },
    { path: '/adventure', icon: '🗺️', label: t('navExplore') },
    { path: '/achievements', icon: '🏆', label: t('navAwards') },
    { path: '/avatar', icon: '👤', label: t('navAvatar') },
    { path: '/settings', icon: '⚙️', label: t('navSettings') },
  ];

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-header">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-logo">
            <img src="/images/logo.png" alt="SpacECE" className="navbar-logo" />
          </div>
          <div className="brand-text">
            <span className="brand-title">SpacECE</span>
            <span className="brand-tagline">Learning Adventures</span>
          </div>
        </Link>
        
        <div className="navbar-actions">
          <button className="nav-action-btn notification-btn" title="Notifications">
            <span className="action-icon">🔔</span>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>
          <button className="nav-action-btn search-btn" title="Search">
            <span className="action-icon">🔍</span>
          </button>
          <LanguageToggle compact />
        </div>
      </div>

      <div className="navbar-tabs">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `navbar-tab ${isActive ? 'active' : ''}`}
            id={`nav-${tab.path.slice(1)}`}
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
          <span className="stat-value">{state.coins || 50}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <span className="stat-value">{state.stars || 0}</span>
        </div>
      </div>
    </nav>
  );
}
