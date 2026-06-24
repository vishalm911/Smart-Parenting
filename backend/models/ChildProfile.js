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
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('ChildProfile', ChildProfileSchema);
