import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, InputAdornment,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { sendPasswordReset } from '../../api/authService';
import SpacECELogo from '../../components/shared/SpacECELogo';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Pre-fill email if passed as query param (e.g. from login page: /forgot-password?email=x)
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const sendReset = async (targetEmail) => {
    setError('');
    setLoading(true);
    const result = await sendPasswordReset(targetEmail);
    if (result.error) {
      setError(result.error);
    } else {
      if (result.resetLink) {
        setResetLink(result.resetLink);
      }
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
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1, color: '#1F3A68' }}>
            Check Your Email 📧
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
            We've sent a password reset link to
          </Typography>
          <Typography variant="body1" fontWeight={900} sx={{ color: '#3BB77E', mb: 3 }}>
            {email}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 600 }}>
            Follow the instructions in the email to reset your password.
            If you don't see it, check your spam/junk folder.
          </Typography>

          {resetLink && (
            <Box sx={{ mb: 3, p: 2, borderRadius: '14px', bgcolor: 'rgba(255,149,0,0.1)', border: '1px dashed #FF9500', textAlign: 'left' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
                ⚡ Testing Mode Reset Link:
              </Typography>
              <a href={resetLink} style={{ color: '#FF9500', fontWeight: 800, fontSize: '0.85rem', wordBreak: 'break-all', textDecoration: 'underline' }}>
                Click here to reset your password →
              </a>
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '14px', textAlign: 'left' }}>{error}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                borderRadius: 50, px: 4, py: 1.4,
                background: 'linear-gradient(135deg, #FF9500, #FFC107)',
                fontWeight: 900, fontSize: '1rem',
                boxShadow: '0 6px 20px rgba(255,149,0,0.4)',
                '&:hover': { boxShadow: '0 10px 28px rgba(255,149,0,0.55)' },
              }}
            >
              Back to Login →
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResend}
              disabled={resendCooldown || loading}
              sx={{
                borderRadius: 50, fontWeight: 700,
                borderColor: 'rgba(0,0,0,0.15)',
                color: '#718096',
              }}
            >
              {resendCooldown ? 'Resend available in 30s…' : 'Resend Email'}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 460, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Header ── */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <SpacECELogo variant="glass" width={105} />
        </Box>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#111111', mb: 0.5 }}>
          Forgot Password?
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          No worries! 🔑 Enter your email and we'll send a reset link.
        </Typography>
      </Box>

      {/* ── Card ── */}
      <Box sx={{
        p: { xs: 3, sm: 4 }, borderRadius: '28px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 40px rgba(31,58,104,0.12)',
      }}>
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px' }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Email Address" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: '#FF9500', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit" variant="contained" fullWidth size="large"
            disabled={loading}
            sx={{
              py: 1.6, fontWeight: 900, fontSize: '1rem',
              borderRadius: 50,
              background: 'linear-gradient(135deg, #FF9500 0%, #FFC107 100%)',
              boxShadow: '0 6px 20px rgba(255,149,0,0.4)',
              '&:hover': { boxShadow: '0 10px 28px rgba(255,149,0,0.55)' },
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link 📩'}
          </Button>
        </form>
      </Box>

      {/* ── Footer ── */}
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

export default ForgotPassword;
