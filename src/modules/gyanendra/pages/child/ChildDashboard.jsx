import {
  Box, Typography, Grid, Paper, Chip, LinearProgress, Button,
} from '@mui/material';
import {
  MonetizationOn as CoinIcon, EmojiEvents as TrophyIcon,
  LocalFireDepartment as StreakIcon, AutoAwesome as SparkleIcon,
  RocketLaunch as RocketIcon, NavigateNext as NextIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChildProfile } from '../../context/ChildProfileContext';
import { getGreeting, getAvatarEmoji } from '../../utils/helpers';
import ActivityCard from '../../components/shared/ActivityCard';
import ProgressRing from '../../components/shared/ProgressRing';

/* ─── Static demo data ─── */
const featuredActivities = [
  { title: 'Alphabet Forest',  description: 'Follow the fireflies to learn every letter!', image: '🌲', progress: 75,  category: 'Literacy', duration: '15 min', coins: 80,  difficulty: 'Easy',   ageGroup: '4-6'  },
  { title: 'Number Safari',    description: 'Hop from animal to animal counting 1–20!',    image: '🦁', progress: 40,  category: 'Math',    duration: '20 min', coins: 100, difficulty: 'Medium', ageGroup: '4-6'  },
  { title: 'Color Splash',     description: 'Mix red, blue and yellow to paint rainbows!', image: '🎨', progress: 20,  category: 'Art',     duration: '10 min', coins: 60,  difficulty: 'Easy',   ageGroup: '4-6'  },
  { title: 'Space Explorer',   description: 'Fly your rocket past planets and moons!',     image: '🚀', progress: 0,   category: 'Science', duration: '25 min', coins: 150, difficulty: 'Hard',   ageGroup: '7-10' },
];

const achievements = [
  { title: 'First Step', emoji: '👶', earned: true,  rarity: 'Common'    },
  { title: 'Explorer',   emoji: '🔭', earned: true,  rarity: 'Rare'      },
  { title: 'Math Star',  emoji: '⭐', earned: true,  rarity: 'Epic'      },
  { title: 'Book Worm',  emoji: '📚', earned: false, rarity: 'Rare'      },
  { title: 'Artist',     emoji: '🎨', earned: false, rarity: 'Common'    },
  { title: 'Champion',   emoji: '🏆', earned: false, rarity: 'Legendary' },
];

const RARITY = {
  Common:    { color: '#64748B', bg: '#F1F5F9', border: 'rgba(148,163,184,0.4)', glow: 'rgba(100,116,139,0.2)' },
  Rare:      { color: '#3B82F6', bg: '#EFF6FF', border: 'rgba(147,197,253,0.5)', glow: 'rgba(59,130,246,0.25)' },
  Epic:      { color: '#9F7AEA', bg: '#F5F3FF', border: 'rgba(216,180,254,0.5)', glow: 'rgba(159,122,234,0.3)' },
  Legendary: { color: '#D97706', bg: '#FFF8E1', border: 'rgba(255,193,7,0.5)',   glow: 'rgba(245,166,35,0.35)' },
};

const weekDays   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const dailyMissions = [
  { task: 'Finish 1 adventure',  done: true,  reward: 50,  emoji: '🌟' },
  { task: 'Earn 3 stars',        done: true,  reward: 30,  emoji: '⭐' },
  { task: 'Try a new topic',     done: false, reward: 100, emoji: '🔭' },
  { task: 'Play for 20 minutes', done: false, reward: 75,  emoji: '⏱️' },
];

