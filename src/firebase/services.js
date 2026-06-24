/**
 * src/firebase/services.js
 * Numeracy module service — Firebase replaced with axios calls.
 * All function signatures preserved.
 */
import client from '../api/client';
// import client from '../api/client';

// ── Math Games ──────────────────────────────────────────────────────────────
export const getMathGames = async (difficulty = null) => {
  try {
    const params = difficulty ? { difficulty } : {};
    const { data } = await client.get('/numeracy/math', { params });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

export const addMathGame = async (gameData) => {
  try {
    const { data } = await client.post('/numeracy/math', gameData);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const updateMathGame = async (id, updates) => {
  try {
    const { data } = await client.put(`/numeracy/math/${id}`, updates);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const deleteMathGame = async (id) => {
  try {
    await client.delete(`/numeracy/math/${id}`);
    return { error: null };
  } catch (e) {
    return { error: e.response?.data?.error || e.message };
  }
};

// ── Puzzle Games ────────────────────────────────────────────────────────────
export const getPuzzleGames = async (difficulty = null) => {
  try {
    const params = difficulty ? { difficulty } : {};
    const { data } = await client.get('/numeracy/puzzles', { params });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

export const addPuzzleGame = async (gameData) => {
  try {
    const { data } = await client.post('/numeracy/puzzles', gameData);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const updatePuzzleGame = async (id, updates) => {
  try {
    const { data } = await client.put(`/numeracy/puzzles/${id}`, updates);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const deletePuzzleGame = async (id) => {
  try {
    await client.delete(`/numeracy/puzzles/${id}`);
    return { error: null };
  } catch (e) {
    return { error: e.response?.data?.error || e.message };
  }
};

// ── Logic Games ─────────────────────────────────────────────────────────────
export const getLogicGames = async (difficulty = null) => {
  try {
    const params = difficulty ? { difficulty } : {};
    const { data } = await client.get('/numeracy/logic', { params });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

export const addLogicGame = async (gameData) => {
  try {
    const { data } = await client.post('/numeracy/logic', gameData);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const updateLogicGame = async (id, updates) => {
  try {
    const { data } = await client.put(`/numeracy/logic/${id}`, updates);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const deleteLogicGame = async (id) => {
  try {
    await client.delete(`/numeracy/logic/${id}`);
    return { error: null };
  } catch (e) {
    return { error: e.response?.data?.error || e.message };
  }
};

// ── Numeracy Scores ─────────────────────────────────────────────────────────
export const saveNumeracyScore = async (scoreData) => {
  try {
    const { data } = await client.post('/scores', { ...scoreData, activity_type: scoreData.activity_type || 'numeracy' });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const getNumeracyScores = async (childId) => {
  try {
    const { data } = await client.get('/scores', { params: { childId, activityType: 'numeracy' } });
    return { data: data.data, error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

// ── UserContext compatibility functions ────────────────────────────────────
// These replace the old Firebase Auth listener pattern

// onAuthChange — replaces Firebase onAuthStateChanged
// Calls callback once with current user from localStorage
export const onAuthChange = (callback) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  // Call async so components have time to mount
  setTimeout(() => callback(user), 0);
  // Return unsubscribe function
  return () => {};
};

// getUserProfile — fetch child or user profile
export const getUserProfile = async (uid) => {
  try {
    const { data } = await client.get(`/children/${uid}`);
    if (data?.data) return data.data;
  } catch {}
  try {
    const { data } = await client.get(`/users/${uid}`);
    return data?.data || null;
  } catch {
    return null;
  }
};

// loginAnonymous — no anonymous auth in JWT, return a guest user object
export const loginAnonymous = async () => {
  return { uid: 'guest', role: 'guest', displayName: 'Guest' };
};

// updateDayStreak — mark today active for a user
export const updateDayStreak = async (userId) => {
  try {
    const { data } = await client.post(`/literacy/streaks/${userId}/mark-today`);
    return data.count || 0;
  } catch {
    return 0;
  }
};

// startSession — create a new session
export const startSession = async (userId) => {
  try {
    const { data } = await client.post('/sessions');
    return data.sessionId;
  } catch {
    return null;
  }
};

// endSession — end a session
export const endSession = async (sessionId) => {
  if (!sessionId) return;
  try {
    await client.put(`/sessions/${sessionId}/end`);
  } catch {}
};

// checkAndUnlockAchievements — stub, returns empty unlocks
export const checkAndUnlockAchievements = async (userId, profile) => {
  return [];
};
