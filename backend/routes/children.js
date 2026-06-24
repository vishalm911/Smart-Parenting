/**
 * routes/children.js
 * Replaces Firestore child_profiles collection (childProfileService.js)
 *
 * GET    /api/children?parentUid=<id>   — all profiles for a parent
 * GET    /api/children/:id              — single profile
 * POST   /api/children                 — create profile (max 4 per parent)
 * PUT    /api/children/:id             — update profile
 * DELETE /api/children/:id             — delete profile
 */

const router       = require('express').Router();
const ChildProfile = require('../models/ChildProfile');
const User         = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const MAX_PROFILES = 4;

// GET all children for a parent
router.get('/', verifyToken, async (req, res) => {
  try {
    const parentUid = req.query.parentUid || req.user.userId;
    const profiles  = await ChildProfile.find({ parent_uid: parentUid });
    res.json({ data: profiles, error: null });
  } catch (err) {
    res.status(500).json({ data: [], error: err.message });
  }
});

// GET single child profile
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const profile = await ChildProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ data: null, error: 'Child profile not found.' });
    res.json({ data: profile, error: null });
  } catch (err) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST create child profile
router.post('/', verifyToken, async (req, res) => {
  try {
    const parentUid = req.body.parent_uid || req.user.userId;

    // Enforce max 4 profiles per parent
    const count = await ChildProfile.countDocuments({ parent_uid: parentUid });
    if (count >= MAX_PROFILES) {
      return res.status(400).json({
        data: null,
        error: `Maximum of ${MAX_PROFILES} child profiles allowed per parent.`,
      });
    }

    const profile = await ChildProfile.create({ ...req.body, parent_uid: parentUid });

    // Also link on parent's User document
    await User.findByIdAndUpdate(parentUid, { $push: { linked_child_profiles: profile._id } });

    res.status(201).json({ data: profile, error: null });
  } catch (err) {
    res.status(400).json({ data: null, error: err.message });
  }
});

// PUT update child profile
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const profile = await ChildProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!profile) return res.status(404).json({ data: null, error: 'Child profile not found.' });
    res.json({ data: profile, error: null });
  } catch (err) {
    res.status(400).json({ data: null, error: err.message });
  }
});

// DELETE child profile
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const profile = await ChildProfile.findByIdAndDelete(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Child profile not found.' });

    // Unlink from parent
    await User.findByIdAndUpdate(profile.parent_uid, {
      $pull: { linked_child_profiles: profile._id },
    });

    res.json({ message: 'Profile deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
