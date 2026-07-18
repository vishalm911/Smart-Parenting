import {
  Box, Typography, Grid, Paper, Avatar, Chip, List, ListItem, ListItemAvatar,
  ListItemText, Divider, LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon, People as PeopleIcon,
  EmojiEvents as TrophyIcon, TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getGreeting, getInitials } from '../../utils/helpers';
import ProgressRing from '../../components/shared/ProgressRing';

const classData = {
  students: 28,
  activitiesAssigned: 15,
  avgCompletion: 72,
  topPerformers: [
    { name: 'Arjun Sharma',  completion: 98, initials: 'AS' },
    { name: 'Priya Devi',    completion: 95, initials: 'PD' },
    { name: 'Riya Singh',    completion: 92, initials: 'RS' },
    { name: 'Karan Patel',   completion: 89, initials: 'KP' },
    { name: 'Meena Gupta',   completion: 86, initials: 'MG' },
  ],
  recentActivity: [
    { student: 'Arjun S.',  action: 'Completed Alphabet Forest', time: '5m ago',  emoji: '✅', color: '#22C55E' },
    { student: 'Priya D.',  action: 'Started Number Safari',     time: '12m ago', emoji: '▶️', color: '#3B82F6' },
    { student: 'Karan P.',  action: 'Earned 50 coins',           time: '30m ago', emoji: '🪙', color: '#D97706' },
    { student: 'Riya S.',   action: 'Unlocked Explorer badge',   time: '1h ago',  emoji: '🏆', color: '#9F7AEA' },
    { student: 'Meena G.',  action: 'Completed Color Splash',    time: '2h ago',  emoji: '✅', color: '#22C55E' },
  ],
  activityBreakdown: [
    { subject: 'Literacy', completion: 85, color: '#3B82F6', bg: '#EFF6FF', emoji: '📖' },
    { subject: 'Math',     completion: 70, color: '#D97706', bg: '#FFF8E1', emoji: '🔢' },
    { subject: 'Science',  completion: 65, color: '#22C55E', bg: '#F0FFF4', emoji: '🔬' },
    { subject: 'Art',      completion: 80, color: '#9F7AEA', bg: '#F5F3FF', emoji: '🎨' },
  ],
};

const MEDAL_STYLES = [
  { bg: 'linear-gradient(135deg, #FFD700, #FFA000)', shadow: 'rgba(255,193,7,0.5)',  label: '🥇' },
  { bg: 'linear-gradient(135deg, #C0C0C0, #9E9E9E)', shadow: 'rgba(192,192,192,0.5)', label: '🥈' },
  { bg: 'linear-gradient(135deg, #CD7F32, #8D5524)', shadow: 'rgba(205,127,50,0.5)',  label: '🥉' },
  { bg: 'linear-gradient(135deg, #4299E1, #1F3A68)', shadow: 'rgba(66,153,225,0.35)', label: '4' },
  { bg: 'linear-gradient(135deg, #4299E1, #1F3A68)', shadow: 'rgba(66,153,225,0.35)', label: '5' },
];

