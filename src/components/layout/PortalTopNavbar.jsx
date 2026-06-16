import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Box,
  Menu, MenuItem, Divider, Chip,
  useMediaQuery, useTheme, List, ListItem, ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications as NotificationsIcon,
  Settings as SettingsIcon, Logout as LogoutIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useChildProfile } from '../../context/ChildProfileContext';
import { getInitials } from '../../utils/helpers';
import { DRAWER_WIDTH } from './PortalSidebar';
import SpacECELogo from '../shared/SpacECELogo';

const ROLE_COLORS = {
  child:   { main: '#F5A623', light: '#FFC107' },
  parent:  { main: '#3BB77E', light: '#A5D6A7' },
  teacher: { main: '#4299E1', light: '#90CAF9' },
  admin:   { main: '#9F7AEA', light: '#D6BCFA' },
};

/* Stat pills shown in the header — dynamic values from ChildProfileContext */
const ChildStatPills = ({ activeChild, coinCount }) => {
  const streak  = activeChild?.streak_days  || 0;
  const stars   = activeChild?.stars        || 0;
  const badges  = (activeChild?.badges      || []).length;
  const xp      = activeChild?.xp           || 0;

  const pills = [
    { emoji: '🔥', value: streak,  label: 'DAY STREAK', bg: '#FFF0F0', color: '#E53E3E'  },
    { emoji: '⭐', value: stars,   label: 'STARS',       bg: '#FFFBEB', color: '#D97706'  },
    { emoji: '🏆', value: badges,  label: 'BADGES',      bg: '#F0FFF4', color: '#22C55E'  },
    { emoji: '⚡', value: xp,      label: 'XP',           bg: '#EFF6FF', color: '#3B82F6'  },
  ];
  return (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
      {pills.map((p) => (
        <Box key={p.label} sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          px: 1.75, py: 0.75, borderRadius: '14px',
          bgcolor: p.bg, border: `1.5px solid ${p.color}25`,
          minWidth: 58,
          transition: 'transform 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)' },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.95rem', lineHeight: 1 }}>{p.emoji}</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#1A1A1A', lineHeight: 1, fontFamily: '"Nunito", sans-serif' }}>{p.value}</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: p.color, letterSpacing: '0.05em', mt: 0.2 }}>{p.label}</Typography>
        </Box>
      ))}
    </Box>
  );
};

const TopNavbar = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { currentUser, userRole, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { coinCount, activeChild } = useChildProfile();

  const [anchorEl,      setAnchorEl]      = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleMenuOpen   = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose  = ()  => setAnchorEl(null);
  const handleNotifOpen  = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = ()  => setNotifAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/');
  };

  const roleColors = ROLE_COLORS[userRole] || ROLE_COLORS.parent;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        color: 'text.primary',
        ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
        width: isMobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
        zIndex: (t) => isMobile ? t.zIndex.drawer + 1 : t.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, md: 2.5 }, minHeight: { xs: 60, sm: 64 } }}>

        {/* Left */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton onClick={onMenuClick} sx={{ color: '#1F3A68' }}>
              <MenuIcon />
            </IconButton>
          )}
          {isMobile && (
            <SpacECELogo variant="header" width={80} style={{ maxHeight: 38 }} />
          )}
        </Box>

        {/* Center — child stat pills (matches dashboard screenshot) */}
        {userRole === 'child' && <ChildStatPills activeChild={activeChild} coinCount={coinCount} />}

        {/* Right */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>

          {/* Notification bell */}
          <IconButton
            onClick={handleNotifOpen}
            sx={{ color: '#6B7280', bgcolor: '#F9FAFB', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.07)',
                  '&:hover': { bgcolor: '#F3F4F6', color: '#1F3A68' } }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', fontWeight: 900, minWidth: 18, height: 18 } }}
            >
              <NotificationsIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          {/* Notification dropdown */}
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            PaperProps={{
              sx: {
                width: 320, maxHeight: 420, borderRadius: '18px', mt: 1.5,
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={900}>🔔 Notifications</Typography>
              {unreadCount > 0 && (
                <Typography
                  variant="caption"
                  sx={{ color: '#F5A623', fontWeight: 800, cursor: 'pointer', bgcolor: '#FFF8E1', px: 1.25, py: 0.4, borderRadius: 10 }}
                  onClick={() => { markAllAsRead(); handleNotifClose(); }}
                >
                  Mark all read
                </Typography>
              )}
            </Box>
            <Divider />
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>✨</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>All caught up!</Typography>
              </Box>
            ) : (
              <List sx={{ pt: 0, maxHeight: 300, overflowY: 'auto' }}>
                {notifications.slice(0, 8).map((notif) => (
                  <ListItem
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    sx={{
                      cursor: 'pointer', alignItems: 'flex-start', py: 1.5,
                      bgcolor: notif.read_status ? 'transparent' : '#FFFBF0',
                      borderLeft: notif.read_status ? '3px solid transparent' : '3px solid #F5A623',
                      '&:hover': { bgcolor: '#FFF8E1' },
                    }}
                  >
                    <ListItemText
                      primary={notif.message}
                      secondary={
                        notif.created_at?.toDate
                          ? new Date(notif.created_at.toDate()).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : 'Just now'
                      }
                      primaryTypographyProps={{ variant: 'body2', fontWeight: notif.read_status ? 500 : 700 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    {!notif.read_status && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F5A623', mt: 0.8, flexShrink: 0 }} />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Menu>

          {/* User avatar */}
          <IconButton
            onClick={handleMenuOpen}
            sx={{ p: 0.4, border: `2px solid ${roleColors.main}40`, borderRadius: '50%',
                  '&:hover': { boxShadow: `0 0 12px ${roleColors.main}40` } }}
          >
            <Avatar
              sx={{
                width: 34, height: 34,
                background: `linear-gradient(135deg, ${roleColors.main} 0%, ${roleColors.light} 100%)`,
                fontSize: '0.82rem', fontWeight: 900,
                border: '2px solid white',
              }}
            >
              {currentUser?.displayName
                ? getInitials(currentUser.displayName)
                : userRole?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          {/* User menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                width: 220, borderRadius: '18px', mt: 1.5,
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography variant="subtitle2" fontWeight={900}>{currentUser?.displayName || 'User'}</Typography>
              <Typography variant="caption" color="text.secondary">{currentUser?.email || ''}</Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                const routes = { parent: '/parent/settings', teacher: '/teacher/settings', admin: '/admin/settings', child: '/child/avatar' };
                navigate(routes[userRole] || '/');
              }}
              sx={{ py: 1.5, '&:hover': { bgcolor: '#FFF8E1' } }}
            >
              <SettingsIcon sx={{ mr: 1.5, fontSize: 18, color: roleColors.main }} />
              <Typography variant="body2" fontWeight={700}>{userRole === 'child' ? 'My Avatar' : 'Settings'}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, '&:hover': { bgcolor: '#FFF5F5' } }}>
              <LogoutIcon sx={{ mr: 1.5, fontSize: 18, color: '#E53E3E' }} />
              <Typography variant="body2" color="error.main" fontWeight={700}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;
