/**
 * routes/cognitiveSel.js
 * Exposes MongoDB collections for cognitive, creativity, emotional, and story choices
 *
 * GET/POST/PUT/DELETE  /api/cognitive-sel/games
 * GET/POST/PUT/DELETE  /api/cognitive-sel/stories
 */

const router = require('express').Router();
const { CognitiveSelGame, CognitiveStory } = require('../models/CognitiveSel');
const { verifyToken, requireRole } = require('../middleware/auth');

// Helper to register simple CRUD routes
const registerCrud = (router, path, Model) => {
  // GET list
  router.get(path, verifyToken, async (req, res) => {
    try {
      const filter = {};
      if (req.query.universe) filter.universe = req.query.universe;
      if (req.query.game_id)  filter.game_id  = req.query.game_id;
      if (req.query.story_id) filter.story_id = req.query.story_id;
      const docs = await Model.find(filter).sort({ created_at: 1 });
      res.json({ data: docs, error: null });
    } catch (err) {
      res.status(500).json({ data: [], error: err.message });
    }
  });

  // POST create (Admin/Teacher only)
  router.post(path, verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json({ data: doc, error: null });
    } catch (err) {
      res.status(400).json({ data: null, error: err.message });
    }
  });

  // PUT update (Admin/Teacher only)
  router.put(`${path}/:id`, verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ data: null, error: 'Not found' });
      res.json({ data: doc, error: null });
    } catch (err) {
      res.status(400).json({ data: null, error: err.message });
    }
  });

  // DELETE remove (Admin/Teacher only)
  router.delete(`${path}/:id`, verifyToken, requireRole('admin', 'teacher'), async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ message: 'Deleted.', error: null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

registerCrud(router, '/games',   CognitiveSelGame);
registerCrud(router, '/stories', CognitiveStory);

module.exports = router;
