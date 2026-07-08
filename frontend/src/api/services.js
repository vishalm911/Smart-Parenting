import client from '../api/client';

// ── Math Games ──────────────────────────────────────────────────────────────
export const getMathGames = async (difficulty = null) => {
  try {
    const params = difficulty ? { difficulty } : {};
    const { data } = await client.get('/numeracy/math', { params });
    return data.data || [];
  } catch (e) {
    console.error(e);
    return [];
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
    return data.data || [];
  } catch (e) {
    console.error(e);
    return [];
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
    return data.data || [];
  } catch (e) {
    console.error(e);
    return [];
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

// ── Auth & Session ──────────────────────────────────────────────────────────
export const onAuthChange = (callback) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  setTimeout(() => callback(user), 0);
  return () => {};
};

export const getUserProfile = async (uid) => {
  // Only try users endpoint — children are fetched separately
  try {
    const { data } = await client.get(`/users/${uid}`);
    return data?.data || null;
  } catch {
    return null;
  }
};

export const loginAnonymous = async () => {
  return { uid: 'guest', role: 'guest', displayName: 'Guest' };
};

export const updateDayStreak = async (userId) => {
  try {
    const { data } = await client.post(`/literacy/streaks/${userId}/mark-today`);
    return data.count || 0;
  } catch {
    return 0;
  }
};

export const startSession = async () => {
  try {
    const { data } = await client.post('/sessions');
    return data.sessionId;
  } catch {
    return null;
  }
};

export const endSession = async (sessionId) => {
  if (!sessionId) return;
  try {
    await client.put(`/sessions/${sessionId}/end`);
  } catch (err) {
    console.warn('Failed to end session:', err.message);
  }
};

export const checkAndUnlockAchievements = async () => {
  return [];
};

// ── Child profile & user updates ────────────────────────────────────────────
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data } = await client.put(`/children/${userId}`, updates);
    if (data?.data) return { data: data.data, error: null };
  } catch (err) {
    console.warn('Update child profile endpoint failed, attempting user update:', err.message);
  }
  try {
    const { data } = await client.put(`/users/${userId}`, updates);
    return { data: data.data, error: null };
  } catch (e) {
    return { data: null, error: e.response?.data?.error || e.message };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const awardProgress = async (userId, { xp = 0, stars = 0, coins = 0, module = null } = {}) => {
  try {
    const payload = { xp, stars, coins };
    if (module) payload.module = module;
    await client.put(`/children/${userId}`, payload);
    return { error: null };
  } catch (err) {
    return { error: err.response?.data?.error || err.message };
  }
};

export const getUnlockedAchievements = async (userId) => {
  try {
    const { data } = await client.get('/scores', { params: { childId: userId } });
    const scores = data.data || [];
    const achievements = [];
    if (scores.length >= 1)  achievements.push({ id: 'first_game', title: 'First Game!',   icon: '🎮', unlocked: true });
    if (scores.length >= 5)  achievements.push({ id: 'five_games', title: 'Playing Strong', icon: '⭐', unlocked: true });
    if (scores.length >= 10) achievements.push({ id: 'ten_games',  title: 'Game Master',    icon: '🏆', unlocked: true });
    const total = scores.reduce((s, a) => s + (a.score || 0), 0);
    if (total >= 100) achievements.push({ id: 'score_100', title: 'Century!',     icon: '💯', unlocked: true });
    if (total >= 500) achievements.push({ id: 'score_500', title: 'High Scorer',  icon: '🚀', unlocked: true });
    return { data: achievements, error: null };
  } catch {
    return { data: [], error: null };
  }
};

// ── Milestone Assessment & Seen Question APIs ──────────────────────────────

export const saveMilestoneAssessmentResult = async (resultData) => {
  try {
    const { data } = await client.post('/milestones/assessments', resultData);
    return { success: true, data: data.data, error: null };
  } catch (e) {
    console.error('saveMilestoneAssessmentResult:', e);
    return { success: false, error: e.response?.data?.error || e.message };
  }
};

export const saveAssessmentSeenIds = async (uid, seenIds = []) => {
  if (!uid || uid === 'mock-user-123') return { error: null };
  try {
    await client.put(`/children/${uid}`, { assessmentSeenIds: seenIds });
    return { error: null };
  } catch (e) {
    console.warn('saveAssessmentSeenIds skipped:', e.response?.status || e.message);
    return { error: null };
  }
};

export const getAssessmentSeenIds = async (uid) => {
  if (!uid || uid === 'mock-user-123') return [];
  try {
    const { data } = await client.get(`/children/${uid}`);
    return data.data?.assessmentSeenIds || [];
  } catch (e) {
    console.warn('getAssessmentSeenIds skipped:', e.response?.status || e.message);
    return [];
  }
};

export const getMilestoneAssessments = async (childId) => {
  try {
    const { data } = await client.get('/milestones/assessments', { params: { childId } });
    return { data: data.data || [], error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

export const getAllMilestoneAssessments = async () => {
  try {
    const { data } = await client.get('/milestones/assessments');
    return { data: data.data || [], error: null };
  } catch (e) {
    return { data: [], error: e.response?.data?.error || e.message };
  }
};

export const deleteMilestoneAssessment = async (id) => {
  try {
    await client.delete(`/milestones/assessments/${id}`);
    return { error: null };
  } catch (e) {
    return { error: e.response?.data?.error || e.message };
  }
};