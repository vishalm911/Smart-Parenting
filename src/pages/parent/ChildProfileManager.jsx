import { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, TextField, Avatar,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { useChildProfile } from '../../context/ChildProfileContext';
import { getAvatarEmoji } from '../../utils/helpers';
import { AVATARS, AGE_GROUPS } from '../../firebase/childProfileService';
import AgeGroupBadge from '../../components/shared/AgeGroupBadge';
import ModalDialog from '../../components/shared/ModalDialog';
import SkeletonLoader from '../../components/shared/SkeletonLoader';

const AGE_COLORS = {
  '1-3':  { color: '#F43F5E', bg: '#FFF0F3' },
  '4-6':  { color: '#F5A623', bg: '#FFF8E1' },
  '7-10': { color: '#3B82F6', bg: '#EFF6FF' },
};

// ── Milestone helpers (Age 1–3 only) ─────────────────────────────────────
/**
 * Calculates the child's age in whole months from their date of birth,
 * then maps it to a milestone level (1–6) matching milestones_0_3.json.
 *
 * Level 1 → 0–6 months   | Level 4 → 1.5–2 years
 * Level 2 → 6–12 months  | Level 5 → 2–2.5 years
 * Level 3 → 1–1.5 years  | Level 6 → 2.5–3 years
 */
const getMilestoneInfo = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const ageMonths =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  let milestoneLevel;
  if      (ageMonths < 6)  milestoneLevel = 1;
  else if (ageMonths < 12) milestoneLevel = 2;
  else if (ageMonths < 18) milestoneLevel = 3;
  else if (ageMonths < 24) milestoneLevel = 4;
  else if (ageMonths < 30) milestoneLevel = 5;
  else                     milestoneLevel = 6;
  return { ageMonths, milestoneLevel };
};
// ─────────────────────────────────────────────────────────────────────────────

