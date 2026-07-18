import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  IconButton, Chip, TextField, Switch, FormControlLabel, Alert, CircularProgress,
  Tabs, Tab, MenuItem, Select, FormControl, InputLabel, Divider
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Send as SendIcon
} from '@mui/icons-material';
import ModalDialog from '../../components/shared/ModalDialog';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import {
  getNotificationTemplates,
  saveNotificationTemplate,
  deleteNotificationTemplate,
  toggleNotificationTemplate,
  sendNotification
} from '../../api/userService';
import { getChildProfiles } from '../../api/childProfileService';

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
  const [activeTab,    setActiveTab]    = useState(0);
  const [templates,    setTemplates]    = useState([]);
  const [children,     setChildren]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');
  
  // Template modal state
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editTemplate, setEditTemplate] = useState(null);
  const [formData,     setFormData]     = useState(EMPTY_FORM);

  // Send Notification state
  const [selectedChildId, setSelectedChildId]       = useState('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sendForm,           setSendForm]           = useState({ title: '', message: '', type: 'system' });
  const [sendingNotif,       setSendingNotif]       = useState(false);

  // Load templates and children from database on mount
  const loadData = async () => {
    setLoading(true); setError('');
    const { data: templatesData, error: fetchErr } = await getNotificationTemplates();
    const { data: childrenData } = await getChildProfiles();
    
    if (childrenData) {
      setChildren(childrenData);
    }

    if (fetchErr) {
      setError('Failed to load templates: ' + fetchErr);
      setLoading(false);
      return;
    }
    if (templatesData && templatesData.length > 0) {
      setTemplates(templatesData);
    } else {
      // Seed database with default templates if the collection is empty
      const seeded = await Promise.all(
        SEED_TEMPLATES.map((t) => saveNotificationTemplate(t).then(({ id }) => ({ id, ...t })))
      );
      setTemplates(seeded.filter((t) => !!t.id));
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Save template (create or update)
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

  const handleEdit = (template) => {
    setEditTemplate(template);
    setFormData({ title: template.title, message: template.message, type: template.type });
    setError('');
    setDialogOpen(true);
  };

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

  const handleToggleActive = async (template) => {
    const newActive = !template.active;
    setTemplates((prev) => prev.map((t) => t.id === template.id ? { ...t, active: newActive } : t));
    const { error: toggleErr } = await toggleNotificationTemplate(template.id, newActive);
    if (toggleErr) {
      setTemplates((prev) => prev.map((t) => t.id === template.id ? { ...t, active: template.active } : t));
      setError('Failed to update template: ' + toggleErr);
    }
  };

  // Pre-fill Send Form when template selected
  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setSendForm({ title: '', message: '', type: 'system' });
      return;
    }
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSendForm({
        title: template.title,
        message: template.message,
        type: template.type
      });
    }
  };

  // Send actual notification to database
  const handleSendNotification = async () => {
    if (!sendForm.title.trim() || !sendForm.message.trim()) {
      setError('Title and message are required.');
      return;
    }
    setSendingNotif(true);
    setError('');
    
    let childId = null;
    let parentId = null;

    if (selectedChildId !== 'all') {
      const child = children.find(c => c._id === selectedChildId);
      if (child) {
        childId = child._id;
        parentId = child.parent_uid;
      }
    }

    const childObj = children.find(c => c._id === selectedChildId);
    const resolvedName = childObj ? childObj.name : 'Child';
    const finalTitle = sendForm.title.replace('{child_name}', resolvedName).replace('{activity_name}', 'Adventure Island').replace('{amount}', '50');
    const finalMessage = sendForm.message.replace('{child_name}', resolvedName).replace('{activity_name}', 'Adventure Island').replace('{amount}', '50');

    const { error: sendErr } = await sendNotification({
      title: finalTitle,
      message: finalMessage,
      type: sendForm.type,
      child_id: childId,
      parent_id: parentId
    });

    if (sendErr) {
      setError('Failed to send notification: ' + sendErr);
    } else {
      showSuccess(`🚀 Notification sent successfully to ${selectedChildId === 'all' ? 'all children' : resolvedName}!`);
      setSendForm({ title: '', message: '', type: 'system' });
      setSelectedTemplateId('');
    }
    setSendingNotif(false);
  };

  // Live preview formatting
  const childObj = children.find(c => c._id === selectedChildId);
  const resolvedName = childObj ? childObj.name : 'Child';
  const previewTitle = sendForm.title.replace('{child_name}', resolvedName).replace('{activity_name}', 'Adventure Island').replace('{amount}', '50') || 'Notification Title';
  const previewMessage = sendForm.message.replace('{child_name}', resolvedName).replace('{activity_name}', 'Adventure Island').replace('{amount}', '50') || 'Your notification message preview will appear here...';
  const previewConfig = TYPE_CONFIG[sendForm.type] || TYPE_CONFIG.system;

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.01em' }}>Notifications Portal 🔔</Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Send direct notifications to children or manage templates
          </Typography>
        </Box>
        {activeTab === 0 && (
          <Button
            startIcon={<AddIcon />}
            variant="contained" color="secondary"
            onClick={() => { setEditTemplate(null); setFormData(EMPTY_FORM); setError(''); setDialogOpen(true); }}
            sx={{ borderRadius: '12px', fontWeight: 800 }}
          >
            New Template
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: '16px', mb: 3, p: 0.5, bgcolor: '#F3F4F6' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newTab) => { setActiveTab(newTab); setError(''); }}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': { height: 0 },
            '& .MuiTab-root': {
              borderRadius: '12px',
              fontWeight: 800,
              minHeight: 44,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              '&.Mui-selected': { bgcolor: 'white', color: 'var(--color-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
            }
          }}
        >
          <Tab label="Templates Manager 📁" />
          <Tab label="Send Notification 🚀" />
        </Tabs>
      </Paper>

      {error      && <Alert severity="error"   sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{successMsg}</Alert>}

      {/* TAB 1: TEMPLATE MANAGER */}
      {activeTab === 0 && (
        <>
          {loading ? (
            <Paper elevation={0} sx={{ borderRadius: '20px', p: 3 }}>
              <SkeletonLoader variant="card" count={3} />
            </Paper>
          ) : (
            <Grid container spacing={2.5} alignItems="stretch">
              {templates.map((template, i) => {
                const config = TYPE_CONFIG[template.type] || TYPE_CONFIG.system;
                return (
                  <Grid item xs={12} sm={6} md={4} key={template.id} sx={{ display: 'flex' }}>
                    <Card sx={{
                      borderRadius: '20px', width: '100%',
                      border: `1.5px solid ${template.active ? config.border : 'rgba(0,0,0,0.06)'}`,
                      animation: `slideInUp 0.35s ease-out ${i * 0.05}s both`,
                      opacity: template.active ? 1 : 0.65,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}>
                      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
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
                          <Chip
                            label={config.label} size="small"
                            sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: config.bg, color: config.color }}
                          />
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
        </>
      )}

      {/* TAB 2: SEND NOTIFICATION */}
      {activeTab === 1 && (
        <Grid container spacing={4}>
          {/* Form Side */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ borderRadius: '24px', p: 4, border: '1.5px solid var(--color-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.02)' }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 3 }}>Compose Message ✏️</Typography>
              
              {/* Select Recipient Child */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="child-select-label">Send To Child</InputLabel>
                <Select
                  labelId="child-select-label"
                  value={selectedChildId}
                  label="Send To Child"
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">📢 Broadcast to All Children</MenuItem>
                  <Divider />
                  {children.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.avatar_emoji || '🧒'} {c.name} (Age {c.age_months ? `${Math.floor(c.age_months / 12)} yrs` : c.age_group})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Template Quick Select */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="template-select-label">Load Template (Optional)</InputLabel>
                <Select
                  labelId="template-select-label"
                  value={selectedTemplateId}
                  label="Load Template (Optional)"
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">— Select a template to pre-fill —</MenuItem>
                  {templates.filter(t => t.active).map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {TYPE_CONFIG[t.type]?.icon || '⚙️'} {t.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Custom Inputs */}
              <TextField
                fullWidth label="Notification Title"
                value={sendForm.title}
                onChange={(e) => setSendForm(p => ({ ...p, title: e.target.value }))}
                sx={{ mb: 3 }}
                slotProps={{
                  input: { style: { borderRadius: '12px' } }
                }}
              />

              <TextField
                fullWidth label="Message Body"
                value={sendForm.message}
                onChange={(e) => setSendForm(p => ({ ...p, message: e.target.value }))}
                multiline rows={4}
                sx={{ mb: 3 }}
                helperText="Use placeholders: {child_name}, {activity_name}, {amount}"
                slotProps={{
                  input: { style: { borderRadius: '12px' } }
                }}
              />

              {/* Type Picker */}
              <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>NOTIFICATION THEME</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 4 }}>
                {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                  <Box
                    key={type}
                    onClick={() => setSendForm(p => ({ ...p, type }))}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      px: 2, py: 1, borderRadius: '14px', cursor: 'pointer',
                      bgcolor: sendForm.type === type ? cfg.bg : '#F9FAFB',
                      border: `2px solid ${sendForm.type === type ? cfg.border : 'rgba(0,0,0,0.06)'}`,
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: cfg.bg },
                    }}
                  >
                    <Typography sx={{ fontSize: '1.2rem' }}>{cfg.icon}</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: sendForm.type === type ? cfg.color : '#6B7280' }}>
                      {cfg.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Submit Button */}
              <Button
                fullWidth variant="contained" color="primary" size="large"
                startIcon={sendingNotif ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                disabled={sendingNotif}
                onClick={handleSendNotification}
                sx={{
                  borderRadius: '14px', py: 1.5, fontWeight: 900, fontSize: '1rem',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  boxShadow: '0 4px 15px rgba(244, 163, 0, 0.25)'
                }}
              >
                {sendingNotif ? 'Sending Notification…' : 'Send Notification'}
              </Button>
            </Paper>
          </Grid>

          {/* Live Preview Side */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{
              borderRadius: '24px', p: 4, height: '100%',
              bgcolor: '#FFF9F0', border: '1.5px dashed rgba(244, 163, 0, 0.3)',
              display: 'flex', flexDirection: 'column', justifyItems: 'center'
            }}>
              <Typography variant="subtitle1" fontWeight={900} color="primary" sx={{ mb: 3 }}>
                Live Child Portal Preview 📱
              </Typography>
              
              <Box sx={{
                flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280
              }}>
                {/* Child notification balloon bubble */}
                <Card sx={{
                  maxWidth: 320, width: '100%', borderRadius: '24px', p: 2.5,
                  boxShadow: '0 15px 35px rgba(0,0,0,0.08)', border: '2px solid rgba(255,255,255,0.7)',
                  background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)',
                  position: 'relative', overflow: 'visible',
                  animation: 'float-gentle 4s ease-in-out infinite'
                }}>
                  {/* Glowing header icon wrapper */}
                  <Box sx={{
                    position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
                    width: 48, height: 48, borderRadius: '50%',
                    bgcolor: previewConfig.bg, border: `2.5px solid ${previewConfig.border}`,
                    boxShadow: `0 4px 12px ${previewConfig.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem'
                  }}>
                    {previewConfig.icon}
                  </Box>

                  <Box sx={{ pt: 2, textHeight: '1.4', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={900} sx={{ letterSpacing: '0.05em', fontSize: '0.7rem', textTransform: 'uppercase', mb: 0.5 }}>
                      🔔 NEW NOTIFICATION
                    </Typography>
                    
                    <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#1A1A1A', mb: 1, lineHeight: 1.25 }}>
                      {previewTitle}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.8rem', lineHeight: 1.4, mb: 2.5 }}>
                      {previewMessage}
                    </Typography>

                    <Button variant="contained" size="small" fullWidth sx={{
                      borderRadius: '12px', fontWeight: 900, textTransform: 'none',
                      background: 'linear-gradient(135deg, #7C4DFF 0%, #E91E8C 100%)',
                      boxShadow: '0 4px 10px rgba(124, 77, 255, 0.2)'
                    }}>
                      Got it!
                    </Button>
                  </Box>
                </Card>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ textAlign: 'center', mt: 2 }}>
                * Preview displays placeholding variables replaced in real-time.
              </Typography>
            </Paper>
          </Grid>
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
