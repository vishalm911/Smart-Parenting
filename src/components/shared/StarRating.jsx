import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';

/**
 * StarRating Component
 * 
 * @param {number} value - Current rating value (0-5)
 * @param {function} onChange - Callback when rating changes (null for read-only)
 * @param {number} max - Maximum number of stars (default: 5)
 * @param {string} size - Size: 'small', 'medium', 'large' (default: 'medium')
 * @param {string} color - Star color (default: '#FFC107')
 * @param {boolean} readOnly - If true, disables interaction
 * @param {boolean} showValue - If true, shows numeric value beside stars
 */
const StarRating = ({
  value = 0,
  onChange = null,
  max = 5,
  size = 'medium',
  color = '#FFC107',
  readOnly = false,
  showValue = false,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    small: { fontSize: 20, gap: 2 },
    medium: { fontSize: 28, gap: 4 },
    large: { fontSize: 36, gap: 6 },
  };

  const currentSize = sizes[size] || sizes.medium;
  const displayValue = hoverValue || value;

  const handleClick = (starIndex) => {
    if (!readOnly && onChange) {
      onChange(starIndex);
    }
  };

  const handleMouseEnter = (starIndex) => {
    if (!readOnly && onChange) {
      setHoverValue(starIndex);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const isFilled = displayValue >= starValue;
    const isHalf = !isFilled && displayValue >= starValue - 0.5;

    const starStyle = {
      fontSize: currentSize.fontSize,
      color: isFilled || isHalf ? color : '#E2E8F0',
      cursor: readOnly ? 'default' : 'pointer',
      transition: 'all 0.2s ease-in-out',
      transform: hoverValue === starValue ? 'scale(1.2)' : 'scale(1)',
      filter: isFilled ? 'drop-shadow(0 2px 4px rgba(255, 193, 7, 0.4))' : 'none',
    };

    let StarComponent = StarBorderIcon;
    if (isFilled) StarComponent = StarIcon;
    else if (isHalf) StarComponent = StarHalfIcon;

    return (
      <StarComponent
        key={index}
        sx={starStyle}
        onClick={() => handleClick(starValue)}
        onMouseEnter={() => handleMouseEnter(starValue)}
        onMouseLeave={handleMouseLeave}
      />
    );
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${currentSize.gap}px`,
      }}
    >
      <Box sx={{ display: 'flex', gap: `${currentSize.gap}px` }}>
        {Array.from({ length: max }, (_, i) => renderStar(i))}
      </Box>
      {showValue && (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            ml: 1,
          }}
        >
          {value.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};

export default StarRating;
