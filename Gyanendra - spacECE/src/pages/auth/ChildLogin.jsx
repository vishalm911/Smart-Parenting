import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../context/AuthContext';
import { useChildProfile } from '../../context/ChildProfileContext';
import { getAvatarEmoji } from '../../utils/helpers';
import SpacECELogo from '../../components/shared/SpacECELogo';

const ageGroupData = {
  '1-3':  {
    label: 'Ages 1–3', subtitle: 'Tiny Explorers',
    emoji: '🐣', icon: '🍼',
    color: '#F472B6', bg: 'linear-gradient(135deg, #FDE8F4 0%, #FBCFE8 100%)',
    border: '#F9A8D4', accent: '#EC4899', glow: 'rgba(236,72,153,0.35)',
    stars: '⭐',
  },
  '4-6':  {
    label: 'Ages 4–6', subtitle: 'Curious Cubs',
    emoji: '🐻', icon: '🎨',
    color: '#34D399', bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    border: '#6EE7B7', accent: '#059669', glow: 'rgba(5,150,105,0.35)',
    stars: '⭐⭐',
  },
  '7-10': {
    label: 'Ages 7–10', subtitle: 'Star Voyagers',
    emoji: '🚀', icon: '🔭',
    color: '#60A5FA', bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
    border: '#93C5FD', accent: '#3B82F6', glow: 'rgba(59,130,246,0.35)',
    stars: '⭐⭐⭐',
  },
};

