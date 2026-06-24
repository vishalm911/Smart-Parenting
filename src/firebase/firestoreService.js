/**
 * src/firebase/firestoreService.js
 *
 * Drop-in replacement for the Firebase Firestore general service.
 * Covers: user_accounts, activity_scores, sessions.
 *
 * Firebase method                 →  This service method
 * ────────────────────────────────────────────────────────
 * getUserAccount(uid)             →  getUserAccount(uid)
 * updateUserAccount(uid, data)    →  updateUserAccount(uid, data)
 * createSession(uid)              →  createSession(uid)
 * endSession(sessionId)           →  endSession(sessionId)
 * saveActivityScore(data)         →  saveActivityScore(data)
 * getActivityScores(childId)      →  getActivityScores(childId)
 * getLeaderboard()                →  getLeaderboard()
 * getChildSummary(childId)        →  getChildSummary(childId)
 */

import client from '../api/client';

// ── Users ──────────────────────────────────────────────────────────────────
export const getUserAccount = async (uid) => {
  try {
    const { data } = await client.get(`/users/${uid}`);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const updateUserAccount = async (uid, updates) => {
  try {
    const { data } = await client.put(`/users/${uid}`, updates);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const getAllUsers = async (filters = {}) => {
  try {
    const { data } = await client.get('/users', { params: filters });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

export const deactivateUser = async (uid) => {
  try {
    await client.delete(`/users/${uid}`);
    return { error: null };
  } catch (e) {
    return { error: e.response?.data?.error || e.message };
  }
};

// ── Sessions ───────────────────────────────────────────────────────────────
export const createSession = async () => {
  try {
    const { data } = await client.post('/sessions');
    return { sessionId: data.sessionId, error: null };
  } catch (e) {
    return { sessionId: null, error: e.response?.data?.error || e.message };
  }
};

export const endSession = async (sessionId) => {
  try {
    await client.put(`/sessions/${sessionId}/end`);
    return { error: null };
  } catch (e) {
    return { error: e.response?.data?.error || e.message };
  }
};

// ── Activity Scores ────────────────────────────────────────────────────────
export const saveActivityScore = async (scoreData) => {
  try {
    const { data } = await client.post('/scores', scoreData);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const getActivityScores = async (childId, activityType = null) => {
  try {
    const params = { childId };
    if (activityType) params.activityType = activityType;
    const { data } = await client.get('/scores', { params });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

export const getLeaderboard = async () => {
  try {
    const { data } = await client.get('/scores/leaderboard');
    return { data: data.data, error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

export const getChildSummary = async (childId) => {
  try {
    const { data } = await client.get(`/scores/summary/${childId}`);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: {}, error: e.response?.data?.error || e.message };
  }
};

// ── Extra functions used by pages (aliases & additions) ────────────────────

// createUserAccount — called by login pages after first sign-in
// In JWT flow, user is already created on register. This is a no-op / update.
export const createUserAccount = async (uid, data) => {
  try {
    const result = await client.put(`/users/${uid}`, data);
    return { data: result.data?.data, error: null };
  } catch (e) {
    // If user doesn't exist yet, silently ignore (JWT register already created them)
    return { data: null, error: null };
  }
};

// activateUser — re-enable a deactivated user
export const activateUser = async (uid) => {
  try {
    const { data } = await client.put(`/users/${uid}`, { is_active: true });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

// changeUserRole — update a user's role (admin only)
export const changeUserRole = async (uid, role) => {
  try {
    const { data } = await client.put(`/users/${uid}`, { role });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

// getActiveSessions — sessions that are currently active
export const getActiveSessions = async () => {
  try {
    const { data } = await client.get('/sessions');
    const active = (data.data || []).filter(s => s.is_active);
    return { data: active, error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

// getUserSessions — all sessions for a specific user
export const getUserSessions = async (userId) => {
  try {
    const { data } = await client.get('/sessions', { params: { userId } });
    return { data: data.data || [], error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

// Notifications — stored in MongoDB via scores/activity endpoint for now
// These are stub implementations that won't crash the app
export const getNotifications = async (userId) => {
  return { data: [], error: null };
};

export const getParentNotifications = async (userId) => {
  return { data: [], error: null };
};

export const markNotificationAsRead = async (notifId) => {
  return { error: null };
};

export const getUnreadCount = async (userId) => {
  return { count: 0, error: null };
};

export const subscribeToNotifications = (userId, callback) => {
  callback([]);
  return () => {}; // unsubscribe noop
};

export const getNotificationTemplates = async () => {
  return { data: [], error: null };
};

export const saveNotificationTemplate = async (data) => {
  return { data, error: null };
};

export const deleteNotificationTemplate = async (id) => {
  return { error: null };
};

export const toggleNotificationTemplate = async (id, enabled) => {
  return { error: null };
};

// Feature flags — simple localStorage based (no backend needed)
export const subscribeToFeatureFlags = (callback) => {
  const flags = JSON.parse(localStorage.getItem('featureFlags') || '{}');
  callback(flags);
  return () => {};
};

export const saveFeatureFlags = async (flags) => {
  localStorage.setItem('featureFlags', JSON.stringify(flags));
  return { error: null };
};
