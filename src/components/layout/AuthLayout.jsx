import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link } from '@mui/material';

/* Cloud shape builder */
const CloudGroup = ({ sx, scale = 1 }) => (
  <Box sx={{ position: 'absolute', ...sx }}>
    <Box sx={{ position: 'relative', width: 130 * scale, height: 52 * scale }}>
      <Box sx={{ position: 'absolute', width: 130 * scale, height: 44 * scale, top: 8 * scale, left: 0,   bgcolor: 'rgba(255,255,255,0.65)', borderRadius: '50%', backdropFilter: 'blur(3px)' }} />
      <Box sx={{ position: 'absolute', width: 84  * scale, height: 64 * scale, top: -12 * scale, left: 22 * scale, bgcolor: 'rgba(255,255,255,0.65)', borderRadius: '50%', backdropFilter: 'blur(3px)' }} />
      <Box sx={{ position: 'absolute', width: 68  * scale, height: 46 * scale, top: 0,   left: 64 * scale, bgcolor: 'rgba(255,255,255,0.65)', borderRadius: '50%', backdropFilter: 'blur(3px)' }} />
    </Box>
  </Box>
);

const AuthLayout = () => {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(175deg, #74C6F0 0%, #A8DEFF 28%, #C9EEFF 54%, #DFF5FF 76%, #F0FAFF 100%)',
    }}>

      {/* ── Drifting clouds ── */}
      <CloudGroup sx={{ top: '8%',  left: '-3%',  animation: 'cloudDrift 14s ease-in-out infinite' }} scale={1.1} />
      <CloudGroup sx={{ top: '5%',  right: '4%',  animation: 'cloudDrift 18s ease-in-out infinite', animationDelay: '4s' }} scale={0.78} />
      <CloudGroup sx={{ top: '48%', left: '1%',   animation: 'cloudDrift 20s ease-in-out infinite', animationDelay: '8s' }} scale={0.65} />
      <CloudGroup sx={{ bottom: '14%', right: '2%', animation: 'cloudDrift 16s ease-in-out infinite', animationDelay: '2s' }} scale={0.9} />
      <CloudGroup sx={{ bottom: '30%', left: '5%', animation: 'cloudDrift 22s ease-in-out infinite', animationDelay: '6s' }} scale={0.5} />

      {/* ── Floating stars & sparkles ── */}
      {[
        { emoji: '⭐', top: '7%',  left: '8%',   size: '1.7rem', delay: '0s',   dur: '3.5s' },
        { emoji: '✨', top: '14%', right: '18%', size: '1.2rem', delay: '1.1s', dur: '4.2s' },
        { emoji: '🌟', top: '52%', left: '3%',   size: '1.5rem', delay: '0.5s', dur: '5s'   },
        { emoji: '💫', top: '70%', right: '6%',  size: '1.3rem', delay: '2.2s', dur: '3.8s' },
        { emoji: '⭐', bottom: '12%', right: '22%', size: '1rem', delay: '1.6s', dur: '4.5s'},
        { emoji: '✨', top: '30%', left: '10%',  size: '0.9rem', delay: '3s',   dur: '3.5s' },
        { emoji: '🌟', top: '20%', right: '8%',  size: '1rem',   delay: '0.8s', dur: '4.8s' },
        { emoji: '💫', bottom: '24%', left: '12%', size: '1.2rem', delay: '1.8s', dur: '3.2s'},
      ].map((item, i) => (
        <Box key={i} sx={{
          position: 'absolute',
          fontSize: item.size,
          top: item.top, left: item.left, right: item.right, bottom: item.bottom,
          animation: `twinkle ${item.dur} ease-in-out infinite`,
          animationDelay: item.delay,
          pointerEvents: 'none',
          zIndex: 0,
        }}>
          {item.emoji}
        </Box>
      ))}

      {/* ── Floating learning icons (left panel) ── */}
      <Box sx={{
        position: 'absolute', left: 20, top: '28%',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column', gap: 2.5, zIndex: 2,
      }}>
        {[
          { emoji: '⭐', bg: 'rgba(255,248,224,0.9)', shadow: 'rgba(255,193,7,0.4)',  delay: '0s',   dur: '3.5s' },
          { emoji: '🏅', bg: 'rgba(255,243,224,0.9)', shadow: 'rgba(245,166,35,0.4)', delay: '0.5s', dur: '4.2s' },
          { emoji: '💎', bg: 'rgba(232,244,253,0.9)', shadow: 'rgba(66,153,225,0.4)', delay: '1s',   dur: '3.8s' },
          { emoji: '🚀', bg: 'rgba(240,255,244,0.9)', shadow: 'rgba(59,183,126,0.4)', delay: '1.5s', dur: '4.5s' },
        ].map(({ emoji, bg, shadow, delay, dur }, i) => (
          <Box key={i} sx={{
            width: 52, height: 52, borderRadius: '50%',
            bgcolor: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem',
            boxShadow: `0 6px 20px ${shadow}`,
            border: '2px solid rgba(255,255,255,0.8)',
            animation: `float ${dur} ease-in-out infinite`,
            animationDelay: delay,
            cursor: 'default',
            backdropFilter: 'blur(8px)',
          }}>
            {emoji}
          </Box>
        ))}
      </Box>

      {/* ── Floating right decorations ── */}
      <Box sx={{
        position: 'absolute', right: 24, top: '20%',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column', gap: 3, zIndex: 2,
      }}>
        {[
          { emoji: '📚', bg: 'rgba(232,244,253,0.9)', shadow: 'rgba(66,153,225,0.35)', delay: '0.3s', dur: '4s'   },
          { emoji: '✏️', bg: 'rgba(243,232,255,0.9)', shadow: 'rgba(159,122,234,0.35)', delay: '1.2s', dur: '3.7s' },
          { emoji: '🎨', bg: 'rgba(255,240,240,0.9)', shadow: 'rgba(252,129,129,0.35)', delay: '0.7s', dur: '4.8s' },
        ].map(({ emoji, bg, shadow, delay, dur }, i) => (
          <Box key={i} sx={{
            width: 48, height: 48, borderRadius: '50%',
            bgcolor: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: `0 6px 18px ${shadow}`,
            border: '2px solid rgba(255,255,255,0.7)',
            animation: `floatSlow ${dur} ease-in-out infinite`,
            animationDelay: delay,
            backdropFilter: 'blur(8px)',
          }}>
            {emoji}
          </Box>
        ))}
      </Box>

      {/* ── Rocket decoration ── */}
      <Box sx={{
        position: 'absolute', right: { xs: 12, md: 80 }, top: '42%',
        fontSize: '2.2rem',
        animation: 'rocketFloat 5s ease-in-out infinite',
        display: { xs: 'none', sm: 'block' },
        filter: 'drop-shadow(0 6px 12px rgba(31,58,104,0.25))',
        zIndex: 1,
        pointerEvents: 'none',
      }}>
        🚀
      </Box>

      {/* ── Main centered content ── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: 5,
        position: 'relative',
        zIndex: 1,
      }}>
        <Outlet />
      </Box>

      {/* ── Astronaut mascot (bottom-right) ── */}
      <Box sx={{
        position: 'fixed',
        bottom: 24, right: 24,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1, zIndex: 10,
        pointerEvents: 'none',
        animation: 'float 5s ease-in-out infinite',
      }}>
        {/* Speech bubble */}
        <Box sx={{
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255,255,255,0.7)',
          borderRadius: '18px 18px 4px 18px',
          px: 2, py: 1,
          boxShadow: '0 8px 24px rgba(31,58,104,0.15)',
        }}>
          <Typography variant="caption" fontWeight={800} sx={{ color: '#1F3A68', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
            Let's explore together! 🌟
          </Typography>
        </Box>

        {/* Astronaut */}
        <Box sx={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1F3A68 0%, #3A6BC4 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.4rem',
          boxShadow: '0 8px 28px rgba(31,58,104,0.35)',
          border: '3px solid rgba(255,255,255,0.8)',
          alignSelf: 'flex-end',
        }}>
          🧑‍🚀
        </Box>
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ textAlign: 'center', py: 2, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(31,58,104,0.55)', fontWeight: 700 }}>
          © {new Date().getFullYear()} SpacECE India Foundation · Learning Adventures Await! 🚀
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
          <Link component={RouterLink} to="/privacy" sx={{ color: 'rgba(31,58,104,0.6)', fontWeight: 700, fontSize: '0.72rem', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: '#FF9500' } }}>
            Privacy Policy
          </Link>
          <Typography variant="caption" sx={{ color: 'rgba(31,58,104,0.4)', fontWeight: 700, fontSize: '0.72rem' }}>•</Typography>
          <Link component={RouterLink} to="/terms" sx={{ color: 'rgba(31,58,104,0.6)', fontWeight: 700, fontSize: '0.72rem', textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: '#FF9500' } }}>
            Terms of Service
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
