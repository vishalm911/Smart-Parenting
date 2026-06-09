import { useState } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, Button,
  Snackbar, Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import ActivityCard from '../../components/shared/ActivityCard';
import StarRating from '../../components/shared/StarRating';
import ModalDialog from '../../components/shared/ModalDialog';
import { useChildProfile } from '../../context/ChildProfileContext';

const CATEGORY_META = {
  All:      { emoji: '🌈', color: '#1F3A68', bg: 'rgba(219,234,254,0.9)', glow: 'rgba(31,58,104,0.3)'   },
  Literacy: { emoji: '📖', color: '#3B82F6', bg: 'rgba(219,234,254,0.9)', glow: 'rgba(59,130,246,0.35)' },
  Math:     { emoji: '🔢', color: '#22C55E', bg: 'rgba(220,252,231,0.9)', glow: 'rgba(34,197,94,0.35)'  },
  Science:  { emoji: '🔬', color: '#06B6D4', bg: 'rgba(207,250,254,0.9)', glow: 'rgba(6,182,212,0.35)'  },
  Art:      { emoji: '🎨', color: '#F97316', bg: 'rgba(255,237,213,0.9)', glow: 'rgba(249,115,22,0.35)' },
  Music:    { emoji: '🎵', color: '#9F7AEA', bg: 'rgba(243,232,255,0.9)', glow: 'rgba(159,122,234,0.4)' },
  Social:   { emoji: '🤝', color: '#EF4444', bg: 'rgba(255,237,237,0.9)', glow: 'rgba(239,68,68,0.35)'  },
};

const allActivities = [
  { title: 'Alphabet Forest',    description: 'Follow the fireflies to learn every letter sound from A to Z!',      image: '🌲', progress: 75,  category: 'Literacy', duration: '15 min', coins: 80,  difficulty: 'Easy',   ageGroup: '4-6'  },
  { title: 'Number Safari',      description: 'Hop from animal to animal counting wild creatures up to 20!',         image: '🦁', progress: 40,  category: 'Math',    duration: '20 min', coins: 100, difficulty: 'Medium', ageGroup: '4-6'  },
  { title: 'Color Splash',       description: 'Mix red, blue and yellow to paint a dazzling rainbow world!',        image: '🎨', progress: 20,  category: 'Art',     duration: '10 min', coins: 60,  difficulty: 'Easy',   ageGroup: '4-6'  },
  { title: 'Space Explorer',     description: 'Blast off and explore planets, moons and shooting stars!',           image: '🚀', progress: 0,   category: 'Science', duration: '25 min', coins: 150, difficulty: 'Hard',   ageGroup: '7-10' },
  { title: 'Story Time',         description: 'Listen, read along and discover magical tales from around the world!',image: '📖', progress: 100, category: 'Literacy', duration: '12 min', coins: 70,  difficulty: 'Easy',   ageGroup: '4-6'  },
  { title: 'Shape World',        description: 'Find hidden triangles, circles and squares everywhere you look!',    image: '🔷', progress: 60,  category: 'Math',    duration: '8 min',  coins: 55,  difficulty: 'Easy',   ageGroup: '4-6'  },
  { title: 'Melody Maker',       description: 'Create your very own magical tunes — no instrument needed!',         image: '🎵', progress: 0,   category: 'Music',   duration: '18 min', coins: 90,  difficulty: 'Medium', ageGroup: '5-8'  },
  { title: 'Nature Friends',     description: 'Discover the amazing secrets of plants, bugs and wild animals!',     image: '🌿', progress: 30,  category: 'Science', duration: '20 min', coins: 110, difficulty: 'Medium', ageGroup: '6-10' },
  { title: 'Feelings & Friends', description: 'Learn how to name feelings and be a great friend to everyone!',      image: '😊', progress: 0,   category: 'Social',  duration: '15 min', coins: 80,  difficulty: 'Easy',   ageGroup: '4-6'  },
  { title: 'Clay Studio',        description: 'Squish and shape digital clay into anything your heart desires!',    image: '🏺', progress: 0,   category: 'Art',     duration: '22 min', coins: 120, difficulty: 'Medium', ageGroup: '6-10' },
  { title: 'Word Wizard',        description: 'Cast spelling spells to build amazing new words every day!',         image: '✏️', progress: 50,  category: 'Literacy', duration: '15 min', coins: 95,  difficulty: 'Medium', ageGroup: '6-10' },
  { title: 'Counting Coins',     description: 'Trade, save and count gold coins like a real treasure hunter!',      image: '🪙', progress: 0,   category: 'Math',    duration: '10 min', coins: 75,  difficulty: 'Easy',   ageGroup: '5-8'  },
];

const categories = ['All', 'Literacy', 'Math', 'Science', 'Art', 'Music', 'Social'];

