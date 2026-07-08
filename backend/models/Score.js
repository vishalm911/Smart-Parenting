/**
 * models/Score.js  — activity_scores + language_scores collections
 * models/Streak.js — streaks collection
 * models/Session.js — sessions collection
 * models/Numeracy.js — math_games, puzzle_games, logic_games, numeracy_scores
 *
 * All exported from this single file for convenience.
 */

const mongoose = require('mongoose');

// ── Activity Score ─────────────────────────────────────────────────────────
const ActivityScoreSchema = new mongoose.Schema(
  {
    child_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile', required: true },
    activity_id:   { type: String },
    activity_type: {
      type: String,
      enum: ['story', 'picture_match', 'word_builder', 'flashcard',
             'sound_match', 'phonics', 'fluency', 'numeracy', 'logic', 'puzzle', 'literacy'],
    },
    score:         { type: Number, default: 0 },
    accuracy:      { type: Number, default: 0 },   // percentage 0-100
    time_spent:    { type: Number, default: 0 },   // seconds
    attempts:      { type: Number, default: 1 },
    username:      { type: String },
    display_name:  { type: String },
    date:          { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Streak ─────────────────────────────────────────────────────────────────
const StreakSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    dates:   [String],   // ISO date strings "YYYY-MM-DD"
    count:   { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Session ────────────────────────────────────────────────────────────────
const SessionSchema = new mongoose.Schema(
  {
    user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    started_at: { type: Date, default: Date.now },
    ended_at:   { type: Date },
    is_active:  { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Numeracy: Math Games ───────────────────────────────────────────────────
const MathGameSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    type:        { type: String },
    difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    questions:   [mongoose.Schema.Types.Mixed],
    age_group:   { type: String },
    is_active:   { type: Boolean, default: true },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Numeracy: Puzzle Games ─────────────────────────────────────────────────
const PuzzleGameSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true },
    type:       { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    data:       { type: mongoose.Schema.Types.Mixed },
    age_group:  { type: String },
    is_active:  { type: Boolean, default: true },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Numeracy: Logic Games ──────────────────────────────────────────────────
const LogicGameSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true },
    type:       { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    data:       { type: mongoose.Schema.Types.Mixed },
    age_group:  { type: String },
    is_active:  { type: Boolean, default: true },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = {
  ActivityScore: mongoose.model('ActivityScore', ActivityScoreSchema),
  Streak:        mongoose.model('Streak',        StreakSchema),
  Session:       mongoose.model('Session',        SessionSchema),
  MathGame:      mongoose.model('MathGame',       MathGameSchema),
  PuzzleGame:    mongoose.model('PuzzleGame',     PuzzleGameSchema),
  LogicGame:     mongoose.model('LogicGame',      LogicGameSchema),
};
