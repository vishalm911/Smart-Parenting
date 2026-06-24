import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

/**
 * ModalDialog Component
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} type - 'confirm' | 'success' | 'warning' | 'error' | 'info'
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {function} onConfirm - Confirm handler
 * @param {function} onCancel - Cancel handler
 * @param {boolean} loading - Loading state for confirm button
 * @param {node} children - Custom content
 * @param {string} maxWidth - Dialog max width
 */
const ModalDialog = ({
  open = false,
  onClose,
  title = '',
  message = '',
  type = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  children = null,
  maxWidth = 'sm',
}) => {
  const handleCancel = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const typeConfig = {
    confirm: {
      icon: <InfoOutlinedIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      confirmColor: 'primary',
      bgGradient: 'linear-gradient(135deg, #EBF8FF 0%, #E6FFFA 100%)',
    },
    success: {
      icon: <CheckCircleOutlinedIcon sx={{ fontSize: 48, color: 'success.main' }} />,
      confirmColor: 'success',
      bgGradient: 'linear-gradient(135deg, #F0FFF4 0%, #E6FFFA 100%)',
    },
    warning: {
      icon: <WarningAmberIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
      confirmColor: 'warning',
      bgGradient: 'linear-gradient(135deg, #FFFFF0 0%, #FFF8E1 100%)',
    },
    error: {
      icon: <ReportProblemOutlinedIcon sx={{ fontSize: 48, color: 'error.main' }} />,
      confirmColor: 'error',
      bgGradient: 'linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%)',
    },
    info: {
      icon: <InfoOutlinedIcon sx={{ fontSize: 48, color: 'info.main' }} />,
      confirmColor: 'info',
      bgGradient: 'linear-gradient(135deg, #EBF8FF 0%, #BEE3F8 100%)',
    },
  };

  const config = typeConfig[type] || typeConfig.confirm;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
        },
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 12,
          top: 12,
          color: 'text.secondary',
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Icon header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: 4,
          pb: 2,
          background: config.bgGradient,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            boxShadow: 2,
          }}
        >
          {config.icon}
        </Box>
      </Box>

      {/* Title */}
      {title && (
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.25rem',
            pb: 0,
          }}
        >
          {title}
        </DialogTitle>
      )}

      {/* Content */}
      <DialogContent sx={{ textAlign: 'center', pt: 1, pb: 2 }}>
        {message && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}
        {children}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1.5 }}>
        {cancelText && (
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              minWidth: 120,
              borderRadius: 2.5,
              borderColor: 'divider',
              color: 'text.secondary',
            }}
          >
            {cancelText}
          </Button>
        )}
        {onConfirm && (
          <Button
            variant="contained"
            color={config.confirmColor}
            onClick={handleConfirm}
            disabled={loading}
            sx={{ minWidth: 120, borderRadius: 2.5 }}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ModalDialog;
