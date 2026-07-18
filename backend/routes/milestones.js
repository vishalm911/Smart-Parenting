/**
 * routes/milestones.js
 * Handle milestone assessments and activity recommendations.
 */

const router = require('express').Router();
const MilestoneAssessment = require('../models/MilestoneAssessment');
const Recommendation = require('../models/Recommendation');
const { verifyToken, requireRole } = require('../middleware/auth');

// ── Milestone Assessments ───────────────────────────────────────────────────

// POST — save milestone assessment result
router.post('/assessments', verifyToken, async (req, res) => {
  try {
    const assessment = await MilestoneAssessment.create(req.body);
    res.status(201).json({ data: assessment, error: null });
  } catch (err) {
    res.status(400).json({ data: null, error: err.message });
  }
});

// GET — get latest assessment for a child
router.get('/assessments/latest', verifyToken, async (req, res) => {
  try {
    const { childId } = req.query;
    if (!childId) return res.status(400).json({ error: 'childId is required' });
    const assessment = await MilestoneAssessment.findOne({ childId }).sort({ completedAt: -1 });
    res.json({ data: assessment, error: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — get all assessments (optional childId filter)
router.get('/assessments', verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.childId) filter.childId = req.query.childId;
    const assessments = await MilestoneAssessment.find(filter).sort({ completedAt: -1 });
    res.json({ data: assessments, error: null });
  } catch (err) {
    res.status(500).json({ data: [], error: err.message });
  }
});

// DELETE — delete milestone assessment (admin only)
router.delete('/assessments/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const doc = await MilestoneAssessment.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Milestone assessment not found.' });
    res.json({ message: 'Milestone assessment deleted successfully.', error: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── Recommendations ─────────────────────────────────────────────────────────

// POST — create a recommendation (admin / teacher only)
router.post('/recommendations', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const rec = await Recommendation.create(req.body);
    res.status(201).json({ data: rec, error: null });
  } catch (err) {
    res.status(400).json({ data: null, error: err.message });
  }
});

// GET — list recommendations for a child
router.get('/recommendations', verifyToken, async (req, res) => {
  try {
    const { childId } = req.query;
    if (!childId) return res.status(400).json({ error: 'childId is required' });
    const recs = await Recommendation.find({ child_id: childId }).sort({ created_at: -1 });
    res.json({ data: recs, error: null });
  } catch (err) {
    res.status(500).json({ data: [], error: err.message });
  }
});

// PUT — update completion status of a recommendation
router.put('/recommendations/:id', verifyToken, async (req, res) => {
  try {
    const { completed } = req.body;
    const rec = await Recommendation.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true, runValidators: true }
    );
    if (!rec) return res.status(404).json({ data: null, error: 'Recommendation not found.' });
    res.json({ data: rec, error: null });
  } catch (err) {
    res.status(400).json({ data: null, error: err.message });
  }
});

module.exports = router;