const TeacherDashboard = () => {
  const { currentUser, userAccount } = useAuth();
  const greeting    = getGreeting();
  const displayName = currentUser?.displayName || userAccount?.displayName || 'Teacher';

  const statItems = [
    { label: 'Students',        value: classData.students,            icon: '👩‍🎓', color: '#3B82F6', bg: '#EFF6FF', border: 'rgba(59,130,246,0.2)'  },
    { label: 'Activities Set',  value: classData.activitiesAssigned,  icon: '📋',  color: '#22C55E', bg: '#F0FFF4', border: 'rgba(34,197,94,0.2)'   },
    { label: 'Avg. Completion', value: `${classData.avgCompletion}%`, icon: '📈',  color: '#D97706', bg: '#FFF8E1', border: 'rgba(245,166,35,0.25)'  },
    { label: 'Top Scorers',     value: classData.topPerformers.length, icon: '🏆', color: '#9F7AEA', bg: '#F5F3FF', border: 'rgba(139,92,246,0.2)'   },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Welcome Header ── */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5, fontFamily: '"Nunito", sans-serif' }}>
          {greeting}, <span style={{ color: '#4299E1' }}>{displayName}</span>! 👩‍🏫
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ fontFamily: '"Nunito", sans-serif' }}>
          Here's how your class is doing today. Keep inspiring! 🌟
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

        {/* ── LEFT: Subject Breakdown + Activity Feed ── */}
        <Grid size={{ xs: 12, md: 8 }}>

          {/* Subject Breakdown */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', mb: 3, border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2.5, fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>
              📊 Activity Completion by Subject
            </Typography>
            {classData.activityBreakdown.map((subj) => (
              <Box key={subj.subject} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      px: 1.5, py: 0.4, borderRadius: 10,
                      background: subj.bg, border: `1px solid ${subj.color}30`,
                    }}>
                      <Typography sx={{ fontSize: '0.9rem' }}>{subj.emoji}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={800}>{subj.subject}</Typography>
                  </Box>
                  <Box sx={{
                    px: 1.5, py: 0.3, borderRadius: 10,
                    bgcolor: subj.bg, border: `1px solid ${subj.color}30`,
                  }}>
                    <Typography variant="caption" fontWeight={900} sx={{ color: subj.color }}>
                      {subj.completion}%
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={subj.completion}
                  sx={{
                    height: 12, borderRadius: 100,
                    bgcolor: `${subj.color}15`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: subj.color, borderRadius: 100,
                      boxShadow: `0 0 8px ${subj.color}60`,
                      transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                  }}
                />
              </Box>
            ))}
          </Paper>

          {/* Recent Student Activity Feed */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2.5, fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>⚡ Recent Student Activity</Typography>
            <List disablePadding>
              {classData.recentActivity.map((item, i) => (
                <Box key={i}>
                  <ListItem disablePadding sx={{ py: 1.25 }}>
                    <ListItemAvatar sx={{ minWidth: 52 }}>
                      <Avatar sx={{
                        width: 40, height: 40, fontSize: '0.78rem', fontWeight: 900,
                        background: `linear-gradient(135deg, ${item.color}30, ${item.color}15)`,
                        color: item.color,
                        border: `2px solid ${item.color}40`,
                        boxShadow: `0 3px 10px ${item.color}25`,
                      }}>
                        {item.student.split(' ').map((n) => n[0]).join('')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.student}
                      secondary={item.action}
                      primaryTypographyProps={{ fontWeight: 800, fontSize: '0.88rem' }}
                      secondaryTypographyProps={{ variant: 'caption', fontWeight: 600, sx: { color: 'text.secondary' } }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
                      <Typography sx={{ fontSize: '1.1rem' }}>{item.emoji}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {item.time}
                      </Typography>
                    </Box>
                  </ListItem>
                  {i < classData.recentActivity.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.6)' }} />
                  )}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* ── RIGHT: Progress Ring + Leaderboard ── */}
        <Grid size={{ xs: 12, md: 4 }}>

          {/* Class Progress Ring */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', mb: 3, textAlign: 'center', border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 0.5, fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>🏫 Class Progress</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 2 }}>
              Average completion rate this week
            </Typography>
            <ProgressRing value={classData.avgCompletion} size={140} color="#4299E1">
              <SchoolIcon sx={{ color: '#4299E1', fontSize: 28 }} />
            </ProgressRing>
            <Typography variant="h6" fontWeight={900} sx={{ mt: 2, color: '#4299E1' }}>
              {classData.avgCompletion}% Complete
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              📈 Up 8% from last week!
            </Typography>
          </Paper>

          {/* Top Performers Leaderboard */}
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.055)', boxShadow: '0 4px 20px rgba(31,58,104,0.07)' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2.5, fontFamily: '"Nunito", sans-serif', letterSpacing: '-0.01em' }}>🏆 Top Performers</Typography>
            {classData.topPerformers.map((student, i) => {
              const medal = MEDAL_STYLES[i] || MEDAL_STYLES[3];
              return (
                <Box key={student.name} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.75,
                  p: i < 3 ? 1 : 0,
                  borderRadius: i < 3 ? '14px' : 0,
                  background: i < 3 ? `${medal.bg.replace('135deg', '135deg').split(',')[1]?.trim()?.replace(')', '')}10)` : 'transparent',
                }}>
                  {/* Medal/rank */}
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: medal.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 10px ${medal.shadow}`,
                    fontSize: i < 3 ? '1rem' : '0.7rem',
                    color: 'white',
                    fontWeight: 900,
                  }}>
                    {medal.label}
                  </Box>

                  {/* Avatar */}
                  <Avatar sx={{
                    width: 34, height: 34, fontSize: '0.72rem', fontWeight: 900,
                    background: medal.bg,
                    border: '2px solid rgba(255,255,255,0.8)',
                    boxShadow: `0 2px 8px ${medal.shadow}`,
                  }}>
                    {getInitials(student.name)}
                  </Avatar>

                  {/* Name + bar */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight={i < 3 ? 900 : 700} sx={{ fontSize: '0.78rem', display: 'block', lineHeight: 1.2 }}>
                      {student.name.split(' ')[0]}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={student.completion}
                      sx={{
                        height: 5, borderRadius: 100, mt: 0.4,
                        bgcolor: 'rgba(0,0,0,0.06)',
                        '& .MuiLinearProgress-bar': {
                          background: medal.bg, borderRadius: 100,
                          boxShadow: `0 0 6px ${medal.shadow}`,
                        },
                      }}
                    />
                  </Box>

                  {/* Score */}
                  <Box sx={{
                    px: 1.25, py: 0.3, borderRadius: 10,
                    bgcolor: 'rgba(220,252,231,0.9)', border: '1px solid rgba(74,222,128,0.4)',
                    flexShrink: 0,
                  }}>
                    <Typography variant="caption" fontWeight={900} sx={{ color: '#15803D', fontSize: '0.65rem' }}>
                      {student.completion}%
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;
