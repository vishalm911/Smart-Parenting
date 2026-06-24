import { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Grid, Avatar, Alert, Chip,
} from '@mui/material';
import { School as SchoolIcon, Save as SaveIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { updateUserAccount } from '../../firebase/firestoreService';
import { getInitials } from '../../utils/helpers';

const INFO_FIELDS = [
  { key: 'displayName',  label: 'Full Name',     placeholder: 'Your full name',   xs: 12, sm: 6 },
  { key: 'school',       label: 'School Name',   placeholder: 'Your school',      xs: 12, sm: 6 },
  { key: 'grade',        label: 'Grade Taught',  placeholder: 'e.g. Grade 3',     xs: 12, sm: 6 },
  { key: 'studentCount', label: 'Student Count', placeholder: 'Number of students',xs: 12, sm: 6, type: 'number' },
  { key: 'subject',      label: 'Subject',       placeholder: 'Primary subject',  xs: 12, sm: 6 },
  { key: 'phone',        label: 'Phone',         placeholder: 'Contact number',   xs: 12, sm: 6 },
  { key: 'bio',          label: 'Bio',           placeholder: 'A short bio…',     xs: 12,        multiline: true, rows: 3 },
];

const TeacherProfile = () => {
  const { currentUser, userAccount } = useAuth();
  const [editing,   setEditing]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [formData,  setFormData]  = useState({
    displayName:  currentUser?.displayName || userAccount?.displayName || 'Teacher',
    school:       userAccount?.school       || '',
    grade:        userAccount?.grade        || '',
    studentCount: userAccount?.studentCount || '',
    subject:      userAccount?.subject      || '',
    phone:        userAccount?.phone        || '',
    bio:          userAccount?.bio          || '',
  });

  const handleChange = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    setSaving(true); setSaveError('');
    const result = await updateUserAccount(currentUser.uid, formData);
    if (result.error) { setSaveError(result.error); }
    else { setSaved(true); setEditing(false); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.01em' }}>Teacher Profile 👩‍🏫</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Your professional profile on SpacECE
          </Typography>
        </Box>
        <Button
          startIcon={editing ? <SaveIcon /> : <EditIcon />}
          variant={editing ? 'contained' : 'outlined'}
          color={editing ? 'secondary' : 'primary'}
          onClick={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
        >
          {saving ? 'Saving…' : editing ? 'Save Profile' : 'Edit Profile'}
        </Button>
      </Box>

      {saved     && <Alert severity="success" sx={{ mb: 2 }}>Profile saved successfully! ✅</Alert>}
      {saveError && <Alert severity="error"   sx={{ mb: 2 }}>{saveError}</Alert>}

      {/* Profile Header Card */}
      <Paper elevation={0} sx={{ p: 3.5, borderRadius: '20px', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
          {/* Avatar with ring */}
          <Box sx={{ position: 'relative' }}>
            <Avatar sx={{
              width: 88, height: 88, fontWeight: 900, fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #4299E1 0%, #90CAF9 100%)',
              border: '4px solid white',
              boxShadow: '0 6px 20px rgba(66,153,225,0.35)',
            }}>
              {getInitials(formData.displayName)}
            </Avatar>
            <Box sx={{
              position: 'absolute', bottom: 2, right: 2,
              width: 22, height: 22, borderRadius: '50%',
              background: 'linear-gradient(135deg, #22C55E 0%, #86EFAC 100%)',
              border: '2.5px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
            </Box>
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={900}>{formData.displayName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {currentUser?.email || 'teacher@spaceece.org'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<SchoolIcon sx={{ fontSize: '14px !important' }} />}
                label={formData.school || 'School not set'}
                size="small"
                sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#EFF6FF', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)' }}
              />
              {formData.grade && (
                <Chip label={`Grade: ${formData.grade}`} size="small"
                  sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F5F3FF', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }} />
              )}
              {formData.studentCount && (
                <Chip label={`${formData.studentCount} students`} size="small"
                  sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F0FFF4', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }} />
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Edit Form */}
      <Paper elevation={0} sx={{ p: 3.5, borderRadius: '20px' }}>
        <Typography variant="h6" fontWeight={900} sx={{ mb: 2.5, letterSpacing: '-0.01em' }}>📋 Profile Information</Typography>
        <Grid container spacing={2.5}>
          {INFO_FIELDS.map((field) => (
            <Grid key={field.key} size={{ xs: field.xs, sm: field.sm }}>
              <TextField
                fullWidth
                label={field.label}
                placeholder={editing ? field.placeholder : ''}
                value={formData[field.key]}
                onChange={handleChange(field.key)}
                disabled={!editing}
                type={field.type}
                multiline={field.multiline}
                rows={field.rows}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    bgcolor: '#FAFAFA',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>

        {editing && (
          <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
            <Button variant="contained" color="secondary" onClick={handleSave} disabled={saving} sx={{ px: 4 }}>
              {saving ? 'Saving…' : '✅ Save Changes'}
            </Button>
            <Button variant="outlined" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TeacherProfile;
