/**
 * routes/sessions.js
 * Replaces Firestore sessions collection (createSession / endSession from firestoreService.js)
 *
 * POST  /api/sessions          — start a new session, returns sessionId
 * PUT   /api/sessions/:id/end  — mark session ended
 * GET   /api/sessions          — all sessions (admin)
 */

const router  = require('express').Router();
const { Session } = require('../models/Score');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST — create session on login
router.post('/', verifyToken, async (req, res) => {
  try {
    const session = await Session.create({ user_id: req.user.userId });
    res.status(201).json({ sessionId: session._id, error: null });
  } catch (err) {
    res.status(500).json({ sessionId: null, error: err.message });
  }
});

// PUT — end session on logout
router.put('/:id/end', verifyToken, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { ended_at: new Date(), is_active: false },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ message: 'Session ended.', error: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all sessions — admin only
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('user_id', 'email displayName role')
      .sort({ started_at: -1 })
      .limit(200);
    res.json({ data: sessions, error: null });
  } catch (err) {
    res.status(500).json({ data: [], error: err.message });
  }
});

module.exports = router;
