import { useState } from 'react';
import { Box, Typography, Paper, Grid, Divider, Button, Tabs, Tab } from '@mui/material';
import StarRating from '../../components/shared/StarRating';
import ActivityCard from '../../components/shared/ActivityCard';
import ProgressRing from '../../components/shared/ProgressRing';
import ModalDialog from '../../components/shared/ModalDialog';
import AgeGroupBadge from '../../components/shared/AgeGroupBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorBoundary from '../../components/shared/ErrorBoundary';

const Section = ({ title, description, children }) => (
  <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 3 }}>
    <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>{title}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{description}</Typography>
    {children}
  </Paper>
);

const ComponentShowcase = () => {
  const [starValue, setStarValue] = useState(3);
  const [modalType, setModalType] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const components = [
    'StarRating', 'ActivityCard', 'ProgressRing', 'ModalDialog',
    'AgeGroupBadge', 'LoadingSpinner', 'ErrorBoundary',
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4, px: 2 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #1F3A68 0%, #F5A623 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Component Showcase
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={400}>
          SpaceECE India Foundation — Shared Component Library
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
        sx={{ mb: 4, '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' } }}>
        {components.map((name) => <Tab key={name} label={name} />)}
      </Tabs>

      {/* StarRating */}
      {activeTab === 0 && (
        <Section title="⭐ StarRating" description="Interactive star rating component with hover effects and multiple sizes.">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Interactive</Typography>
              <StarRating value={starValue} onChange={setStarValue} showValue />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Selected: {starValue} stars
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Read-Only</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <StarRating value={5} readOnly size="small" showValue />
                <StarRating value={3.5} readOnly size="medium" showValue />
                <StarRating value={2} readOnly size="large" showValue />
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>Props</Typography>
          <Box component="pre" sx={{ p: 2, bgcolor: '#F5F7FA', borderRadius: 2, fontSize: '0.8rem', overflow: 'auto' }}>
{`<StarRating
  value={3}           // Current rating (0-5)
  onChange={setValue}  // Callback (null for read-only)
  max={5}             // Max stars
  size="medium"       // 'small' | 'medium' | 'large'
  color="#FFC107"     // Star color
  readOnly={false}    // Disable interaction
  showValue={true}    // Show numeric value
/>`}
          </Box>
        </Section>
      )}

      {/* ActivityCard */}
      {activeTab === 1 && (
        <Section title="📚 ActivityCard" description="Display learning activities with progress tracking.">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Default</Typography>
              <ActivityCard title="Alphabet Forest" description="Learn letter sounds and recognition" image="🌲" progress={65} category="Literacy" duration="15 min" onClick={() => {}} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Featured</Typography>
              <ActivityCard title="Number Safari" description="Count animals on the savanna" image="🦁" progress={100} category="Math" duration="20 min" variant="featured" onClick={() => {}} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Compact</Typography>
              <ActivityCard title="Color Splash" image="🎨" progress={30} variant="compact" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>No Progress</Typography>
              <ActivityCard title="Space Explorer" description="Discover the solar system!" image="🚀" category="Science" duration="25 min" onClick={() => {}} />
            </Grid>
          </Grid>
        </Section>
      )}

      {/* ProgressRing */}
      {activeTab === 2 && (
        <Section title="🔄 ProgressRing" description="Animated SVG circular progress indicator.">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <ProgressRing value={25} size={100} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>25%</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <ProgressRing value={50} size={120} color="#4299E1" />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>50%</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <ProgressRing value={75} size={140} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>75%</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <ProgressRing value={100} size={160} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>100%</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>Custom Center Content</Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <ProgressRing value={65} size={120}>
              <Typography sx={{ fontSize: 24 }}>🏆</Typography>
            </ProgressRing>
            <ProgressRing value={85} size={120} color="#9F7AEA">
              <Typography sx={{ fontSize: 24 }}>⭐</Typography>
            </ProgressRing>
          </Box>
        </Section>
      )}

      {/* ModalDialog */}
      {activeTab === 3 && (
        <Section title="💬 ModalDialog" description="Reusable confirmation and notification dialogs.">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {['confirm', 'success', 'warning', 'error', 'info'].map((type) => (
              <Button key={type} variant="outlined" onClick={() => setModalType(type)} sx={{ borderRadius: 2, textTransform: 'capitalize' }}>
                {type}
              </Button>
            ))}
          </Box>
          <ModalDialog
            open={!!modalType} onClose={() => setModalType(null)} type={modalType || 'confirm'}
            title={`${modalType?.charAt(0).toUpperCase()}${modalType?.slice(1)} Dialog`}
            message={`This is a ${modalType} dialog example. You can customize the title, message, and actions.`}
            onConfirm={() => setModalType(null)}
          />
        </Section>
      )}

      {/* AgeGroupBadge */}
      {activeTab === 4 && (
        <Section title="🏷️ AgeGroupBadge" description="Color-coded age group badges for child profiles.">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Filled (default)</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <AgeGroupBadge ageGroup="1-3" />
                <AgeGroupBadge ageGroup="4-6" />
                <AgeGroupBadge ageGroup="7-10" />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Outlined</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <AgeGroupBadge ageGroup="1-3" variant="outlined" />
                <AgeGroupBadge ageGroup="4-6" variant="outlined" />
                <AgeGroupBadge ageGroup="7-10" variant="outlined" />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Medium Size</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <AgeGroupBadge ageGroup="1-3" size="medium" />
                <AgeGroupBadge ageGroup="4-6" size="medium" />
                <AgeGroupBadge ageGroup="7-10" size="medium" />
              </Box>
            </Grid>
          </Grid>
        </Section>
      )}

      {/* LoadingSpinner */}
      {activeTab === 5 && (
        <Section title="⏳ LoadingSpinner" description="SpaceECE-branded loading indicator with multiple variants.">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Small</Typography>
              <LoadingSpinner size="small" message="Loading..." />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Medium (Branded)</Typography>
              <LoadingSpinner size="medium" message="Preparing your adventure..." />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Simple (Unbranded)</Typography>
              <LoadingSpinner size="medium" branded={false} message="Loading data..." />
            </Grid>
          </Grid>
        </Section>
      )}

      {/* ErrorBoundary */}
      {activeTab === 6 && (
        <Section title="🛡️ ErrorBoundary" description="Catches JavaScript errors and displays a friendly fallback UI.">
          <ErrorBoundary message="This is a demo error boundary. In production, this catches unhandled errors.">
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#F0FFF4', textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>✅ No Error</Typography>
              <Typography variant="body2" color="text.secondary">
                This content is wrapped in an ErrorBoundary. If a JavaScript error occurs, a friendly error page is shown instead of a blank screen.
              </Typography>
            </Paper>
          </ErrorBoundary>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>Usage</Typography>
          <Box component="pre" sx={{ p: 2, bgcolor: '#F5F7FA', borderRadius: 2, fontSize: '0.8rem', overflow: 'auto' }}>
{`<ErrorBoundary
  message="Custom error message"
  fullPage={false}
  fallback={<CustomFallbackUI />}
>
  <YourComponent />
</ErrorBoundary>`}
          </Box>
        </Section>
      )}
    </Box>
  );
};

export default ComponentShowcase;
