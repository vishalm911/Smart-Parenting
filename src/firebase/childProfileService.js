import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const CHILD_PROFILES_COLLECTION = 'child_profiles';
const MAX_PROFILES = 4;

/**
 * Get all child profiles for a parent
 */
export const getChildProfiles = async (parentUid) => {
  try {
    const q = query(
      collection(db, CHILD_PROFILES_COLLECTION),
      where('parent_uid', '==', parentUid)
    );
    const snapshot = await getDocs(q);
    const profiles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log(
      '[childProfileService] getChildProfiles — Firestore doc IDs mapped:',
      profiles.map((p) => ({ firestoreDocId: p.id, name: p.name }))
    );
    return { data: profiles, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

/**
 * Get a single child profile by ID
 */
export const getChildProfile = async (profileId) => {
  try {
    const docRef = doc(db, CHILD_PROFILES_COLLECTION, profileId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    }
    return { data: null, error: 'Child profile not found.' };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/**
 * Create a new child profile (max 4 per parent)
 */
export const createChildProfile = async (parentUid, data) => {
  try {
    // Check max profiles limit
    const { data: existing } = await getChildProfiles(parentUid);
    if (existing && existing.length >= MAX_PROFILES) {
      return { error: `Maximum of ${MAX_PROFILES} child profiles allowed.` };
    }

    const profileRef = doc(collection(db, CHILD_PROFILES_COLLECTION));
    await setDoc(profileRef, {
      parent_uid: parentUid,
      name: data.name,
      avatar: data.avatar || 'avatar1',
      age_group: data.age_group || '4-6',
      date_of_birth: data.date_of_birth || null,
      coin_count: 0,
      xp: 0,
      level: 1,
      badges: [],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    return { profileId: profileRef.id, error: null };
  } catch (error) {
    return { profileId: null, error: error.message };
  }
};

/**
 * Update an existing child profile
 */
export const updateChildProfile = async (profileId, data) => {
  try {
    console.log('[childProfileService] updateChildProfile — Firestore doc ID used for updateDoc:', profileId, '| Data:', data);
    const docRef = doc(db, CHILD_PROFILES_COLLECTION, profileId);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Delete a child profile
 */
export const deleteChildProfile = async (profileId) => {
  try {
    console.log('[childProfileService] deleteChildProfile — Firestore doc ID used for deleteDoc:', profileId);
    const docRef = doc(db, CHILD_PROFILES_COLLECTION, profileId);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error) {
    console.error('[childProfileService] deleteDoc failed for ID:', profileId, '| Error:', error.message);
    return { error: error.message };
  }
};

/**
 * Update child coin count
 */
export const updateCoinCount = async (profileId, amount) => {
  try {
    const { data: profile } = await getChildProfile(profileId);
    if (!profile) return { error: 'Profile not found.' };

    const newCount = (profile.coin_count || 0) + amount;
    await updateDoc(doc(db, CHILD_PROFILES_COLLECTION, profileId), {
      coin_count: newCount,
      updated_at: serverTimestamp(),
    });
    return { coinCount: newCount, error: null };
  } catch (error) {
    return { coinCount: null, error: error.message };
  }
};

/**
 * Available avatars list
 */
export const AVATARS = [
  { id: 'avatar1', label: 'Astronaut', emoji: '🧑‍🚀' },
  { id: 'avatar2', label: 'Rocket', emoji: '🚀' },
  { id: 'avatar3', label: 'Star', emoji: '⭐' },
  { id: 'avatar4', label: 'Planet', emoji: '🪐' },
  { id: 'avatar5', label: 'Moon', emoji: '🌙' },
  { id: 'avatar6', label: 'Sun', emoji: '☀️' },
  { id: 'avatar7', label: 'Rainbow', emoji: '🌈' },
  { id: 'avatar8', label: 'Butterfly', emoji: '🦋' },
  { id: 'avatar9', label: 'Teddy', emoji: '🧸' },
  { id: 'avatar10', label: 'Robot', emoji: '🤖' },
  { id: 'avatar11', label: 'Unicorn', emoji: '🦄' },
  { id: 'avatar12', label: 'Dragon', emoji: '🐉' },
];

/**
 * Age groups
 */
export const AGE_GROUPS = [
  { value: '1-3', label: 'Age 1-3', color: '#48BB78' },
  { value: '4-6', label: 'Age 4-6', color: '#4299E1' },
  { value: '7-10', label: 'Age 7-10', color: '#9F7AEA' },
];
