/**
 * routes/scores.js
 * Replaces Firestore activity_scores + language_scores collections
 *
 * POST  /api/scores                        — save a new score
 * GET   /api/scores?childId=<id>           — get scores for a child
 * GET   /api/scores/leaderboard            — top scores across all children
 * GET   /api/scores/summary/:childId       — aggregate summary per child
 * DELETE /api/scores/:id                   — delete a score entry (admin)
 */

const router = require('express').Router();
const { ActivityScore } = require('../models/Score');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST — save activity score
router.post('/', verifyToken, async (req, res) => {
  try {
    const score = await ActivityScore.create(req.body);
    res.status(201).json({ data: score, error: null });
  } catch (err) {
    res.status(400).json({ data: null, error: err.message });
  }
});

// GET — scores for a specific child
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.childId)      filter.child_id      = req.query.childId;
    if (req.query.activityType) filter.activity_type = req.query.activityType;

    const scores = await ActivityScore.find(filter)
      .sort({ date: -1 })
      .limit(Number(req.query.limit) || 100);

    res.json({ data: scores, error: null });
  } catch (err) {
    res.status(500).json({ data: [], error: err.message });
  }
});

// GET — global leaderboard (top 20 by total score)
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const leaders = await ActivityScore.aggregate([
      {
        $group: {
          _id:          '$child_id',
          totalScore:   { $sum: '$score' },
          displayName:  { $last: '$display_name' },
          username:     { $last: '$username' },
          attempts:     { $sum: '$attempts' },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 20 },
    ]);
    res.json({ data: leaders, error: null });
  } catch (err) {
    res.status(500).json({ data: [], error: err.message });
  }
});

// GET — per-child aggregate summary
router.get('/summary/:childId', verifyToken, async (req, res) => {
  try {
    const [summary] = await ActivityScore.aggregate([
      { $match: { child_id: require('mongoose').Types.ObjectId.createFromHexString(req.params.childId) } },
      {
        $group: {
          _id:         '$child_id',
          totalScore:  { $sum: '$score' },
          avgAccuracy: { $avg: '$accuracy' },
          totalTime:   { $sum: '$time_spent' },
          totalGames:  { $sum: 1 },
        },
      },
    ]);
    res.json({ data: summary || {}, error: null });
  } catch (err) {
    res.status(500).json({ data: {}, error: err.message });
  }
});

// DELETE — admin only
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await ActivityScore.findByIdAndDelete(req.params.id);
    res.json({ message: 'Score deleted.', error: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
