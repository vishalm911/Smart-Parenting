import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

/**
 * PasswordField - TextField with show/hide toggle
 */
const PasswordField = ({
  label = 'Password',
  value,
  onChange,
  error = false,
  helperText = '',
  fullWidth = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      type={showPassword ? 'text' : 'password'}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <VisibilityOffIcon sx={{ fontSize: 20 }} />
                ) : (
                  <VisibilityIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }
      }}
      {...props}
    />
  );
};

export default PasswordField;
