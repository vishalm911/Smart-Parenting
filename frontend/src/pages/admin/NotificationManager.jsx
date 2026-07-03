import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  IconButton, Chip, TextField, Switch, FormControlLabel, Alert, CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon,
} from '@mui/icons-material';
import ModalDialog from '../../components/shared/ModalDialog';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import {
  getNotificationTemplates,
  saveNotificationTemplate,
  deleteNotificationTemplate,
  toggleNotificationTemplate,
} from '../../api/userService';

// ── Seed templates written to database when the collection is empty ──────────
const SEED_TEMPLATES = [
  { title: 'Activity Completed', message: '{child_name} completed {activity_name}! 🎉', type: 'achievement', active: true  },
  { title: 'Coins Earned',        message: '{child_name} earned {amount} coins! 🪙',    type: 'reward',      active: true  },
  { title: 'Daily Reminder',      message: "Time for today's learning adventure! 📚",   type: 'reminder',    active: true  },
  { title: 'New Content',          message: 'New activity "{activity_name}" is live!',  type: 'system',      active: false },
  { title: 'Weekly Report',        message: "Here is {child_name}'s weekly progress 📊", type: 'system',     active: true  },
];

const TYPE_CONFIG = {
  achievement: { icon: '🏆', color: '#F5A623', bg: '#FFF8E1', border: 'rgba(245,166,35,0.3)',  label: 'Achievement' },
  reward:      { icon: '🪙', color: '#22C55E', bg: '#F0FFF4', border: 'rgba(34,197,94,0.3)',   label: 'Reward'      },
  reminder:    { icon: '⏰', color: '#3B82F6', bg: '#EFF6FF', border: 'rgba(59,130,246,0.3)',  label: 'Reminder'    },
  system:      { icon: '⚙️', color: '#8B5CF6', bg: '#F5F3FF', border: 'rgba(139,92,246,0.3)',  label: 'System'      },
};

const EMPTY_FORM = { title: '', message: '', type: 'system' };

