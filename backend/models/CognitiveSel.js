const mongoose = require('mongoose');

// ── Cognitive & SEL Games Config Schema ──────────────────────────────────────
const CognitiveSelGameSchema = new mongoose.Schema(
  {
    universe:    { type: String, required: true, enum: ['brain', 'creativity', 'emotion'] },
    game_id:     { type: String, required: true, unique: true },
    title:       { type: String, required: true },
    description: { type: String },
    emoji:       { type: String },
    color:       { type: String },
    config:      { type: mongoose.Schema.Types.Mixed }, // flexible config (emojis, palettes, scenarios)
    is_active:   { type: Boolean, default: true }
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// ── Branching Choice Story Schema ───────────────────────────────────────────
const CognitiveStorySchema = new mongoose.Schema(
  {
    story_id:    { type: String, required: true, unique: true },
    title:       { type: String, required: true },
    emoji:       { type: String },
    color:       { type: String },
    nodes:       { type: mongoose.Schema.Types.Mixed }, // branching structure object
    is_active:   { type: Boolean, default: true }
  },
  { strict: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = {
  CognitiveSelGame: mongoose.model('CognitiveSelGame', CognitiveSelGameSchema),
  CognitiveStory:   mongoose.model('CognitiveStory',   CognitiveStorySchema)
};
