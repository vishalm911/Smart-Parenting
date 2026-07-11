/**
 * utils/notify.js
 * Small helper for creating Notification documents from other routes
 * (activity completion, module progress, admin actions, etc).
 * Failures here must never break the caller's main request, so every
 * call is wrapped in try/catch and errors are only logged.
 */
const Notification = require('../models/Notification');

async function createNotification({ title, message, type = 'system', child_id = null, parent_id = null }) {
  try {
    if (!title || !message) return null;
    const notif = new Notification({
      title,
      message,
      type,
      child_id: child_id ? String(child_id) : null,
      parent_id: parent_id ? String(parent_id) : null,
    });
    await notif.save();
    return notif;
  } catch (err) {
    console.error('createNotification failed:', err.message);
    return null;
  }
}

module.exports = { createNotification };