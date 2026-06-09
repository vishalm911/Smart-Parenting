/**
 * Application constants
 */

// User Roles
export const ROLES = {
  CHILD: 'child',
  PARENT: 'parent',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

// Route paths
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN_CHILD: '/login/child',
  LOGIN_PARENT: '/login/parent',
  LOGIN_TEACHER: '/login/teacher',
  LOGIN_ADMIN: '/login/admin',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Child
  CHILD_DASHBOARD: '/child/dashboard',
  CHILD_EXPLORE: '/child/explore',
  CHILD_AWARDS: '/child/awards',
  CHILD_AVATAR: '/child/avatar',

  // Parent
  PARENT_DASHBOARD: '/parent/dashboard',
  PARENT_CHILDREN: '/parent/children',
  PARENT_SWITCH_CHILD: '/parent/children/switch',
  PARENT_SETTINGS: '/parent/settings',

  // Teacher
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_PROFILE: '/teacher/profile',
  TEACHER_SETTINGS: '/teacher/settings',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_SESSIONS: '/admin/sessions',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_FEATURES: '/admin/features',
  ADMIN_SETTINGS: '/admin/settings',

  // Dev
  SHOWCASE: '/showcase',
};

// Role-based dashboard redirects
export const ROLE_DASHBOARDS = {
  [ROLES.CHILD]: ROUTES.CHILD_DASHBOARD,
  [ROLES.PARENT]: ROUTES.PARENT_DASHBOARD,
  [ROLES.TEACHER]: ROUTES.TEACHER_DASHBOARD,
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
};

// Navigation menus by role
export const NAV_MENUS = {
  [ROLES.CHILD]: [
    { label: 'Home', path: ROUTES.CHILD_DASHBOARD, icon: 'Home' },
    { label: 'Explore', path: ROUTES.CHILD_EXPLORE, icon: 'Explore' },
    { label: 'Awards', path: ROUTES.CHILD_AWARDS, icon: 'EmojiEvents' },
    { label: 'Avatar', path: ROUTES.CHILD_AVATAR, icon: 'Face' },
  ],
  [ROLES.PARENT]: [
    { label: 'Dashboard', path: ROUTES.PARENT_DASHBOARD, icon: 'Dashboard' },
    { label: 'Children', path: ROUTES.PARENT_CHILDREN, icon: 'ChildCare' },
    { label: 'Switch Child', path: ROUTES.PARENT_SWITCH_CHILD, icon: 'SwapHoriz' },
    { label: 'Settings', path: ROUTES.PARENT_SETTINGS, icon: 'Settings' },
  ],
  [ROLES.TEACHER]: [
    { label: 'Dashboard', path: ROUTES.TEACHER_DASHBOARD, icon: 'Dashboard' },
    { label: 'Profile', path: ROUTES.TEACHER_PROFILE, icon: 'Person' },
    { label: 'Settings', path: ROUTES.TEACHER_SETTINGS, icon: 'Settings' },
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard',     path: ROUTES.ADMIN_DASHBOARD,     icon: 'Dashboard'     },
    { label: 'Users',         path: ROUTES.ADMIN_USERS,         icon: 'People'        },
    { label: 'Sessions',      path: ROUTES.ADMIN_SESSIONS,      icon: 'History'       },
    { label: 'Notifications', path: ROUTES.ADMIN_NOTIFICATIONS, icon: 'Notifications' },
    { label: 'Features',      path: ROUTES.ADMIN_FEATURES,      icon: 'ToggleOn'      },
    { label: 'Settings',      path: ROUTES.ADMIN_SETTINGS,      icon: 'Settings'      },
  ],
};

// Age group configuration
export const AGE_GROUPS = {
  '1-3': { label: 'Age 1-3', color: '#48BB78', bgColor: '#F0FFF4' },
  '4-6': { label: 'Age 4-6', color: '#4299E1', bgColor: '#EBF8FF' },
  '7-10': { label: 'Age 7-10', color: '#9F7AEA', bgColor: '#FAF5FF' },
};

// Notification types
export const NOTIFICATION_TYPES = {
  ACHIEVEMENT: 'achievement',
  REWARD: 'reward',
  REMINDER: 'reminder',
  SYSTEM: 'system',
  GENERAL: 'general',
};

// App metadata
export const APP_NAME = 'SpaceECE India Foundation';
export const APP_TAGLINE = 'Learning Adventures Await! ✨';