const ChildLogin = () => {
  const navigate = useNavigate();
  const { loginAsChild } = useAuth();
  const { childProfiles, loading } = useChildProfile();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [hoveredAge, setHoveredAge] = useState(null);

  const handleContinue = () => {
    if (selectedProfile) {
      loginAsChild(selectedProfile);
      navigate('/child/dashboard');
    }
  };

  return (
    <Box sx={{
      maxWidth: 600, width: '100%', textAlign: 'center',
      animation: 'fadeIn 0.5s ease-out',
      mx: 'auto',
    }}>

      {/* ── Logo header ── */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <SpacECELogo variant="glass" width={130} />
      </Box>

      <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5, color: '#111111' }}>
        Who's Learning Today? 🎒
      </Typography>
      <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ mb: 3 }}>
        Pick your explorer profile to start the adventure!
      </Typography>

      {/* ── Loading ── */}
      {loading ? (
        <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={44} sx={{ color: '#FF9500' }} />
          <Typography variant="body2" color="text.secondary" fontWeight={700}>Loading profiles...</Typography>
        </Box>

      ) : childProfiles.length === 0 ? (
        /* ── Empty State ── */
        <Box sx={{
          p: 5, borderRadius: '28px', mb: 3,
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(16px)',
          border: '2px dashed rgba(255,149,0,0.4)',
          boxShadow: '0 8px 32px rgba(31,58,104,0.1)',
        }}>
          <Typography sx={{ fontSize: '3.5rem', mb: 2, animation: 'bounce 2s ease-in-out infinite' }}>🌱</Typography>
          <Typography variant="h6" fontWeight={900} sx={{ mb: 1, color: '#1F3A68' }}>
            No Profiles Yet!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 320, mx: 'auto', fontWeight: 600 }}>
            Ask your parent to log in and create a child profile under{' '}
            <strong>Children → Add Child</strong>.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login/parent')}
            sx={{
              borderRadius: 50, px: 4, py: 1.4,
              background: 'linear-gradient(135deg, #3BB77E, #6EE7B7)',
              fontWeight: 800,
            }}
          >
            Parent Login
          </Button>
        </Box>

      ) : (
        /* ── Profile Cards ── */
        <Grid container spacing={2} sx={{ mb: 3 }} alignItems="stretch">
          {childProfiles.map((profile, index) => {
            const ageData = ageGroupData[profile.age_group] || ageGroupData['4-6'];
            const isSelected = selectedProfile?.id === profile.id;

            return (
              <Grid size={{ xs: 12, sm: 4 }} key={profile.id} sx={{ display: 'flex' }}>
                <Box
                  onClick={() => setSelectedProfile(profile)}
                  sx={{
                    width: '100%', borderRadius: '24px', cursor: 'pointer',
                    background: isSelected
                      ? ageData.bg
                      : 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `2.5px solid ${isSelected ? ageData.accent : 'rgba(255,255,255,0.7)'}`,
                    p: 2.5, textAlign: 'center',
                    boxShadow: isSelected
                      ? `0 12px 36px ${ageData.glow}`
                      : '0 4px 16px rgba(31,58,104,0.08)',
                    transform: isSelected ? 'scale(1.05) translateY(-6px)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animation: `slideInUp 0.4s ease-out ${index * 0.12}s both`,
                    position: 'relative', overflow: 'hidden',
                    '&:hover': {
                      transform: isSelected ? 'scale(1.05) translateY(-6px)' : 'translateY(-4px)',
                      boxShadow: `0 10px 28px ${ageData.glow}`,
                    },
                  }}
                >
                  {isSelected && (
                    <CheckCircleIcon sx={{
                      position: 'absolute', top: 10, right: 10,
                      fontSize: 22, color: ageData.accent,
                      bgcolor: 'white', borderRadius: '50%',
                      boxShadow: `0 2px 8px ${ageData.glow}`,
                      animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }} />
                  )}

                  {/* Age group badge */}
                  <Box sx={{
                    display: 'inline-block', px: 2, py: 0.5, borderRadius: 10, mb: 2,
                    bgcolor: `${ageData.accent}20`,
                    border: `1.5px solid ${ageData.border}`,
                  }}>
                    <Typography variant="caption" fontWeight={900} sx={{ color: ageData.accent, fontSize: '0.72rem' }}>
                      {ageData.stars} {ageData.label}
                    </Typography>
                  </Box>

                  {/* Avatar circle with glow */}
                  <Box sx={{
                    width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 1.5,
                    background: isSelected
                      ? `linear-gradient(135deg, ${ageData.accent} 0%, ${ageData.color} 100%)`
                      : 'linear-gradient(135deg, #E8F4FD 0%, #DBEAFE 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem',
                    boxShadow: isSelected ? `0 6px 20px ${ageData.glow}` : '0 2px 10px rgba(31,58,104,0.1)',
                    border: `3px solid ${isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)'}`,
                    transition: 'all 0.3s ease',
                    animation: isSelected ? 'pulse 2.5s ease-in-out infinite' : undefined,
                  }}>
                    {getAvatarEmoji(profile.avatar)}
                  </Box>

                  <Typography variant="h6" fontWeight={900} sx={{ mb: 0.25, color: isSelected ? ageData.accent : 'text.primary' }}>
                    {profile.name}
                  </Typography>
                  <Typography variant="caption" fontWeight={800} sx={{
                    color: ageData.accent, display: 'block', mb: 1,
                    bgcolor: `${ageData.accent}15`, borderRadius: 10, px: 1.5, py: 0.25, display: 'inline-block',
                  }}>
                    {ageData.subtitle}
                  </Typography>

                  {/* Coins */}
                  <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
                    bgcolor: 'rgba(255,193,7,0.12)', borderRadius: 10, px: 2, py: 0.5,
                    border: '1px solid rgba(255,193,7,0.3)',
                  }}>
                    <Typography sx={{ fontSize: '1rem' }}>🪙</Typography>
                    <Typography variant="caption" fontWeight={900} sx={{ color: '#D4891A', fontSize: '0.8rem' }}>
                      {profile.coin_count || 0} coins
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ── Continue Button ── */}
      {!loading && childProfiles.length > 0 && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!selectedProfile}
          onClick={handleContinue}
          startIcon={<RocketLaunchIcon />}
          sx={{
            py: 1.8, fontSize: '1.05rem', fontWeight: 900,
            borderRadius: 50, mb: 2,
            background: selectedProfile
              ? 'linear-gradient(135deg, #FF9500 0%, #FFC107 100%)'
              : undefined,
            color: selectedProfile ? 'white' : undefined,
            boxShadow: selectedProfile ? '0 8px 28px rgba(255,149,0,0.45)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              boxShadow: selectedProfile ? '0 14px 36px rgba(255,149,0,0.55)' : 'none',
            },
            '&.Mui-disabled': {
              background: 'rgba(255,255,255,0.5)', color: '#A0AEC0',
            },
          }}
        >
          {selectedProfile ? `Continue as ${selectedProfile.name} →` : 'Select Your Profile First 👆'}
        </Button>
      )}

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{
          color: '#1F3A68', fontWeight: 700,
          bgcolor: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: 50, px: 2.5,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' },
        }}
      >
        Back to Role Selection
      </Button>
    </Box>
  );
};

export default ChildLogin;
