import { useState } from 'react';
import {
  Box, Typography, Grid, Paper, Chip, LinearProgress, Button,
} from '@mui/material';
import { useChildProfile } from '../../context/ChildProfileContext';
import ModalDialog from '../../components/shared/ModalDialog';
import StarRating from '../../components/shared/StarRating';

/* ── Design tokens ── */
const RARITY = {
  Common:    { color: '#64748B', bg: '#F1F5F9', border: 'rgba(148,163,184,0.4)', glow: 'rgba(100,116,139,0.2)', label: '⚪ Common'    },
  Rare:      { color: '#3B82F6', bg: '#EFF6FF', border: 'rgba(147,197,253,0.4)', glow: 'rgba(59,130,246,0.25)',  label: '🔵 Rare'      },
  Epic:      { color: '#9F7AEA', bg: '#F5F3FF', border: 'rgba(216,180,254,0.4)', glow: 'rgba(159,122,234,0.3)', label: '🟣 Epic'      },
  Legendary: { color: '#D97706', bg: '#FFF8E1', border: 'rgba(255,193,7,0.5)',   glow: 'rgba(245,166,35,0.4)',  label: '🌟 Legendary' },
};

const CATEGORIES = ['All', 'Literacy', 'Math', 'Creative', 'Emotion', 'Brain', 'Science'];
const CAT_META = {
  All:      { emoji: '🌈', color: '#1F3A68', bg: 'rgba(219,234,254,0.9)' },
  Literacy: { emoji: '📖', color: '#3B82F6', bg: 'rgba(219,234,254,0.9)' },
  Math:     { emoji: '🔢', color: '#22C55E', bg: 'rgba(220,252,231,0.9)' },
  Creative: { emoji: '🎨', color: '#F97316', bg: 'rgba(255,237,213,0.9)' },
  Emotion:  { emoji: '❤️', color: '#EF4444', bg: 'rgba(255,237,237,0.9)' },
  Brain:    { emoji: '🧠', color: '#9F7AEA', bg: 'rgba(243,232,255,0.9)' },
  Science:  { emoji: '🔬', color: '#06B6D4', bg: 'rgba(207,250,254,0.9)' },
};

const MILESTONES = [
  { label: 'First Steps',    emoji: '👶', xp: 0,    unlocked: true  },
  { label: 'Rising Star',    emoji: '⭐', xp: 200,  unlocked: true  },
  { label: 'Rocket Learner', emoji: '🚀', xp: 500,  unlocked: true  },
  { label: 'Knowledge City', emoji: '🏙️', xp: 1000, unlocked: false },
  { label: 'Grand Master',   emoji: '👑', xp: 2000, unlocked: false },
];

const allBadges = [
  { title: 'Literacy Star',    emoji: '📖', category: 'Literacy', rarity: 'Rare',      earned: true,  desc: 'Complete 10 reading activities',   progress: 100, reward: 150 },
  { title: 'Math Champion',    emoji: '🏆', category: 'Math',     rarity: 'Epic',      earned: true,  desc: 'Solve 10 maths challenges',        progress: 100, reward: 200 },
  { title: 'Creative Mind',    emoji: '🎨', category: 'Creative', rarity: 'Rare',      earned: true,  desc: 'Finish 5 creative projects',       progress: 100, reward: 120 },
  { title: 'Emotion Explorer', emoji: '❤️', category: 'Emotion',  rarity: 'Common',    earned: false, desc: 'Complete emotional learning cards', progress: 60,  reward: 80  },
  { title: 'Science Whiz',     emoji: '🔬', category: 'Science',  rarity: 'Legendary', earned: false, desc: 'Explore 5 science experiments',    progress: 20,  reward: 500 },
  { title: 'Problem Solver',   emoji: '🧩', category: 'Brain',    rarity: 'Rare',      earned: false, desc: 'Crack 8 brain challenges',         progress: 75,  reward: 180 },
  { title: 'Super Reader',     emoji: '📚', category: 'Literacy', rarity: 'Epic',      earned: false, desc: 'Read 20 stories',                  progress: 40,  reward: 250 },
  { title: 'Number Ninja',     emoji: '🥷', category: 'Math',     rarity: 'Rare',      earned: false, desc: 'Master number patterns 1-100',     progress: 15,  reward: 160 },
  { title: 'Music Master',     emoji: '🎵', category: 'Creative', rarity: 'Common',    earned: false, desc: 'Create 3 musical pieces',          progress: 0,   reward: 90  },
  { title: 'Kind Heart',       emoji: '💗', category: 'Emotion',  rarity: 'Common',    earned: false, desc: 'Complete 5 kindness activities',   progress: 33,  reward: 70  },
  { title: 'Brain Boss',       emoji: '🧠', category: 'Brain',    rarity: 'Legendary', earned: false, desc: 'Top score in all brain games',     progress: 0,   reward: 600 },
  { title: 'Space Scientist',  emoji: '🔭', category: 'Science',  rarity: 'Epic',      earned: false, desc: 'Complete the full Space series',   progress: 10,  reward: 300 },
];

