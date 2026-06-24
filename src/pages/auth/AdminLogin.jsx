import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, InputAdornment,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon     from '@mui/icons-material/ArrowBack';
import MenuBookIcon      from '@mui/icons-material/MenuBook';
import PasswordField     from '../../components/auth/PasswordField';
import { loginWithEmail, logout as firebaseLogout } from '../../firebase/authService';
import { getUserAccount, createUserAccount }        from '../../firebase/firestoreService';
import SpacECELogo from '../../components/shared/SpacECELogo';

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithEmail(email, password);
    if (result.error) { setError(result.error); setLoading(false); return; }

    let { data: account } = await getUserAccount(result.user.uid);

    if (!account) {
      const { error: provisionError } = await createUserAccount(result.user.uid, {
        email: result.user.email,
        role: 'admin',
        displayName: result.user.displayName || email.split('@')[0],
      });
      if (provisionError) {
        await firebaseLogout();
        setError('Unable to provision admin account. Please contact support.');
        setLoading(false);
        return;
      }
      const refetch = await getUserAccount(result.user.uid);
      account = refetch.data;
    }

    if (!account || account.role !== 'admin') {
      await firebaseLogout();
      setError('Access denied. This portal is for administrators only.');
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate('/admin/dashboard');
  };

  return (
    <Box sx={{ maxWidth: 460, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Header ── */}
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

      {/* ── Login Card ── */}
      <Box sx={{
        p: { xs: 3, sm: 4 }, borderRadius: '28px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 40px rgba(31,58,104,0.12)',
        mb: 2,
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

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px' }}>{error}</Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth label="Admin Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: '#9F7AEA', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <PasswordField
            label="Admin Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            required sx={{ mb: 3 }}
          />

          <Button
            type="submit" variant="contained" fullWidth size="large"
            disabled={loading}
            sx={{
              py: 1.6, fontWeight: 900, fontSize: '1rem',
              borderRadius: 50,
              background: 'linear-gradient(135deg, #9F7AEA 0%, #C084FC 100%)',
              boxShadow: '0 6px 20px rgba(159,122,234,0.4)',
              '&:hover': { boxShadow: '0 10px 28px rgba(159,122,234,0.55)' },
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Portal 🔐'}
          </Button>
        </form>
      </Box>

      {/* ── Literacy Panel Direct Button ──
      <Button
        fullWidth variant="outlined"
        startIcon={<MenuBookIcon />}
        onClick={() => navigate('/literacy-admin')}
        sx={{
          py: 1.6, fontWeight: 900, fontSize: '0.95rem',
          borderRadius: 50, mb: 2,
          border: '1.5px solid rgba(124,77,255,0.4)',
          color: '#7C4DFF',
          background: 'rgba(124,77,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          '&:hover': {
            background: 'rgba(124,77,255,0.12)',
            border: '1.5px solid rgba(124,77,255,0.7)',
            boxShadow: '0 6px 20px rgba(124,77,255,0.2)',
          },
        }}
      >
        // 📚 Open Literacy Panel
      </Button> */}

      {/* ── Footer ── */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography
          variant="body2"
          sx={{ color: '#FF9500', fontWeight: 800, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate('/forgot-password')}
        >
          Forgot Password?
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{
            mt: 1.5, color: '#718096', fontWeight: 700,
            bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
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

export default AdminLogin;