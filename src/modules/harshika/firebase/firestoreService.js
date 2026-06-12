import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, setDoc,
} from "firebase/firestore";
import { db } from "./config";

const todayStr = () => new Date().toISOString().slice(0, 10);

// ── STORIES ──────────────────────────────────
export const getStories = async (ageGroup = null) => {
  try {
    const ref = ageGroup
      ? query(collection(db, "stories"), where("age_group", "==", ageGroup))
      : collection(db, "stories");
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
export const addStory = async (data) => {
  try {
    const ref = await addDoc(collection(db, "stories"), { ...data, created_at: serverTimestamp(), updated_at: serverTimestamp() });
    return ref.id;
  } catch { return null; }
};
export const updateStory = async (id, data) => {
  try { await updateDoc(doc(db, "stories", id), { ...data, updated_at: serverTimestamp() }); } catch {}
};
export const deleteStory = async (id) => {
  try { await deleteDoc(doc(db, "stories", id)); } catch {}
};

// ── VOCABULARY GAMES ──────────────────────────────────
export const getVocabularyGames = async () => {
  try {
    const snap = await getDocs(collection(db, "vocabulary_games"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
export const addVocabGame = async (data) => {
  try {
    const ref = await addDoc(collection(db, "vocabulary_games"), { ...data, created_at: serverTimestamp(), updated_at: serverTimestamp() });
    return ref.id;
  } catch { return null; }
};
export const updateVocabGame = async (id, data) => {
  try { await updateDoc(doc(db, "vocabulary_games", id), { ...data, updated_at: serverTimestamp() }); } catch {}
};
export const deleteVocabGame = async (id) => {
  try { await deleteDoc(doc(db, "vocabulary_games", id)); } catch {}
};

// ── WORD BUILDER ──────────────────────────────────
export const getWordBuilderList = async () => {
  try {
    const snap = await getDocs(collection(db, "word_builder"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
export const addWordBuilderItem = async (data) => {
  try {
    const ref = await addDoc(collection(db, "word_builder"), { ...data, created_at: serverTimestamp() });
    return ref.id;
  } catch { return null; }
};
export const updateWordBuilderItem = async (id, data) => {
  try { await updateDoc(doc(db, "word_builder", id), { ...data, updated_at: serverTimestamp() }); } catch {}
};
export const deleteWordBuilderItem = async (id) => {
  try { await deleteDoc(doc(db, "word_builder", id)); } catch {}
};

// ── PICTURE MATCH ──────────────────────────────────
export const getPictureMatchItems = async () => {
  try {
    const snap = await getDocs(collection(db, "picture_match"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
export const addPictureMatchItem = async (data) => {
  try {
    const ref = await addDoc(collection(db, "picture_match"), { ...data, created_at: serverTimestamp() });
    return ref.id;
  } catch { return null; }
};
export const updatePictureMatchItem = async (id, data) => {
  try { await updateDoc(doc(db, "picture_match", id), { ...data, updated_at: serverTimestamp() }); } catch {}
};
export const deletePictureMatchItem = async (id) => {
  try { await deleteDoc(doc(db, "picture_match", id)); } catch {}
};

// ── SOUND MATCH ──────────────────────────────────
export const getSoundMatchData = async () => {
  try {
    const snap = await getDocs(collection(db, "sound_match"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
export const addSoundMatch = async (data) => {
  try {
    const ref = await addDoc(collection(db, "sound_match"), { ...data, created_at: serverTimestamp() });
    return ref.id;
  } catch { return null; }
};
export const updateSoundMatch = async (id, data) => {
  try { await updateDoc(doc(db, "sound_match", id), { ...data, updated_at: serverTimestamp() }); } catch {}
};
export const deleteSoundMatch = async (id) => {
  try { await deleteDoc(doc(db, "sound_match", id)); } catch {}
};

// ── OBJECT RECOGNITION ──────────────────────────────────
export const getObjectRecognitionData = async () => {
  try {
    const snap = await getDocs(collection(db, "object_recognition"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
export const addObjectRecognition = async (data) => {
  try {
    const ref = await addDoc(collection(db, "object_recognition"), { ...data, created_at: serverTimestamp() });
    return ref.id;
  } catch { return null; }
};
export const updateObjectRecognition = async (id, data) => {
  try { await updateDoc(doc(db, "object_recognition", id), { ...data, updated_at: serverTimestamp() }); } catch {}
};
export const deleteObjectRecognition = async (id) => {
  try { await deleteDoc(doc(db, "object_recognition", id)); } catch {}
};

// ── FLUENCY PASSAGES ──────────────────────────────────
export const getFluencyPassages = async () => {
  try {
    const snap = await getDocs(collection(db, "fluency_passages"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
export const addFluencyPassage = async (data) => {
  try {
    const ref = await addDoc(collection(db, "fluency_passages"), { ...data, created_at: serverTimestamp() });
    return ref.id;
  } catch { return null; }
};
export const updateFluencyPassage = async (id, data) => {
  try { await updateDoc(doc(db, "fluency_passages", id), { ...data, updated_at: serverTimestamp() }); } catch {}
};
export const deleteFluencyPassage = async (id) => {
  try { await deleteDoc(doc(db, "fluency_passages", id)); } catch {}
};

// ── PHONICS WORDS ──────────────────────────────────
export const getPhonicsWords = async () => {
  try {
    const snap = await getDocs(collection(db, "phonics_words"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
export const addPhonicsWord = async (data) => {
  try {
    const ref = await addDoc(collection(db, "phonics_words"), { ...data, created_at: serverTimestamp() });
    return ref.id;
  } catch { return null; }
};
export const updatePhonicsWord = async (id, data) => {
  try { await updateDoc(doc(db, "phonics_words", id), { ...data, updated_at: serverTimestamp() }); } catch {}
};
export const deletePhonicsWord = async (id) => {
  try { await deleteDoc(doc(db, "phonics_words", id)); } catch {}
};

// ── CHALLENGES ──────────────────────────────────
export const getChallengesData = async () => {
  try {
    const snap = await getDocs(collection(db, "challenges"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
export const updateChallenge = async (id, data) => {
  try {
    await updateDoc(doc(db, "challenges", id), { ...data, updated_at: serverTimestamp() });
  } catch {}
};

// ── READING ACTIVITIES ──────────────────────────────────
export const getReadingActivities = async (ageGroup = null) => {
  try {
    const ref = ageGroup
      ? query(collection(db, "reading_activities"), where("age_group", "==", ageGroup))
      : collection(db, "reading_activities");
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
export const addReadingActivity = async (data) => {
  try {
    const ref = await addDoc(collection(db, "reading_activities"), { ...data, created_at: serverTimestamp(), updated_at: serverTimestamp() });
    return ref.id;
  } catch { return null; }
};
export const updateReadingActivity = async (id, data) => {
  try { await updateDoc(doc(db, "reading_activities", id), { ...data, updated_at: serverTimestamp() }); } catch {}
};
export const deleteReadingActivity = async (id) => {
  try { await deleteDoc(doc(db, "reading_activities", id)); } catch {}
};

// ── SCORES ──────────────────────────────────
// activity_type: "story" | "picture_match" | "word_builder" | "flashcard" | "sound_match" | "phonics" | "fluency"
export const saveActivityScore = async (childId, activityId, activityType, scoreData) => {
  try {
    const ref = await addDoc(collection(db, "activity_scores"), {
      child_id: childId,
      activity_id: activityId,
      activity_type: activityType,
      ...scoreData,
      date: serverTimestamp(),
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return ref.id;
  } catch { return null; }
};
// Legacy: still save to language_scores for backward compat
export const saveLanguageScore = async (childId, activityId, scoreData) => {
  try {
    const ref = await addDoc(collection(db, "language_scores"), {
      child_id: childId, activity_id: activityId, activity_type: "story",
      ...scoreData,
      date: serverTimestamp(), created_at: serverTimestamp(), updated_at: serverTimestamp(),
    });
    return ref.id;
  } catch { return null; }
};

export const getAllScores = async () => {
  try {
    // Fetch from both collections and merge
    const [legacySnap, newSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, "language_scores")),
      getDocs(collection(db, "activity_scores")),
      getDocs(collection(db, "users")),
    ]);

    // Build uid -> username map from users collection
    const userMap = {};
    usersSnap.docs.forEach(d => {
      const data = d.data();
      userMap[d.id] = data.username || data.display_name || null;
    });

    const legacy = legacySnap.docs.map(d => ({ id: d.id, ...d.data(), _col: "language_scores" }));
    const newScores = newSnap.docs.map(d => ({ id: d.id, ...d.data(), _col: "activity_scores" }));

    // Deduplicate by id, then enrich missing usernames
    const allMap = {};
    [...legacy, ...newScores].forEach(s => { allMap[s.id] = s; });

    return Object.values(allMap).map(sc => ({
      ...sc,
      username: sc.username || sc.display_name || userMap[sc.child_id] || null,
    }));
  } catch { return []; }
};

export const updateScore = async (id, col, data) => {
  try {
    await updateDoc(doc(db, col || "language_scores", id), { ...data, updated_at: serverTimestamp() });
  } catch {}
};

export const deleteScore = async (id, col) => {
  try { await deleteDoc(doc(db, col || "language_scores", id)); } catch {}
};

export const getScoresByChild = async (childId) => {
  try {
    const q = query(collection(db, "language_scores"), where("child_id", "==", childId), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};

// ── STREAK ────────────────────────────────────
export const getStreak = async (userId) => {
  try {
    const ref = doc(db, "streaks", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { dates: [], count: 0 };
    return snap.data();
  } catch { return { dates: [], count: 0 }; }
};
export const markTodayActive = async (userId) => {
  try {
    const today = todayStr();
    const ref = doc(db, "streaks", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { dates: [today], count: 1, updated_at: serverTimestamp() });
      return 1;
    }
    const data = snap.data();
    const dates = data.dates || [];
    if (dates.includes(today)) return data.count;
    const sorted = [...dates, today].sort();
    const last7 = sorted.slice(-7);
    let streak = 1;
    const d = new Date(today);
    for (let i = 1; i <= 6; i++) {
      d.setDate(d.getDate() - 1);
      if (last7.includes(d.toISOString().slice(0, 10))) streak++;
      else break;
    }
    await setDoc(ref, { dates: last7, count: streak, updated_at: serverTimestamp() });
    return streak;
  } catch { return 0; }
};
export const getScoresByStory = async (storyId) => {
  try {
    const q = query(collection(db, "language_scores"), where("activity_id", "==", storyId), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
