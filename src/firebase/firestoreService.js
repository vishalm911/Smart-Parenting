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
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';

// ============================================================
// USER ACCOUNTS COLLECTION
// Collection: user_accounts
// Fields: uid, email, role, linked_child_profiles, created_at
// ============================================================

/**
 * Get user account by UID
 */
export const getUserAccount = async (uid) => {
  try {
    const docRef = doc(db, 'user_accounts', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    }
    return { data: null, error: 'User account not found.' };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/**
 * Create a new user account document
 */
export const createUserAccount = async (uid, data) => {
  try {
    const docRef = doc(db, 'user_accounts', uid);
    await setDoc(docRef, {
      uid,
      email: data.email,
      role: data.role,
      displayName: data.displayName || '',
      linked_child_profiles: [],
      is_active: true,
      created_at: serverTimestamp(),
      ...data,
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Update user account
 */
export const updateUserAccount = async (uid, data) => {
  try {
    const docRef = doc(db, 'user_accounts', uid);
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
 * Get all user accounts (admin)
 */
export const getAllUsers = async () => {
  try {
    const q = query(collection(db, 'user_accounts'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { data: users, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

/**
 * Activate a user account (admin)
 */
export const activateUser = async (uid) => {
  return updateUserAccount(uid, { is_active: true });
};

/**
 * Deactivate a user account (admin)
 */
export const deactivateUser = async (uid) => {
  return updateUserAccount(uid, { is_active: false });
};

/**
 * Change user role (admin)
 */
export const changeUserRole = async (uid, newRole) => {
  return updateUserAccount(uid, { role: newRole });
};

// ============================================================
// SESSIONS COLLECTION
// Collection: sessions
// Fields: uid, login_time, logout_time, device_info
// ============================================================

/**
 * Create a new session
 */
export const createSession = async (uid, deviceInfo = {}) => {
  try {
    const sessionRef = doc(collection(db, 'sessions'));
    await setDoc(sessionRef, {
      uid,
      login_time: serverTimestamp(),
      logout_time: null,
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        ...deviceInfo,
      },
    });
    return { sessionId: sessionRef.id, error: null };
  } catch (error) {
    return { sessionId: null, error: error.message };
  }
};

/**
 * End a session
 */
export const endSession = async (sessionId) => {
  try {
    const docRef = doc(db, 'sessions', sessionId);
    await updateDoc(docRef, {
      logout_time: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Get sessions for a user
 * NOTE: orderBy('login_time') removed — it requires a composite Firestore index
 * (uid + login_time) that may not exist. Sorting is done client-side instead.
 */
export const getUserSessions = async (uid) => {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('uid', '==', uid),
      limit(50)
    );
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log(`[getUserSessions] uid=${uid} → raw sessions from Firestore:`, sessions);
    return { data: sessions, error: null };
  } catch (error) {
    console.error(`[getUserSessions] uid=${uid} → Firestore ERROR:`, error.message);
    return { data: [], error: error.message };
  }
};

/**
 * Get all active sessions (admin)
 */
export const getActiveSessions = async () => {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('logout_time', '==', null),
      orderBy('login_time', 'desc')
    );
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { data: sessions, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

// ============================================================
// NOTIFICATIONS COLLECTION
// Collection: notifications
// Fields: child_id, parent_id, message, read_status, type, created_at
// ============================================================

/**
 * Get notifications for a child
 */
export const getNotifications = async (childId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('child_id', '==', childId),
      orderBy('created_at', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { data: notifications, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

/**
 * Get notifications for a parent
 */
export const getParentNotifications = async (parentId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('parent_id', '==', parentId),
      orderBy('created_at', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { data: notifications, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notifId) => {
  try {
    const docRef = doc(db, 'notifications', notifId);
    await updateDoc(docRef, { read_status: true });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Create a notification
 */
export const createNotification = async (data) => {
  try {
    const notifRef = doc(collection(db, 'notifications'));
    await setDoc(notifRef, {
      child_id: data.child_id || '',
      parent_id: data.parent_id || '',
      message: data.message,
      read_status: false,
      type: data.type || 'general',
      created_at: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Get unread notification count
 * Note: only filters on read_status to avoid requiring a composite Firestore index.
 */
export const getUnreadCount = async (userId, field = 'parent_id') => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where(field, '==', userId),
      where('read_status', '==', false)
    );
    const snapshot = await getDocs(q);
    return { count: snapshot.size, error: null };
  } catch (error) {
    return { count: 0, error: error.message };
  }
};

/**
 * Mark all unread notifications as read for a user (batch)
 */
export const markAllNotificationsAsRead = async (userId, field = 'parent_id') => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where(field, '==', userId),
      where('read_status', '==', false)
    );
    const snapshot = await getDocs(q);
    await Promise.all(
      snapshot.docs.map((d) => updateDoc(doc(db, 'notifications', d.id), { read_status: true }))
    );
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Listen to notifications in real-time
 */
export const subscribeToNotifications = (userId, field, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where(field, '==', userId),
    orderBy('created_at', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(notifications);
  }, (error) => {
    console.warn('[subscribeToNotifications] Snapshot listener failed (likely missing index or permissions):', error.message);
  });
};

// ============================================================
// FEATURE FLAGS COLLECTION
// Collection: feature_flags
// Single document "global" with all flag key/value pairs
// ============================================================

/**
 * Get feature flags from Firestore (single "global" document)
 */
export const getFeatureFlags = async () => {
  try {
    const docRef = doc(db, 'feature_flags', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null };
    }
    return { data: null, error: null }; // No flags yet — use defaults
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/**
 * Save feature flags to Firestore
 */
export const saveFeatureFlags = async (flags) => {
  try {
    const docRef = doc(db, 'feature_flags', 'global');
    await setDoc(docRef, { ...flags, updated_at: serverTimestamp() }, { merge: true });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Subscribe to feature flags in real-time
 */
export const subscribeToFeatureFlags = (callback) => {
  const docRef = doc(db, 'feature_flags', 'global');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  }, (error) => {
    console.warn('[subscribeToFeatureFlags] Snapshot listener failed:', error.message);
  });
};

// ============================================================
// NOTIFICATION TEMPLATES COLLECTION
// Collection: notification_templates
// Fields: title, message, type, active, created_at, updated_at
// ============================================================

/**
 * Get all notification templates
 */
export const getNotificationTemplates = async () => {
  try {
    const q = query(collection(db, 'notification_templates'), orderBy('created_at', 'asc'));
    const snapshot = await getDocs(q);
    const templates = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { data: templates, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

/**
 * Save (create or update) a notification template
 */
export const saveNotificationTemplate = async (data, existingId = null) => {
  try {
    if (existingId) {
      const docRef = doc(db, 'notification_templates', existingId);
      await updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
      return { id: existingId, error: null };
    }
    const docRef = doc(collection(db, 'notification_templates'));
    await setDoc(docRef, {
      title: data.title,
      message: data.message,
      type: data.type || 'system',
      active: data.active !== undefined ? data.active : true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

/**
 * Delete a notification template
 */
export const deleteNotificationTemplate = async (templateId) => {
  try {
    await deleteDoc(doc(db, 'notification_templates', templateId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Toggle active state of a notification template
 */
export const toggleNotificationTemplate = async (templateId, active) => {
  try {
    await updateDoc(doc(db, 'notification_templates', templateId), {
      active,
      updated_at: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};
