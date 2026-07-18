import { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to console (could be sent to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: this.props.fullPage ? '100vh' : '300px',
            p: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: 500,
              width: '100%',
              textAlign: 'center',
              p: 5,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'error.light',
              background: 'linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%)',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ReportProblemOutlinedIcon sx={{ fontSize: 40, color: 'error.dark' }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'error.dark' }}>
              Oops! Something went wrong
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {this.props.message ||
                "We're sorry, but something unexpected happened. Please try again."}
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: 'rgba(0,0,0,0.04)',
                  borderRadius: 2,
                  textAlign: 'left',
                  maxHeight: 150,
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{ fontFamily: 'monospace', color: 'error.main', whiteSpace: 'pre-wrap' }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color="error"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              sx={{ borderRadius: 2.5, px: 4 }}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