const NotificationManager = () => {
  const [templates,    setTemplates]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editTemplate, setEditTemplate] = useState(null);
  const [formData,     setFormData]     = useState(EMPTY_FORM);

  // ── Load templates from database on mount ────────────────────────────────
  const loadTemplates = async () => {
    setLoading(true); setError('');
    const { data, error: fetchErr } = await getNotificationTemplates();
    if (fetchErr) {
      setError('Failed to load templates: ' + fetchErr);
      setLoading(false);
      return;
    }
    if (data && data.length > 0) {
      setTemplates(data);
    } else {
      // Seed database with default templates if the collection is empty
      const seeded = await Promise.all(
        SEED_TEMPLATES.map((t) => saveNotificationTemplate(t).then(({ id }) => ({ id, ...t })))
      );
      setTemplates(seeded.filter((t) => !!t.id));
    }
    setLoading(false);
  };

  useEffect(() => { loadTemplates(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ── Save (create or update) ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Title and message are required.'); return;
    }
    setSaving(true); setError('');
    const { id, error: saveErr } = await saveNotificationTemplate(formData, editTemplate?.id || null);
    if (saveErr) {
      setError('Failed to save template: ' + saveErr);
    } else {
      if (editTemplate) {
        setTemplates((prev) => prev.map((t) => t.id === editTemplate.id ? { ...t, ...formData } : t));
        showSuccess('✅ Template updated successfully.');
      } else {
        setTemplates((prev) => [...prev, { id, ...formData, active: true }]);
        showSuccess('✅ Template created successfully.');
      }
      setDialogOpen(false);
      setEditTemplate(null);
      setFormData(EMPTY_FORM);
    }
    setSaving(false);
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (template) => {
    setEditTemplate(template);
    setFormData({ title: template.title, message: template.message, type: template.type });
    setError('');
    setDialogOpen(true);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = (id) => setDeleteDialog({ open: true, id });
  const handleDelete = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ open: false, id: null });
    const { error: delErr } = await deleteNotificationTemplate(id);
    if (delErr) {
      setError('Failed to delete template: ' + delErr);
    } else {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      showSuccess('🗑️ Template deleted.');
    }
  };

  // ── Toggle Active ─────────────────────────────────────────────────────────
  const handleToggleActive = async (template) => {
    const newActive = !template.active;
    // Optimistic update
    setTemplates((prev) => prev.map((t) => t.id === template.id ? { ...t, active: newActive } : t));
    const { error: toggleErr } = await toggleNotificationTemplate(template.id, newActive);
    if (toggleErr) {
      // Revert on error
      setTemplates((prev) => prev.map((t) => t.id === template.id ? { ...t, active: template.active } : t));
      setError('Failed to update template: ' + toggleErr);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.01em' }}>Notification Templates 🔔</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Manage notification messages sent to parents and children
          </Typography>
        </Box>
        <Button
          startIcon={<AddIcon />}
          variant="contained" color="secondary"
          onClick={() => { setEditTemplate(null); setFormData(EMPTY_FORM); setError(''); setDialogOpen(true); }}
        >
          New Template
        </Button>
      </Box>

      {error      && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

      {loading ? (
        <Paper elevation={0} sx={{ borderRadius: '20px', p: 3 }}>
          <SkeletonLoader variant="card" count={3} />
        </Paper>
      ) : (
        <Grid container spacing={2} alignItems="stretch">
          {templates.map((template, i) => {
            const config = TYPE_CONFIG[template.type] || TYPE_CONFIG.system;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={template.id} sx={{ display: 'flex' }}>
                <Card sx={{
                  borderRadius: '20px', width: '100%',
                  border: `1.5px solid ${template.active ? config.border : 'rgba(0,0,0,0.06)'}`,
                  animation: `slideInUp 0.35s ease-out ${i * 0.06}s both`,
                  opacity: template.active ? 1 : 0.65,
                  transition: 'all 0.2s ease',
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Top row: icon + actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{
                        width: 44, height: 44, borderRadius: '14px',
                        bgcolor: config.bg, border: `1.5px solid ${config.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}>
                        {config.icon}
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEdit(template)}
                          sx={{ color: '#9CA3AF', '&:hover': { color: '#F5A623', bgcolor: '#FFF8E1' } }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => confirmDelete(template.id)}
                          sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444', bgcolor: '#FFF5F5' } }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 0.5 }}>{template.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.82rem', lineHeight: 1.5 }}>
                      {template.message}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ display: 'flex', gap: 0.75 }}>
                        <Chip
                          label={config.label} size="small"
                          sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: config.bg, color: config.color }}
                        />
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={!!template.active}
                            onChange={() => handleToggleActive(template)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: config.color },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: config.color },
                            }}
                          />
                        }
                        label={
                          <Typography variant="caption" fontWeight={800} sx={{ color: template.active ? config.color : '#9CA3AF', fontSize: '0.65rem' }}>
                            {template.active ? 'Active' : 'Inactive'}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create / Edit Dialog */}
      <ModalDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditTemplate(null); setFormData(EMPTY_FORM); setError(''); }}
        title={editTemplate ? '✏️ Edit Template' : '🆕 New Template'}
        type="info"
        confirmText={saving ? 'Saving…' : (editTemplate ? 'Update Template' : 'Create Template')}
        cancelText="Cancel"
        onConfirm={handleSave}
        onCancel={() => { setDialogOpen(false); setEditTemplate(null); setFormData(EMPTY_FORM); setError(''); }}
        loading={saving}
        maxWidth="sm"
      >
        <Box sx={{ textAlign: 'left', pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
          <TextField
            fullWidth label="Title" value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth label="Message" value={formData.message}
            onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
            multiline rows={3} sx={{ mb: 2 }}
            helperText="Use {child_name}, {activity_name}, {amount} as placeholders"
          />
          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 1, display: 'block' }}>TYPE</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <Box
                key={type}
                onClick={() => setFormData((p) => ({ ...p, type }))}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  px: 1.5, py: 0.75, borderRadius: '12px', cursor: 'pointer',
                  bgcolor: formData.type === type ? cfg.bg : '#F9FAFB',
                  border: `1.5px solid ${formData.type === type ? cfg.border : 'rgba(0,0,0,0.08)'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: cfg.bg },
                }}
              >
                <Typography sx={{ fontSize: '1rem' }}>{cfg.icon}</Typography>
                <Typography variant="caption" fontWeight={800} sx={{ color: formData.type === type ? cfg.color : '#6B7280', textTransform: 'capitalize' }}>
                  {cfg.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </ModalDialog>

      {/* Delete Confirmation */}
      <ModalDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        title="Delete Template?"
        message="This action cannot be undone. The template will be permanently removed from the database."
        type="error"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
      />
    </Box>
  );
};

export default NotificationManager;
