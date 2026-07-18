const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema(
  {
    child_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile', required: true },
    activity_id:    { type: String },
    activity_name:  { type: String },
    domain:         { type: String },
    reason:         { type: String },
    priority:       { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    completed:      { type: Boolean, default: false },
    generated_date: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Recommendation', RecommendationSchema);
