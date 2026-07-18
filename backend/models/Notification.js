/**
 * models/Notification.js
 * Represents actual notifications delivered to children or parents.
 */
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    message:     { type: String, required: true },
    type:        { type: String, enum: ['achievement', 'reward', 'reminder', 'system'], default: 'system' },
    read_status: { type: Boolean, default: false },
    child_id:    { type: String, default: null }, // can store child's ID or ObjectId
    parent_id:   { type: String, default: null }, // can store parent's ID or ObjectId
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Notification', NotificationSchema);
