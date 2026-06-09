import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SpacECELogo from '../../components/shared/SpacECELogo';

const roles = [
  {
    key: 'child',
    label: "I'm a Child!",
    subtitle: 'Ages 1–10',
    emoji: '🧒',
    description: 'Play games, earn coins & go on amazing learning adventures every day!',
    path: '/login/child',
    gradient: 'linear-gradient(145deg, #FFF3DC 0%, #FFE4A0 60%, #FFCC60 100%)',
    border: '#FFB84D',
    accent: '#FF9500',
    glow: 'rgba(255,149,0,0.35)',
    bg: 'rgba(255,248,220,0.9)',
    floatEmoji: ['⭐', '🎮', '🪙'],
    badgeBg: 'rgba(255,193,7,0.15)',
  },
  {
    key: 'parent',
    label: "I'm a Parent",
    subtitle: 'For Families',
    emoji: '👨‍👩‍👧',
    description: "Track your child's progress, manage profiles & celebrate achievements!",
    path: '/login/parent',
    gradient: 'linear-gradient(145deg, #DCFCE7 0%, #BBF7D0 60%, #86EFAC 100%)',
    border: '#4ADE80',
    accent: '#3BB77E',
    glow: 'rgba(59,183,126,0.35)',
    bg: 'rgba(220,252,231,0.9)',
    floatEmoji: ['❤️', '📊', '🌟'],
    badgeBg: 'rgba(59,183,126,0.15)',
  },
  {
    key: 'teacher',
    label: "I'm a Teacher",
    subtitle: 'For Educators',
    emoji: '👩‍🏫',
    description: 'Guide students, assign fun activities & watch little learners grow!',
    path: '/login/teacher',
    gradient: 'linear-gradient(145deg, #DBEAFE 0%, #BFDBFE 60%, #93C5FD 100%)',
    border: '#60A5FA',
    accent: '#4299E1',
    glow: 'rgba(66,153,225,0.35)',
    bg: 'rgba(219,234,254,0.9)',
    floatEmoji: ['📚', '✏️', '🎓'],
    badgeBg: 'rgba(66,153,225,0.15)',
  },
  {
    key: 'admin',
    label: 'Administrator',
    subtitle: 'Platform Admin',
    emoji: '🔐',
    description: 'Manage the platform, users, sessions & system settings securely.',
    path: '/login/admin',
    gradient: 'linear-gradient(145deg, #F3E8FF 0%, #E9D5FF 60%, #D8B4FE 100%)',
    border: '#C084FC',
    accent: '#9F7AEA',
    glow: 'rgba(159,122,234,0.35)',
    bg: 'rgba(243,232,255,0.9)',
    floatEmoji: ['⚙️', '🛡️', '📋'],
    badgeBg: 'rgba(159,122,234,0.15)',
  },
];

