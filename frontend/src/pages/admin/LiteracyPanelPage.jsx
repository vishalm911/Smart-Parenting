/**
 * LiteracyPanelPage.jsx
 * Literacy Admin embedded inside Express Admin portal.
 * No separate login — Admin already authenticated.
 */
import { Box, Typography, Paper } from '@mui/material';
import { LiteracyAdminContent } from '../literacy/admin/AdminPanel';

export default function LiteracyPanelPage() {
  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5, fontFamily: '"Nunito", sans-serif' }}>
          📚 Literacy Panel
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ fontFamily: '"Nunito", sans-serif' }}>
          Manage Stories, Vocabulary, Activities and Reading Scores 
        </Typography>
      </Box>

      <Paper elevation={0} sx={{
        p: 2, mb: 3, borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(124,77,255,0.08), rgba(179,136,255,0.06))',
        border: '1.5px solid rgba(124,77,255,0.2)',
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Typography sx={{ fontSize: '1.5rem' }}>🔤</Typography>
        <Box>
          <Typography variant="body2" fontWeight={800} sx={{ color: '#7C4DFF', mb: 0.25 }}>
            Literacy Content Management
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Create and edit stories, vocabulary, activities and reading scores
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{
        p: { xs: 2, sm: 3 }, borderRadius: '24px',
        border: '1.5px solid rgba(0,0,0,0.055)',
        boxShadow: '0 4px 20px rgba(31,58,104,0.07)',
      }}>
        <LiteracyAdminContent />
      </Paper>

    </Box>
  );
}