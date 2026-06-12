import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
import {
  Home as HomeIcon,
  Explore as ExploreIcon,
  EmojiEvents as AwardsIcon,
  Face as AvatarIcon,
  Dashboard as DashboardIcon,
  ChildCare as ChildCareIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  ToggleOn as ToggleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const iconMap = {
  Home: HomeIcon,
  Explore: ExploreIcon,
  EmojiEvents: AwardsIcon,
  Face: AvatarIcon,
  Dashboard: DashboardIcon,
  ChildCare: ChildCareIcon,
  Settings: SettingsIcon,
  Person: PersonIcon,
  People: PeopleIcon,
  Notifications: NotificationsIcon,
};

const mobileMenus = {
  child: [
    { label: 'Home', path: '/child/dashboard', icon: 'Home' },
    { label: 'Explore', path: '/child/explore', icon: 'Explore' },
    { label: 'Awards', path: '/child/awards', icon: 'EmojiEvents' },
    { label: 'Avatar', path: '/child/avatar', icon: 'Face' },
  ],
  parent: [
    { label: 'Home', path: '/parent/dashboard', icon: 'Dashboard' },
    { label: 'Children', path: '/parent/children', icon: 'ChildCare' },
    { label: 'Settings', path: '/parent/settings', icon: 'Settings' },
  ],
  teacher: [
    { label: 'Home', path: '/teacher/dashboard', icon: 'Dashboard' },
    { label: 'Profile', path: '/teacher/profile', icon: 'Person' },
    { label: 'Settings', path: '/teacher/settings', icon: 'Settings' },
  ],
  admin: [
    { label: 'Home', path: '/admin/dashboard', icon: 'Dashboard' },
    { label: 'Users', path: '/admin/users', icon: 'People' },
    { label: 'Alerts', path: '/admin/notifications', icon: 'Notifications' },
    { label: 'Settings', path: '/admin/features', icon: 'Settings' },
  ],
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();
  const { unreadCount } = useNotifications();

  const items = mobileMenus[userRole] || [];
  const currentIndex = items.findIndex((item) => location.pathname === item.path);

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        display: { xs: 'block', md: 'none' },
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
      elevation={8}
    >
      <BottomNavigation
        value={currentIndex >= 0 ? currentIndex : 0}
        onChange={(_, newValue) => {
          navigate(items[newValue].path);
        }}
        sx={{
          height: 64,
          bgcolor: 'background.paper',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            py: 1,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            fontWeight: 600,
            '&.Mui-selected': {
              fontSize: '0.7rem',
            },
          },
        }}
      >
        {items.map((item) => {
          const IconComponent = iconMap[item.icon] || DashboardIcon;
          const isNotification = item.icon === 'Notifications';

          return (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={
                isNotification && unreadCount > 0 ? (
                  <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }}>
                    <IconComponent sx={{ fontSize: 24 }} />
                  </Badge>
                ) : (
                  <IconComponent sx={{ fontSize: 24 }} />
                )
              }
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
