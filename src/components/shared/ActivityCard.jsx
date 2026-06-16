import { Box, Card, CardContent, Typography, LinearProgress, Chip } from '@mui/material';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const CATEGORY_COLORS = {
  Literacy: { bg: 'rgba(219,234,254,0.8)', color: '#1D4ED8', dot: '#3B82F6', gradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' },
  Math:     { bg: 'rgba(220,252,231,0.8)', color: '#166534', dot: '#22C55E', gradient: 'linear-gradient(135deg, #F0FFF4, #DCFCE7)' },
  Science:  { bg: 'rgba(207,250,254,0.8)', color: '#0E7490', dot: '#06B6D4', gradient: 'linear-gradient(135deg, #ECFEFF, #CFFAFE)' },
  Art:      { bg: 'rgba(255,237,213,0.8)', color: '#9A3412', dot: '#F97316', gradient: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' },
  Music:    { bg: 'rgba(243,232,255,0.8)', color: '#6B21A8', dot: '#A855F7', gradient: 'linear-gradient(135deg, #FAF5FF, #F3E8FF)' },
  Social:   { bg: 'rgba(255,241,242,0.8)', color: '#9F1239', dot: '#F43F5E', gradient: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)' },
  Default:  { bg: 'rgba(248,250,252,0.8)', color: '#334155', dot: '#94A3B8', gradient: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)' },
};

const DIFFICULTY_META = {
  Easy:   { color: '#15803D', bg: 'rgba(220,252,231,0.9)', stars: '⭐',    label: 'Easy'   },
  Medium: { color: '#D97706', bg: 'rgba(255,237,213,0.9)', stars: '⭐⭐',  label: 'Medium' },
  Hard:   { color: '#DC2626', bg: 'rgba(255,237,237,0.9)', stars: '⭐⭐⭐', label: 'Hard'   },
};

const ENCOURAGE = [
  "You've got this! 💪",
  "Let's go, superstar! 🌟",
  "Adventure awaits! 🚀",
  "Keep it up, champ! 🏆",
  "Learning is fun! 🎉",
];

/**
 * ActivityCard — Premium glassmorphism version
 * Equal height via flexbox, rich metadata, animated progress, coin badge
 */
const ActivityCard = ({
  title = 'Activity',
  description = '',
  image = '📚',
  progress = 0,
  category = '',
  duration = '',
  coins = 0,
  difficulty = '',
  ageGroup = '',
  locked = false,
  onClick = null,
  variant = 'default',
}) => {
  const isFeatured = variant === 'featured';
  const isCompact  = variant === 'compact';
  const isDone     = progress === 100;
  const catStyle   = CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;
  const diffMeta   = DIFFICULTY_META[difficulty];
  const encourageIdx = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % ENCOURAGE.length;

  /* ── Compact variant ── */
  if (isCompact) {
    return (
      <Box
        onClick={locked ? undefined : onClick}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          p: 1.5, borderRadius: '16px',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255,255,255,0.7)',
          boxShadow: '0 2px 10px rgba(31,58,104,0.07)',
          cursor: onClick && !locked ? 'pointer' : 'default',
          transition: 'all 0.25s ease',
          '&:hover': (!locked && onClick) ? {
            transform: 'translateX(4px)',
            boxShadow: `0 6px 18px ${catStyle.dot}25`,
          } : {},
          width: '100%',
        }}
      >
        <Box sx={{
          width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
          background: catStyle.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
          border: '1px solid rgba(255,255,255,0.8)',
        }}>
          {locked ? '🔒' : (typeof image === 'string' && image.startsWith('http')
            ? <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
            : image)}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={800} noWrap>{title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{description}</Typography>
        </Box>
        {progress > 0 && (
          <Box sx={{
            minWidth: 44, textAlign: 'right',
            bgcolor: isDone ? 'rgba(220,252,231,0.9)' : 'rgba(255,248,220,0.9)',
            borderRadius: 10, px: 1, py: 0.25,
          }}>
            <Typography variant="caption" fontWeight={900} sx={{ color: isDone ? '#15803D' : '#D97706', fontSize: '0.7rem' }}>
              {isDone ? '✅' : `${progress}%`}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  /* ── Default / Featured variant ── */
  return (
    <Card
      onClick={locked ? undefined : onClick}
      elevation={0}
      sx={{
        cursor: locked ? 'not-allowed' : onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        opacity: locked ? 0.6 : 1,
        background: isDone
          ? 'linear-gradient(135deg, rgba(220,252,231,0.85), rgba(187,247,208,0.7))'
          : isFeatured
            ? 'linear-gradient(135deg, rgba(255,248,220,0.9), rgba(255,237,179,0.8))'
            : 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `2px solid ${isDone ? 'rgba(74,222,128,0.5)' : isFeatured ? 'rgba(255,193,7,0.5)' : 'rgba(255,255,255,0.7)'}`,
        boxShadow: '0 4px 20px rgba(31,58,104,0.08)',
        transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
        '&:hover': (!locked && onClick) ? {
          transform: 'translateY(-6px)',
          boxShadow: `0 16px 40px ${catStyle.dot}30`,
          borderColor: `${catStyle.dot}60`,
        } : {},
        borderRadius: '22px',
      }}
    >
      {/* "DONE" ribbon */}
      {isDone && !locked && (
        <Box sx={{
          position: 'absolute', top: 14, right: -24, width: 88,
          bgcolor: '#22C55E', color: 'white', fontSize: '0.5rem', fontWeight: 900,
          py: 0.4, transform: 'rotate(35deg)', letterSpacing: '0.08em',
          textAlign: 'center', zIndex: 2,
          boxShadow: '0 2px 8px rgba(34,197,94,0.4)',
        }}>
          DONE! ✓
        </Box>
      )}

      {/* Category colored top strip */}
      <Box sx={{
        height: 4,
        background: `linear-gradient(90deg, ${catStyle.dot}, ${catStyle.dot}80)`,
      }} />

      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header: image + title */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.25 }}>

          {/* Emoji in colored rounded square */}
          <Box sx={{
            width: 58, height: 58, borderRadius: '16px', flexShrink: 0,
            background: catStyle.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
            border: `1.5px solid ${catStyle.dot}30`,
            boxShadow: `0 4px 12px ${catStyle.dot}20`,
            position: 'relative',
            transition: 'transform 0.25s ease',
          }}>
            {typeof image === 'string' && image.startsWith('http') ? (
              <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
            ) : image}
            {locked && (
              <Box sx={{
                position: 'absolute', inset: 0, borderRadius: '14px',
                bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LockIcon sx={{ fontSize: 20, color: 'white' }} />
              </Box>
            )}
            {isDone && !locked && (
              <Box sx={{
                position: 'absolute', bottom: -4, right: -4,
                bgcolor: '#22C55E', borderRadius: '50%', width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: 'white' }} />
              </Box>
            )}
          </Box>

          {/* Title + category */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800, lineHeight: 1.3, mb: 0.5,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: isDone ? '#166534' : 'text.primary',
              }}
            >
              {title}
            </Typography>

            {category && (
              <Chip
                label={`${category}`}
                size="small"
                sx={{
                  height: 20, fontSize: '0.62rem', fontWeight: 800,
                  bgcolor: catStyle.bg, color: catStyle.color,
                  border: `1px solid ${catStyle.dot}40`,
                  mb: 0.5, borderRadius: 10,
                }}
              />
            )}

            {description && (
              <Typography variant="caption" color="text.secondary" sx={{
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', lineHeight: 1.45, fontWeight: 500,
              }}>
                {description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Metadata badges */}
        {(diffMeta || ageGroup || duration) && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.25 }}>
            {diffMeta && (
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.4,
                px: 1.25, py: 0.3, borderRadius: 10,
                bgcolor: diffMeta.bg, border: `1px solid ${diffMeta.color}30`,
              }}>
                <Typography sx={{ fontSize: '0.65rem' }}>{diffMeta.stars}</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 800, color: diffMeta.color }}>
                  {difficulty}
                </Typography>
              </Box>
            )}
            {ageGroup && (
              <Box sx={{
                display: 'inline-flex', alignItems: 'center',
                px: 1.25, py: 0.3, borderRadius: 10,
                bgcolor: 'rgba(248,250,252,0.9)', border: '1px solid rgba(148,163,184,0.3)',
              }}>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'text.secondary' }}>
                  Ages {ageGroup}
                </Typography>
              </Box>
            )}
            {duration && (
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.3,
                px: 1.25, py: 0.3, borderRadius: 10,
                bgcolor: 'rgba(248,250,252,0.9)', border: '1px solid rgba(148,163,184,0.3)',
              }}>
                <PlayCircleOutlinedIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'text.disabled' }}>
                  {duration}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Spacer to push progress/footer to bottom */}
        <Box sx={{ flex: 1 }} />

        {/* Progress bar */}
        {progress > 0 && (
          <Box sx={{ mb: 1.25 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                {isDone ? '🎉 Completed!' : 'Progress'}
              </Typography>
              <Typography variant="caption" sx={{
                fontWeight: 900, fontSize: '0.7rem',
                color: isDone ? '#15803D' : '#D97706',
              }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 9, borderRadius: 100,
                bgcolor: 'rgba(0,0,0,0.07)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 100,
                  background: isDone
                    ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                    : 'linear-gradient(90deg, #FF9500, #FFC107)',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                },
              }}
            />
          </Box>
        )}

        {/* Footer: coins + encouragement */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {coins > 0 ? (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              bgcolor: 'rgba(255,248,220,0.9)',
              borderRadius: 10, px: 1.25, py: 0.35,
              border: '1px solid rgba(255,193,7,0.4)',
            }}>
              <MonetizationOnIcon sx={{ fontSize: 13, color: '#FFC107' }} />
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#D97706', fontSize: '0.7rem' }}>
                +{coins}
              </Typography>
            </Box>
          ) : <Box />}

          {!locked && progress < 100 && (
            <Typography variant="caption" sx={{
              color: catStyle.dot, fontWeight: 700, fontSize: '0.65rem', fontStyle: 'italic',
            }}>
              {ENCOURAGE[encourageIdx]}
            </Typography>
          )}
          {isDone && !locked && (
            <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800, fontSize: '0.68rem' }}>
              ✅ All done!
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
