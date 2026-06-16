import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, InputAdornment,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PasswordField from '../../components/auth/PasswordField';
import { loginWithEmail, logout as firebaseLogout } from '../../firebase/authService';
import { getUserAccount, createUserAccount } from '../../firebase/firestoreService';
import SpacECELogo from '../../components/shared/SpacECELogo';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Step 1: authenticate with Firebase
    const result = await loginWithEmail(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Step 2: verify role is 'admin' in Firestore before granting access
    let { data: account } = await getUserAccount(result.user.uid);
    
    // Auto-provision the user_accounts record if the admin was created
    // directly in Firebase Auth without going through the registration flow
    // (e.g. manually seeded via Firebase console).
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
      // Re-fetch so account.role is available for the check below
      const refetch = await getUserAccount(result.user.uid);
      account = refetch.data;
    }

    if (!account || account.role !== 'admin') {
      // Sign the user back out — they authenticated but are not an admin
      await firebaseLogout();
      setError('Access denied. This portal is for administrators only.');
      setLoading(false);
      return;
    }

    // Step 3: admin verified — navigate to dashboard.
    // AuthContext.onAuthChange is already in-flight and will set userRole='admin'.
    // RoleRoute now waits for isRoleReady before checking, so no flicker redirect.
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
      }}>
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
              py: 1.6, fontWeight: 900, fontSize: '1rem', mb: 2,
              borderRadius: 50,
              background: 'linear-gradient(135deg, #9F7AEA 0%, #C084FC 100%)',
              boxShadow: '0 6px 20px rgba(159,122,234,0.4)',
              '&:hover': { boxShadow: '0 10px 28px rgba(159,122,234,0.55)' },
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin 🔐'}
          </Button>
        </form>
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
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

export default AdminLogin;