const ChildExplore = () => {
  const { activeChild, updateChildProfile: updateProfile } = useChildProfile();

  const [activeCategory, setActiveCategory] = useState('All');
  const [search,         setSearch]         = useState('');

  // Rating modal state
  const [ratingModal,  setRatingModal]  = useState({ open: false, activity: null });
  const [rating,       setRating]       = useState(0);
  const [ratingDone,   setRatingDone]   = useState(false);

  // Reward modal state (shown after rating is submitted)
  const [rewardModal,  setRewardModal]  = useState({ open: false, coins: 0, stars: 0, title: '' });
  const [savingRating, setSavingRating] = useState(false);

  const filtered = allActivities.filter((a) => {
    const matchCat    = activeCategory === 'All' || a.category === activeCategory;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const doneCount  = allActivities.filter((a) => a.progress === 100).length;
  const totalCoins = allActivities.filter((a) => a.progress === 100).reduce((s, a) => s + (a.coins || 0), 0);

  // Open the star-rating modal when an activity is clicked
  const handleActivityClick = (activity) => {
    setRating(0);
    setRatingDone(false);
    setRatingModal({ open: true, activity });
  };

  // Submit rating → persist stars to Firebase child profile, show reward modal
  const handleSubmitRating = async () => {
    if (rating === 0) return;
    setSavingRating(true);

    if (activeChild?.id) {
      const coinsEarned = ratingModal.activity.coins || 0;
      const starsEarned = rating;

      // Persist stars and coins to Firebase child profile
      const updates = {
        stars:      (activeChild.stars      || 0) + starsEarned,
        coin_count: (activeChild.coin_count || 0) + coinsEarned,
      };
      await updateProfile(activeChild.id, updates);
    }

    setSavingRating(false);
    setRatingModal({ open: false, activity: null });
    // Show reward celebration modal
    setRewardModal({
      open: true,
      coins: ratingModal.activity.coins || 0,
      stars: rating,
      title: ratingModal.activity.title,
    });
  };

  const handleCloseReward = () => setRewardModal({ open: false, coins: 0, stars: 0, title: '' });

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Page header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" fontWeight={900} sx={{ mb: 0.25, letterSpacing: '-0.015em' }}>
          🔭 Explore Learning Adventures!
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Pick any adventure and start earning coins — every activity makes you smarter! 🧠✨
        </Typography>
      </Box>

      {/* ── Animated stat cards ── */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        {[
          { label: 'Completed', value: doneCount,               emoji: '🏆', color: '#22C55E', bg: 'rgba(220,252,231,0.9)', border: 'rgba(74,222,128,0.5)'  },
          { label: 'Coins Earned', value: `${totalCoins} 🪙`,   emoji: '✨',  color: '#D97706', bg: 'rgba(255,248,220,0.9)', border: 'rgba(255,193,7,0.5)'   },
          { label: 'Adventures',  value: `${allActivities.length} 🌟`, emoji: '🚀', color: '#3B82F6', bg: 'rgba(219,234,254,0.9)', border: 'rgba(147,197,253,0.5)' },
        ].map((stat) => (
          <Box key={stat.label} sx={{
            display: 'flex', alignItems: 'center', gap: 1.25,
            px: 2, py: 1.25, borderRadius: '18px',
            background: stat.bg, backdropFilter: 'blur(12px)',
            border: `1.5px solid ${stat.border}`,
            boxShadow: `0 4px 14px ${stat.color}20`,
            animation: 'fadeIn 0.5s ease-out',
          }}>
            <Typography sx={{ fontSize: '1.5rem' }}>{stat.emoji}</Typography>
            <Box>
              <Typography fontWeight={900} sx={{ color: stat.color, lineHeight: 1, fontSize: '1.1rem' }}>{stat.value}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>{stat.label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Search ── */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2.5, alignItems: 'center' }}>
        <TextField
          placeholder="🔍 Search for an adventure..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            flex: '1 1 260px', maxWidth: 380,
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
        {search && (
          <Button size="small" onClick={() => setSearch('')}
            sx={{
              color: '#718096', fontWeight: 800, borderRadius: 50,
              bgcolor: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
            }}>
            Clear ×
          </Button>
        )}
      </Box>

      {/* ── Category pills ── */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {categories.map((cat) => {
          const meta   = CATEGORY_META[cat] || CATEGORY_META.All;
          const active = activeCategory === cat;
          return (
            <Box
              key={cat}
              onClick={() => setActiveCategory(cat)}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                px: 1.75, py: 0.65, borderRadius: 50,
                cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem',
                background: active ? meta.color : 'rgba(255,255,255,0.72)',
                color: active ? 'white' : meta.color,
                border: `2px solid ${active ? meta.color : `${meta.color}40`}`,
                backdropFilter: 'blur(8px)',
                boxShadow: active ? `0 4px 14px ${meta.glow}` : 'none',
                transform: active ? 'scale(1.06)' : 'scale(1)',
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                fontFamily: '"Nunito", sans-serif',
                '&:hover': {
                  background: meta.color, color: 'white',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <span style={{ fontSize: '1rem' }}>{meta.emoji}</span>
              {cat}
            </Box>
          );
        })}
      </Box>

      {/* ── Results count ── */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 700 }}>
        {filtered.length === 0
          ? '🔍 No adventures match — try a different search!'
          : `✨ ${filtered.length} adventure${filtered.length !== 1 ? 's' : ''} ${activeCategory !== 'All' ? `in ${activeCategory}` : 'waiting for you'}!`}
      </Typography>

      {/* ── Activity Grid ── */}
      {filtered.length === 0 ? (
        <Box sx={{
          p: 6, textAlign: 'center', borderRadius: '24px',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.7)',
        }}>
          <Typography sx={{ fontSize: '3.5rem', mb: 1.5, animation: 'bounce 2s ease-in-out infinite' }}>🔍</Typography>
          <Typography variant="h6" fontWeight={900} sx={{ mb: 0.75 }}>No adventures found</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Try searching for something else or pick a different topic!
          </Typography>
          <Button sx={{ mt: 2.5, fontWeight: 900, borderRadius: 50 }} variant="contained"
            onClick={() => { setSearch(''); setActiveCategory('All'); }}>
            Show All Adventures 🌈
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2} alignItems="stretch">
          {filtered.map((activity, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={activity.title}
              sx={{ animation: `slideInUp 0.4s ease-out ${i * 0.04}s both`, display: 'flex' }}>
              <ActivityCard {...activity} onClick={() => handleActivityClick(activity)} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Star Rating Modal (shown when an activity is clicked) ── */}
      <ModalDialog
        open={ratingModal.open}
        onClose={() => setRatingModal({ open: false, activity: null })}
        title={`Rate: ${ratingModal.activity?.title || ''}`}
        type="info"
        confirmText={rating === 0 ? 'Select a rating first' : `Submit ${rating} ⭐`}
        cancelText="Maybe later"
        onConfirm={handleSubmitRating}
        onCancel={() => setRatingModal({ open: false, activity: null })}
        loading={savingRating}
        maxWidth="xs"
      >
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>{ratingModal.activity?.image || '🎯'}</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 2.5 }}>
            How did you enjoy this adventure?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <StarRating
              value={rating}
              onChange={setRating}
              size="large"
              max={5}
            />
          </Box>
          {rating > 0 && (
            <Typography variant="caption" fontWeight={800} sx={{
              color: '#F5A623',
              animation: 'fadeIn 0.3s ease-out',
            }}>
              {['', "Just okay 🙂", "Pretty good! 😊", "I liked it! 😃", "Really fun! 🤩", "AMAZING! 🌟"][rating]}
            </Typography>
          )}
          {ratingModal.activity?.coins > 0 && (
            <Box sx={{
              mt: 2, px: 2, py: 1, borderRadius: '12px',
              bgcolor: 'rgba(255,248,220,0.9)', border: '1px solid rgba(255,193,7,0.4)',
              display: 'inline-block',
            }}>
              <Typography variant="caption" fontWeight={900} sx={{ color: '#D97706' }}>
                🪙 You'll earn {ratingModal.activity.coins} coins!
              </Typography>
            </Box>
          )}
        </Box>
      </ModalDialog>

      {/* ── Reward Celebration Modal (shown after rating submission) ── */}
      <ModalDialog
        open={rewardModal.open}
        onClose={handleCloseReward}
        title="Amazing work! 🎉"
        type="success"
        confirmText="Collect Reward!"
        cancelText=""
        onConfirm={handleCloseReward}
        maxWidth="xs"
      >
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 1, animation: 'celebrationPop 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
            🎊
          </Typography>
          <Typography variant="h6" fontWeight={900} sx={{ mb: 0.5 }}>
            {rewardModal.title} completed!
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, mb: 1 }}>
            <Box sx={{
              px: 2.5, py: 1.5, borderRadius: '14px',
              bgcolor: 'rgba(255,248,220,0.9)', border: '1.5px solid rgba(255,193,7,0.4)',
              textAlign: 'center',
            }}>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#D97706' }}>
                +{rewardModal.coins}
              </Typography>
              <Typography variant="caption" fontWeight={800} sx={{ color: '#D97706' }}>
                🪙 COINS
              </Typography>
            </Box>
            <Box sx={{
              px: 2.5, py: 1.5, borderRadius: '14px',
              bgcolor: 'rgba(255,248,220,0.9)', border: '1.5px solid rgba(255,193,7,0.4)',
              textAlign: 'center',
            }}>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#F5A623' }}>
                +{rewardModal.stars}
              </Typography>
              <Typography variant="caption" fontWeight={800} sx={{ color: '#F5A623' }}>
                ⭐ STARS
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <StarRating value={rewardModal.stars} readOnly size="medium" />
          </Box>
        </Box>
      </ModalDialog>
    </Box>
  );
};

export default ChildExplore;
