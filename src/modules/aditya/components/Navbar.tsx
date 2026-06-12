import React from 'react';
import type { Child } from '../services/firebaseSimulator';
import spaceeceLogo from '../assets/spaceece_logo.png';

type RoleType = 'child' | 'parent' | 'teacher' | 'admin' | 'reports' | 'settings';

interface SidebarProps {
  currentRole: RoleType;
  onChangeRole: (role: RoleType) => void;
  childrenList: Child[];
  selectedChild: Child;
  onChangeChild: (childId: string) => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  role: RoleType;
  tab?: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',     role: 'child',    tab: 'progress',          label: 'HOME',     icon: '🏠' },
  { id: 'explore',  role: 'child',    tab: 'map',               label: 'EXPLORE',  icon: '🗺️' },
  { id: 'awards',   role: 'reports',  tab: 'reports',           label: 'AWARDS',   icon: '🏆' },
  { id: 'parent',   role: 'parent',   tab: 'parent_dashboard',  label: 'PARENT',   icon: '👪' },
  { id: 'teacher',  role: 'teacher',  tab: 'teacher',           label: 'TEACHER',  icon: '👩‍🏫' },
  { id: 'admin',    role: 'admin',    tab: 'admin',             label: 'ADMIN',    icon: '⚙️' },
  { id: 'settings', role: 'settings', tab: 'settings',          label: 'SETTINGS', icon: '🔧' },
];

export const Navbar: React.FC<SidebarProps> = ({
  currentRole,
  onChangeRole,
  childrenList,
  selectedChild,
  onChangeChild,
  activeTab,
  onChangeTab
}) => {

  const handleNavClick = (item: NavItem) => {
    if (item.role !== currentRole) {
      onChangeRole(item.role);
    }
    if (item.tab) {
      onChangeTab(item.tab);
    }
  };

  const isActive = (item: NavItem) => {
    if (item.role !== currentRole) return false;
    if (item.tab) return activeTab === item.tab;
    return true;
  };

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <img src={spaceeceLogo} alt="SpaceECE Logo" />
        <div className="sidebar-brand-text">
          <h1>SpacECE</h1>
          <span>Learning Adventures</span>
        </div>
      </div>

      {/* Child Profile Selector */}
      {(currentRole === 'child' || currentRole === 'parent' || currentRole === 'reports') && (
        <div className="sidebar-profile">
          <span style={{ fontSize: '1.2rem' }}>{selectedChild.avatar}</span>
          <select
            value={selectedChild.id}
            onChange={(e) => onChangeChild(e.target.value)}
          >
            {childrenList.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.age}y)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Language pills */}
      <div style={{ display: 'flex', gap: '6px', padding: '0 16px', marginBottom: '16px' }}>
        {['EN', 'हि', 'मर'].map((lang, i) => (
          <span
            key={lang}
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '8px',
              background: i === 0 ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
              color: i === 0 ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {lang}
          </span>
        ))}
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${isActive(item) ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* XP Counter at bottom */}
      <div className="sidebar-xp">
        <span style={{ fontSize: '1.2rem' }}>🪙</span>
        <span>50</span>
      </div>
    </aside>
  );
};
