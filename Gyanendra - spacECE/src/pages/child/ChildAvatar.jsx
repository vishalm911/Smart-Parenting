import { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Chip, Alert } from '@mui/material';
import { CheckCircle as CheckIcon, Save as SaveIcon } from '@mui/icons-material';
import { useChildProfile } from '../../context/ChildProfileContext';
import { AVATARS } from '../../firebase/childProfileService';

const colorThemes = [
  { id: 'cosmic',  label: 'Cosmic Blue',  bg: '#1F3A68', accent: '#4299E1', emoji: '🌌' },
  { id: 'sunset',  label: 'Sunset Gold',  bg: '#B7791F', accent: '#FFC107', emoji: '🌅' },
  { id: 'forest',  label: 'Forest Green', bg: '#276749', accent: '#48BB78', emoji: '🌿' },
  { id: 'galaxy',  label: 'Galaxy Purple',bg: '#553C9A', accent: '#9F7AEA', emoji: '🔮' },
  { id: 'cherry',  label: 'Cherry Red',   bg: '#9B2335', accent: '#FC8181', emoji: '🍒' },
];

const ChildAvatar = () => {
  const { activeChild, updateChildProfile } = useChildProfile();
  const [selectedAvatar, setSelectedAvatar] = useState(activeChild?.avatar || 'avatar1');
  const [selectedTheme,  setSelectedTheme]  = useState('cosmic');
  const [saved,          setSaved]          = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [hoveredAvatar,  setHoveredAvatar]  = useState(null);

  const currentTheme      = colorThemes.find((t) => t.id === selectedTheme) || colorThemes[0];
  const currentAvatarData = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];

  const handleSave = async () => {
    setLoading(true);
    if (activeChild?.id) {
      await updateChildProfile(activeChild.id, { avatar: selectedAvatar });
    }
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" fontWeight={900} sx={{ mb: 0.25, letterSpacing: '-0.015em' }}>
          🧑‍🎨 Create Your Avatar
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Customize your learning companion! Make it uniquely yours. ✨
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: '16px', fontWeight: 800 }}>
          🎉 Avatar saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>

        {/* ── Preview card ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{
            p: 4, borderRadius: '28px', textAlign: 'center',
            position: 'sticky', top: 80,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255,255,255,0.7)',
            boxShadow: '0 8px 40px rgba(31,58,104,0.1)',
          }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 3 }}>👁️ Preview</Typography>

            {/* Avatar ring */}
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2.5 }}>
              {/* Outer glow ring */}
              <Box sx={{
                position: 'absolute', inset: -8,
                borderRadius: '50%',
                background: `conic-gradient(${currentTheme.accent}, ${currentTheme.bg}, ${currentTheme.accent})`,
                animation: 'spin 6s linear infinite',
                opacity: 0.6,
              }} />
              {/* Avatar circle */}
              <Box sx={{
                width: 140, height: 140, borderRadius: '50%',
                background: `linear-gradient(135deg, ${currentTheme.bg} 0%, ${currentTheme.accent} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '4.5rem',
                border: '4px solid rgba(255,255,255,0.95)',
                boxShadow: `0 8px 32px ${currentTheme.accent}50`,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative', zIndex: 1,
                animation: 'pulse 3s ease-in-out infinite',
              }}>
                {currentAvatarData.emoji}
              </Box>
              {/* Sparkle decorations */}
              {['✨', '⭐', '💫'].map((s, i) => (
                <Box key={i} sx={{
                  position: 'absolute', fontSize: '1.1rem',
                  top: [`-10%`, '50%', '90%'][i],
                  right: [`10%`, '-14%', '15%'][i],
                  animation: `starPulse ${2.2 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                }}>{s}</Box>
              ))}
            </Box>

            <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>
              {activeChild?.name || 'Explorer'}
            </Typography>
            <Chip
              label={currentAvatarData.label}
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${currentTheme.bg}30, ${currentTheme.accent}20)`,
                color: currentTheme.accent, fontWeight: 800, mb: 3,
                border: `1.5px solid ${currentTheme.accent}40`,
                borderRadius: 10,
              }}
            />

            <Button
              fullWidth variant="contained" size="large"
              startIcon={loading ? null : <SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{
                borderRadius: 50, py: 1.5, fontWeight: 900,
                background: `linear-gradient(135deg, ${currentTheme.bg} 0%, ${currentTheme.accent} 100%)`,
                boxShadow: `0 6px 20px ${currentTheme.accent}40`,
                '&:hover': {
                  boxShadow: `0 10px 28px ${currentTheme.accent}55`,
                },
              }}
            >
              {loading ? 'Saving... 💾' : 'Save Avatar 🎨'}
            </Button>
          </Box>
        </Grid>

        {/* ── Customization options ── */}
        <Grid size={{ xs: 12, md: 8 }}>

          {/* Avatar selection */}
          <Box sx={{
            p: 3, borderRadius: '24px', mb: 3,
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255,255,255,0.7)',
            boxShadow: '0 4px 20px rgba(31,58,104,0.08)',
          }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2.5, letterSpacing: '-0.01em' }}>
              👤 Choose Your Character
            </Typography>
            <Grid container spacing={1.5}>
              {AVATARS.map((av, i) => {
                const isSelected = selectedAvatar === av.id;
                const isHovered  = hoveredAvatar === av.id;
                return (
                  <Grid size={{ xs: 4, sm: 3, md: 3 }} key={av.id}>
                    <Box
                      onClick={() => setSelectedAvatar(av.id)}
                      onMouseEnter={() => setHoveredAvatar(av.id)}
                      onMouseLeave={() => setHoveredAvatar(null)}
                      sx={{
                        position: 'relative', textAlign: 'center',
                        cursor: 'pointer', p: 1.5, borderRadius: '18px',
                        width: '100%', minWidth: 72, boxSizing: 'border-box',
                        border: `2.5px solid ${isSelected ? currentTheme.accent : isHovered ? `${currentTheme.accent}60` : 'rgba(226,232,240,0.6)'}`,
                        background: isSelected
                          ? `linear-gradient(135deg, ${currentTheme.bg}15, ${currentTheme.accent}10)`
                          : isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(248,250,252,0.8)',
                        fontSize: '2.2rem', lineHeight: 1.3,
                        transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: isSelected ? `0 6px 18px ${currentTheme.accent}35` : 'none',
                        animation: `slideInUp 0.4s ease-out ${i * 0.03}s both`,
                      }}
                    >
                      {isSelected && (
                        <CheckIcon sx={{
                          position: 'absolute', top: -8, right: -8, fontSize: 20,
                          color: currentTheme.accent, bgcolor: 'white', borderRadius: '50%',
                          boxShadow: `0 2px 8px ${currentTheme.accent}40`,
                          animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }} />
                      )}
                      {av.emoji}
                      <Typography variant="caption" display="block"
                        sx={{
                          mt: 0.5, fontSize: '0.65rem',
                          fontWeight: 700,
                          color: isSelected ? currentTheme.accent : 'text.secondary',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: 1.25,
                        }}>
                        {av.label}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Color theme */}
          <Box sx={{
            p: 3, borderRadius: '24px',
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255,255,255,0.7)',
            boxShadow: '0 4px 20px rgba(31,58,104,0.08)',
          }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2.5, letterSpacing: '-0.01em' }}>
              🎨 Choose Your Theme
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {colorThemes.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <Box
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    sx={{
                      cursor: 'pointer', borderRadius: '18px',
                      overflow: 'hidden',
                      border: `3px solid ${isSelected ? theme.accent : 'rgba(255,255,255,0.6)'}`,
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': { transform: 'scale(1.06) translateY(-3px)' },
                      boxShadow: isSelected ? `0 6px 20px ${theme.accent}45` : '0 2px 8px rgba(31,58,104,0.1)',
                      transform: isSelected ? 'scale(1.06) translateY(-3px)' : 'scale(1)',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{
                      width: 90, height: 56,
                      background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.accent} 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>
                      {theme.emoji}
                    </Box>
                    <Box sx={{
                      p: 1, textAlign: 'center',
                      bgcolor: isSelected ? `${theme.accent}15` : 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(8px)',
                    }}>
                      <Typography variant="caption" fontWeight={900}
                        sx={{ color: isSelected ? theme.accent : 'text.primary', fontSize: '0.65rem' }}>
                        {theme.label}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <Box sx={{
                        position: 'absolute', top: 6, right: 6,
                        width: 20, height: 20, borderRadius: '50%',
                        bgcolor: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 2px 6px ${theme.accent}50`,
                      }}>
                        <CheckIcon sx={{ fontSize: 13, color: 'white' }} />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChildAvatar;
