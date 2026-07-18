const mongoose = require('mongoose');

const MilestoneAssessmentSchema = new mongoose.Schema(
  {
    childId:         { type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile', required: true },
    milestone_level: { type: Number, required: true },
    totalScore:      { type: Number, required: true },
    maxPossible:     { type: Number, required: true },
    domainScores:    { type: mongoose.Schema.Types.Mixed, default: {} },
    responses:       [{ type: mongoose.Schema.Types.Mixed }],
    completedAt:     { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('MilestoneAssessment', MilestoneAssessmentSchema);
