import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Typography,
  Box,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * Maps URL segments → human-readable labels.
 * Static segments are matched first; dynamic slugs fall back to title-casing.
 */
const SEGMENT_LABELS = {
  // role prefixes
  child:   'Child',
  parent:  'Parent',
  teacher: 'Teacher',
  admin:   'Admin',

  // common words
  dashboard:     'Dashboard',
  explore:       'Explore',
  awards:        'Awards',
  avatar:        'My Avatar',
  children:      'Child Profiles',
  switch:        'Switch Child',
  settings:      'Settings',
  profile:       'Profile',
  users:         'User Management',
  sessions:      'Sessions',
  notifications: 'Notifications',
  features:      'Feature Flags',
  showcase:      'Component Showcase',
  login:         'Login',
  register:      'Register',
  'forgot-password': 'Forgot Password',
};

/** Turn a raw URL segment into a label */
const toLabel = (seg) =>
  SEGMENT_LABELS[seg] ||
  seg
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const Breadcrumb = () => {
  const { pathname } = useLocation();

  const crumbs = useMemo(() => {
    // Split on "/" and drop empty strings
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return [];

    return parts.map((part, idx) => ({
      label: toLabel(part),
      path: '/' + parts.slice(0, idx + 1).join('/'),
      isLast: idx === parts.length - 1,
    }));
  }, [pathname]);

  // Don't render on the root page or if there's only one segment
  if (crumbs.length <= 1) return null;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 3.5 },
        pt: 1.5,
        pb: 0.5,
      }}
    >
      <MuiBreadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
          '& .MuiBreadcrumbs-li': { lineHeight: 1 },
        }}
      >
        {/* Home anchor */}
        <Typography
          component={Link}
          to="/"
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem',
            color: '#6B7280',
            textDecoration: 'none',
            '&:hover': { color: '#1F3A68', textDecoration: 'underline' },
          }}
        >
          🏠 Home
        </Typography>

        {crumbs.map((crumb) =>
          crumb.isLast ? (
            <Typography
              key={crumb.path}
              variant="caption"
              sx={{
                fontWeight: 800,
                fontSize: '0.75rem',
                color: '#1F3A68',
                whiteSpace: 'nowrap',
              }}
            >
              {crumb.label}
            </Typography>
          ) : (
            <Typography
              key={crumb.path}
              component={Link}
              to={crumb.path}
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                color: '#6B7280',
                textDecoration: 'none',
                '&:hover': { color: '#1F3A68', textDecoration: 'underline' },
              }}
            >
              {crumb.label}
            </Typography>
          )
        )}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
