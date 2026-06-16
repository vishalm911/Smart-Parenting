import { Box, Typography, Paper, Switch, Chip, Divider, Alert } from '@mui/material';
import { useApp } from '../../context/AppContext';

const FLAG_META = [
  { key: 'enableChildDashboard',    label: 'Child Dashboard',       desc: 'Enable the child learning dashboard',             category: 'Features',       emoji: '🏠' },
  { key: 'enableTeacherDashboard',  label: 'Teacher Dashboard',     desc: 'Enable the teacher management dashboard',         category: 'Features',       emoji: '👩‍🏫' },
  { key: 'enableNotifications',     label: 'Notifications System',  desc: 'Enable in-app notifications for all users',       category: 'Features',       emoji: '🔔' },
  { key: 'enableCoinRewards',       label: 'Coin Rewards',          desc: 'Enable coin reward system for children',          category: 'Gamification',   emoji: '🪙' },
  { key: 'enableAvatarCustomization', label: 'Avatar Customization', desc: 'Allow children to customize their avatars',      category: 'Gamification',   emoji: '🎭' },
  { key: 'enableGoogleSignIn',      label: 'Google Sign-In',        desc: 'Enable Google OAuth for login',                   category: 'Authentication', emoji: '🔑' },
  { key: 'maintenanceMode',         label: 'Maintenance Mode',      desc: '⚠️ Show maintenance page to all users',           category: 'System',         emoji: '⚙️' },
];

const CATEGORY_STYLE = {
  Features:       { bg: '#EFF6FF', color: '#3B82F6', border: 'rgba(59,130,246,0.25)'  },
  Gamification:   { bg: '#FFF8E1', color: '#F5A623', border: 'rgba(245,166,35,0.25)'  },
  Authentication: { bg: '#F5F3FF', color: '#8B5CF6', border: 'rgba(139,92,246,0.25)'  },
  System:         { bg: '#F0FFF4', color: '#22C55E', border: 'rgba(34,197,94,0.25)'   },
};

const FeatureFlags = () => {
  const { featureFlags, updateFeatureFlag } = useApp();
  const categories   = [...new Set(FLAG_META.map((f) => f.category))];
  const enabledCount = FLAG_META.filter((f) => featureFlags[f.key]).length;

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.01em' }}>Feature Flags 🚩</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Toggle features on or off across the platform
          </Typography>
        </Box>
        <Box sx={{
          px: 2, py: 1, borderRadius: '12px',
          bgcolor: '#F0FFF4', border: '1.5px solid rgba(34,197,94,0.3)',
          textAlign: 'center',
        }}>
          <Typography variant="h6" fontWeight={900} sx={{ color: '#22C55E', lineHeight: 1 }}>{enabledCount}</Typography>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#22C55E', letterSpacing: '0.05em' }}>
            OF {FLAG_META.length} ON
          </Typography>
        </Box>
      </Box>

      {featureFlags.maintenanceMode && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          ⚠️ <strong>Maintenance Mode is ON.</strong> All users will see the maintenance screen.
        </Alert>
      )}

      {categories.map((category) => {
        const catStyle = CATEGORY_STYLE[category] || CATEGORY_STYLE.Features;
        return (
          <Paper key={category} elevation={0} sx={{ borderRadius: '20px', mb: 2.5, overflow: 'hidden' }}>
            {/* Category header */}
            <Box sx={{
              px: 3, py: 1.5,
              bgcolor: catStyle.bg,
              borderBottom: `1.5px solid ${catStyle.border}`,
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <Typography variant="subtitle1" fontWeight={900} sx={{ color: catStyle.color, letterSpacing: '-0.01em' }}>{category}</Typography>
              <Chip
                label={`${FLAG_META.filter((f) => f.category === category && featureFlags[f.key]).length} active`}
                size="small"
                sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: 'white', color: catStyle.color, border: `1px solid ${catStyle.border}` }}
              />
            </Box>

            {FLAG_META.filter((f) => f.category === category).map((flag, i, arr) => {
              const enabled = !!featureFlags[flag.key];
              const isDanger = flag.key === 'maintenanceMode';
              return (
                <Box key={flag.key}>
                  <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    px: 3, py: 2,
                    bgcolor: isDanger && enabled ? 'rgba(239,68,68,0.04)' : 'transparent',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: '#FFFBF5' },
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        bgcolor: enabled ? catStyle.bg : '#F9FAFB',
                        border: `1.5px solid ${enabled ? catStyle.border : 'rgba(0,0,0,0.06)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', transition: 'all 0.2s ease',
                      }}>
                        {flag.emoji}
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.2 }}>
                          <Typography variant="subtitle2" fontWeight={700}>{flag.label}</Typography>
                          {isDanger && enabled && (
                            <Chip label="DANGER" size="small" sx={{ fontWeight: 900, fontSize: '0.6rem', bgcolor: '#FFF5F5', color: '#EF4444' }} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">{flag.desc}</Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={enabled}
                      onChange={() => updateFeatureFlag(flag.key, !enabled)}
                      color={isDanger ? 'error' : 'primary'}
                      sx={isDanger ? {} : {
                        '& .MuiSwitch-switchBase.Mui-checked': { color: catStyle.color },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: catStyle.color },
                      }}
                    />
                  </Box>
                  {i < arr.length - 1 && <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)', mx: 3 }} />}
                </Box>
              );
            })}
          </Paper>
        );
      })}
    </Box>
  );
};

export default FeatureFlags;
