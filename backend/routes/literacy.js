/**
 * routes/literacy.js
 *
 * Replaces all Firestore literacy operations from literacyService.js.
 * Every Firebase collection → MongoDB model, same data shape.
 *
 * GET    /api/literacy/stories              ?age_group=3-5
 * POST   /api/literacy/stories
 * PUT    /api/literacy/stories/:id
 * DELETE /api/literacy/stories/:id
 *
 * GET    /api/literacy/vocabulary
 * POST   /api/literacy/vocabulary
 * PUT    /api/literacy/vocabulary/:id
 * DELETE /api/literacy/vocabulary/:id
 *
 * GET    /api/literacy/word-builder
 * POST   /api/literacy/word-builder
 * PUT    /api/literacy/word-builder/:id
 * DELETE /api/literacy/word-builder/:id
 *
 * GET    /api/literacy/picture-match
 * POST   /api/literacy/picture-match
 * PUT    /api/literacy/picture-match/:id
 * DELETE /api/literacy/picture-match/:id
 *
 * GET    /api/literacy/sound-match
 * POST   /api/literacy/sound-match
 * PUT    /api/literacy/sound-match/:id
 * DELETE /api/literacy/sound-match/:id
 *
 * GET    /api/literacy/object-recognition
 * POST   /api/literacy/object-recognition
 * PUT    /api/literacy/object-recognition/:id
 * DELETE /api/literacy/object-recognition/:id
 *
 * GET    /api/literacy/fluency
 * POST   /api/literacy/fluency
 * PUT    /api/literacy/fluency/:id
 * DELETE /api/literacy/fluency/:id
 *
 * GET    /api/literacy/phonics
 * POST   /api/literacy/phonics
 * PUT    /api/literacy/phonics/:id
 * DELETE /api/literacy/phonics/:id
 *
 * GET    /api/literacy/challenges
 * PUT    /api/literacy/challenges/:id
 *
 * GET    /api/literacy/reading-activities   ?age_group=3-5
 * POST   /api/literacy/reading-activities
 * PUT    /api/literacy/reading-activities/:id
 * DELETE /api/literacy/reading-activities/:id
 *
 * GET    /api/literacy/streaks/:userId
 * POST   /api/literacy/streaks/:userId/mark-today
 */

const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  Story, VocabularyGame, WordBuilder, PictureMatch,
  SoundMatch, ObjectRecognition, FluencyPassage,
  PhonicsWord, Challenge, ReadingActivity,
} = require('../models/Literacy');
const { Streak } = require('../models/Score');

// ── Generic CRUD factory ───────────────────────────────────────────────────
// Reduces boilerplate: each resource shares the same 4 handlers.
const crudRoutes = (router, path, Model, filterFn = null) => {
  // GET all (optional filter)
  router.get(path, verifyToken, async (req, res) => {
    try {
      const filter = filterFn ? filterFn(req.query) : {};
      const docs = await Model.find(filter).sort({ created_at: -1 });
      res.json(docs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post(path, verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // PUT update
  router.put(`${path}/:id`, verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE
  router.delete(`${path}/:id`, verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// ── Wire up all literacy collections ──────────────────────────────────────
crudRoutes(router, '/stories',            Story,             (q) => q.age_group ? { age_group: q.age_group } : {});
crudRoutes(router, '/vocabulary',         VocabularyGame,    null);
crudRoutes(router, '/word-builder',       WordBuilder,       null);
crudRoutes(router, '/picture-match',      PictureMatch,      null);
crudRoutes(router, '/sound-match',        SoundMatch,        null);
crudRoutes(router, '/object-recognition', ObjectRecognition, null);
crudRoutes(router, '/fluency',            FluencyPassage,    null);
crudRoutes(router, '/phonics',            PhonicsWord,       null);
crudRoutes(router, '/reading-activities', ReadingActivity,   (q) => q.age_group ? { age_group: q.age_group } : {});

// ── Challenges: GET all + PUT update (no create/delete from UI) ───────────
router.get('/challenges', verifyToken, async (req, res) => {
  try {
    const docs = await Challenge.find().sort({ created_at: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/challenges/:id', verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const doc = await Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Streaks ────────────────────────────────────────────────────────────────
router.get('/streaks/:userId', verifyToken, async (req, res) => {
  try {
    const streak = await Streak.findOne({ user_id: req.params.userId });
    res.json(streak || { dates: [], count: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/streaks/:userId/mark-today', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    let streak = await Streak.findOne({ user_id: req.params.userId });

    if (!streak) {
      streak = await Streak.create({ user_id: req.params.userId, dates: [today], count: 1 });
      return res.json({ count: 1 });
    }

    const dates = streak.dates || [];
    if (dates.includes(today)) return res.json({ count: streak.count });

    const sorted = [...dates, today].sort().slice(-7);
    let count = 1;
    const d = new Date(today);
    for (let i = 1; i <= 6; i++) {
      d.setDate(d.getDate() - 1);
      if (sorted.includes(d.toISOString().slice(0, 10))) count++;
      else break;
    }

    streak.dates = sorted;
    streak.count = count;
    await streak.save();

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
