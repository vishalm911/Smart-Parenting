import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, Divider, Alert, InputAdornment,
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
    <Box sx={{ maxWidth: 440, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
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

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth label="Email Address" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
            <Typography
              variant="body2"
              sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </Typography>
          </Box>

          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
            sx={{ py: 1.4, fontWeight: 700, fontSize: '0.95rem', mb: 2 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">or</Typography>
        </Divider>

        <GoogleSignInButton onClick={handleGoogleLogin} disabled={loading} />
      </Paper>

      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Typography component="span" variant="body2"
            sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate('/register')}>
            Register
          </Typography>
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 1, color: 'text.secondary' }} size="small">
          Back to Role Selection
        </Button>
      </Box>
    </Box>
  );
};

export default TeacherLogin;
