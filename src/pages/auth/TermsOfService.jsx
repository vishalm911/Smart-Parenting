import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SpacECELogo from '../../components/shared/SpacECELogo';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 800, width: '100%', animation: 'fadeIn 0.5s ease-out', my: 2 }}>
      {/* Header logo */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <SpacECELogo variant="glass" width={120} />
        </Box>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#111111', mb: 0.5 }}>
          Terms of Service
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Last Updated: June 13, 2026
        </Typography>
      </Box>

      {/* Main content card */}
      <Paper sx={{
        p: { xs: 3, sm: 5 },
        borderRadius: '28px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 40px rgba(31,58,104,0.12)',
        maxHeight: '65dvh',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
        textAlign: 'left',
      }}>
        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          1. Agreement to Terms
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          By accessing or using the SpacECE platform, educational portals, and numeracy/literacy apps (collectively, the "Services"), you agree to be bound by these Terms of Service. These Services are operated by SpacECE India Foundation. If you do not agree to these terms, do not access or use our Services.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          2. Account Registration &amp; Parental Supervision
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          SpacECE is designed for child enrichment, but accounts must only be registered by adults.
        </Typography>
        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • **Eligibility**: You must be at least 18 years of age to register an account as a Parent or Teacher.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • **Parental Consent**: As a parent or legal guardian, you are solely responsible for creating, managing, and monitoring any child profiles linked to your account. By registering a child profile, you confirm your consent to the processing of their educational progress data in accordance with our Privacy Policy.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • **Account Security**: You are responsible for keeping your login credentials confidential.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          3. Permitted Use &amp; Platform Guidelines
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          We grant you and your authorized children a limited, non-exclusive, non-transferable, and revocable license to access the educational games and interactive portals for learning purposes.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          You agree **not** to:
        </Typography>
        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • Use the Services for any commercial purpose or distribute content from the platform without authorization.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • Attempt to probe, bypass security settings, or upload malicious code to our databases or servers.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • Create child profiles that collect sensitive personal data or impersonate others.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          4. Intellectual Property
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          All graphics, games, levels, audio, text, source code, and logo designs are protected under intellectual property laws and belong exclusively to SpacECE India Foundation or its licensors. You may not copy, reverse-engineer, or modify any aspect of our services.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          5. Limitation of Liability &amp; Disclaimer
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          The Services are provided on an "as-is" and "as-available" basis. We make no warranty that learning outcomes will be guaranteed, or that services will be uninterrupted and error-free. To the maximum extent permitted by law, SpacECE India Foundation shall not be liable for any indirect or consequential damages arising from your use of the platform.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          6. Governing Law
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          These terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these Terms of Service shall be subject to the exclusive jurisdiction of the courts of Pune, Maharashtra, India.
        </Typography>
      </Paper>

      {/* Back button */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            color: '#1F3A68', fontWeight: 700,
            bgcolor: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: 50, px: 2.5,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' },
          }}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default TermsOfService;
