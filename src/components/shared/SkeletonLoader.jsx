import { Box, Skeleton, Grid, Paper } from '@mui/material';

/**
 * SkeletonLoader - Shimmer placeholders while content loads.
 *
 * Props:
 *   variant - 'card' | 'list' | 'profile' | 'dashboard' | 'table'
 *   count   - number of items to render (for card/list variants)
 */
const SkeletonLoader = ({ variant = 'card', count = 3 }) => {
  if (variant === 'card') {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: count }).map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2, mb: 1.5 }} />
              <Skeleton variant="text" width="70%" height={24} />
              <Skeleton variant="text" width="90%" height={18} />
              <Skeleton variant="text" width="40%" height={18} sx={{ mt: 0.5 }} />
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" width={60} height={28} sx={{ borderRadius: 2 }} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (variant === 'list') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5,
            borderBottom: i < count - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
            <Skeleton variant="circular" width={44} height={44} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
            <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'profile') {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Skeleton variant="circular" width={88} height={88} />
          <Box>
            <Skeleton variant="text" width={180} height={28} />
            <Skeleton variant="text" width={140} height={20} />
            <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: 2, mt: 1 }} />
          </Box>
        </Box>
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6 }} key={i}>
              <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  if (variant === 'dashboard') {
    return (
      <Box>
        {/* Stats row */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="circular" width={44} height={44} />
                  <Box>
                    <Skeleton variant="text" width={50} height={32} />
                    <Skeleton variant="text" width={70} height={16} />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {/* Content */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
              <SkeletonLoader variant="list" count={4} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2, mx: 'auto' }} />
              <Skeleton variant="circular" width={140} height={140} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (variant === 'table') {
    return (
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 2, bgcolor: '#F5F7FA', display: 'flex', gap: 3 }}>
          {[30, 20, 15, 15, 10].map((w, i) => (
            <Skeleton key={i} variant="text" width={`${w}%`} height={20} />
          ))}
        </Box>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 3,
            borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '30%' }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width="60%" height={18} />
            </Box>
            {[20, 15, 15, 10].map((w, j) => (
              <Skeleton key={j} variant="text" width={`${w}%`} height={18} />
            ))}
          </Box>
        ))}
      </Paper>
    );
  }

  return null;
};

export default SkeletonLoader;
