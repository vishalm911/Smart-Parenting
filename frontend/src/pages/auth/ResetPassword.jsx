import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, InputAdornment,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { resetPassword } from '../../api/authService';
import SpacECELogo from '../../components/shared/SpacECELogo';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from the link URL.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <Box sx={{ maxWidth: 460, width: '100%', textAlign: 'center', animation: 'bounceIn 0.6s ease-out' }}>
        <Box sx={{
          p: { xs: 4, sm: 5 }, borderRadius: '28px',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255,255,255,0.7)',
          boxShadow: '0 8px 40px rgba(31,58,104,0.12)',
        }}>
          <Box sx={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3,
            boxShadow: '0 8px 28px rgba(59,183,126,0.35)',
            animation: 'celebrationPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <CheckCircleIcon sx={{ fontSize: 52, color: '#3BB77E' }} />
          </Box>
          <Typography variant="h4" fontWeight={900} sx={{ mb: 2, color: '#1F3A68' }}>
            Success! 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 600 }}>
            Your password has been successfully reset. You can now log in to your account with your new password.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/')}
            sx={{
              borderRadius: 50, py: 1.6,
              background: 'linear-gradient(135deg, #FF9500, #FFC107)',
              fontWeight: 900, fontSize: '1rem',
              boxShadow: '0 6px 20px rgba(255,149,0,0.4)',
              '&:hover': { boxShadow: '0 10px 28px rgba(255,149,0,0.55)' },
            }}
          >
            Go to Login
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 460, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <SpacECELogo variant="glass" width={105} />
        </Box>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#111111', mb: 0.5 }}>
          Reset Password
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          Enter your new password below to update your account.
        </Typography>
      </Box>

      {/* Card */}
      <Box sx={{
        p: { xs: 3, sm: 4 }, borderRadius: '28px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 40px rgba(31,58,104,0.12)',
      }}>
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px' }}>{error}</Alert>}
        {!token && <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '14px' }}>Reset token not found in the URL. Password cannot be reset.</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!token}
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: '#FF9500', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={!token}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: '#FF9500', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !token}
            sx={{
              py: 1.6, fontWeight: 900, fontSize: '1rem',
              borderRadius: 50,
              background: 'linear-gradient(135deg, #FF9500 0%, #FFC107 100%)',
              boxShadow: '0 6px 20px rgba(255,149,0,0.4)',
              '&:hover': { boxShadow: '0 10px 28px rgba(255,149,0,0.55)' },
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{
            color: '#718096', fontWeight: 700,
            bgcolor: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: 50, px: 2.5,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' },
          }}
          size="small"
        >
          Back to Login
        </Button>
      </Box>
    </Box>
  );
};

export default ResetPassword;