const RoleSelector = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [hovering, setHovering] = useState(null);

  const handleContinue = () => {
    if (selected) navigate(selected.path);
  };

  return (
    <Box sx={{
      maxWidth: 580, width: '100%',
      textAlign: 'center',
      animation: 'fadeIn 0.6s ease-out',
      px: { xs: 1, sm: 0 },
      mx: 'auto',
    }}>

      {/* ── Official SpacECE Logo — glassmorphism card ── */}
      <Box sx={{ mx: 'auto', mb: 3, display: 'flex', justifyContent: 'center' }}>
        <SpacECELogo variant="glass" width={160} />
      </Box>

      {/* ── Heading ── */}
      <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5, color: '#111111', lineHeight: 1.2 }}>
        Welcome to Spac<span style={{ color: '#F5A623' }}>ECE</span>
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
        Explore, Learn &amp; Grow Through Fun Adventures
      </Typography>
      <Typography variant="body2" sx={{
        color: '#FF9500', fontWeight: 800, mb: 3,
        display: 'inline-flex', alignItems: 'center', gap: 0.5,
        bgcolor: 'rgba(255,149,0,0.1)', px: 2, py: 0.5, borderRadius: 10,
      }}>
        ✨ Who are you today? Pick your role to begin!
      </Typography>

      {/* ── Role Cards: 2×2 Grid ── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        mb: 3,
      }}>
        {roles.map((role, index) => {
          const isSelected = selected?.key === role.key;
          const isHovered  = hovering === role.key;

          return (
            <Box
              key={role.key}
              onClick={() => setSelected(role)}
              onMouseEnter={() => setHovering(role.key)}
              onMouseLeave={() => setHovering(null)}
              sx={{
                borderRadius: '24px',
                cursor: 'pointer',
                background: isSelected ? role.gradient : `rgba(255,255,255,0.72)`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `2.5px solid ${isSelected ? role.accent : isHovered ? role.border + '80' : 'rgba(255,255,255,0.7)'}`,
                boxShadow: isSelected
                  ? `0 12px 36px ${role.glow}, 0 4px 12px rgba(0,0,0,0.06)`
                  : isHovered
                    ? `0 8px 24px ${role.glow}`
                    : '0 4px 16px rgba(31,58,104,0.08)',
                transform: isSelected
                  ? 'scale(1.04) translateY(-6px)'
                  : isHovered ? 'translateY(-5px)' : 'none',
                transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: `slideInUp 0.5s ease-out ${index * 0.09}s both`,
                p: { xs: 2, sm: 2.5 },
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <CheckCircleIcon sx={{
                  position: 'absolute', top: 10, right: 10,
                  fontSize: 22, color: role.accent,
                  bgcolor: 'white', borderRadius: '50%',
                  boxShadow: `0 2px 8px ${role.glow}`,
                  animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }} />
              )}

              {/* Background gradient on hover/select */}
              {(isSelected || isHovered) && (
                <Box sx={{
                  position: 'absolute', inset: 0, borderRadius: '22px',
                  background: role.gradient, opacity: isSelected ? 1 : 0.5,
                  zIndex: 0, transition: 'opacity 0.3s ease',
                }} />
              )}

              {/* Floating emoji decorations */}
              {role.floatEmoji.map((e, i) => (
                <Box key={i} sx={{
                  position: 'absolute', fontSize: '0.8rem', opacity: 0.18,
                  top: `${[8, 72, 42][i]}%`, right: `${[6, 9, 82][i]}%`,
                  animation: `twinkle ${2.8 + i * 0.6}s ease-in-out infinite`,
                  animationDelay: `${i * 0.7}s`,
                  zIndex: 1,
                }}>{e}</Box>
              ))}

              {/* Content */}
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                {/* Emoji */}
                <Box sx={{
                  fontSize: { xs: '2.8rem', sm: '3.4rem' }, mb: 1,
                  lineHeight: 1, display: 'block',
                  animation: isHovered ? 'wobble 0.7s ease-in-out' : 'none',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                }}>
                  {role.emoji}
                </Box>

                <Typography fontWeight={900} sx={{
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  color: isSelected ? role.accent : 'text.primary',
                  mb: 0.25, lineHeight: 1.2,
                }}>
                  {role.label}
                </Typography>

                <Typography variant="caption" sx={{
                  color: role.accent, fontWeight: 800,
                  display: 'block', mb: { xs: 0.25, sm: 0.5 },
                  fontSize: '0.7rem',
                  bgcolor: role.badgeBg,
                  borderRadius: 10, px: 1.5, py: 0.25,
                  display: 'inline-block',
                }}>
                  {role.subtitle}
                </Typography>

                <Typography variant="caption" sx={{
                  color: 'text.secondary', lineHeight: 1.4, fontWeight: 600,
                  display: { xs: 'none', sm: 'block' }, fontSize: '0.72rem',
                }}>
                  {role.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ── CTA Button ── */}
      <Button
        variant="contained"
        size="large"
        disabled={!selected}
        onClick={handleContinue}
        startIcon={<RocketLaunchIcon />}
        sx={{
          px: 5, py: 1.8, fontSize: '1.05rem', fontWeight: 900,
          borderRadius: 50, mb: 2.5,
          background: selected
            ? `linear-gradient(135deg, ${selected.accent} 0%, ${selected.border} 100%)`
            : 'linear-gradient(135deg, #CBD5E0 0%, #E2E8F0 100%)',
          color: selected ? 'white' : 'text.secondary',
          boxShadow: selected ? `0 8px 28px ${selected?.glow || 'rgba(0,0,0,0.15)'}` : 'none',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: selected ? 'scale(1.02)' : 'scale(1)',
          letterSpacing: '0.01em',
          '&:hover': {
            transform: selected ? 'scale(1.05) translateY(-3px)' : 'none',
            boxShadow: selected ? `0 14px 36px ${selected?.glow}` : 'none',
          },
          '&.Mui-disabled': {
            background: 'rgba(255,255,255,0.5)',
            color: '#A0AEC0',
            backdropFilter: 'blur(8px)',
          },
        }}
      >
        {selected
          ? `Start as ${selected.label.replace("I'm a ", '').replace("I'm ", '')} →`
          : 'Choose Your Role First 👆'}
      </Button>

      {/* ── Register link ── */}
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          New to SpacECE?{' '}
          <Typography
            component="span" variant="body2"
            sx={{
              color: '#FF9500', fontWeight: 900, cursor: 'pointer',
              bgcolor: 'rgba(255,149,0,0.1)', px: 1.5, py: 0.25, borderRadius: 10,
              '&:hover': { bgcolor: 'rgba(255,149,0,0.2)', textDecoration: 'underline' },
              transition: 'all 0.2s ease',
            }}
            onClick={() => navigate('/register')}
          >
            Create a free account →
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
};

export default RoleSelector;
