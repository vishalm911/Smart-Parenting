import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

/**
 * ProgressRing Component
 *
 * @param {number} value - Progress value (0-100)
 * @param {number} size - Ring size in pixels (default: 120)
 * @param {number} strokeWidth - Stroke width (default: 8)
 * @param {string} color - Progress color (default: brand orange)
 * @param {string} trackColor - Background track color
 * @param {boolean} showPercentage - Show percentage text in center
 * @param {boolean} animated - Animate on mount
 * @param {node} children - Custom center content
 */
const ProgressRing = ({
  value = 0,
  size = 120,
  strokeWidth = 8,
  color = '#F5A623',
  trackColor = '#E2E8F0',
  showPercentage = true,
  animated = true,
  children = null,
}) => {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    let animationFrame;
    const startTime = Date.now();
    const duration = 1000; // 1 second animation

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayValue / 100) * circumference;
  const center = size / 2;

  // Determine color based on progress
  const getProgressColor = () => {
    if (displayValue >= 100) return '#48BB78';
    if (displayValue >= 75) return '#38A169';
    if (displayValue >= 50) return color;
    if (displayValue >= 25) return '#FFC107';
    return '#FC8181';
  };

  const activeColor = getProgressColor();

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: animated ? 'none' : 'stroke-dashoffset 0.5s ease-in-out',
            filter: `drop-shadow(0 0 6px ${activeColor}40)`,
          }}
        />
      </svg>

      {/* Center content */}
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children || (
          showPercentage && (
            <>
              <Typography
                sx={{
                  fontSize: size * 0.22,
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1,
                }}
              >
                {displayValue}%
              </Typography>
              <Typography
                sx={{
                  fontSize: size * 0.1,
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                Complete
              </Typography>
            </>
          )
        )}
      </Box>
    </Box>
  );
};

export default ProgressRing;
