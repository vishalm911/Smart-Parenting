import {
  Box, Typography, Grid, Card, CardContent, Button, Avatar, Chip, LinearProgress,
  Paper, List, ListItem, ListItemButton, ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  MonetizationOn as CoinIcon,
  Notifications as NotifIcon,
  TrendingUp as TrendingIcon,
  ChildCare as ChildIcon,
  LocalFireDepartment as StreakIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChildProfile } from '../../context/ChildProfileContext';
import { useNotifications } from '../../context/NotificationContext';
import { getGreeting, getAvatarEmoji, timeAgo } from '../../utils/helpers';
import AgeGroupBadge from '../../components/shared/AgeGroupBadge';
import ActivityCard from '../../components/shared/ActivityCard';
import ProgressRing from '../../components/shared/ProgressRing';

const recentActivities = [
  { title: 'Alphabet Forest', description: 'Completed letter recognition', progress: 100, image: '🌲', category: 'Literacy', coins: 80,  difficulty: 'Easy'   },
  { title: 'Number Safari',   description: 'Counting 1-20',                progress: 65,  image: '🦁', category: 'Math',    coins: 100, difficulty: 'Medium' },
  { title: 'Color Splash',    description: 'Learning primary colors',       progress: 30,  image: '🎨', category: 'Art',     coins: 60,  difficulty: 'Easy'   },
];

// No hardcoded child data — all profiles come from Firestore via ChildProfileContext.

