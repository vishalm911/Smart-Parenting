import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, Alert, InputAdornment,
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
    <Box sx={{ maxWidth: 420, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
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

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth label="Admin Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <PasswordField label="Admin Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 3 }} />

          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
            sx={{
              py: 1.4, fontWeight: 700, fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #F5A623 0%, #FFCC60 100%)',
              color: '#111111',
              '&:hover': { background: 'linear-gradient(135deg, #E09515 0%, #F5A623 100%)' },
            }}>
            {loading ? 'Authenticating...' : 'Sign In to Admin'}
          </Button>
        </form>
      </Paper>

      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ color: 'text.secondary' }} size="small">
          Back to Role Selection
        </Button>
        <Box sx={{ mt: 1 }}>
          <Typography
            component="span" variant="body2"
            sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLogin;
