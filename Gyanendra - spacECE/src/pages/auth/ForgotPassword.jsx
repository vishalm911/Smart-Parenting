import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, Alert, InputAdornment,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { sendPasswordReset } from '../../firebase/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Pre-fill email if passed as query param (e.g. from login page: /forgot-password?email=x)
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  const sendReset = async (targetEmail) => {
    setError('');
    setLoading(true);
    const result = await sendPasswordReset(targetEmail);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendReset(email);
  };

  const handleResend = async () => {
    if (resendCooldown) return;
    setResendCooldown(true);
    await sendReset(email);
    // Allow resend again after 30 seconds
    setTimeout(() => setResendCooldown(false), 30000);
  };

  if (success) {
    return (
      <Box sx={{ maxWidth: 440, width: '100%', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%', bgcolor: '#F0FFF4',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
          }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Check Your Email 📧</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            We've sent a password reset link to <strong>{email}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Follow the instructions in the email to reset your password.
            If you don't see it, check your spam/junk folder.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, textAlign: 'left' }}>{error}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button variant="contained" onClick={() => navigate('/')} sx={{ borderRadius: 2.5, px: 4 }}>
              Back to Login
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResend}
              disabled={resendCooldown || loading}
              sx={{ borderRadius: 2.5 }}
            >
              {resendCooldown ? 'Resend available in 30s…' : 'Resend Email'}
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 440, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: 3, bgcolor: 'white', boxShadow: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, fontSize: '2rem',
        }}>🔑</Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
          Forgot Password?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No worries! Enter your email and we'll send you a reset link.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Email Address" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
            sx={{ py: 1.4, fontWeight: 700, fontSize: '0.95rem' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </Paper>

      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
          Back to Login
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
