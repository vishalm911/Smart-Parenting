import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import { logout, updateUserProfile } from '../../api/services';
import logoImg from '../../assets/logo.jpeg';
import { getTranslation } from '../../utils/translations';
import { useApp } from '../../context/AppContext';
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

const SEARCHABLE_ITEMS = [
  { name: 'Math World', category: 'Math & Numbers 🔢', description: 'Fun math games, addition, subtraction and multiplication!', path: '/math-world', icon: '🔢', color: '#F43F5E' },
  { name: 'Puzzle World', category: 'Logic & Puzzle 🧩', description: 'Solve jigsaw and shape puzzles to unlock stars!', path: '/puzzle-world', icon: '🧩', color: '#3B82F6' },
  { name: 'Number Adventure', category: 'Math & Numbers 🔢', description: 'Help the numbers find their way home!', path: '/number-adventure', icon: '🦁', color: '#F5A623' },
  { name: 'Logic Island', category: 'Logic & Puzzle 🧩', description: 'Solve logic puzzles and train your brain!', path: '/logic-island', icon: '🏝️', color: '#10B981' },
  { name: 'Reading World', category: 'Reading & Literacy 📖', description: 'Read interactive stories and learn new words!', path: '/child/reading-world', icon: '📖', color: '#8B5CF6' },
  { name: 'Story World', category: 'Reading & Literacy 📖', description: 'Listen to bedtime and adventure tales!', path: '/child/story-world', icon: '🌟', color: '#EC4899' },
  { name: 'Vocabulary Zone', category: 'Words & Grammar 🔤', description: 'Learn spelling and improve your word library!', path: '/child/vocabulary-zone', icon: '🔤', color: '#06B6D4' },
  { name: 'Language Challenges', category: 'Words & Grammar 🔤', description: 'Test your vocabulary with matching games!', path: '/child/language-challenges', icon: '🎯', color: '#EF4444' },
  { name: 'Brain World', category: 'Cognitive & Mind 🧠', description: 'Train your memory and processing speed!', path: '/child/brain-world', icon: '🧠', color: '#14B8A6' },
  { name: 'Emotions World', category: 'Cognitive & Mind 🧠', description: 'Understand feelings and express your emotions!', path: '/child/emotion-world', icon: '❤️', color: '#F43F5E' },
  { name: 'Creativity World', category: 'Arts & Drawing 🎨', description: 'Draw, paint, and create your own art!', path: '/child/creativity-world', icon: '🎨', color: '#8B5CF6' },
  { name: 'Awards Board', category: 'Rewards & Achievements 🏆', description: 'View your badges, stars, and accomplishments!', path: '/child/awards', icon: '🏆', color: '#F5A623' },
  { name: 'Avatar Customizer', category: 'Profile & Customization 👤', description: 'Customize your child profile avatar!', path: '/child/avatar', icon: '👤', color: '#3B82F6' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { profile, user, setProfile, refreshProfile, markLoggedOut } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { featureFlags } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = NAV_ITEMS.filter(tab => {
    if (tab.path === '/child/avatar') return featureFlags?.enableAvatarCustomization !== false;
    return true;
  });

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

  const filteredSearchItems = SEARCHABLE_ITEMS.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {isOpen && <div className="sidebar-mobile-overlay" onClick={onClose} />}
      {showNotifs && <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowNotifs(false)} />}

      <nav className={`navbar ${isOpen ? 'open' : ''}`} id="main-navbar">
        <button className="navbar-close-btn" onClick={onClose} aria-label="Close menu">&times;</button>
        <div className="navbar-header">
          <Link to="/child/dashboard" className="navbar-brand" onClick={onClose}>
            <div className="brand-logo">
              <img src={logoImg} alt="SpacECE" className="navbar-logo" />
            </div>
            <div className="brand-text">
              <span className="brand-title">
                <span className="brand-spac">Spac</span>
                <span className="brand-ece">ECE</span>
              </span>
              <span className="brand-tagline">Learning Adventures</span>
            </div>
          </Link>

          <div className="navbar-actions" style={{ position: 'relative' }}>
            {featureFlags?.enableNotifications !== false && (
              <button
                className="nav-action-btn"
                title="Notifications"
                onClick={() => setShowNotifs(!showNotifs)}
                style={{ position: 'relative', zIndex: showNotifs ? 1001 : 1 }}
              >
                <span className="action-icon">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
            )}

            {showNotifs && (
              <div className="child-notification-dropdown" style={{ zIndex: 1001 }}>
                <div className="child-notification-header">
                  <span>🔔 Alerts</span>
                  {unreadCount > 0 && (
                    <button
                      className="child-notification-clear"
                      onClick={() => {
                        markAllAsRead();
                        setShowNotifs(false);
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="child-notification-list">
                  {notifications.length === 0 ? (
                    <div className="child-notification-empty">
                      <span>🎈</span>
                      <p>All caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const icons = { achievement: '🏆', reward: '🪙', reminder: '⏰', system: '⚙️' };
                      const icon = icons[notif.type] || '⚙️';
                      return (
                        <div
                          key={notif.id}
                          className={`child-notification-item ${notif.read_status ? 'read' : 'unread'}`}
                          onClick={() => {
                            markAsRead(notif.id);
                            setShowNotifs(false);
                          }}
                        >
                          <span className="child-notification-icon">{icon}</span>
                          <div className="child-notification-body">
                            <p className="child-notification-title">{notif.title}</p>
                            <p className="child-notification-message">{notif.message}</p>
                            <span className="child-notification-time">
                              {new Date(notif.created_at).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {!notif.read_status && <span className="child-notification-unread-dot" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <button className="nav-action-btn" title="Search" onClick={() => setShowSearch(true)}>
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
          {navItems.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/child/dashboard'}
              className={({ isActive }) => `navbar-tab ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{getTranslation(tab.label, currentLang)}</span>
              <span className="tab-indicator"></span>
            </NavLink>
          ))}
        </div>


        <div className="navbar-logout-container">
          <button className="navbar-logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-label">{getTranslation('Sign Out', currentLang)}</span>
          </button>
        </div>
      </nav>

      {showSearch && (
        <div className="child-search-overlay" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
          <div className="child-search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="child-search-header">
              <h3>🔍 Search Adventures</h3>
              <button className="child-search-close" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>&times;</button>
            </div>
            
            <div className="child-search-body">
              <div className="child-search-input-wrapper">
                <input
                  type="text"
                  placeholder="Type to search (e.g. math, stories, puzzle)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="child-search-input"
                />
                {searchQuery && (
                  <button className="child-search-clear-input" onClick={() => setSearchQuery('')}>&times;</button>
                )}
              </div>

              {/* Popular Categories */}
              {!searchQuery && (
                <div className="child-search-trending">
                  <p className="trending-title">💡 Try searching for:</p>
                  <div className="trending-tags">
                    {['Math', 'Puzzle', 'Story', 'Creativity', 'Brain', 'Vocabulary'].map((tag) => (
                      <button
                        key={tag}
                        className="trending-tag-btn"
                        onClick={() => setSearchQuery(tag)}
                      >
                        {tag === 'Math' ? '🔢 Math' :
                         tag === 'Puzzle' ? '🧩 Puzzles' :
                         tag === 'Story' ? '🌟 Stories' :
                         tag === 'Creativity' ? '🎨 Drawing' :
                         tag === 'Brain' ? '🧠 Mind' : '🔤 Words'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchQuery && (
                <div className="child-search-results">
                  {filteredSearchItems.length === 0 ? (
                    <div className="search-no-results">
                      <span>🧐</span>
                      <p>No adventures found for "{searchQuery}"</p>
                      <button className="reset-search-btn" onClick={() => setSearchQuery('')}>Try again</button>
                    </div>
                  ) : (
                    <div className="search-results-list">
                      {filteredSearchItems.map((item) => (
                        <div
                          key={item.path}
                          className="search-result-item"
                          onClick={() => {
                            setShowSearch(false);
                            setSearchQuery('');
                            onClose();
                            navigate(item.path);
                          }}
                        >
                          <div
                            className="search-result-icon"
                            style={{ background: `${item.color}15`, border: `2px solid ${item.color}30` }}
                          >
                            <span style={{ color: item.color }}>{item.icon}</span>
                          </div>
                          <div className="search-result-info">
                            <p className="search-result-name">{item.name}</p>
                            <p className="search-result-desc">{item.description}</p>
                            <span className="search-result-category" style={{ color: item.color, background: `${item.color}10` }}>
                              {item.category}
                            </span>
                          </div>
                          <span className="search-result-arrow">🚀</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}