/**
 * routes/notifications.js
 * Express routes for notifications and notification templates.
 */
const router = require('express').Router();
const Notification = require('../models/Notification');
const NotificationTemplate = require('../models/NotificationTemplate');
const { verifyToken } = require('../middleware/auth');

// ── TEMPLATES ENDPOINTS ──────────────────────────────────────────────────────

// GET all templates
router.get('/templates', verifyToken, async (req, res) => {
  try {
    const templates = await NotificationTemplate.find({}).sort({ created_at: -1 });
    res.json({ data: templates.map(t => ({ id: t._id.toString(), ...t.toObject() })), error: null });
  } catch (err) {
    res.status(500).json({ data: [], error: err.message });
  }
});

// POST save notification template (create or update)
router.post('/templates', verifyToken, async (req, res) => {
  try {
    const { id } = req.query; // optional template ID for editing
    const templateData = req.body;

    if (id) {
      const template = await NotificationTemplate.findByIdAndUpdate(id, templateData, { new: true });
      if (!template) return res.status(404).json({ id: null, error: 'Template not found.' });
      return res.json({ id: template._id.toString(), data: template, error: null });
    } else {
      const template = new NotificationTemplate(templateData);
      await template.save();
      return res.json({ id: template._id.toString(), data: template, error: null });
    }
  } catch (err) {
    res.status(500).json({ id: null, error: err.message });
  }
});

// DELETE a template
router.delete('/templates/:id', verifyToken, async (req, res) => {
  try {
    const template = await NotificationTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found.' });
    res.json({ error: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT toggle template active status
router.put('/templates/:id/toggle', verifyToken, async (req, res) => {
  try {
    const { active } = req.body;
    const template = await NotificationTemplate.findByIdAndUpdate(
      req.params.id,
      { active },
      { new: true }
    );
    if (!template) return res.status(404).json({ error: 'Template not found.' });
    res.json({ data: template, error: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── NOTIFICATIONS ENDPOINTS ──────────────────────────────────────────────────

// GET notifications for child or parent, or all if userId === 'all'
router.get('/', async (req, res) => {
  try {
    const { userId, field } = req.query;

    const query = {};
    if (userId && userId !== 'all') {
      if (field === 'child_id' || req.query.child_id) {
        query.child_id = userId;
      } else if (field === 'parent_id' || req.query.parent_id) {
        query.parent_id = userId;
      } else {
        // Fallback: match either
        query.$or = [{ child_id: userId }, { parent_id: userId }];
      }
    }

    const notifications = await Notification.find(query).sort({ created_at: -1 }).limit(50);
    res.json({
      data: notifications.map(n => ({
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        read_status: n.read_status,
        created_at: n.created_at
      })),
      error: null
    });
  } catch (err) {
    res.status(500).json({ data: [], error: err.message });
  }
});

// GET unread notifications count
router.get('/unread/count', async (req, res) => {
  try {
    const { userId, field } = req.query;
    if (!userId) return res.status(400).json({ count: 0, error: 'userId is required' });

    const query = { read_status: false };
    if (field === 'child_id') {
      query.child_id = userId;
    } else if (field === 'parent_id') {
      query.parent_id = userId;
    } else {
      query.$or = [{ child_id: userId }, { parent_id: userId }];
    }

    const count = await Notification.countDocuments(query);
    res.json({ count, error: null });
  } catch (err) {
    res.status(500).json({ count: 0, error: err.message });
  }
});

// POST send a notification (admin broadcast or direct user message)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, message, type, child_id, parent_id } = req.body;
    if (!title || !message) {
      return res.status(400).json({ data: null, error: 'Title and message are required' });
    }

    const notif = new Notification({
      title,
      message,
      type: type || 'system',
      child_id: child_id || null,
      parent_id: parent_id || null,
    });

    await notif.save();
    res.json({ data: notif, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PUT mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { read_status: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json({ error: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
