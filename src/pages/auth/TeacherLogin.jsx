import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Divider, Alert, InputAdornment,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PasswordField from '../../components/auth/PasswordField';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { loginWithEmail, loginWithGoogle } from '../../firebase/authService';
import { getUserAccount, createUserAccount } from '../../firebase/firestoreService';
import SpacECELogo from '../../components/shared/SpacECELogo';

const ROLE_DASHBOARDS_MAP = {
  parent: '/parent/dashboard',
  teacher: '/teacher/dashboard',
  admin: '/admin/dashboard',
};

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithEmail(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Verify/fetch Firestore account role
    const { data: account } = await getUserAccount(result.user.uid);
    if (!account) {
      // New user — create account with teacher role
      await createUserAccount(result.user.uid, {
        email: result.user.email,
        role: 'teacher',
        displayName: result.user.displayName || '',
      });
      navigate('/teacher/dashboard');
      return;
    }

    // Route to actual role dashboard
    const destination = ROLE_DASHBOARDS_MAP[account.role] || '/teacher/dashboard';
    navigate(destination);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Only create account if it doesn't already exist (prevents overwriting existing roles)
    const { data: existing } = await getUserAccount(result.user.uid);
    if (!existing) {
      await createUserAccount(result.user.uid, {
        email: result.user.email,
        role: 'teacher',
        displayName: result.user.displayName || '',
      });
      navigate('/teacher/dashboard');
      return;
    }

    const destination = ROLE_DASHBOARDS_MAP[existing.role] || '/teacher/dashboard';
    navigate(destination);
  };

  return (
    <Box sx={{ maxWidth: 460, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Header ── */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <SpacECELogo variant="glass" width={115} />
        </Box>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#111111', mb: 0.5 }}>
          Teacher Login
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          Welcome back! 📚 Guide your students to success.
        </Typography>
      </Box>

      {/* ── Login Card ── */}
      <Box sx={{
        p: { xs: 3, sm: 4 }, borderRadius: '28px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 40px rgba(31,58,104,0.12)',
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px' }}>{error}</Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth label="Email Address" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: '#4299E1', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <PasswordField
            value={password} onChange={(e) => setPassword(e.target.value)}
            required sx={{ mb: 1.5 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#FF9500', fontWeight: 800, cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </Typography>
          </Box>

          <Button
            type="submit" variant="contained" fullWidth size="large"
            disabled={loading}
            sx={{
              py: 1.6, fontWeight: 900, fontSize: '1rem', mb: 2,
              borderRadius: 50,
              background: 'linear-gradient(135deg, #4299E1 0%, #63B3ED 100%)',
              boxShadow: '0 6px 20px rgba(66,153,225,0.4)',
              '&:hover': { boxShadow: '0 10px 28px rgba(66,153,225,0.55)' },
            }}
          >
            {loading ? 'Signing in...' : 'Sign In 📚'}
          </Button>
        </form>

        <Divider sx={{ my: 2, '&::before, &::after': { borderColor: 'rgba(0,0,0,0.1)' } }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>or continue with</Typography>
        </Divider>

        <GoogleSignInButton onClick={handleGoogleLogin} disabled={loading} />
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Don't have an account?{' '}
          <Typography component="span" variant="body2"
            sx={{
              color: '#FF9500', fontWeight: 900, cursor: 'pointer',
              bgcolor: 'rgba(255,149,0,0.1)', px: 1.5, py: 0.25, borderRadius: 10,
              '&:hover': { bgcolor: 'rgba(255,149,0,0.2)' },
            }}
            onClick={() => navigate('/register')}>
            Register Free →
          </Typography>
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{
            mt: 1.5, color: '#718096', fontWeight: 700,
            bgcolor: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: 50, px: 2.5,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' },
          }}
          size="small"
        >
          Back to Role Selection
        </Button>
      </Box>
    </Box>
  );
};

export default TeacherLogin;
