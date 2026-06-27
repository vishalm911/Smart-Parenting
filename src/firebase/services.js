/**
 * Firebase Service Layer — SpacECE
 * ──────────────────────────────────
 * All Firestore CRUD + Auth operations for Numeracy module.
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
  arrayUnion,
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
  name: 'Guest (Local Mode)',
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
  await initUserProfile(cred.user.uid, 'Guest');
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

/* ══════════════════════════════════════════
   USER PROFILE  →  collection: users
══════════════════════════════════════════ */

function getUserCollection() {
  const role = localStorage.getItem('spaceece_role');
  const childId = localStorage.getItem('spaceece_child_id');
  if (role === 'child' || childId) {
    return 'child_profiles';
  }
  return 'user_accounts';
}

/**
 * Create a default user profile document if it doesn't exist.
 */
export async function initUserProfile(uid, name = 'Guest') {
  const collName = getUserCollection();
  const ref = doc(db, collName, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    if (collName === 'child_profiles') {
      await setDoc(ref, {
        name,
        avatar: 'Alex',
        coin_count: 50,
        xp: 0,
        stars: 0,
        badges: [],
        dayStreak: 0,
        level: 1,
        progress: {
          mathWorld: 0,
          puzzleWorld: 0,
          numberAdventure: 0,
          logicIsland: 0,
        },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    } else {
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
    }
  } else {
    if (collName === 'child_profiles') {
      await updateDoc(ref, { updated_at: serverTimestamp() });
    } else {
      await updateDoc(ref, { lastLogin: serverTimestamp(), updated_at: serverTimestamp() });
    }
  }
}

export async function getUserProfile(uid) {
  if (uid === 'mock-user-123') {
    return { id: uid, ...mockProfile };
  }
  try {
    const collName = getUserCollection();
    const snap = await getDoc(doc(db, collName, uid));
    if (snap.exists()) {
      const data = snap.data();
      if (collName === 'child_profiles') {
        const localLang = typeof window !== 'undefined' ? localStorage.getItem('spaceece_language') || 'English' : 'English';
        return {
          id: snap.id,
          name: data.name || 'Child',
          avatar: data.avatar || 'Alex',
          coins: data.coin_count ?? 50,
          xp: data.xp ?? 0,
          stars: data.stars ?? 0,
          dayStreak: data.dayStreak ?? 0,
          badges: Array.isArray(data.badges) ? data.badges.length : (data.badges ?? 0),
          level: data.level ?? 1,
          language: data.language || localLang,
          progress: data.progress || {
            mathWorld: 0,
            puzzleWorld: 0,
            numberAdventure: 0,
            logicIsland: 0,
          },
          ...data
        };
      }
      const localLang = typeof window !== 'undefined' ? localStorage.getItem('spaceece_language') || 'English' : 'English';
      return { id: snap.id, language: localLang, ...data };
    }
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
    const collName = getUserCollection();
    await updateDoc(doc(db, collName, uid), { ...data, updated_at: serverTimestamp() });
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
    const collName = getUserCollection();
    const updates = {
      xp: increment(xp),
      stars: increment(stars),
      coins: increment(coins),
      updated_at: serverTimestamp(),
    };
    if (collName === 'child_profiles') {
      updates.coin_count = increment(coins);
    }
    if (module) {
      updates[`progress.${module}`] = increment(xp);
    }
    await updateDoc(doc(db, collName, uid), updates);

    // Also write to shared progress_tracking collection (for parent analytics tracking)
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
      await updateDoc(doc(db, getUserCollection(), uid), { dayStreak: 1 });
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
    await updateDoc(doc(db, getUserCollection(), uid), { dayStreak: newStreak, updated_at: serverTimestamp() });
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
        const collName = getUserCollection();
        if (collName === 'child_profiles') {
          await updateDoc(doc(db, 'child_profiles', uid), {
            badges: arrayUnion(milestone.id),
            updated_at: serverTimestamp(),
          });
        } else {
          await updateDoc(doc(db, 'user_accounts', uid), {
            badges: increment(1),
            updated_at: serverTimestamp(),
          });
        }
        // Send parent notification
        await addDoc(collection(db, 'notifications'), {
          child_id: uid,
          parent_id: null,          // parent links handled by the auth module
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

/* ══════════════════════════════════════════
/* ══════════════════════════════════════════
   MILESTONE ASSESSMENTS  →  collection: milestone_assessments
   Writes ONE document per completed assessment session.
   Per-question data is stored in the `responses` array inside that document.
══════════════════════════════════════════ */

/**
 * Saves the full result of one milestone assessment session as a single
 * Firestore document. Called once in AssessmentModule.handleFinish.
 *
 * Document shape:
 *   childId         — child's Firestore profile ID
 *   milestone_level — level 1–6 derived from date_of_birth
 *   totalScore      — weighted percentage (0–100)
 *   maxPossible     — TOTAL_QUESTIONS × 2
 *   domainScores    — { [domain]: { earned, maxPossible, percentage } }
 *   responses[]     — [{ questionId, selectedAnswer, score }, ...]
 *   completedAt     — server timestamp
 *   created_at      — server timestamp
 *
 * @param {{ childId: string, milestone_level: number, totalScore: number,
 *           maxPossible: number,
 *           domainScores: Record<string,{earned:number,maxPossible:number,percentage:number}>,
 *           responses: Array<{questionId, selectedAnswer, score}> }} resultData
 */
export async function saveMilestoneAssessmentResult(resultData) {
  try {
    const ref = collection(db, 'milestone_assessments');
    await addDoc(ref, {
      childId:         resultData.childId,
      milestone_level: resultData.milestone_level,
      totalScore:      resultData.totalScore,
      maxPossible:     resultData.maxPossible,
      domainScores:    resultData.domainScores,
      responses:       resultData.responses,
      completedAt:     serverTimestamp(),
      created_at:      serverTimestamp(),
    });
    return { success: true };
  } catch (e) {
    console.error('saveMilestoneAssessmentResult:', e);
    return { success: false, error: e.message };
  }
}

/* ══════════════════════════════════════════
   ASSESSMENT SEEN-QUESTION TRACKING
   Stores seen question IDs per child to prevent repeats across sessions.
   Field: child_profiles/{uid}.assessmentSeenIds  (string[])
══════════════════════════════════════════ */

/**
 * Fetch the list of assessment question IDs this child has already seen.
 * Returns an empty array for mock users or on error.
 */
export async function getAssessmentSeenIds(uid) {
  if (!uid || uid === 'mock-user-123') return [];
  try {
    const snap = await getDoc(doc(db, 'child_profiles', uid));
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.assessmentSeenIds) ? data.assessmentSeenIds : [];
    }
    return [];
  } catch (e) {
    console.error('getAssessmentSeenIds:', e);
    return [];
  }
}

/**
 * Persist the updated seen-question ID list back to Firestore.
 * This is called after each assessment session completes.
 */
export async function saveAssessmentSeenIds(uid, seenIds = []) {
  if (!uid || uid === 'mock-user-123') return;
  try {
    await updateDoc(doc(db, 'child_profiles', uid), {
      assessmentSeenIds: seenIds,
      updated_at: serverTimestamp(),
    });
  } catch (e) {
    console.error('saveAssessmentSeenIds:', e);
  }
}