const LEVEL_COLORS = {
  Seedling:     { color: '#22C55E', bg: '#F0FFF4', border: 'rgba(74,222,128,0.4)'   },
  Explorer:     { color: '#3B82F6', bg: '#EFF6FF', border: 'rgba(147,197,253,0.4)'  },
  'Star Learner': { color: '#F5A623', bg: '#FFF8E1', border: 'rgba(245,166,35,0.4)' },
  Champion:     { color: '#9F7AEA', bg: '#F5F3FF', border: 'rgba(216,180,254,0.4)'  },
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userAccount } = useAuth();
  const { childProfiles, coinCount } = useChildProfile();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const greeting     = getGreeting();
  const displayName  = currentUser?.displayName || userAccount?.displayName || 'Parent';
  // Always use real Firestore profiles — never merge or fall back to fake data.
  const displayProfiles = childProfiles;

  const statItems = [
    { label: 'Children',         value: childProfiles.length, icon: '👧',  color: '#3B82F6', bg: '#EFF6FF', border: 'rgba(59,130,246,0.2)'   },
    { label: 'Total Coins',      value: coinCount,            icon: '🪙',  color: '#D97706', bg: '#FFF8E1', border: 'rgba(245,166,35,0.25)'  },
    { label: 'Activities Done',  value: 12,                   icon: '🎯',  color: '#22C55E', bg: '#F0FFF4', border: 'rgba(34,197,94,0.2)'    },
    { label: 'Notifications',    value: unreadCount || 0,     icon: '🔔',  color: '#9F7AEA', bg: '#F5F3FF', border: 'rgba(139,92,246,0.2)'   },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Welcome Header ── */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5, lineHeight: 1.2, fontFamily: '"Nunito", sans-serif' }}>
          {greeting}, <span style={{ color: '#3BB77E' }}>{displayName}</span>! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ fontFamily: '"Nunito", sans-serif' }}>
          Here's what's happening with your children's learning journey. 🌱
        </Typography>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {statItems.map((stat, i) => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Box sx={{
              p: { xs: 2.5, sm: 3 }, borderRadius: '22px',
              bgcolor: stat.bg,
              border: `1.5px solid ${stat.border}`,
              borderTop: `4px solid ${stat.color}`,
              boxShadow: `0 4px 20px ${stat.border}, 0 1px 4px rgba(0,0,0,0.04)`,
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              animation: `popIn 0.5s ease-out ${i * 0.08}s both`,
              '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 14px 36px ${stat.border}` },
            }}>
              <Typography sx={{ fontSize: { xs: '2rem', sm: '2.4rem' }, mb: 1, lineHeight: 1 }}>{stat.icon}</Typography>
              <Typography variant="h3" fontWeight={900} sx={{ color: stat.color, lineHeight: 1, fontFamily: '"Nunito", sans-serif', fontSize: { xs: '1.8rem', sm: '2.2rem' } }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ fontSize: '0.72rem', mt: 0.5, display: 'block' }}>
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>

        {/* ── LEFT: Child Cards + Activity ── */}
        <Grid size={{ xs: 12, md: 8 }}>

          {/* Child Profiles */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', mb: 3, border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" fontWeight={900} sx={{ fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>👧 Child Profiles</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>Track your children's adventures</Typography>
              </Box>
              <Button
                startIcon={<AddIcon />} variant="contained" size="small"
                onClick={() => navigate('/parent/children')}
                sx={{
                  borderRadius: 50, px: 2,
                  background: 'linear-gradient(135deg, #FF9500 0%, #FFC107 100%)',
                  fontWeight: 900,
                  boxShadow: '0 4px 14px rgba(255,149,0,0.4)',
                  '&:hover': { boxShadow: '0 8px 20px rgba(255,149,0,0.55)' },
                }}
              >
                Add Child
              </Button>
            </Box>

            {displayProfiles.length === 0 ? (
              /* ── Empty state — no Firestore profiles yet ── */
              <Box
                sx={{
                  textAlign: 'center', py: 5, px: 2,
                  border: '2px dashed rgba(245,166,35,0.35)',
                  borderRadius: '20px', bgcolor: '#FAFAFA',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  '&:hover': { borderColor: '#F5A623', bgcolor: '#FFF8E1' },
                }}
                onClick={() => navigate('/parent/children')}
              >
                <Typography sx={{ fontSize: '3rem', mb: 1.5 }}>👧</Typography>
                <Typography variant="subtitle1" fontWeight={900} color="text.secondary" sx={{ mb: 0.5 }}>
                  No child profiles yet
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 2 }}>
                  Add your first child to start tracking their learning journey!
                </Typography>
                <Button
                  startIcon={<AddIcon />} variant="contained" size="small"
                  onClick={(e) => { e.stopPropagation(); navigate('/parent/children'); }}
                  sx={{
                    borderRadius: 50, px: 3,
                    background: 'linear-gradient(135deg, #FF9500 0%, #FFC107 100%)',
                    fontWeight: 900,
                    boxShadow: '0 4px 14px rgba(255,149,0,0.4)',
                    '&:hover': { boxShadow: '0 8px 20px rgba(255,149,0,0.55)' },
                  }}
                >
                  Add First Child
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2} alignItems="stretch">
                {displayProfiles.map((child, i) => {
                  const levelStyle = LEVEL_COLORS[child.level] || LEVEL_COLORS.Explorer;
                  return (
                    <Grid size={{ xs: 12, sm: 4 }} key={child.id} sx={{ display: 'flex' }}>
                      <Card
                        onClick={() => navigate('/parent/children')}
                        elevation={0}
                        sx={{
                          borderRadius: '20px', cursor: 'pointer', width: '100%',
                          bgcolor: '#FFFFFF',
                          border: `1.5px solid ${levelStyle.border}`,
                          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                          transition: 'all 0.25s ease',
                          animation: `slideInUp 0.4s ease-out ${i * 0.1}s both`,
                          '&:hover': {
                            borderColor: `${levelStyle.color}50`,
                            transform: 'translateY(-4px)',
                            boxShadow: `0 10px 28px ${levelStyle.color}20`,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                          {/* Avatar with glow ring */}
                          <Box sx={{ position: 'relative', display: 'inline-block', mb: 1.5 }}>
                            <Box sx={{
                              position: 'absolute', inset: -5, borderRadius: '50%',
                              background: `conic-gradient(${levelStyle.color}, rgba(255,255,255,0) 60%, ${levelStyle.color})`,
                              opacity: 0.5, animation: 'spin 6s linear infinite',
                            }} />
                            <Box sx={{
                              width: 72, height: 72, borderRadius: '50%',
                              background: `linear-gradient(135deg, ${levelStyle.color}30, ${levelStyle.color}15)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '2rem', position: 'relative', zIndex: 1,
                              border: `3px solid rgba(255,255,255,0.9)`,
                              boxShadow: `0 4px 14px ${levelStyle.color}35`,
                            }}>
                              {getAvatarEmoji(child.avatar)}
                            </Box>
                          </Box>

                          <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 0.5 }}>
                            {child.name}
                          </Typography>

                          {/* Level badge */}
                          <Box sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.5,
                            px: 1.5, py: 0.3, borderRadius: 10, mb: 0.75,
                            bgcolor: levelStyle.bg,
                            border: `1.5px solid ${levelStyle.border}`,
                          }}>
                            <SparkleIcon sx={{ fontSize: 12, color: levelStyle.color }} />
                            <Typography variant="caption" fontWeight={900} sx={{ color: levelStyle.color, fontSize: '0.66rem' }}>
                              {child.level || 'Explorer'}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 1 }}>
                            <AgeGroupBadge ageGroup={child.age_group} />
                          </Box>

                          {/* Progress bar */}
                          <Box sx={{ mb: 1.25 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.6rem' }}>Progress</Typography>
                              <Typography variant="caption" fontWeight={900} sx={{ color: levelStyle.color, fontSize: '0.6rem' }}>
                                {child.progress || 0}%
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={child.progress || 0} sx={{
                              height: 8, borderRadius: 100,
                              bgcolor: `${levelStyle.color}15`,
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, ${levelStyle.color}, ${levelStyle.color}CC)`,
                                borderRadius: 100,
                              },
                            }} />
                          </Box>

                          {/* Coin + streak */}
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Box sx={{
                              display: 'flex', alignItems: 'center', gap: 0.4,
                              bgcolor: 'rgba(255,248,220,0.9)', borderRadius: 10, px: 1, py: 0.3,
                              border: '1px solid rgba(255,193,7,0.4)',
                            }}>
                              <Typography sx={{ fontSize: '0.75rem' }}>🪙</Typography>
                              <Typography variant="caption" fontWeight={900} sx={{ color: '#D97706', fontSize: '0.65rem' }}>
                                {child.coin_count || 0}
                              </Typography>
                            </Box>
                            <Box sx={{
                              display: 'flex', alignItems: 'center', gap: 0.4,
                              bgcolor: 'rgba(255,237,237,0.9)', borderRadius: 10, px: 1, py: 0.3,
                              border: '1px solid rgba(239,68,68,0.3)',
                            }}>
                              <Typography sx={{ fontSize: '0.75rem' }}>🔥</Typography>
                              <Typography variant="caption" fontWeight={900} sx={{ color: '#DC2626', fontSize: '0.65rem' }}>
                                {child.streak || 0}d
                              </Typography>
                            </Box>
                          </Box>

                          {child.lastActivity && (
                            <Typography variant="caption" color="text.secondary"
                              sx={{ mt: 1, display: 'block', fontWeight: 700, fontSize: '0.6rem' }}>
                              📚 {child.lastActivity}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>

          {/* Recent Activity */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2.5, fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>⚡ Recent Activity</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {recentActivities.map((act) => (
                <ActivityCard key={act.title} {...act} variant="compact" />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* ── RIGHT: Progress Ring + Notifications ── */}
        <Grid size={{ xs: 12, md: 4 }}>

          {/* Overall Progress */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', mb: 3, textAlign: 'center', border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 0.5, fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>📊 Family Progress</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 2 }}>
              Combined weekly learning goal
            </Typography>
            <ProgressRing value={65} size={140} color="#3BB77E" />
            <Typography variant="h6" fontWeight={900} sx={{ mt: 2, color: '#3BB77E' }}>65% Complete!</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              🚀 Great progress this week! Keep it up!
            </Typography>
          </Paper>

          {/* Notifications */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" fontWeight={900} sx={{ fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>🔔 Notifications</Typography>
              {unreadCount > 0 && (
                <Box sx={{
                  px: 1.25, py: 0.3, borderRadius: 10,
                  bgcolor: 'rgba(255,149,0,0.12)',
                  border: '1px solid rgba(255,149,0,0.3)',
                }}>
                  <Typography variant="caption" fontWeight={900} sx={{ color: '#FF9500', fontSize: '0.65rem' }}>
                    {unreadCount} new
                  </Typography>
                </Box>
              )}
            </Box>

            {notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>✨</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={700}>All caught up!</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {notifications.slice(0, 5).map((notif, i) => (
                  <ListItem key={notif.id || i} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => markAsRead(notif.id)}
                      sx={{
                        borderRadius: '14px', px: 1.5, py: 1,
                        bgcolor: notif.read_status ? 'transparent' : 'rgba(255,149,0,0.06)',
                        borderLeft: notif.read_status ? '3px solid transparent' : '3px solid #FF9500',
                        '&:hover': { bgcolor: 'rgba(255,149,0,0.1)' },
                      }}
                    >
                      <ListItemText
                        primary={notif.message}
                        secondary={timeAgo(notif.created_at)}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: notif.read_status ? 500 : 700, fontSize: '0.8rem', lineHeight: 1.4 }}
                        secondaryTypographyProps={{ variant: 'caption', fontSize: '0.65rem' }}
                      />
                      {!notif.read_status && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF9500', flexShrink: 0, boxShadow: '0 0 6px rgba(255,149,0,0.6)' }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentDashboard;
