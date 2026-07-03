/**
 * models/Literacy.js
 * Replaces all Firestore literacy collections:
 *   stories, vocabulary_games, word_builder, picture_match,
 *   sound_match, object_recognition, fluency_passages,
 *   phonics_words, challenges, reading_activities
 */

const mongoose = require('mongoose');

// ── Stories ────────────────────────────────────────────────────────────────
const StorySchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    content:   { type: String },
    age_group: { type: String },
    level:     { type: String },
    image_url: { type: String },
    audio_url: { type: String },
    tags:      [String],
    is_active: { type: Boolean, default: true },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Vocabulary Games ───────────────────────────────────────────────────────
const VocabularyGameSchema = new mongoose.Schema(
  {
    word:        { type: String, required: true },
    definition:  { type: String },
    image_url:   { type: String },
    audio_url:   { type: String },
    age_group:   { type: String },
    difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Word Builder ───────────────────────────────────────────────────────────
const WordBuilderSchema = new mongoose.Schema(
  {
    word:      { type: String, required: true },
    letters:   [String],
    hint:      { type: String },
    image_url: { type: String },
    age_group: { type: String },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Picture Match ──────────────────────────────────────────────────────────
const PictureMatchSchema = new mongoose.Schema(
  {
    word:      { type: String, required: true },
    image_url: { type: String, required: true },
    options:   [String],
    age_group: { type: String },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Sound Match ────────────────────────────────────────────────────────────
const SoundMatchSchema = new mongoose.Schema(
  {
    word:      { type: String, required: true },
    audio_url: { type: String },
    options:   [String],
    age_group: { type: String },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Object Recognition ─────────────────────────────────────────────────────
const ObjectRecognitionSchema = new mongoose.Schema(
  {
    object_name: { type: String, required: true },
    image_url:   { type: String },
    options:     [String],
    age_group:   { type: String },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Fluency Passages ───────────────────────────────────────────────────────
const FluencyPassageSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    text:      { type: String, required: true },
    wpm_goal:  { type: Number },
    age_group: { type: String },
    level:     { type: String },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Phonics Words ──────────────────────────────────────────────────────────
const PhonicsWordSchema = new mongoose.Schema(
  {
    word:       { type: String, required: true },
    phoneme:    { type: String },
    audio_url:  { type: String },
    image_url:  { type: String },
    age_group:  { type: String },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Challenges ─────────────────────────────────────────────────────────────
const ChallengeSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String },
    type:        { type: String },
    difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    age_group:   { type: String },
    points:      { type: Number, default: 10 },
    is_active:   { type: Boolean, default: true },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Reading Activities ─────────────────────────────────────────────────────
const ReadingActivitySchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String },
    type:        { type: String },
    age_group:   { type: String },
    level:       { type: String },
    content:     { type: mongoose.Schema.Types.Mixed },
    is_active:   { type: Boolean, default: true },
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = {
  Story:             mongoose.model('Story',             StorySchema),
  VocabularyGame:    mongoose.model('VocabularyGame',    VocabularyGameSchema),
  WordBuilder:       mongoose.model('WordBuilder',       WordBuilderSchema),
  PictureMatch:      mongoose.model('PictureMatch',      PictureMatchSchema),
  SoundMatch:        mongoose.model('SoundMatch',        SoundMatchSchema),
  ObjectRecognition: mongoose.model('ObjectRecognition', ObjectRecognitionSchema),
  FluencyPassage:    mongoose.model('FluencyPassage',    FluencyPassageSchema),
  PhonicsWord:       mongoose.model('PhonicsWord',       PhonicsWordSchema),
  Challenge:         mongoose.model('Challenge',         ChallengeSchema),
  ReadingActivity:   mongoose.model('ReadingActivity',   ReadingActivitySchema),
};
