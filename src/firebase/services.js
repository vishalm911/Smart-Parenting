/**
 * Firebase Service Layer — SpacECE
 * ──────────────────────────────────
 * All Firestore CRUD + Auth operations for Ayush's Numeracy module.
 *
 * Collections owned by this module:
 *   ✅ math_games       — game content (read)
 *   ✅ puzzle_games      — game content (read)
 *   ✅ logic_games       — game content (read)
 *   ✅ numeracy_scores   — per-session score writes
 *   ✅ users             — profile, xp, stars, coins, dayStreak, progress
 *
 * Collections this module writes to (cross-module):
 *   ✅ achievements      — badge unlock events (write)
 *   ✅ progress_tracking — per-session module progress (write)
 *   ✅ streaks           — daily login streak (write)
 *   ✅ sessions          — login/logout time tracking (write)
 *   ✅ notifications     — sends alert to parent on milestone (write)
 *   🔍 rewards          — reads coin balance metadata (read)
 *   🔍 user_accounts    — reads role for admin check (read)
 *
 * Collections NOT touched by this module (other interns):
 *   ai_analysis, assessments, avatars, child_profiles, feature_flags,
 *   fluency_passages, language_scores, notification_templates, phonics_words,
 *   reading_activities, reading_progress, recommendations, reports,
 *   stories, vocabulary_games, admins
 */
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { db, auth } from './config';

// ─── Local Mock Profile Fallback (Offline / Restricted Environment Mode) ───
let mockProfile = {
  name: 'Ayush (Local Mode)',
  avatar: 'Alex',
  coins: 120,
  xp: 350,
  stars: 25,
  badges: 3,
  dayStreak: 5,
  level: 3,
  progress: {
    mathWorld: 40,
    puzzleWorld: 20,
    numberAdventure: 10,
    logicIsland: 5,
  }
};

const mockUnlockedIds = new Set(['first-game', 'streak-3']);

/* ══════════════════════════════════════════
   AUTH
══════════════════════════════════════════ */

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function loginEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function registerEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await initUserProfile(cred.user.uid, displayName);
  return cred.user;
}

export async function loginAnonymous() {
  const cred = await signInAnonymously(auth);
  await initUserProfile(cred.user.uid, 'Ayush');
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

/* ══════════════════════════════════════════
   USER PROFILE  →  collection: users
══════════════════════════════════════════ */

/**
 * Create a default user profile document if it doesn't exist.
 */
export async function initUserProfile(uid, name = 'Ayush') {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name,
      avatar: 'Alex',
      coins: 50,
      xp: 0,
      stars: 0,
      badges: 0,
      dayStreak: 0,
      level: 1,
      lastLogin: serverTimestamp(),
      progress: {
        mathWorld: 0,
        puzzleWorld: 0,
        numberAdventure: 0,
        logicIsland: 0,
      },
      createdAt: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, { lastLogin: serverTimestamp(), updated_at: serverTimestamp() });
  }
}

export async function getUserProfile(uid) {
  if (uid === 'mock-user-123') {
    return { id: uid, ...mockProfile };
  }
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  } catch (e) {
    console.error('getUserProfile:', e);
    return null;
  }
}

export async function updateUserProfile(uid, data) {
  if (uid === 'mock-user-123') {
    mockProfile = { ...mockProfile, ...data };
    return true;
  }
  try {
    await updateDoc(doc(db, 'users', uid), { ...data, updated_at: serverTimestamp() });
    return true;
  } catch (e) {
    console.error('updateUserProfile:', e);
    return false;
  }
}

/**
 * Award XP, stars, and coins after a game session.
 * Also writes to progress_tracking collection.
 */
