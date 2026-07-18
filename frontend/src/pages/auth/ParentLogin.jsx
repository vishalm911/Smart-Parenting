import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControlLabel,
  Checkbox, Divider, Alert, InputAdornment,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PasswordField from '../../components/auth/PasswordField';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import SpacECELogo from '../../components/shared/SpacECELogo';
import { useAuth } from '../../context/AuthContext';

const ROLE_DASHBOARDS_MAP = {
  parent:  '/parent/dashboard',
  teacher: '/teacher/dashboard',
  admin:   '/admin/dashboard',
};

const ParentLogin = () => {
  const navigate = useNavigate();
  const { login, loginGoogle, isAuthenticated, userRole, refreshUser } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
  // Only redirect if already logged in before visiting this page
  // Don't trigger after fresh login — handleLogin handles that
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');
  if (token && user?.role === 'parent') {
    navigate('/parent/dashboard', { replace: true });
  }
}, []); // empty deps — only on mount, not on every auth change

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    const destination = ROLE_DASHBOARDS_MAP[result.user?.role] || '/parent/dashboard';
    navigate(destination);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await loginGoogle('parent');
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    const destination = ROLE_DASHBOARDS_MAP[result.user?.role] || '/parent/dashboard';
    navigate(destination);
  };

  return (
    <Box sx={{ maxWidth: 460, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <SpacECELogo variant="glass" width={115} />
        </Box>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#111111', mb: 0.5 }}>
          Parent Login
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          Welcome back! 🌿 Manage your child's learning journey.
        </Typography>
      </Box>

      <Box sx={{
        p: { xs: 3, sm: 4 }, borderRadius: '28px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 40px rgba(31,58,104,0.12)',
      }}>
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px' }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth label="Email Address" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: '#3BB77E', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <PasswordField
            value={password} onChange={(e) => setPassword(e.target.value)}
            required sx={{ mb: 1.5 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox size="small" checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{ color: '#3BB77E', '&.Mui-checked': { color: '#3BB77E' } }} />
              }
              label={<Typography variant="body2" color="text.secondary" fontWeight={600}>Remember me</Typography>}
            />
            <Typography variant="body2"
              sx={{ color: '#FF9500', fontWeight: 800, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate('/forgot-password')}>
              Forgot Password?
            </Typography>
          </Box>
          <Button type="submit" variant="contained" fullWidth size="large"
            disabled={loading}
            sx={{
              py: 1.6, fontWeight: 900, fontSize: '1rem', mb: 2, borderRadius: 50,
              background: 'linear-gradient(135deg, #3BB77E 0%, #6EE7B7 100%)',
              boxShadow: '0 6px 20px rgba(59,183,126,0.4)',
            }}>
            {loading ? 'Signing in...' : 'Sign In 🌟'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>or continue with</Typography>
        </Divider>

        <GoogleSignInButton
          role="parent"
          onSuccess={async (user) => {
            await refreshUser();
            navigate(ROLE_DASHBOARDS_MAP[user?.role] || '/parent/dashboard');
          }}
          onError={(msg) => setError(msg)}
        />
      </Box>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Don't have an account?{' '}
          <Typography component="span" variant="body2"
            sx={{ color: '#FF9500', fontWeight: 900, cursor: 'pointer', bgcolor: 'rgba(255,149,0,0.1)', px: 1.5, py: 0.25, borderRadius: 10 }}
            onClick={() => navigate('/register')}>
            Register Free →
          </Typography>
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}
          sx={{ mt: 1.5, color: '#718096', fontWeight: 700, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 50, px: 2.5 }}
          size="small">
          Back to Role Selection
        </Button>
      </Box>
    </Box>
  );
};

export default ParentLogin;