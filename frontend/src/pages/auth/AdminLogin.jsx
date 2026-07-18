import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, InputAdornment,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PasswordField from '../../components/auth/PasswordField';
import SpacECELogo from '../../components/shared/SpacECELogo';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');
    if (token && user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    if (result.user?.role !== 'admin') {
      setError('Access denied. This portal is for administrators only.');
      return;
    }
    navigate('/admin/dashboard');
  };

  return (
    <Box sx={{ maxWidth: 460, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <SpacECELogo variant="glass" width={105} />
        </Box>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#111111', mb: 0.5 }}>
          Admin Portal
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          🔐 Authorized personnel only
        </Typography>
      </Box>

      <Box sx={{
        p: { xs: 3, sm: 4 }, borderRadius: '28px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 40px rgba(31,58,104,0.12)', mb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '10px',
            background: 'linear-gradient(135deg, #9F7AEA, #C084FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography sx={{ fontSize: '1rem' }}>🖥️</Typography>
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={900} sx={{ color: '#9F7AEA', lineHeight: 1.2 }}>
              Platform Administrator
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Users, Sessions, Notifications, Features + Literacy
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px' }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth label="Admin Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: '#9F7AEA', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <PasswordField
            label="Admin Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            required sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" fullWidth size="large"
            disabled={loading}
            sx={{
              py: 1.6, fontWeight: 900, fontSize: '1rem', borderRadius: 50,
              background: 'linear-gradient(135deg, #9F7AEA 0%, #C084FC 100%)',
              boxShadow: '0 6px 20px rgba(159,122,234,0.4)',
            }}>
            {loading ? 'Authenticating...' : 'Sign In to Admin Portal 🔐'}
          </Button>
        </form>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="body2"
          sx={{ color: '#FF9500', fontWeight: 800, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate('/forgot-password')}>
          Forgot Password?
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

export default AdminLogin;