export async function awardProgress(uid, { xp = 0, stars = 0, coins = 0, module = '' }) {
  if (uid === 'mock-user-123') {
    mockProfile.xp += xp;
    mockProfile.stars += stars;
    mockProfile.coins += coins;
    mockProfile.level = Math.floor(mockProfile.xp / 100) + 1;
    if (module) {
      if (!mockProfile.progress) mockProfile.progress = {};
      mockProfile.progress[module] = (mockProfile.progress[module] || 0) + xp;
    }
    return true;
  }
  try {
    const updates = {
      xp: increment(xp),
      stars: increment(stars),
      coins: increment(coins),
      updated_at: serverTimestamp(),
    };
    if (module) {
      updates[`progress.${module}`] = increment(xp);
    }
    await updateDoc(doc(db, 'users', uid), updates);

    // Also write to shared progress_tracking collection (Aditya reads this)
    if (module && xp > 0) {
      await addDoc(collection(db, 'progress_tracking'), {
        child_id: uid,
        module,
        xp_earned: xp,
        stars_earned: stars,
        coins_earned: coins,
        domain: 'numeracy',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }
    return true;
  } catch (e) {
    console.error('awardProgress:', e);
    return false;
  }
}

/* ══════════════════════════════════════════
   STREAKS  →  collection: streaks
   Updates daily login streak for child.
══════════════════════════════════════════ */

export async function updateDayStreak(uid) {
  if (uid === 'mock-user-123') {
    return mockProfile.dayStreak;
  }
  try {
    await initUserProfile(uid);
    const ref = doc(db, 'streaks', uid);
    const snap = await getDoc(ref);
    const today = new Date().toDateString();

    if (!snap.exists()) {
      await setDoc(ref, {
        child_id: uid,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', uid), { dayStreak: 1 });
      return 1;
    }

    const data = snap.data();
    if (data.last_active_date === today) return data.current_streak; // already updated today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = data.last_active_date === yesterday.toDateString();
    const newStreak = isConsecutive ? data.current_streak + 1 : 1;
    const longest   = Math.max(newStreak, data.longest_streak || 1);

    await updateDoc(ref, {
      current_streak: newStreak,
      longest_streak: longest,
      last_active_date: today,
      updated_at: serverTimestamp(),
    });
    await updateDoc(doc(db, 'users', uid), { dayStreak: newStreak, updated_at: serverTimestamp() });
    return newStreak;
  } catch (e) {
    console.error('updateDayStreak:', e);
    return 0;
  }
}

/* ══════════════════════════════════════════
   SESSIONS  →  collection: sessions
   Tracks login/logout time per child.
══════════════════════════════════════════ */

export async function startSession(uid) {
  if (uid === 'mock-user-123') {
    return 'mock-session-123';
  }
  try {
    const ref = await addDoc(collection(db, 'sessions'), {
      uid,
      login_time: serverTimestamp(),
      logout_time: null,
      device_info: navigator.userAgent,
      created_at: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.error('startSession:', e);
    return null;
  }
}

export async function endSession(sessionId) {
  if (!sessionId || sessionId === 'mock-session-123') return;
  try {
    await updateDoc(doc(db, 'sessions', sessionId), {
      logout_time: serverTimestamp(),
    });
  } catch (e) {
    console.error('endSession:', e);
  }
}

/* ══════════════════════════════════════════
   ACHIEVEMENTS  →  collection: achievements
   Called when a badge milestone is reached.
══════════════════════════════════════════ */

const ACHIEVEMENT_MILESTONES = [
  { id: 'first-game',    label: 'First Game!',      emoji: '🎮', condition: (profile) => profile.xp >= 1 },
  { id: 'streak-3',      label: '3-Day Streak',     emoji: '🔥', condition: (profile) => profile.dayStreak >= 3 },
  { id: 'streak-7',      label: 'Week Warrior',     emoji: '⚡', condition: (profile) => profile.dayStreak >= 7 },
  { id: 'xp-100',        label: 'XP Hunter',        emoji: '💫', condition: (profile) => profile.xp >= 100 },
  { id: 'xp-500',        label: 'Math Master',      emoji: '🏆', condition: (profile) => profile.xp >= 500 },
  { id: 'stars-10',      label: 'Star Collector',   emoji: '⭐', condition: (profile) => profile.stars >= 10 },
  { id: 'coins-100',     label: 'Coin Champion',    emoji: '🪙', condition: (profile) => profile.coins >= 100 },
  { id: 'numeracy-pro',  label: 'Numeracy Pro',     emoji: '🔢', condition: (profile) => profile.progress?.mathWorld >= 200 },
];

/**
 * Check all achievement milestones and write new unlocks to achievements collection.
 * Also increments users.badges and sends a notification to the parent.
 */
export async function checkAndUnlockAchievements(uid, profile) {
  if (!uid || !profile) return [];
  if (uid === 'mock-user-123') {
    const newUnlocks = [];
    for (const milestone of ACHIEVEMENT_MILESTONES) {
      if (!mockUnlockedIds.has(milestone.id) && milestone.condition(profile)) {
        mockUnlockedIds.add(milestone.id);
        mockProfile.badges += 1;
        newUnlocks.push(milestone);
      }
    }
    return newUnlocks;
  }
  try {
    // Fetch already-unlocked achievements
    const existing = await getDocs(query(collection(db, 'achievements'), where('child_id', '==', uid)));
    const unlockedIds = new Set(existing.docs.map(d => d.data().achievement_id));

    const newUnlocks = [];
    for (const milestone of ACHIEVEMENT_MILESTONES) {
      if (!unlockedIds.has(milestone.id) && milestone.condition(profile)) {
        // Write to achievements collection
        await addDoc(collection(db, 'achievements'), {
          child_id: uid,
          achievement_id: milestone.id,
          label: milestone.label,
          emoji: milestone.emoji,
          domain: 'numeracy',
          unlocked_at: serverTimestamp(),
          created_at: serverTimestamp(),
        });
        // Increment badge count on user profile
        await updateDoc(doc(db, 'users', uid), {
          badges: increment(1),
          updated_at: serverTimestamp(),
        });
        // Send parent notification
        await addDoc(collection(db, 'notifications'), {
          child_id: uid,
          parent_id: null,          // parent links handled by Gyanendra's auth module
          message: `🎉 ${profile.name || 'Your child'} just unlocked "${milestone.label}" ${milestone.emoji}`,
          type: 'achievement',
          read_status: false,
          created_at: serverTimestamp(),
        });
        newUnlocks.push(milestone);
      }
    }
    return newUnlocks;
  } catch (e) {
    console.error('checkAndUnlockAchievements:', e);
    return [];
  }
}

/* ══════════════════════════════════════════
   GAME COLLECTIONS
   math_games / puzzle_games / logic_games
══════════════════════════════════════════ */

export async function getMathGames(ageGroup) {
  if (!auth.currentUser) {
    return [];
  }
  try {
    const ref = collection(db, 'math_games');
    const q = ageGroup ? query(ref, where('age_group', '==', ageGroup)) : query(ref);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getMathGames:', e);
    return [];
  }
}

export async function getPuzzleGames(ageGroup) {
  if (!auth.currentUser) {
    return [];
  }
  try {
    const ref = collection(db, 'puzzle_games');
    const q = ageGroup ? query(ref, where('age_group', '==', ageGroup)) : query(ref);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getPuzzleGames:', e);
    return [];
  }
}

export async function getLogicGames(ageGroup) {
  if (!auth.currentUser) {
    return [];
  }
  try {
    const ref = collection(db, 'logic_games');
    const q = ageGroup ? query(ref, where('age_group', '==', ageGroup)) : query(ref);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getLogicGames:', e);
    return [];
  }
}

export async function getGameById(collectionName, gameId) {
  try {
    const snap = await getDoc(doc(db, collectionName, gameId));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  } catch (e) {
    console.error('getGameById:', e);
    return null;
  }
}

/* ══════════════════════════════════════════
   SCORES  →  collection: numeracy_scores
══════════════════════════════════════════ */

export async function saveNumeracyScore(scoreData) {
  if (!auth.currentUser || scoreData.child_id === 'mock-user-123') {
    return { success: true, id: 'mock-score-' + Date.now() };
  }
  try {
    const ref = collection(db, 'numeracy_scores');
    const docRef = await addDoc(ref, {
      ...scoreData,
      date: serverTimestamp(),
      created_at: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error('saveNumeracyScore:', e);
    return { success: false, error: e };
  }
}

export async function getChildScores(childId, limitCount = 20) {
  if (!auth.currentUser || childId === 'mock-user-123') {
    return [
      { id: 'mock-score-1', game_id: 'counting-1-3', score: 45, level: 2, date: new Date().toISOString() },
      { id: 'mock-score-2', game_id: 'number-match', score: 60, level: 3, date: new Date().toISOString() }
    ];
  }
  try {
    const ref = collection(db, 'numeracy_scores');
    const q = query(
      ref,
      where('child_id', '==', childId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getChildScores:', e);
    return [];
  }
}

/* ══════════════════════════════════════════
   REWARDS  →  collection: rewards  (READ ONLY)
   Pratiush owns this — we only read metadata.
══════════════════════════════════════════ */

export async function getRewardsCatalog() {
  if (!auth.currentUser) {
    return [
      { id: 'toy-car', title: 'Toy Car', cost: 50, emoji: '🚗' },
      { id: 'super-star', title: 'Super Star Badge', cost: 100, emoji: '⭐' },
      { id: 'rocket-sticker', title: 'Rocket Sticker', cost: 150, emoji: '🚀' }
    ];
  }
  try {
    const snap = await getDocs(collection(db, 'rewards'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getRewardsCatalog:', e);
    return [];
  }
}

/* ══════════════════════════════════════════
   USER ACCOUNTS  →  collection: user_accounts
   Gyanendra owns this — we only read role.
══════════════════════════════════════════ */

export async function getUserRole(uid) {
  if (uid === 'mock-user-123' || !auth.currentUser) {
    return 'child';
  }
  try {
    const snap = await getDoc(doc(db, 'user_accounts', uid));
    if (snap.exists()) return snap.data().role || 'child';
    return 'child';
  } catch {
    return 'child';
  }
}

/* ══════════════════════════════════════════
   ACHIEVEMENT GETTER
   Used to render achievements dynamically.
══════════════════════════════════════════ */
export async function getUnlockedAchievements(uid) {
  if (!uid || uid === 'mock-user-123') {
    return ['first-game', 'streak-3'];
  }
  try {
    const q = query(collection(db, 'achievements'), where('child_id', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().achievement_id);
  } catch (e) {
    console.error('getUnlockedAchievements error:', e);
    return [];
  }
}
