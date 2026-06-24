import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SpacECELogo from '../../components/shared/SpacECELogo';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 800, width: '100%', animation: 'fadeIn 0.5s ease-out', my: 2 }}>
      {/* Header logo */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <SpacECELogo variant="glass" width={120} />
        </Box>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#111111', mb: 0.5 }}>
          Privacy Policy
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
          1. Introduction &amp; Commitment to Safety
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          Welcome to **SpacECE** (operated by SpacECE India Foundation). We are dedicated to providing a secure, educational, and fun environment for children to develop numeracy, literacy, and cognitive skills. Your privacy, and the privacy of your children, is of paramount importance to us.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          2. Regulatory Compliance (DPDPA, COPPA &amp; GDPR-K)
        </Typography>

        <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
          🇮🇳 India Digital Personal Data Protection Act (DPDPA 2023)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          Under Section 9 of the DPDPA 2023, we collect **verifiable parental consent** before processing any personal data of a child (individuals under 18 years of age in India). SpacECE **does not** engage in any tracking or behavioral monitoring of children, nor do we target advertisements or execute algorithms that could cause harm to a child.
        </Typography>

        <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
          🇺🇸 Children's Online Privacy Protection Act (COPPA)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          We comply with COPPA guidelines. We do not permit children under the age of 13 to create accounts independently. All child profiles are created exclusively by authorized parents or legal guardians. We avoid collecting any Personally Identifiable Information (PII) from children.
        </Typography>

        <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
          🇪🇺 GDPR-K (European Union)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          For users in the EU, we require parental authorization for processing data of children under 16 (or lower legal limits established by individual member states).
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          3. Information Collection &amp; Use
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          To maintain a safe zone, we divide information collection based on roles:
        </Typography>
        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • **Parents &amp; Teachers**: During registration, we collect your full name, email address, password, and (optional) authentication profile via Google OAuth. This information is used strictly to secure accounts, manage child profiles, and compile progress reports.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • **Children**: We do **NOT** collect children's email addresses, phone numbers, or location info. Parents are asked to create child profiles using only a **display name/nickname** (which need not be their real name) and an **avatar choice**. We collect progress metrics (scores, rewards, game coins, and completed learning levels) to customize the educational experience.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          4. Zero Tracking and Advertising Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          The SpacECE platform is entirely ad-free. We do not integrate third-party advertising SDKs or tracking pixels inside child portal sections. We do not build marketing profiles on children.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          5. Parental Rights and Data Erasure
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          We fully respect your "Right to be Forgotten" and data autonomy:
        </Typography>
        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • **Review**: Parents can log in to view child profiles and progress dashboard analytics.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • **Update/Modify**: Parents can change nicknames or avatar selections at any time.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, fontWeight: 500 }}>
            • **Complete Erasure**: Parents can permanently delete any child profile in the **Child Profiles Manager**. Deletion instantly wipes the child's profile, rewards history, and game metrics from our Firestore database databases.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
          6. Contact Information &amp; Grievance Redressal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          For privacy inquiries, parental consent forms, or to request account erasure, please contact our Data Protection Officer:
          <br /><br />
          **Grievance Officer (DPDPA Compliance)**
          <br />
          SpacECE India Foundation
          <br />
          Email: [privacy@spaceece.org](mailto:privacy@spaceece.org)
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

export default PrivacyPolicy;
