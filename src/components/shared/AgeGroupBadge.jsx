import { Chip } from '@mui/material';
import { AGE_GROUPS } from '../../utils/constants';

/**
 * AgeGroupBadge Component
 *
 * @param {string} ageGroup - Age group value: '1-3', '4-6', '7-10'
 * @param {string} size - 'small' | 'medium' (default: 'small')
 * @param {string} variant - MUI Chip variant
 */
const AgeGroupBadge = ({ ageGroup = '4-6', size = 'small', variant = 'filled' }) => {
  const config = AGE_GROUPS[ageGroup] || AGE_GROUPS['4-6'];

  return (
    <Chip
      label={config.label}
      size={size}
      variant={variant}
      sx={{
        backgroundColor: variant === 'filled' ? config.color : 'transparent',
        color: variant === 'filled' ? '#FFFFFF' : config.color,
        border: variant === 'outlined' ? `2px solid ${config.color}` : 'none',
        fontWeight: 700,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        letterSpacing: '0.02em',
        borderRadius: 6,
        height: size === 'small' ? 24 : 30,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: `0 2px 8px ${config.color}40`,
        },
      }}
    />
  );
};

export default AgeGroupBadge;
