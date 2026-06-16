import { Box, Typography, CircularProgress } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

/**
 * LoadingSpinner Component
 *
 * @param {boolean} fullScreen - If true, covers entire viewport
 * @param {string} message - Loading message text
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {boolean} branded - Show SpaceECE branding
 */
const LoadingSpinner = ({
  fullScreen = false,
  message = 'Loading...',
  size = 'medium',
  branded = true,
}) => {
  const sizes = {
    small: 30,
    medium: 50,
    large: 70,
  };

  const spinnerSize = sizes[size] || sizes.medium;

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
      }}
    >
      {branded ? (
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress
            size={spinnerSize + 20}
            thickness={3}
            sx={{
              color: 'secondary.main',
              position: 'absolute',
              animation: 'spin 2s linear infinite',
            }}
          />
          <Box
            sx={{
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1F3A68 0%, #2E5090 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <RocketLaunchIcon
              sx={{
                fontSize: spinnerSize * 0.5,
                color: 'white',
                animation: 'bounce 1s ease-in-out infinite',
              }}
            />
          </Box>
        </Box>
      ) : (
        <CircularProgress
          size={spinnerSize}
          thickness={4}
          sx={{
            color: 'primary.main',
          }}
        />
      )}

      {message && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            animation: 'fadeIn 0.5s ease-out',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;