/* Clean stat pill — solid background, matches reference */
const StatPill = ({ emoji, value, label, color, bg, border }) => (
  <Box sx={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    px: 1.5, py: 0.75, borderRadius: '14px',
    bgcolor: bg,
    border: `1.5px solid ${border}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    minWidth: 56,
    transition: 'all 0.2s ease',
    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 0.1 }}>
      <Typography sx={{ fontSize: '0.9rem', lineHeight: 1 }}>{emoji}</Typography>
      <Typography fontWeight={900} sx={{ color, lineHeight: 1, fontSize: '0.95rem' }}>{value}</Typography>
    </Box>
    <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 800, color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {label}
    </Typography>
  </Box>
);

const ChildDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { activeChild, coinCount } = useChildProfile();

  const childName  = activeChild?.name || currentUser?.displayName || 'Explorer';
  const avatarId   = activeChild?.avatar || 'avatar1';
  const greeting   = getGreeting();

  // Real stats from Firebase child profile
  const streakDays   = activeChild?.streak_days || 0;
  const earnedBadges = activeChild?.badges || [];
  const earnedCount  = earnedBadges.length;
  const xp           = activeChild?.xp || 0;
  const starsCount   = activeChild?.stars || 0;
  const coins        = activeChild?.coin_count || coinCount || 0;

  const weeklyGoal = 5;
  const weeklyPct  = Math.round(Math.min((streakDays / weeklyGoal) * 100, 100));

  const missionsCompleted = dailyMissions.filter((m) => m.done).length;

  const topStats = [
    { label: 'STREAK',  value: streakDays,  emoji: '🔥', color: '#DC2626', bg: '#FFF0F0', border: 'rgba(239,68,68,0.2)'  },
    { label: 'STARS',   value: starsCount,  emoji: '⭐', color: '#D97706', bg: '#FFFBEB', border: 'rgba(245,166,35,0.25)' },
    { label: 'BADGES',  value: earnedCount, emoji: '🏆', color: '#7C3AED', bg: '#F5F3FF', border: 'rgba(139,92,246,0.2)' },
    { label: 'COINS',   value: coins,       emoji: '🪙', color: '#16A34A', bg: '#F0FFF4', border: 'rgba(34,197,94,0.2)'  },
    { label: 'XP',      value: xp,          emoji: '⚡', color: '#3B82F6', bg: '#EFF6FF', border: 'rgba(59,130,246,0.2)' },
  ];


  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>


      {/* ═══ GREETING ROW ═══ */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #FF9500 0%, #FFC107 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
          boxShadow: '0 6px 20px rgba(255,149,0,0.45)',
          border: '3px solid rgba(255,255,255,0.9)',
          animation: 'pulse 3s ease-in-out infinite',
        }}>
          {getAvatarEmoji(avatarId)}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.2 }}>
            {greeting}, <span style={{ color: '#FF9500' }}>{childName}</span>! 😊
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            Welcome back! Ready for today's learning adventure? 🌟
          </Typography>
        </Box>
      </Box>

      {/* ═══ CONTINUE LEARNING HERO ═══ */}
      <Box sx={{
        mb: 3, borderRadius: '28px', overflow: 'hidden',
        background: 'linear-gradient(135deg, #FF9500 0%, #FFA726 40%, #FF7F00 100%)',
        position: 'relative',
        boxShadow: '0 12px 40px rgba(255,149,0,0.45)',
        border: '2px solid rgba(255,255,255,0.2)',
      }}>
        {/* Decorative sparkles */}
        {['🌙', '⭐', '✨', '💫', '🌟'].map((s, i) => (
          <Box key={i} sx={{
            position: 'absolute', fontSize: '1.5rem', opacity: 0.18,
            top: `${[10, 55, 25, 70, 40][i]}%`,
            right: `${[15, 22, 32, 42, 55][i]}%`,
            animation: `twinkle ${2.8 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            pointerEvents: 'none',
          }}>{s}</Box>
        ))}

        <Box sx={{ p: { xs: 2.5, sm: 3.5 }, position: 'relative', zIndex: 1 }}>
          {/* Label chip */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.75,
            px: 1.75, py: 0.5, borderRadius: '10px', mb: 1.75,
            bgcolor: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <RocketIcon sx={{ fontSize: 13, color: 'white' }} />
            <Typography variant="overline" sx={{ color: 'white', fontWeight: 900, fontSize: '0.62rem', letterSpacing: '0.14em' }}>
              Continue Learning
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={900} sx={{ color: 'white', mb: 0.25, lineHeight: 1.15 }}>
                Literacy Land
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 2.5, fontWeight: 600 }}>
                Current Lesson: Letter Sounds &amp; Recognition
              </Typography>

              {/* Progress */}
              <Box sx={{ mb: 0.75 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800 }}>
                    35% Complete
                  </Typography>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.4,
                    bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 10, px: 1, py: 0.2,
                  }}>
                    <TimerIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.6rem' }}>
                      ~10 min left
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={35} sx={{
                  height: 10, borderRadius: 100,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white', borderRadius: 100,
                    boxShadow: '0 0 10px rgba(255,255,255,0.6)',
                  },
                }} />
              </Box>

              {/* Goal chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5, mt: 1 }}>
                {['📖 Read 5 stories', '🔤 Learn 10 letters', '⭐ Earn 3 stars'].map((g) => (
                  <Box key={g} sx={{
                    px: 1.25, py: 0.35, borderRadius: 10,
                    bgcolor: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: '0.65rem' }}>{g}</Typography>
                  </Box>
                ))}
              </Box>

              <Button
                variant="contained"
                endIcon={<NextIcon />}
                onClick={() => navigate('/child/explore')}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.22)', color: 'white', fontWeight: 900,
                  borderRadius: 50, px: 3.5, py: 1.1,
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(255,255,255,0.35)',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.32)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  },
                }}
              >
                Continue Journey
              </Button>
            </Box>

            {/* Hero illustration */}
            <Box sx={{
              fontSize: '5rem', ml: 2, flexShrink: 0,
              display: { xs: 'none', sm: 'block' },
              animation: 'float 4s ease-in-out infinite',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.2))',
            }}>
              📖
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══ MAIN CONTENT GRID ═══ */}
      <Grid container spacing={3}>

        {/* ── LEFT: Streak + Activities + Badges ── */}
        <Grid size={{ xs: 12, md: 8 }}>

          {/* Weekly Streak Calendar */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '22px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={900}>🔥 Weekly Streak</Typography>
              <Chip
                label={`${streakDays}/${weeklyGoal} days`} size="small"
                sx={{
                  background: 'linear-gradient(135deg, rgba(255,248,220,0.9), rgba(255,237,179,0.8))',
                  color: '#D97706', fontWeight: 900,
                  border: '1.5px solid rgba(255,193,7,0.5)',
                  borderRadius: 10,
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, justifyContent: 'center', mb: 2 }}>
              {weekDays.map((day, i) => {
                // Mark the first `streakDays` days as done
                const done = i < streakDays;
                return (
                  <Box key={day} sx={{ textAlign: 'center', flex: 1 }}>
                    <Box sx={{
                      width: { xs: 34, sm: 44 }, height: { xs: 34, sm: 44 },
                      borderRadius: '50%', mx: 'auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      background: done
                        ? 'linear-gradient(135deg, #FFF8DC, #FFE4A0)'
                        : 'rgba(248,250,252,0.8)',
                      border: `2.5px solid ${done ? '#FFC107' : 'rgba(226,232,240,0.6)'}`,
                      boxShadow: done ? '0 4px 12px rgba(255,193,7,0.4)' : 'none',
                      transition: 'all 0.3s ease',
                      animation: done ? 'glow 3s ease-in-out infinite' : 'none',
                      animationDelay: `${i * 0.2}s`,
                    }}>
                      {done ? '⭐' : '·'}
                    </Box>
                    <Typography variant="caption" sx={{
                      fontSize: '0.58rem', color: done ? '#D97706' : 'text.secondary',
                      fontWeight: done ? 900 : 500,
                    }}>
                      {day}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            <LinearProgress variant="determinate" value={Math.min(weeklyPct, 100)} sx={{
              height: 10, borderRadius: 100,
              bgcolor: 'rgba(255,149,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 100,
                background: 'linear-gradient(90deg, #FF9500 0%, #FFC107 100%)',
                boxShadow: '0 0 8px rgba(255,149,0,0.4)',
              },
            }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block', fontWeight: 700 }}>
              {streakDays < weeklyGoal
                ? `🚀 ${weeklyGoal - streakDays} more day${weeklyGoal - streakDays !== 1 ? 's' : ''} to complete your week!`
                : '🎉 You completed your whole week! SUPERSTAR!'}
            </Typography>
          </Paper>

          {/* Learning Journey */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '22px', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.01em' }}>🎮 Learning Journey</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Every adventure earns you coins! 🪙
                </Typography>
              </Box>
              <Button size="small" variant="outlined"
                onClick={() => navigate('/child/explore')}
                sx={{
                  borderRadius: 50, fontSize: '0.75rem', fontWeight: 800,
                  borderColor: '#FF9500', color: '#FF9500',
                  '&:hover': { bgcolor: 'rgba(255,149,0,0.08)', borderColor: '#FF9500' },
                }}>
                See All →
              </Button>
            </Box>
            <Grid container spacing={2} alignItems="stretch">
              {featuredActivities.map((act) => (
                <Grid size={{ xs: 12, sm: 6 }} key={act.title} sx={{ display: 'flex' }}>
                  <ActivityCard {...act} onClick={() => navigate('/child/explore')} />
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Badge Collection */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '22px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.01em' }}>🏆 My Badge Collection</Typography>
              <Button size="small" variant="text"
                onClick={() => navigate('/child/awards')}
                sx={{ color: '#FF9500', fontSize: '0.75rem', fontWeight: 800 }}>
                View All →
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
              {achievements.map((badge) => {
                const rs = RARITY[badge.rarity] || RARITY.Common;
                return (
                  <Box key={badge.title} sx={{
                    textAlign: 'center', opacity: badge.earned ? 1 : 0.45,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&:hover': badge.earned ? { transform: 'scale(1.15) translateY(-4px)' } : {},
                    cursor: badge.earned ? 'pointer' : 'default',
                  }}>
                    <Box sx={{
                      width: { xs: 56, sm: 64 }, height: { xs: 56, sm: 64 }, borderRadius: '50%',
                      bgcolor: badge.earned ? rs.bg : 'rgba(248,250,252,0.8)',
                      border: `3px solid ${badge.earned ? rs.border : 'rgba(226,232,240,0.5)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: { xs: '1.6rem', sm: '1.9rem' }, mb: 0.75, mx: 'auto',
                      boxShadow: badge.earned ? `0 6px 18px ${rs.glow}` : 'none',
                      animation: badge.earned ? 'glow 4s ease-in-out infinite' : 'none',
                      transition: 'all 0.3s ease',
                    }}>
                      {badge.emoji}
                    </Box>
                    <Typography variant="caption" fontWeight={badge.earned ? 900 : 500}
                      display="block" sx={{
                        fontSize: '0.62rem',
                        color: badge.earned ? rs.color : 'text.disabled',
                      }}>
                      {badge.title}
                    </Typography>
                    {!badge.earned && (
                      <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.6rem' }}>
                        🔒
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* ── RIGHT: Progress Ring + Daily Missions ── */}
        <Grid size={{ xs: 12, md: 4 }}>

          {/* Progress Ring */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '22px', mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.01em', mb: 0.5 }}>🌟 Learning Progress</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 2 }}>
              Your weekly adventure goal
            </Typography>
            <ProgressRing value={weeklyPct > 100 ? 100 : weeklyPct} size={140} color="#FF9500">
              <TrophyIcon sx={{ color: '#FF9500', fontSize: 30 }} />
            </ProgressRing>
            <Typography variant="body1" fontWeight={900} sx={{ mt: 2, color: '#FF9500', fontSize: '1.1rem' }}>
              {weeklyPct}% Complete!
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {weeklyPct >= 100 ? '🎊 Weekly goal CRUSHED! Amazing!' : "Keep going — you're on fire! 💪"}
            </Typography>

            {/* Category bars */}
            <Box sx={{ mt: 2.5, textAlign: 'left' }}>
              {[
                { label: '📖 Literacy', progress: 75, color: '#3B82F6' },
                { label: '🔢 Math',     progress: 50, color: '#22C55E' },
                { label: '🔬 Science',  progress: 15, color: '#A855F7' },
                { label: '🎨 Art',      progress: 30, color: '#F97316' },
              ].map((cat) => (
                <Box key={cat.label} sx={{ mb: 1.25 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.72rem' }}>{cat.label}</Typography>
                    <Typography variant="caption" sx={{ color: cat.color, fontWeight: 900, fontSize: '0.72rem' }}>{cat.progress}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={cat.progress} sx={{
                    height: 8, borderRadius: 100,
                    bgcolor: `${cat.color}15`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: cat.color, borderRadius: 100,
                      transition: 'width 1s ease',
                    },
                  }} />
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Daily Missions */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '22px' }}>
            <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.01em', mb: 0.5 }}>🎯 Daily Missions</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 2 }}>
              Complete missions to earn bonus coins!
            </Typography>

            {dailyMissions.map((mission, i, arr) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                py: 1.25,
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.6)' : 'none',
              }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: mission.done
                    ? 'linear-gradient(135deg, #DCFCE7, #BBF7D0)'
                    : 'linear-gradient(135deg, #FFF8DC, #FFE4A0)',
                  border: `2px solid ${mission.done ? 'rgba(74,222,128,0.5)' : 'rgba(255,193,7,0.4)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                  boxShadow: mission.done ? '0 2px 8px rgba(74,222,128,0.3)' : '0 2px 8px rgba(255,193,7,0.2)',
                }}>
                  {mission.done ? '✅' : mission.emoji}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={800} sx={{
                    textDecoration: mission.done ? 'line-through' : 'none',
                    color: mission.done ? 'text.disabled' : 'text.primary',
                    fontSize: '0.82rem',
                  }}>
                    {mission.task}
                  </Typography>
                  {mission.done && (
                    <Typography variant="caption" sx={{ color: '#16A34A', fontSize: '0.62rem', fontWeight: 800 }}>
                      🎉 Coins added!
                    </Typography>
                  )}
                </Box>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.4,
                  background: 'rgba(255,248,220,0.9)',
                  borderRadius: 10, px: 1, py: 0.3,
                  border: '1px solid rgba(255,193,7,0.4)',
                }}>
                  <CoinIcon sx={{ fontSize: 13, color: '#FFC107' }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#D97706', fontSize: '0.7rem' }}>
                    +{mission.reward}
                  </Typography>
                </Box>
              </Box>
            ))}

            <Box sx={{
              mt: 2, p: 1.75, borderRadius: '14px',
              bgcolor: '#FFF8E1',
              border: '1.5px solid rgba(245,166,35,0.35)',
              textAlign: 'center',
            }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {missionsCompleted} of {dailyMissions.length} missions done today
              </Typography>
              <Typography variant="h6" fontWeight={900} sx={{
                color: '#D97706', display: 'block',
                background: 'linear-gradient(135deg, #FF9500, #FFC107)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                🪙 80 coins earned!
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChildDashboard;
