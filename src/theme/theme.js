import { createTheme, alpha } from '@mui/material/styles';

const brandColors = {
  darkBlue:    '#1F3A68',
  orange:      '#F5A623',
  orangeLight: '#FFC107',
  yellow:      '#FFC107',
  white:       '#FFFFFF',
  cream:       '#FFF8EE',   // authenticated page background
  creamDark:   '#FFF0D6',
  lightGray:   '#F4F6FA',
  darkGray:    '#1A1A1A',
  mediumGray:  '#718096',
  success:     '#3BB77E',
  error:       '#FC8181',
  info:        '#63B3ED',
  // Sky palette (auth pages only)
  sky:         '#E8F4FD',
  skyLight:    '#DFF5FF',
};

const theme = createTheme({
  palette: {
    primary: {
      main:          brandColors.darkBlue,
      light:         '#3A6BC4',
      dark:          '#152847',
      contrastText:  brandColors.white,
    },
    secondary: {
      main:          brandColors.orange,
      light:         brandColors.orangeLight,
      dark:          '#D4891A',
      contrastText:  brandColors.white,
    },
    warning: {
      main:  brandColors.yellow,
      light: '#FFD54F',
      dark:  '#F9A825',
    },
    success: {
      main:  brandColors.success,
      light: '#5ECB9A',
      dark:  '#2A9062',
    },
    error: {
      main:  '#E53E3E',
      light: brandColors.error,
      dark:  '#C53030',
    },
    info: {
      main:  brandColors.info,
      light: '#90CDF4',
      dark:  '#3182CE',
    },
    background: {
      default: brandColors.cream,   // warm cream — matches reference
      paper:   brandColors.white,   // clean white cards — matches reference
    },
    text: {
      primary:   brandColors.darkGray,
      secondary: brandColors.mediumGray,
    },
    divider: 'rgba(0,0,0,0.07)',
  },

  typography: {
    fontFamily: '"Nunito", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    // ── Page titles (Dashboard headings, Settings, Achievements, etc.) ──
    h1: { fontSize: '3rem',    fontWeight: 900, lineHeight: 1.1,  letterSpacing: '-0.025em', color: brandColors.darkGray },
    h2: { fontSize: '2.5rem',  fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em',  color: brandColors.darkGray },
    // ── Statistics (XP, Students, Progress numbers) ──
    h3: { fontSize: '2.2rem',  fontWeight: 900, lineHeight: 1.2,  letterSpacing: '-0.015em', color: brandColors.darkGray },
    // ── Primary page titles (32px–36px) — "Achievements", "Settings", "Admin Dashboard" ──
    h4: { fontSize: '2.1rem',  fontWeight: 900, lineHeight: 1.25, letterSpacing: '-0.01em',  color: brandColors.darkGray },
    // ── Card titles, sub-page headers ──
    h5: { fontSize: '1.5rem',  fontWeight: 800, lineHeight: 1.35, letterSpacing: '-0.005em', color: brandColors.darkGray },
    // ── Section headings (Learning Journey, Daily Missions, Trophy Shelf) ──
    h6: { fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.45, color: brandColors.darkGray },
    subtitle1: { fontSize: '1.05rem',  fontWeight: 700, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.925rem', fontWeight: 700, lineHeight: 1.5 },
    body1:     { fontSize: '0.95rem',  lineHeight: 1.65, fontWeight: 500, color: '#4A4A4A' },
    body2:     { fontSize: '0.875rem', lineHeight: 1.65, fontWeight: 500, color: brandColors.mediumGray },
    button:    { textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.01em' },
    caption:   { fontSize: '0.78rem',  lineHeight: 1.5, fontWeight: 600 },
    overline:  { textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, fontSize: '0.7rem' },
  },

  shape: { borderRadius: 16 },

  shadows: [
    'none',
    '0px 1px 4px rgba(0,0,0,0.06)',
    '0px 2px 8px rgba(0,0,0,0.07)',
    '0px 4px 14px rgba(0,0,0,0.08)',
    '0px 6px 20px rgba(0,0,0,0.09)',
    '0px 8px 24px rgba(0,0,0,0.10)',
    ...Array(19).fill('0px 12px 32px rgba(0,0,0,0.12)'),
  ],

  components: {
    // ── Buttons ──────────────────────────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '10px 24px',
          fontSize: '0.9rem',
          fontWeight: 800,
          boxShadow: 'none',
          transition: 'all 0.22s ease',
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': { transform: 'translateY(0) scale(0.98)' },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${brandColors.darkBlue} 0%, #3A6BC4 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, #152847 0%, ${brandColors.darkBlue} 100%)`,
            boxShadow: '0px 6px 20px rgba(31,58,104,0.4)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${brandColors.orange} 0%, ${brandColors.orangeLight} 100%)`,
          color: brandColors.white,
          boxShadow: '0 3px 12px rgba(245,166,35,0.35)',
          '&:hover': {
            background: `linear-gradient(135deg, #D4891A 0%, ${brandColors.orange} 100%)`,
            boxShadow: '0 6px 20px rgba(245,166,35,0.5)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': { borderWidth: 2 },
        },
        sizeLarge: { padding: '14px 32px', fontSize: '1rem',   borderRadius: 50 },
        sizeSmall: { padding: '6px 16px',  fontSize: '0.8rem', borderRadius: 50 },
      },
    },

    // ── Cards — clean white with soft shadow ──────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: brandColors.white,
          border: '1.5px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          transition: 'all 0.25s ease',
          '&:hover': {
            boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
            transform: 'translateY(-3px)',
          },
        },
      },
    },

    // ── Paper — clean white ───────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: brandColors.white,
          border: '1.5px solid rgba(0,0,0,0.06)',
        },
        elevation0: {
          background: brandColors.white,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        },
      },
    },

    // ── TextField ─────────────────────────────────────────────────────
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: '#FAFAFA',
            transition: 'all 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.orange,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: brandColors.orange,
            },
          },
        },
      },
    },

    // ── Chip ──────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          fontWeight: 800,
          fontSize: '0.76rem',
        },
      },
    },

    // ── Avatar ────────────────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: `2.5px solid rgba(255,255,255,0.9)`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        },
      },
    },

    // ── Switch — orange accent ────────────────────────────────────────
    MuiSwitch: {
      styleOverrides: {
        root: {},
        switchBase: {
          '&.Mui-checked': {
            color: brandColors.orange,
            '& + .MuiSwitch-track': {
              backgroundColor: brandColors.orange,
              opacity: 1,
            },
          },
        },
      },
    },

    // ── Drawer ────────────────────────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          background: brandColors.white,
          borderRight: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },

    // ── Dialog ────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          background: brandColors.white,
        },
      },
    },

    // ── Tab ───────────────────────────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 800,
          fontSize: '0.9rem',
        },
      },
    },

    // ── Progress ──────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 100, height: 10 },
        bar:  { borderRadius: 100 },
      },
    },

    // ── Alert ─────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 14 },
      },
    },

    // ── ListItemButton ────────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          transition: 'all 0.2s ease',
        },
      },
    },

    // ── AppBar ────────────────────────────────────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: brandColors.white,
          border: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        },
      },
    },

    // ── Table ─────────────────────────────────────────────────────────
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 900,
            fontSize: '0.75rem',
            color: brandColors.mediumGray,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            background: '#FAFAFA',
            borderBottom: '2px solid rgba(0,0,0,0.06)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { background: '#FFFBF5' },
          '&:last-child .MuiTableCell-body': { border: 0 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0,0,0,0.05)',
          padding: '12px 16px',
        },
      },
    },
  },
});

export { brandColors };
export default theme;
