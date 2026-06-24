import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Grid, Divider, Switch,
  Alert, CircularProgress, Snackbar, Avatar, Chip,
} from '@mui/material';
import { Save as SaveIcon, Person as PersonIcon, VerifiedUser as VerifiedIcon, Warning as WarningIcon } from '@mui/icons-material';
import PasswordField from '../../components/auth/PasswordField';
import { useAuth } from '../../context/AuthContext';
import { changePassword, sendPasswordReset } from '../../firebase/authService';
import { updateUserAccount } from '../../firebase/firestoreService';
import { getInitials } from '../../utils/helpers';

/* Section wrapper — clean white card with orange left accent */
const SectionCard = ({ emoji, title, subtitle, children }) => (
  <Paper elevation={0} sx={{
    p: { xs: 2.5, sm: 3.5 }, borderRadius: '20px', mb: 2.5,
    border: '1.5px solid rgba(0,0,0,0.06)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  }}>
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="h6" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
        <span>{emoji}</span> {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" fontWeight={500}>{subtitle}</Typography>
      )}
    </Box>
    {children}
  </Paper>
);

const AccountSettings = () => {
  const { currentUser, userAccount } = useAuth();

  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState('');

  const [profileForm, setProfileForm] = useState({
    displayName: currentUser?.displayName || userAccount?.displayName || '',
  });
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Notification prefs — sync from userAccount when it loads (async after auth)
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifs:    true,
    pushNotifs:     true,
    activityAlerts: true,
    weeklyReport:   false,
  });

  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'info' });
  const [verificationSending, setVerificationSending] = useState(false);
  const [reloading, setReloading] = useState(false);

  // Sync notifPrefs when userAccount arrives from Firestore
  useEffect(() => {
    if (userAccount?.notifPrefs) {
      setNotifPrefs((prev) => ({ ...prev, ...userAccount.notifPrefs }));
    }
  }, [userAccount]);

  // Sync displayName when userAccount/currentUser loads
  useEffect(() => {
    const name = currentUser?.displayName || userAccount?.displayName || '';
    if (name) setProfileForm({ displayName: name });
  }, [currentUser?.displayName, userAccount?.displayName]);

  const isEmailVerified = currentUser?.emailVerified ?? false;

  const showFeedback = (msg, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 6000);
  };

  const handleSendVerification = async () => {
    setVerificationSending(true);
    const result = await sendVerificationEmail();
    setVerificationSending(false);
    if (result.error) {
      showFeedback(result.error, true);
    } else {
      showFeedback('Verification email sent! Check your inbox. ✅');
    }
  };

  const handleReloadUser = async () => {
    setReloading(true);
    const result = await reloadUser();
    setReloading(false);
    if (!result.error && result.user?.emailVerified) {
      showFeedback('Email verified successfully! ✅');
      // Force a re-render by refreshing the page to update currentUser.emailVerified
      window.location.reload();
    } else {
      showFeedback('Email not yet verified. Please click the link in your email first.', true);
    }
  };

  const handleProfileSave = async () => {
    if (!profileForm.displayName.trim()) return showFeedback('Display name cannot be empty.', true);
    setLoading('profile');
    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: profileForm.displayName.trim() });
      if (currentUser?.uid) await updateUserAccount(currentUser.uid, { displayName: profileForm.displayName.trim() });
      showFeedback('Profile updated successfully! ✅');
    } catch (err) {
      showFeedback(err.message || 'Failed to update profile.', true);
    }
    setLoading('');
  };

  const handleEmailChange = async () => {
    if (!emailForm.newEmail || !emailForm.currentPassword) return showFeedback('Please fill in both fields.', true);
    if (!isEmailVerified) return showFeedback('Please verify your current email address before changing it.', true);
    setLoading('email');
    const result = await changeEmail(emailForm.newEmail, emailForm.currentPassword);
    setLoading('');
    if (result.error) {
      showFeedback(result.error, true);
    } else {
      // verifyBeforeUpdateEmail sends a verification to the new address
      showFeedback(`Verification email sent to ${emailForm.newEmail}. Click the link in that email to confirm the change. ✅`);
      setEmailForm({ newEmail: '', currentPassword: '' });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return showFeedback('Passwords do not match.', true);
    if (passwordForm.newPassword.length < 6) return showFeedback('Password must be at least 6 characters.', true);
    if (!passwordForm.currentPassword) return showFeedback('Please enter your current password.', true);
    setLoading('password');
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setLoading('');
    if (result.error) {
      showFeedback(result.error, true);
    } else {
      showFeedback('Password changed successfully! ✅');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleSaveNotifications = async () => {
    if (!currentUser?.uid) return showFeedback('You must be signed in to save preferences.', true);
    setLoading('notif');
    const result = await updateUserAccount(currentUser.uid, { notifPrefs });
    setLoading('');
    if (result.error) {
      showFeedback('Failed to save preferences: ' + result.error, true);
    } else {
      showFeedback('Notification preferences saved! ✅');
    }
  };

  const displayName = profileForm.displayName || currentUser?.displayName || 'User';

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 0.25, letterSpacing: '-0.01em' }}>
          Account Settings ⚙️
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Manage your profile, password, and preferences
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '14px' }}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: '14px' }}>{error}</Alert>}

      {/* Email Verification Banner */}
      {currentUser && !isEmailVerified && (
        <Alert
          severity="warning"
          sx={{ mb: 2.5, borderRadius: '14px' }}
          icon={<WarningIcon />}
        >
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
            Your email address is not verified. Some features are restricted until you verify.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              color="warning"
              variant="outlined"
              onClick={handleSendVerification}
              disabled={verificationSending}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              {verificationSending ? 'Sending…' : 'Send Verification Email'}
            </Button>
            <Button
              size="small"
              color="warning"
              variant="text"
              onClick={handleReloadUser}
              disabled={reloading}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              {reloading ? 'Checking…' : 'Already verified? Refresh'}
            </Button>
          </Box>
        </Alert>
      )}

      {/* Profile */}
      <SectionCard emoji="👤" title="Profile Information" subtitle={`Currently signed in as ${currentUser?.email || '—'}`}>
        {/* Avatar header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{
            width: 72, height: 72, fontWeight: 900, fontSize: '1.6rem',
            background: 'linear-gradient(135deg, #F5A623 0%, #FFC107 100%)',
            border: '4px solid white',
            boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
          }}>
            {getInitials(displayName)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={900}>{displayName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
              <Typography variant="body2" color="text.secondary">{currentUser?.email || ''}</Typography>
              {isEmailVerified ? (
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
                  label="Verified"
                  size="small"
                  color="success"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                />
              ) : (
                <Chip
                  label="Unverified"
                  size="small"
                  color="warning"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              fullWidth label="Display Name"
              value={profileForm.displayName}
              onChange={(e) => setProfileForm({ displayName: e.target.value })}
              InputProps={{ startAdornment: <PersonIcon sx={{ color: '#F5A623', fontSize: 20, mr: 1 }} /> }}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth label="Email (read-only)"
              value={currentUser?.email || ''} disabled
              helperText="Use the Change Email section below to update your email."
            />
          </Grid>
        </Grid>
        <Button
          variant="contained" color="secondary"
          startIcon={loading === 'profile' ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleProfileSave} disabled={loading === 'profile'}
          sx={{ mt: 2.5 }}
        >
          Save Profile
        </Button>
      </SectionCard>

      {/* Change Email */}
      <SectionCard emoji="📧" title="Change Email" subtitle={`Current: ${currentUser?.email || '—'}`}>
        <Alert severity="info" sx={{ mb: 2, borderRadius: '12px', fontSize: '0.82rem' }}>
          A verification link will be sent to your new email address. The change takes effect after you click that link.
        </Alert>
        {!isEmailVerified && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px', fontSize: '0.82rem' }}>
            You must verify your current email address before changing it.
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="New Email" type="email" value={emailForm.newEmail}
              onChange={(e) => setEmailForm((p) => ({ ...p, newEmail: e.target.value }))}
              disabled={!isEmailVerified} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <PasswordField label="Current Password" value={emailForm.currentPassword}
              onChange={(e) => setEmailForm((p) => ({ ...p, currentPassword: e.target.value }))}
              disabled={!isEmailVerified} />
          </Grid>
        </Grid>
        <Button
          variant="contained" color="secondary"
          startIcon={loading === 'email' ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleEmailChange} disabled={loading === 'email' || !isEmailVerified}
          sx={{ mt: 2 }}
        >
          Send Verification &amp; Update Email
        </Button>
      </SectionCard>

      {/* Change Password */}
      <SectionCard emoji="🔐" title="Change Password">
        <Grid container spacing={2}>
          <Grid size={12}>
            <PasswordField label="Current Password" value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <PasswordField label="New Password" value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <PasswordField
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              error={passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword}
              helperText={passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'Passwords do not match' : ''}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained" color="secondary"
          startIcon={loading === 'password' ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handlePasswordChange} disabled={loading === 'password'}
          sx={{ mt: 2 }}
        >
          Change Password
        </Button>
      </SectionCard>

      {/* Notification Preferences */}
      <SectionCard emoji="🔔" title="Notification Preferences">
        {[
          { key: 'emailNotifs',    label: 'Email Notifications',    desc: 'Receive updates via email' },
          { key: 'pushNotifs',     label: 'Push Notifications',     desc: 'Get real-time alerts' },
          { key: 'activityAlerts', label: 'Activity Alerts',        desc: 'When your child completes an activity' },
          { key: 'weeklyReport',   label: 'Weekly Report',          desc: 'Receive weekly progress summaries' },
        ].map((item, i, arr) => (
          <Box key={item.key} sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            py: 1.5,
            borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
          }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>{item.label}</Typography>
              <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
            </Box>
            <Switch
              checked={notifPrefs[item.key]}
              onChange={(e) => setNotifPrefs((p) => ({ ...p, [item.key]: e.target.checked }))}
            />
          </Box>
        ))}
        <Button
          variant="contained" color="secondary"
          startIcon={loading === 'notif' ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleSaveNotifications} disabled={loading === 'notif'}
          sx={{ mt: 2.5 }}
        >
          Save Preferences
        </Button>
      </SectionCard>

      {/* Security */}
      <SectionCard emoji="🛡️" title="Security Settings">
        {[
          { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security', action: 'Enable' },
          { label: 'Login History',             desc: 'View recent login activity',     action: 'View'   },
        ].map((item, i) => (
          <Box key={item.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>{item.label}</Typography>
                <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
              </Box>
              <Button variant="outlined" size="small"
                onClick={() => setSnack({ open: true, msg: `${item.label} will be available soon.`, severity: 'info' })}>
                {item.action}
              </Button>
            </Box>
            {i === 0 && <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />}
          </Box>
        ))}
      </SectionCard>

      <Snackbar
        open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: '14px', fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountSettings;
