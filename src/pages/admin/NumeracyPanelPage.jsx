/**
 * NumeracyPanelPage.jsx
 * Numeracy Admin embedded inside Firebase Admin portal.
 * No separate login — Firebase admin already authenticated.
 */
import { Box, Typography, Paper } from '@mui/material';
import NumeracyAdminContent from '../numeracy/AdminPanel';

export default function NumeracyPanelPage() {
  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5, fontFamily: '"Nunito", sans-serif' }}>
          🔢 Numeracy Panel
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ fontFamily: '"Nunito", sans-serif' }}>
          Manage Math Games, Puzzle Challenges, Logic Games, and Numeracy Scores
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <NumeracyAdminContent />
      </Box>

    </Box>
  );
}
