import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, InputAdornment, LinearProgress, Divider,
  FormControlLabel, Checkbox, Link,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PasswordField from '../../components/auth/PasswordField';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import SpacECELogo from '../../components/shared/SpacECELogo';
import { registerWithEmail, loginWithGoogle } from '../../firebase/authService';
import { useAuth } from '../../context/AuthContext';
import { getPasswordStrength } from '../../utils/helpers';

const roleOptions = [
  {
    value: 'parent',
    label: 'Parent',
    emoji: '👨‍👩‍👧',
    description: 'Track & guide your children',
    bg: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
    border: '#4ADE80',
    accent: '#3BB77E',
    glow: 'rgba(59,183,126,0.3)',
  },
  {
    value: 'teacher',
    label: 'Teacher',
    emoji: '👩‍🏫',
    description: 'Educate & inspire students',
    bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
    border: '#60A5FA',
    accent: '#4299E1',
    glow: 'rgba(66,153,225,0.3)',
  },
];

const Register = () => {
  const navigate = useNavigate();
  const { setupUserAccount, isAuthenticated, userRole } = useAuth();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate(`/${userRole}/dashboard`);
    }
  }, [isAuthenticated, userRole, navigate]);

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', role: 'parent',
  });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors   = ['#E53E3E', '#FC8181', '#FFC107', '#48BB78', '#38A169'];
  const strengthLabels   = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const result = await registerWithEmail(formData.email, formData.password, formData.fullName);
    if (result.error) { setError(result.error); setLoading(false); }
    else {
      await setupUserAccount(result.user, formData.role, formData.fullName);
      setSuccessEmail(formData.email);
      setSuccess(true);
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await loginWithGoogle(formData.role || 'parent');
    if (result.error) { setError(result.error); return; }
    navigate('/parent/dashboard');
  };

  /* ── Success State ── */
  if (success) {
    return (
      <Box sx={{ maxWidth: 460, width: '100%', textAlign: 'center', animation: 'bounceIn 0.6s ease-out' }}>
        <Box sx={{
          p: { xs: 4, sm: 5 }, borderRadius: '28px',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
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
            fontSize: '3rem',
          }}>
            🎉
          </Box>
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1, color: '#1F3A68' }}>
            You're In! 🎊
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
            A verification email has been sent to
          </Typography>
          <Typography variant="body1" fontWeight={900} sx={{ color: '#3BB77E', mb: 3 }}>
            {successEmail}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 600 }}>
            Please verify your email before signing in to start your adventure! 🚀
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/login/${formData.role}`)}
            sx={{
              borderRadius: 50, px: 5, py: 1.5,
              background: 'linear-gradient(135deg, #FF9500, #FFC107)',
              fontWeight: 900, fontSize: '1rem',
              boxShadow: '0 6px 20px rgba(255,149,0,0.4)',
              '&:hover': { boxShadow: '0 10px 28px rgba(255,149,0,0.55)' },
            }}
          >
            Go to Login →
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, width: '100%', animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Header ── */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <SpacECELogo variant="glass" width={120} />
        </Box>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#111111', mb: 0.5 }}>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Join SpacECE India Foundation today! ✨
        </Typography>
      </Box>

      {/* ── Card ── */}
      <Box sx={{
        p: { xs: 3, sm: 4 }, borderRadius: '28px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 40px rgba(31,58,104,0.12)',
      }}>
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px' }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>

          {/* Role Toggle — as illustrated cards */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5, color: '#1F3A68' }}>
              I am a:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {roleOptions.map((opt) => {
                const isSelected = formData.role === opt.value;
                return (
                  <Box
                    key={opt.value}
                    onClick={() => setFormData((prev) => ({ ...prev, role: opt.value }))}
                    sx={{
                      p: 2, borderRadius: '18px', cursor: 'pointer',
                      background: isSelected ? opt.bg : 'rgba(248,250,252,0.8)',
                      border: `2px solid ${isSelected ? opt.accent : 'rgba(226,232,240,0.8)'}`,
                      textAlign: 'center',
                      boxShadow: isSelected ? `0 6px 18px ${opt.glow}` : 'none',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <CheckCircleIcon sx={{
                        position: 'absolute', top: 6, right: 6,
                        fontSize: 18, color: opt.accent,
                        bgcolor: 'white', borderRadius: '50%',
                        animation: 'scaleIn 0.25s ease-out',
                      }} />
                    )}
                    <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>{opt.emoji}</Typography>
                    <Typography fontWeight={900} sx={{ fontSize: '0.88rem', color: isSelected ? opt.accent : 'text.primary' }}>
                      {opt.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.68rem' }}>
                      {opt.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Mandatory Terms & Privacy Notice Consent */}
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                size="small"
                sx={{
                  color: '#FF9500',
                  '&.Mui-checked': { color: '#FF9500' },
                }}
              />
            }
            label={
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ lineHeight: 1.4, display: 'block', textAlign: 'left' }}>
                I agree to the{' '}
                <Link component={RouterLink} to="/terms" sx={{ color: '#FF9500', fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link component={RouterLink} to="/privacy" sx={{ color: '#FF9500', fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Privacy Policy
                </Link>
                . I confirm that I am the parent or legal guardian of any child profiles registered under this account.
              </Typography>
            }
            sx={{ mb: 2, alignItems: 'flex-start' }}
          />

          {/* Google Sign-Up */}
          <GoogleSignInButton
            onClick={handleGoogleSignUp}
            disabled={googleLoading || !agreeToTerms}
          />

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              OR REGISTER WITH EMAIL
            </Typography>
          </Divider>

          <TextField
            fullWidth label="Full Name" value={formData.fullName}
            onChange={handleChange('fullName')} required sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlinedIcon sx={{ color: '#FF9500', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth label="Email Address" type="email" value={formData.email}
            onChange={handleChange('email')} required sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: '#FF9500', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <PasswordField
            value={formData.password} onChange={handleChange('password')}
            required sx={{ mb: 0.5 }}
          />

          {/* Password strength */}
          {formData.password && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(passwordStrength.score / 5) * 100}
                sx={{
                  height: 6, borderRadius: 100,
                  bgcolor: 'rgba(0,0,0,0.06)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: strengthColors[passwordStrength.score - 1] || '#E53E3E',
                    borderRadius: 100,
                    transition: 'all 0.4s ease',
                  },
                }}
              />
              <Typography variant="caption" sx={{
                color: strengthColors[passwordStrength.score - 1] || 'text.secondary',
                fontWeight: 800,
              }}>
                {strengthLabels[passwordStrength.score] || ''}
              </Typography>
            </Box>
          )}

          <PasswordField
            label="Confirm Password" value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')} required sx={{ mb: 3 }}
            error={formData.confirmPassword && formData.password !== formData.confirmPassword}
            helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
          />

          <Button
            type="submit" variant="contained" fullWidth size="large"
            disabled={loading || !agreeToTerms}
            sx={{
              py: 1.6, fontWeight: 900, fontSize: '1rem',
              borderRadius: 50,
              background: agreeToTerms
                ? 'linear-gradient(135deg, #FF9500 0%, #FFC107 100%)'
                : 'rgba(0,0,0,0.06)',
              boxShadow: agreeToTerms ? '0 6px 20px rgba(255,149,0,0.4)' : 'none',
              '&:hover': { boxShadow: agreeToTerms ? '0 10px 28px rgba(255,149,0,0.55)' : 'none' },
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account 🚀'}
          </Button>
        </form>
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Already have an account?{' '}
          <Typography component="span" variant="body2"
            sx={{
              color: '#FF9500', fontWeight: 900, cursor: 'pointer',
              bgcolor: 'rgba(255,149,0,0.1)', px: 1.5, py: 0.25, borderRadius: 10,
              '&:hover': { bgcolor: 'rgba(255,149,0,0.2)' },
            }}
            onClick={() => navigate('/')}>
            Sign In →
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
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default Register;