const levels = [
  { level: 1, title: 'Seedling',     emoji: '🌱', xpNeeded: 0    },
  { level: 2, title: 'Sprout',       emoji: '🌿', xpNeeded: 100  },
  { level: 3, title: 'Explorer',     emoji: '🔭', xpNeeded: 250  },
  { level: 4, title: 'Star Learner', emoji: '⭐', xpNeeded: 500  },
  { level: 5, title: 'Champion',     emoji: '🏆', xpNeeded: 1000 },
];

const ChildAwards = () => {
  const { activeChild, coinCount } = useChildProfile();
  const [activeCategory,  setActiveCategory]  = useState('All');
  const [badgeModal,      setBadgeModal]       = useState({ open: false, badge: null });
  const [achieveModal,    setAchieveModal]     = useState({ open: false, milestone: null });

  // Use real XP from Firebase child profile if available
  const currentXP    = activeChild?.xp || 320;
  const currentLevel = levels.find((l, i) =>
    currentXP >= l.xpNeeded && (!levels[i + 1] || currentXP < levels[i + 1].xpNeeded)
  ) || levels[0];
  const nextLevel   = levels[levels.indexOf(currentLevel) + 1];
  const xpToNext    = nextLevel ? nextLevel.xpNeeded - currentXP : 0;
  const levelPct    = nextLevel
    ? ((currentXP - currentLevel.xpNeeded) / (nextLevel.xpNeeded - currentLevel.xpNeeded)) * 100
    : 100;

  const earned   = allBadges.filter((b) => b.earned);
  const filtered = allBadges.filter((b) =>
    activeCategory === 'All' || b.category === activeCategory
  );

  const unlockedMilestones = MILESTONES.filter((m) => m.unlocked).length;

  // Open badge detail modal when an earned badge is clicked
  const handleBadgeClick = (badge) => {
    if (!badge.earned) return;
    setBadgeModal({ open: true, badge });
  };

  // Open milestone celebration modal
  const handleMilestoneClick = (milestone) => {
    if (!milestone.unlocked) return;
    setAchieveModal({ open: true, milestone });
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Page header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" fontWeight={900} sx={{ mb: 0.25, letterSpacing: '-0.015em' }}>
          🏆 Achievements
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          {earned.length}/{allBadges.length} badges unlocked · You're awesome! ✨
        </Typography>
      </Box>

      {/* ── XP Level Bar ── */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '22px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF9500, #FFC107)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 6px 18px rgba(255,149,0,0.4)',
            animation: 'glow 3s ease-in-out infinite',
            flexShrink: 0,
          }}>
            {currentLevel.emoji}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={900}>
                Level {currentLevel.level}: {currentLevel.title}
              </Typography>
              <Typography variant="caption" fontWeight={900} sx={{ color: '#FF9500' }}>
                {currentXP} / {nextLevel?.xpNeeded || currentXP} XP
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={levelPct} sx={{
              height: 12, borderRadius: 100,
              bgcolor: 'rgba(255,149,0,0.12)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #FF9500, #FFC107)',
                borderRadius: 100,
                boxShadow: '0 0 10px rgba(255,149,0,0.5)',
              },
            }} />
            {nextLevel && (
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mt: 0.5, display: 'block' }}>
                🎯 {xpToNext} XP to {nextLevel.title} {nextLevel.emoji}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* ── Trophy Shelf ── */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '22px', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.01em' }}>✨ Trophy Shelf</Typography>
          <Chip
            label={`${unlockedMilestones}/${MILESTONES.length} milestones`} size="small"
            sx={{
              background: 'linear-gradient(135deg, rgba(255,248,220,0.9), rgba(255,237,179,0.8))',
              color: '#D97706', fontWeight: 900, border: '1.5px solid rgba(255,193,7,0.5)',
              borderRadius: 10,
            }}
          />
        </Box>

        {/* Milestone timeline */}
        <Box sx={{ position: 'relative', px: { xs: 1, sm: 2 }, overflowX: 'auto', pb: 1 }}>
          {/* Connecting line */}
          <Box sx={{
            position: 'absolute', left: '5%', right: '5%', top: 36,
            height: 5, borderRadius: 100,
            background: `linear-gradient(90deg, #FF9500 ${(unlockedMilestones / MILESTONES.length) * 100}%, rgba(226,232,240,0.6) ${(unlockedMilestones / MILESTONES.length) * 100}%)`,
            boxShadow: '0 2px 8px rgba(255,149,0,0.3)',
          }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1, minWidth: 360 }}>
            {MILESTONES.map((m, i) => (
              <Box key={m.label} sx={{ textAlign: 'center', flex: 1 }}>
                <Box
                  onClick={() => handleMilestoneClick(m)}
                  sx={{
                    width: { xs: 56, sm: 68 }, height: { xs: 56, sm: 68 },
                    borderRadius: '50%', mx: 'auto', mb: 1.25,
                    background: m.unlocked
                      ? 'linear-gradient(135deg, #FF9500 0%, #FFC107 100%)'
                      : 'rgba(248,250,252,0.8)',
                    border: `3px solid ${m.unlocked ? '#FFD700' : 'rgba(226,232,240,0.6)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: { xs: '1.5rem', sm: '1.8rem' },
                    boxShadow: m.unlocked ? '0 6px 20px rgba(255,149,0,0.5)' : 'none',
                    opacity: m.unlocked ? 1 : 0.4,
                    transition: 'all 0.3s ease',
                    animation: m.unlocked ? `glow ${3 + i * 0.5}s ease-in-out infinite` : 'none',
                    '&:hover': m.unlocked ? { transform: 'scale(1.12) translateY(-4px)', cursor: 'pointer' } : {},
                    cursor: m.unlocked ? 'pointer' : 'default',
                  }}>
                  {m.emoji}
                </Box>
                <Typography variant="caption" fontWeight={m.unlocked ? 900 : 500}
                  sx={{
                    color: m.unlocked ? 'text.primary' : 'text.disabled',
                    fontSize: '0.62rem', lineHeight: 1.2, display: 'block',
                  }}>
                  {m.label}
                </Typography>
                {m.xp > 0 && (
                  <Typography variant="caption" display="block"
                    sx={{ color: m.unlocked ? '#FF9500' : 'text.disabled', fontSize: '0.56rem', fontWeight: 800 }}>
                    {m.xp} XP
                  </Typography>
                )}
                {m.unlocked && (
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#22C55E', fontWeight: 800 }}>
                    ✅ Unlocked!
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* ── Category Filter Pills ── */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
        {CATEGORIES.map((cat) => {
          const meta   = CAT_META[cat] || CAT_META.All;
          const active = activeCategory === cat;
          return (
            <Box
              key={cat}
              onClick={() => setActiveCategory(cat)}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                px: 1.75, py: 0.6, borderRadius: 50,
                cursor: 'pointer', fontWeight: 800, fontSize: '0.78rem',
                background: active ? `${meta.color}` : 'rgba(255,255,255,0.7)',
                color: active ? 'white' : meta.color,
                border: `2px solid ${active ? meta.color : `${meta.color}40`}`,
                backdropFilter: 'blur(8px)',
                boxShadow: active ? `0 4px 14px ${meta.color}40` : 'none',
                transform: active ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                fontFamily: '"Nunito", sans-serif',
                '&:hover': { background: meta.color, color: 'white', transform: 'scale(1.05)' },
              }}
            >
              <span>{meta.emoji}</span> {cat}
            </Box>
          );
        })}
      </Box>

      {/* ── Badge Grid ── */}
      <Grid container spacing={2} alignItems="stretch">
        {filtered.map((badge, idx) => {
          const rs = RARITY[badge.rarity] || RARITY.Common;
          return (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={badge.title} sx={{ display: 'flex' }}>
              <Box
                onClick={() => handleBadgeClick(badge)}
                sx={{
                  width: '100%', borderRadius: '22px', p: 2.5, textAlign: 'center',
                  background: badge.earned ? rs.bg : 'rgba(248,250,252,0.72)',
                  backdropFilter: 'blur(12px)',
                  border: `2px solid ${badge.earned ? rs.border : 'rgba(226,232,240,0.5)'}`,
                  opacity: badge.earned ? 1 : 0.75,
                  boxShadow: badge.earned ? `0 6px 20px ${rs.glow}` : '0 2px 10px rgba(31,58,104,0.06)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: badge.earned ? 'pointer' : 'default',
                  position: 'relative', overflow: 'hidden',
                  animation: `slideInUp 0.4s ease-out ${idx * 0.04}s both`,
                  '&:hover': badge.earned ? {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 14px 36px ${rs.glow}`,
                  } : { opacity: 0.85 },
                }}>
                {/* Rarity tag */}
                <Box sx={{
                  position: 'absolute', top: 8, right: 8,
                  px: 1, py: 0.25, borderRadius: 10,
                  bgcolor: badge.earned ? rs.bg : 'rgba(248,250,252,0.9)',
                  border: `1px solid ${rs.border}`,
                }}>
                  <Typography sx={{ fontSize: '0.5rem', fontWeight: 900, color: rs.color }}>
                    {rs.label}
                  </Typography>
                </Box>

                {/* Badge emoji */}
                <Box sx={{
                  fontSize: '2.8rem', mb: 1,
                  filter: badge.earned ? 'none' : 'grayscale(80%)',
                  animation: badge.earned ? `float ${3 + (badge.reward % 3)}s ease-in-out infinite` : 'none',
                }}>
                  {badge.earned ? badge.emoji : '🔒'}
                </Box>

                <Typography variant="subtitle2" fontWeight={900}
                  sx={{ color: badge.earned ? rs.color : 'text.disabled', mb: 0.25 }}>
                  {badge.title}
                </Typography>
                <Typography variant="caption" color="text.secondary"
                  sx={{ display: 'block', fontSize: '0.63rem', mb: 1.25, lineHeight: 1.35 }}>
                  {badge.desc}
                </Typography>

                {badge.earned ? (
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    bgcolor: rs.bg, borderRadius: 10, px: 1.5, py: 0.4,
                    border: `1px solid ${rs.border}`,
                  }}>
                    <Typography sx={{ fontSize: '0.9rem' }}>🪙</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: rs.color, fontSize: '0.62rem' }}>
                      +{badge.reward} XP
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: rs.color, fontSize: '0.6rem', fontWeight: 800 }}>
                        {badge.progress > 0 ? `${badge.progress}%` : 'Not started'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: rs.color, fontSize: '0.6rem', fontWeight: 800 }}>
                        🎯 {badge.reward} XP
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={badge.progress} sx={{
                      height: 6, borderRadius: 100,
                      bgcolor: `${rs.color}15`,
                      '& .MuiLinearProgress-bar': { bgcolor: rs.color, borderRadius: 100 },
                    }} />
                    {badge.progress > 0 && (
                      <Typography variant="caption" sx={{ color: rs.color, fontSize: '0.58rem', fontWeight: 700, mt: 0.5, display: 'block' }}>
                        Keep going! 💪
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Badge Detail Modal (earned badges) ── */}
      <ModalDialog
        open={badgeModal.open}
        onClose={() => setBadgeModal({ open: false, badge: null })}
        title={badgeModal.badge ? `${badgeModal.badge.title} Earned! 🎉` : ''}
        type="success"
        confirmText="Awesome! 🚀"
        cancelText=""
        onConfirm={() => setBadgeModal({ open: false, badge: null })}
        maxWidth="xs"
      >
        {badgeModal.badge && (
          <Box sx={{ py: 1.5, textAlign: 'center' }}>
            <Box sx={{
              fontSize: '4rem', mb: 1.5,
              animation: 'celebrationPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'inline-block',
            }}>
              {badgeModal.badge.emoji}
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 2 }}>
              {badgeModal.badge.desc}
            </Typography>
            <Box sx={{
              display: 'inline-flex', gap: 2, px: 3, py: 1.5, borderRadius: '14px',
              bgcolor: RARITY[badgeModal.badge.rarity]?.bg || '#F1F5F9',
              border: `1.5px solid ${RARITY[badgeModal.badge.rarity]?.border || 'rgba(0,0,0,0.1)'}`,
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={900} sx={{ color: RARITY[badgeModal.badge.rarity]?.color }}>
                  +{badgeModal.badge.reward}
                </Typography>
                <Typography variant="caption" fontWeight={800} color="text.secondary">XP EARNED</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" fontWeight={800} sx={{
                px: 1.5, py: 0.5, borderRadius: 10,
                bgcolor: RARITY[badgeModal.badge.rarity]?.bg || '#F1F5F9',
                color: RARITY[badgeModal.badge.rarity]?.color,
                border: `1px solid ${RARITY[badgeModal.badge.rarity]?.border}`,
              }}>
                {RARITY[badgeModal.badge.rarity]?.label}
              </Typography>
            </Box>
          </Box>
        )}
      </ModalDialog>

      {/* ── Milestone Celebration Modal ── */}
      <ModalDialog
        open={achieveModal.open}
        onClose={() => setAchieveModal({ open: false, milestone: null })}
        title={achieveModal.milestone ? `${achieveModal.milestone.label} Unlocked! 🏅` : ''}
        type="success"
        confirmText="Keep it up! 💪"
        cancelText=""
        onConfirm={() => setAchieveModal({ open: false, milestone: null })}
        maxWidth="xs"
      >
        {achieveModal.milestone && (
          <Box sx={{ py: 1.5, textAlign: 'center' }}>
            <Box sx={{
              fontSize: '4rem', mb: 1,
              animation: 'celebrationPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'inline-block',
            }}>
              {achieveModal.milestone.emoji}
            </Box>
            <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
              You've reached the <strong>{achieveModal.milestone.label}</strong> milestone!
            </Typography>
            {achieveModal.milestone.xp > 0 && (
              <Box sx={{
                display: 'inline-block', px: 2.5, py: 1, borderRadius: '12px',
                bgcolor: '#FFF8E1', border: '1.5px solid rgba(255,193,7,0.4)',
              }}>
                <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#D97706' }}>
                  🌟 {achieveModal.milestone.xp} XP milestone reached!
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </ModalDialog>
    </Box>
  );
};

export default ChildAwards;
