import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Avatar, Divider, useMediaQuery, useTheme, IconButton,
} from '@mui/material';
import {
  Home as HomeIcon, Explore as ExploreIcon, EmojiEvents as AwardsIcon,
  Face as AvatarIcon, Dashboard as DashboardIcon, ChildCare as ChildCareIcon,
  SwapHoriz as SwapIcon, Settings as SettingsIcon, Person as PersonIcon,
  People as PeopleIcon, History as HistoryIcon, Notifications as NotificationsIcon,
  ToggleOn as ToggleIcon, Logout as LogoutIcon, ChevronLeft as ChevronLeftIcon,
  MonetizationOn as CoinIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useChildProfile } from '../context/ChildProfileContext';
import { NAV_MENUS } from '../utils/constants';
import { getInitials } from '../utils/helpers';
import SpacECELogo from '../components/shared/SpacECELogo';

const DRAWER_WIDTH = 216;

const iconMap = {
  Home: HomeIcon, Explore: ExploreIcon, EmojiEvents: AwardsIcon, Face: AvatarIcon,
  Dashboard: DashboardIcon, ChildCare: ChildCareIcon, SwapHoriz: SwapIcon,
  Settings: SettingsIcon, Person: PersonIcon, People: PeopleIcon,
  History: HistoryIcon, Notifications: NotificationsIcon, ToggleOn: ToggleIcon,
};

/* NAV icon emoji mapping for child role (matches reference screenshots) */
const EMOJI_ICONS = {
  '/dashboard':   '🏠',
  '/explore':     '📖',
  '/achievements':'🏆',
  '/avatar':      '👤',
  '/settings':    '⚙️',
};

const ROLE_ACCENT = {
  child:   '#F5A623',
  parent:  '#3BB77E',
  teacher: '#4299E1',
  admin:   '#9F7AEA',
};


const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, currentUser, userAccount, logout } = useAuth();
  const { coinCount } = useChildProfile();

  const menuItems = NAV_MENUS[userRole] || [];
  const accent = ROLE_ACCENT[userRole] || ROLE_ACCENT.parent;
  const showCoins = userRole === 'child' || userRole === 'parent';

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = currentUser?.displayName || userAccount?.displayName || 'User';

  const drawerContent = (
    <Box sx={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#FFFFFF',
      borderRight: '1px solid rgba(0,0,0,0.07)',
    }}>

      {/* ── Logo / Brand ── */}
      <Box sx={{
        px: 2, pt: 2, pb: 1.75,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        {/* [Logo icon] | SpaceECE · Learning Adventures */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, overflow: 'visible' }}>

          {/* Logo mark */}
          <SpacECELogo variant="sidebar" width={44} />

          {/* Thin accent divider */}
          <Box sx={{
            width: '1.5px', height: 32, flexShrink: 0,
            background: `linear-gradient(to bottom, transparent, ${accent}80, transparent)`,
            borderRadius: 1,
          }} />

          {/* Brand text */}
          <Box sx={{ minWidth: 'max-content' }}>
            <Typography sx={{
              fontSize: '1rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              fontFamily: '"Nunito", sans-serif',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ color: '#222222' }}>Space</span><span style={{ color: '#F5A623' }}>ECE</span>
            </Typography>
            <Typography sx={{
              fontSize: '0.58rem',
              fontWeight: 700,
              color: accent,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              lineHeight: 1.3,
              fontFamily: '"Nunito", sans-serif',
              whiteSpace: 'nowrap',
              opacity: 0.85,
            }}>
              Learning Adventures
            </Typography>
          </Box>
        </Box>

        {isMobile && (
          <IconButton onClick={onClose} size="small" sx={{ color: '#9CA3AF', ml: 0.5, flexShrink: 0 }}>
            <ChevronLeftIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Box>

      {/* ── User card ── */}
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.25,
          px: 1.5, py: 1.25, borderRadius: '14px',
          bgcolor: `${accent}15`,
          border: `1.5px solid ${accent}25`,
        }}>
          <Avatar sx={{
            width: 36, height: 36,
            bgcolor: accent,
            fontSize: '0.85rem', fontWeight: 900,
            border: '2px solid white',
            boxShadow: `0 2px 8px ${accent}40`,
          }}>
            {getInitials(displayName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" fontWeight={900} noWrap sx={{ display: 'block', lineHeight: 1.2, color: '#1A1A1A', fontSize: '0.8rem' }}>
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: accent, fontWeight: 800, textTransform: 'capitalize' }}>
              {userRole || 'User'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Navigation ── */}
      <List sx={{ flex: 1, px: 1, py: 0.5, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const IconComponent = iconMap[item.icon] || DashboardIcon;
          const isActive = location.pathname === item.path;
          const emojiIcon = EMOJI_ICONS[item.path];

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '14px',
                  py: 1.25, px: 1.5,
                  bgcolor: isActive ? `${accent}20` : 'transparent',
                  border: isActive ? `1.5px solid ${accent}35` : '1.5px solid transparent',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    bgcolor: `${accent}12`,
                    border: `1.5px solid ${accent}22`,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 52 }}>
                  {emojiIcon ? (
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '11px',
                      bgcolor: isActive ? accent : `${accent}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.15rem',
                      transition: 'all 0.18s ease',
                      boxShadow: isActive ? `0 4px 12px ${accent}45` : 'none',
                    }}>
                      {emojiIcon}
                    </Box>
                  ) : (
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '11px',
                      bgcolor: isActive ? accent : `${accent}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.18s ease',
                      boxShadow: isActive ? `0 4px 12px ${accent}45` : 'none',
                    }}>
                      <IconComponent sx={{ fontSize: 18, color: isActive ? 'white' : accent }} />
                    </Box>
                  )}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 900 : 700,
                    color: isActive ? accent : '#374151',
                    fontFamily: '"Nunito", sans-serif',
                    letterSpacing: isActive ? '-0.01em' : '0',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* ── Coins + Logout ── */}
      <Box sx={{ px: 1.5, pb: 2 }}>
        <Divider sx={{ mb: 1.5, borderColor: 'rgba(0,0,0,0.06)' }} />

        {showCoins && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 1.1, mb: 1, borderRadius: '12px',
            bgcolor: '#FFF8E1',
            border: '1.5px solid #FFE082',
          }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #F5A623 0%, #FFC107 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CoinIcon sx={{ fontSize: 16, color: 'white' }} />
            </Box>
            <Typography fontWeight={900} sx={{ color: '#D97706', fontSize: '1.25rem', lineHeight: 1 }}>
              {coinCount ?? 50}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 800, opacity: 0.85 }}>
              coins
            </Typography>
          </Box>
        )}

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '12px', py: 1, px: 1.5,
            '&:hover': { bgcolor: 'rgba(239,68,68,0.07)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 52 }}>
            <LogoutIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{
              fontSize: '0.85rem', fontWeight: 700, color: '#6B7280',
              fontFamily: '"Nunito", sans-serif',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary" open={open} onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent" open
          sx={{
            width: DRAWER_WIDTH, flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH, border: 'none',
              boxShadow: '2px 0 16px rgba(0,0,0,0.06)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export { DRAWER_WIDTH };
export default Sidebar;
