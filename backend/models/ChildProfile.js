/**
 * models/ChildProfile.js
 * Replaces Firestore child_profiles collection.
 */

const mongoose = require('mongoose');

const ChildProfileSchema = new mongoose.Schema(
  {
    parent_uid:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:        { type: String, required: true, trim: true },
    username:    { type: String, trim: true },
    age:         { type: Number },
    avatar:      { type: String, default: '🧒' },
    grade:       { type: String, default: '' },
    pin:         { type: String },  // 4-digit PIN for child login
    is_active:   { type: Boolean, default: true },
    xp:          { type: Number, default: 0 },
    stars:       { type: Number, default: 0 },
    coins:       { type: Number, default: 0 },
    dayStreak:   { type: Number, default: 0 },
    // ── FrontEnd-specific additions ──────────────────────────────────────────
    age_group:         { type: String, default: '4-6' },
    date_of_birth:     { type: Date },
    age_months:        { type: Number },
    milestone_level:   { type: Number },
    age_calculated_at: { type: Date },
    level:             { type: Number, default: 1 },
    badges:            [{ type: String }],
    assessmentSeenIds: [{ type: String }],
    
    // Assessment status
    assessmentCompleted: { type: Boolean, default: false },
    assessmentScore:     { type: Number, default: 0 },
    assessmentAgeGroup:  { type: String, default: '' },

    // Track module progress
    progress: {
      mathWorld:          { type: Number, default: 0 },
      puzzleWorld:        { type: Number, default: 0 },
      numberAdventure:    { type: Number, default: 0 },
      logicIsland:        { type: Number, default: 0 },
      readingWorld:       { type: Number, default: 0 },
      storyWorld:         { type: Number, default: 0 },
      vocabularyZone:     { type: Number, default: 0 },
      languageChallenges: { type: Number, default: 0 },
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('ChildProfile', ChildProfileSchema);