const ChildProfileManager = () => {
  const { childProfiles, loading: profilesLoading, createChildProfile, updateChildProfile, deleteChildProfile } = useChildProfile();
  const [dialogOpen,       setDialogOpen]       = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProfile,   setEditingProfile]   = useState(null);
  const [deleteTarget,     setDeleteTarget]     = useState(null);
  const [error,            setError]            = useState('');
  const [loading,          setLoading]          = useState(false);
  const [formData,         setFormData]         = useState({ name: '', avatar: 'avatar1', age_group: '4-6', date_of_birth: '' });

  // Always use real Firestore profiles — never fall back to fake IDs.
  // The placeholder fallback (id: '1', '2', '3') was the root cause of
  // "No document to update: child_profiles/1" because those IDs don't
  // exist in Firestore.
  const displayProfiles = childProfiles;

  console.log(
    '[ChildProfileManager] Child profiles loaded from Firestore:',
    childProfiles.map((p) => ({ firestoreDocId: p.id, name: p.name, age_group: p.age_group }))
  );

  const handleOpenCreate = () => {
    setEditingProfile(null);
    setFormData({ name: '', avatar: 'avatar1', age_group: '4-6', date_of_birth: '' });
    setError(''); setDialogOpen(true);
  };

  const handleOpenEdit = (profile) => {
    console.log('[ChildProfileManager] Edit clicked — Firestore document ID used for update:', profile.id, '| Profile:', profile.name);
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      avatar: profile.avatar,
      age_group: profile.age_group,
      date_of_birth: profile.date_of_birth || '',
    });
    setError(''); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setError('Please enter a name.'); return; }

    // ── Age 1-3 & 4-6: validate DOB and derive milestone fields if applicable ─────────
    if (['1-3', '4-6'].includes(formData.age_group)) {
      if (!formData.date_of_birth) {
        setError(`Please enter the date of birth for children in the ${formData.age_group} age group.`);
        return;
      }
      const dob = new Date(formData.date_of_birth);
      if (dob > new Date()) {
        setError('Date of birth cannot be in the future.');
        return;
      }
      if (formData.age_group === '0-1') {
        const ageMonths = (new Date() - dob) / (1000 * 60 * 60 * 24 * 30.44);
        if (ageMonths > 12) {
          setError('Date of birth indicates the child is older than 1 year. Please select the correct age group.');
          return;
        }
      } else if (formData.age_group === '1-3') {
        const check = getMilestoneInfo(formData.date_of_birth);
        if (!check || check.ageMonths > 36) {
          setError('Date of birth indicates the child is older than 3 years. Please select the correct age group.');
          return;
        }
      } else if (formData.age_group === '4-6') {
        const ageMonths = (new Date() - dob) / (1000 * 60 * 60 * 24 * 30.44);
        if (ageMonths > 84) { // Roughly 7 years
          setError('Date of birth indicates the child is older than 6 years. Please select the correct age group.');
          return;
        }
      }
    }

    // ── Build Firestore payload ────────────────────────────────────
    let payload;
    if (['0-1', '1-3', '4-6'].includes(formData.age_group) && formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const ageMonths = Math.floor((new Date() - dob) / (1000 * 60 * 60 * 24 * 30.44));
      
      // Calculate milestoneLevel only if they fall under the 1-3 age group format (1 to 6)
      // (Older system relied on this, so we preserve it for backwards compatibility)
      let milestoneLevel = null;
      if (formData.age_group === '1-3') {
        milestoneLevel = Math.min(6, Math.floor(ageMonths / 6) + 1);
      }
      
      payload = { ...formData, age_months: ageMonths, milestone_level: milestoneLevel };
    } else {
      // Ensure milestone fields are explicitly cleared for other age groups (e.g. 7-10)
      payload = { ...formData, date_of_birth: null, age_months: null, milestone_level: null };
    }

    setLoading(true); setError('');
    if (editingProfile) {
      console.log('[ChildProfileManager] Calling updateChildProfile with Firestore doc ID:', editingProfile.id, '| Data:', payload);
    } else {
      console.log('[ChildProfileManager] Calling createChildProfile with data:', payload);
    }
    const result = editingProfile
      ? await updateChildProfile(editingProfile.id, payload)
      : await createChildProfile(payload);
    if (result.error) {
      console.error('[ChildProfileManager] Save failed:', result.error);
      setError(result.error);
    } else {
      console.log('[ChildProfileManager] Save succeeded.');
      setDialogOpen(false);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      console.log('[ChildProfileManager] Delete clicked — Firestore document ID used for deleteDoc:', deleteTarget.id, '| Profile:', deleteTarget.name);
      const result = await deleteChildProfile(deleteTarget.id);
      if (result?.error) {
        console.error('[ChildProfileManager] Delete failed:', result.error);
      } else {
        console.log('[ChildProfileManager] Delete succeeded for doc ID:', deleteTarget.id);
      }
    }
    setDeleteDialogOpen(false); setDeleteTarget(null);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={900}>Child Profiles 👧</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Manage up to 4 child profiles ({displayProfiles.length}/4)
          </Typography>
        </Box>
        <Button
          startIcon={<AddIcon />} variant="contained" color="secondary"
          disabled={displayProfiles.length >= 4} onClick={handleOpenCreate}
        >
          Add Child
        </Button>
      </Box>

      {/* Show skeleton cards while profiles are loading from Firestore */}
      {profilesLoading ? (
        <SkeletonLoader variant="card" count={3} />
      ) : (
      <Grid container spacing={2.5} alignItems="stretch">
        {displayProfiles.map((profile, index) => {
          const ageStyle = AGE_COLORS[profile.age_group] || AGE_COLORS['4-6'];
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={profile.id} sx={{ display: 'flex' }}>
              <Card sx={{
                borderRadius: '20px', width: '100%', textAlign: 'center',
                border: `1.5px solid ${ageStyle.color}25`,
                animation: `slideInUp 0.35s ease-out ${index * 0.08}s both`,
              }}>
                <CardContent sx={{ py: 3, px: 2.5 }}>
                  {/* Avatar */}
                  <Box sx={{
                    width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 2,
                    bgcolor: ageStyle.bg,
                    border: `3px solid ${ageStyle.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem',
                    boxShadow: `0 4px 16px ${ageStyle.color}25`,
                  }}>
                    {getAvatarEmoji(profile.avatar)}
                  </Box>

                  <Typography variant="h6" fontWeight={900} sx={{ mb: 0.75 }}>{profile.name}</Typography>
                  <Box sx={{ mb: 1.5 }}>
                    <AgeGroupBadge ageGroup={profile.age_group} />
                  </Box>

                  {/* Coin count */}
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    px: 1.5, py: 0.4, borderRadius: '10px', mb: 2,
                    bgcolor: '#FFF8E1', border: '1px solid rgba(245,166,35,0.3)',
                  }}>
                    <Typography sx={{ fontSize: '0.85rem' }}>🪙</Typography>
                    <Typography variant="caption" fontWeight={900} sx={{ color: '#D97706' }}>
                      {profile.coin_count || 0} coins
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      size="small" variant="outlined" startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                      onClick={() => handleOpenEdit(profile)}
                      sx={{ borderRadius: '10px', fontSize: '0.75rem', px: 1.5, py: 0.5 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small" variant="outlined" color="error" startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                      onClick={() => { setDeleteTarget(profile); setDeleteDialogOpen(true); }}
                      sx={{ borderRadius: '10px', fontSize: '0.75rem', px: 1.5, py: 0.5 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {/* Add placeholder */}
        {displayProfiles.length < 4 && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
            <Card
              onClick={handleOpenCreate}
              sx={{
                borderRadius: '20px', width: '100%', minHeight: 250,
                border: '2px dashed rgba(245,166,35,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', bgcolor: '#FAFAFA',
                '&:hover': { borderColor: '#F5A623', bgcolor: '#FFF8E1', transform: 'translateY(-3px)' },
                transition: 'all 0.25s ease',
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 1.5,
                  bgcolor: '#FFF8E1', border: '2px solid rgba(245,166,35,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AddIcon sx={{ fontSize: 28, color: '#F5A623' }} />
                </Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary">Add Child Profile</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, pr: 6 }}>
          {editingProfile ? '✏️ Edit Profile' : '🌟 Create New Profile'}
          <IconButton onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 12, top: 12, color: '#9CA3AF' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth label="Child's Name" value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            sx={{ mb: 3, mt: 1 }}
          />

          {/* Avatar Grid */}
          <Typography variant="caption" fontWeight={900} sx={{ mb: 1.25, display: 'block', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Choose Avatar
          </Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {AVATARS.map((av) => (
              <Grid size={{ xs: 3, sm: 2 }} key={av.id}>
                <Box
                  onClick={() => setFormData((p) => ({ ...p, avatar: av.id }))}
                  sx={{
                    p: 1.25, borderRadius: '14px', textAlign: 'center', cursor: 'pointer',
                    fontSize: '1.8rem',
                    border: `2px solid ${formData.avatar === av.id ? '#F5A623' : 'transparent'}`,
                    bgcolor: formData.avatar === av.id ? '#FFF8E1' : '#F9FAFB',
                    transition: 'all 0.18s ease',
                    '&:hover': { bgcolor: '#FFF8E1', transform: 'scale(1.08)' },
                  }}
                >
                  {av.emoji}
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Age Group */}
          <Typography variant="caption" fontWeight={900} sx={{ mb: 1.25, display: 'block', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Age Group
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {AGE_GROUPS.map((ag) => (
              <Box
                key={ag.value}
                onClick={() => {
                  const now = new Date();
                  const toISO = (d) => d.toISOString().split('T')[0];
                  let defaultDob = '';
                  if (ag.value === '0-1') {
                    // Default to ~6 months ago
                    defaultDob = toISO(new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()));
                  } else if (ag.value === '1-3') {
                    // Default to ~1.5 years ago (middle of 0-3 range)
                    defaultDob = toISO(new Date(now.getFullYear() - 1, now.getMonth() - 6, now.getDate()));
                  } else if (ag.value === '4-6') {
                    // Default to ~5 years ago (middle of 3-7 range)
                    defaultDob = toISO(new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()));
                  }
                  setFormData((p) => ({
                    ...p,
                    age_group: ag.value,
                    // Set a sensible default DOB for groups that need it, clear for others
                    date_of_birth: ['0-1', '1-3', '4-6'].includes(ag.value) ? (p.date_of_birth || defaultDob) : '',
                  }));
                }}
                sx={{
                  flex: 1, py: 1.25, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                  bgcolor: formData.age_group === ag.value ? ag.color : '#F9FAFB',
                  border: `2px solid ${formData.age_group === ag.value ? ag.color : 'rgba(0,0,0,0.08)'}`,
                  color: formData.age_group === ag.value ? 'white' : '#6B7280',
                  fontWeight: 800, fontSize: '0.85rem',
                  transition: 'all 0.18s ease',
                  '&:hover': { bgcolor: ag.color, color: 'white', borderColor: ag.color },
                }}
              >
                {ag.label}
              </Box>
            ))}
          </Box>

          {/* Date of Birth — shown for Age 0-1, 1-3, and 4-6 */}
          {['0-1', '1-3', '4-6'].includes(formData.age_group) && (() => {
            const now = new Date();
            const toISO = (d) => d.toISOString().split('T')[0];
            let minDate, maxDate, helperMsg;

            if (formData.age_group === '0-1') {
              minDate = toISO(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
              maxDate = toISO(now);
              helperMsg = "Used to provide age-appropriate activities for your baby";
            } else if (formData.age_group === '1-3') {
              // Child must be 0–3 years old
              minDate = toISO(new Date(now.getFullYear() - 3, now.getMonth(), now.getDate()));
              maxDate = toISO(now);
              helperMsg = "Used to auto-calculate the child's milestone level (1–6)";
            } else {
              // Age 4-6: child must be 3–7 years old
              minDate = toISO(new Date(now.getFullYear() - 7, now.getMonth(), now.getDate()));
              maxDate = toISO(new Date(now.getFullYear() - 3, now.getMonth(), now.getDate()));
              helperMsg = "Helps personalize your child's learning journey (age 3–6)";
            }

            return (
              <>
                <Typography
                  variant="caption" fontWeight={900}
                  sx={{ mt: 2.5, mb: 1.25, display: 'block', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  Date of Birth
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData((p) => ({ ...p, date_of_birth: e.target.value }))}
                  inputProps={{
                    max: maxDate,
                    min: minDate,
                  }}
                  helperText={helperMsg}
                />
              </>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleSave} disabled={loading} sx={{ px: 4 }}>
            {loading ? 'Saving…' : editingProfile ? 'Update Profile' : 'Create Profile'}
          </Button>
        </DialogActions>
      </Dialog>

      <ModalDialog
        open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}
        title="Delete Profile?" type="error"
        message={`Are you sure you want to delete ${deleteTarget?.name}'s profile? This cannot be undone.`}
        confirmText="Delete" onConfirm={handleDelete}
      />
    </Box>
  );
};

export default ChildProfileManager;
