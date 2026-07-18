import { Box, Typography, Grid, Card, CardActionArea, CardContent, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MonetizationOn as CoinIcon } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useChildProfile } from '../../context/ChildProfileContext';
import { getAvatarEmoji } from '../../utils/helpers';
import AgeGroupBadge from '../../components/shared/AgeGroupBadge';

const SwitchChild = () => {
  const navigate = useNavigate();
  const { childProfiles, activeChild, selectChild } = useChildProfile();

  const profiles = childProfiles.length > 0 ? childProfiles : [
    { _id: '1', name: 'Darwin', avatar: 'avatar1', age_group: '4-6', coin_count: 850 },
    { _id: '2', name: 'Aria', avatar: 'avatar8', age_group: '7-10', coin_count: 1200 },
    { _id: '3', name: 'Luna', avatar: 'avatar11', age_group: '1-3', coin_count: 320 },
  ];

  const handleSwitch = (profile) => {
    selectChild(profile);
    navigate('/parent/dashboard');
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
          Switch Child Profile 🔄
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a profile to view their dashboard
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        {profiles.map((profile, index) => {
          const isActive = (activeChild?._id || activeChild?.id) === (profile._id || profile.id);
          return (
            <Grid size={{ xs: 12, sm: 4 }} key={profile._id || profile.id} sx={{ display: 'flex' }}>
              <Card sx={{
                borderRadius: 4, border: '3px solid',
                borderColor: isActive ? 'secondary.main' : 'divider',
                background: isActive ? 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)' : 'white',
                transition: 'all 0.3s ease',
                animation: `slideInUp 0.4s ease-out ${index * 0.1}s both`,
                width: '100%',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                '&:hover': { transform: 'scale(1.04)', boxShadow: 4 },
              }}>
                <CardActionArea onClick={() => handleSwitch(profile)} sx={{ p: 0 }}>
                  <CardContent sx={{ textAlign: 'center', py: 3.5 }}>
                    {isActive && (
                      <Chip label="Active" size="small" sx={{
                        mb: 1.5, bgcolor: 'secondary.main', color: 'white', fontWeight: 700, fontSize: '0.7rem',
                      }} />
                    )}
                    <Box sx={{
                      width: 80, height: 80, borderRadius: '50%',
                      bgcolor: isActive ? 'secondary.main' : '#F5F7FA',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mx: 'auto', mb: 2, fontSize: '2.5rem', transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 4px 16px rgba(245, 166, 35, 0.4)' : 'none',
                    }}>
                      {getAvatarEmoji(profile.avatar)}
                    </Box>
                    <Typography variant="h6" fontWeight={700}>{profile.name}</Typography>
                    <Box sx={{ my: 1 }}><AgeGroupBadge ageGroup={profile.age_group} /></Box>
                    <Chip
                      icon={<CoinIcon sx={{ color: '#FFC107 !important', fontSize: 16 }} />}
                      label={profile.coin_count} size="small"
                      sx={{ bgcolor: '#FFF8E1', fontWeight: 700, color: '#F5A623' }}
                    />
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/parent/dashboard')} sx={{ color: 'text.secondary' }}>
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default SwitchChild;
