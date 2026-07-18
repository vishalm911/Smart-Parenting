import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

/**
 * MaintenancePage
 * Shown to all non-admin users when maintenanceMode feature flag is ON.
 * Admins are allowed through so they can still toggle the flag off.
 */
const MaintenancePage = () => {
  const { userRole } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background blobs */}
      <Box
        sx={{
          position: 'absolute', width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          top: '-15%', left: '-10%',
          animation: 'pulse 6s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
            '50%': { transform: 'scale(1.15)', opacity: 1 },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
          bottom: '-10%', right: '-5%',
          animation: 'pulse 8s ease-in-out infinite reverse',
        }}
      />

      {/* Gear icon */}
      <Box
        sx={{
          fontSize: '6rem',
          mb: 3,
          animation: 'spin 10s linear infinite',
          '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
          filter: 'drop-shadow(0 0 30px rgba(99,102,241,0.6))',
          lineHeight: 1,
        }}
      >
        ⚙️
      </Box>

      {/* Glassmorphism card */}
      <Box
        sx={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '28px',
          px: { xs: 4, sm: 7 },
          py: 6,
          textAlign: 'center',
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography
          variant="h3"
          fontWeight={900}
          sx={{
            color: '#fff',
            letterSpacing: '-0.03em',
            mb: 1,
            fontSize: { xs: '2rem', sm: '2.5rem' },
          }}
        >
          Under Maintenance
        </Typography>

        <Box
          sx={{
            display: 'inline-block',
            px: 2, py: 0.5,
            borderRadius: '50px',
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            mb: 3,
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>
            WE&apos;LL BE BACK SOON
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, mb: 4, fontSize: '1rem' }}
        >
          SpacECE is currently undergoing scheduled maintenance to improve your experience.
          Please check back in a little while. 🚀
        </Typography>

        {/* Decorative dots loader */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 4 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 10, height: 10,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                animation: 'bounce 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
                '@keyframes bounce': {
                  '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
                  '40%': { transform: 'scale(1)', opacity: 1 },
                },
              }}
            />
          ))}
        </Box>

        {/* Admin bypass hint */}
        {userRole === 'admin' && (
          <Button
            href="/admin/features"
            variant="outlined"
            size="small"
            sx={{
              color: '#a78bfa',
              borderColor: 'rgba(167,139,250,0.4)',
              borderRadius: '50px',
              fontSize: '0.78rem',
              fontWeight: 700,
              px: 3,
              '&:hover': {
                borderColor: '#a78bfa',
                background: 'rgba(167,139,250,0.1)',
              },
            }}
          >
            Admin: Go to Feature Flags →
          </Button>
        )}
      </Box>

      <Typography sx={{ color: 'rgba(255,255,255,0.25)', mt: 5, fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} SpacECE India Foundation
      </Typography>
    </Box>
  );
};

export default MaintenancePage;
