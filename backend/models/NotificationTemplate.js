/**
 * models/NotificationTemplate.js
 * Represents notification templates managed by the admin.
 */
const mongoose = require('mongoose');

const NotificationTemplateSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true },
    message: { type: String, required: true },
    type:    { type: String, enum: ['achievement', 'reward', 'reminder', 'system'], default: 'system' },
    active:  { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('NotificationTemplate', NotificationTemplateSchema);
