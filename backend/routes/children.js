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
const { createNotification } = require('../utils/notify');

const MAX_PROFILES = 4;

// GET all children
router.get('/', verifyToken, async (req, res) => {
  try {
    const parentUid = req.query.parentUid;
    const query = {};
    if (parentUid) {
      query.parent_uid = parentUid;
    } else if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      query.parent_uid = req.user.userId;
    }
    const profiles  = await ChildProfile.find(query);
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
    const update = { ...req.body };
    const inc = {};
    
    // Separate xp, stars, coins to increment instead of overwriting
    if (typeof update.xp === 'number') {
      inc.xp = update.xp;
      delete update.xp;
    }
    if (typeof update.stars === 'number') {
      inc.stars = update.stars;
      delete update.stars;
    }
    if (typeof update.coins === 'number') {
      inc.coins = update.coins;
      delete update.coins;
    }

    // Handle module progress increment
    const moduleIncrements = {
      mathWorld: 40,
      puzzleWorld: 40,
      readingWorld: 40,
      vocabularyZone: 40,
      numberAdventure: 50,
      logicIsland: 50,
      storyWorld: 50,
      languageChallenges: 50
    };
    if (update.module && moduleIncrements[update.module]) {
      inc[`progress.${update.module}`] = moduleIncrements[update.module];
    }
    delete update.module;

    const query = {};
    if (Object.keys(update).length > 0) {
      query.$set = update;
    }
    if (Object.keys(inc).length > 0) {
      query.$inc = inc;
    }

    const profile = await ChildProfile.findByIdAndUpdate(req.params.id, query, {
      new: true, runValidators: true,
    });
    if (!profile) return res.status(404).json({ data: null, error: 'Child profile not found.' });
    res.json({ data: profile, error: null });

    // Fire-and-forget: notify the parent about coins earned or a module milestone.
    if (inc.coins) {
      createNotification({
        title: 'Coins earned! 🪙',
        message: `${profile.name} just earned ${inc.coins} coins — now has ${profile.coins} total.`,
        type: 'reward',
        child_id: profile._id,
        parent_id: profile.parent_uid,
      });
    }
    const moduleKey = Object.keys(inc).find((k) => k.startsWith('progress.'));
    if (moduleKey) {
      const moduleName = moduleKey.split('.')[1];
      createNotification({
        title: 'Progress update! 📈',
        message: `${profile.name} made progress in ${moduleName.replace(/([A-Z])/g, ' $1').trim()}.`,
        type: 'achievement',
        child_id: profile._id,
        parent_id: profile.parent_uid,
      });
    }
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