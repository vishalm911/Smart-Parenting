/**
 * routes/numeracy.js
 * Replaces Firestore math_games, puzzle_games, logic_games collections
 *
 * GET/POST/PUT/DELETE  /api/numeracy/math
 * GET/POST/PUT/DELETE  /api/numeracy/puzzles
 * GET/POST/PUT/DELETE  /api/numeracy/logic
 */

const router = require('express').Router();
const { MathGame, PuzzleGame, LogicGame } = require('../models/Score');
const { verifyToken, requireRole } = require('../middleware/auth');

// ── Generic helper ─────────────────────────────────────────────────────────
const crud = (router, path, Model) => {
  router.get(path, verifyToken, async (req, res) => {
    try {
      const filter = {};
      if (req.query.difficulty) filter.difficulty = req.query.difficulty;
      if (req.query.age_group)  filter.age_group  = req.query.age_group;
      const docs = await Model.find(filter).sort({ created_at: -1 });
      res.json({ data: docs, error: null });
    } catch (err) {
      res.status(500).json({ data: [], error: err.message });
    }
  });

  router.post(path, verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json({ data: doc, error: null });
    } catch (err) {
      res.status(400).json({ data: null, error: err.message });
    }
  });

  router.put(`${path}/:id`, verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ data: null, error: 'Not found' });
      res.json({ data: doc, error: null });
    } catch (err) {
      res.status(400).json({ data: null, error: err.message });
    }
  });

  router.delete(`${path}/:id`, verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ message: 'Deleted.', error: null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

crud(router, '/math',    MathGame);
crud(router, '/puzzles', PuzzleGame);
crud(router, '/logic',   LogicGame);

module.exports = router;
