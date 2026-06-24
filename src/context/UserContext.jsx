/**
 * UserContext.jsx - Unified Child Portal State Context
 *
 * Serves as the central state engine for children, bridging:
 * - Active Firebase Auth state & sessions
 * - Syncs local child login selections and profile data
 * - Manages session streaks, badge rewards, stars, and XP counters
 */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  onAuthChange,
  getUserProfile,
  loginAnonymous,
  updateDayStreak,
  startSession,
  endSession,
  checkAndUnlockAchievements,
} from '../firebase/services';
import { useChildProfile } from './ChildProfileContext';

const UserContext = createContext();

/**
 * Provides auth state + user profile (xp, stars, coins, streak, etc.)
 * across the entire app. Auto-signs in anonymously if no user,
 * UNLESS the user explicitly signed out (loggedOut ref = true).
 *
 * Also handles on-login:
 *   - Day streak update  (streaks collection)
 *   - Session tracking   (sessions collection)
 *   - Achievement checks (achievements + notifications collections)
 */
export function UserProvider({ children }) {
  const [user, setUser]       = useState(null);   // Firebase Auth user
  const [profile, setProfile] = useState(null);   // Firestore users/{uid}
  const [loading, setLoading] = useState(true);
  const [newAchievements, setNewAchievements] = useState([]); // badges just unlocked

  // Prevents auto-anonymous-login after an explicit logout
  const loggedOut  = useRef(false);
  // Tracks active session doc ID so we can close it on logout
  const sessionId  = useRef(null);

  // Read active child profile from the child profile context
  const childCtx = useChildProfile();
  const activeChild = childCtx?.activeChild;

  // Sync when activeChild changes (switching profiles in parent view)
  useEffect(() => {
    if (activeChild) {
      const syncProfile = async () => {
        setUser({ uid: activeChild.id, isAnonymous: false, displayName: activeChild.name });
        const prof = await getUserProfile(activeChild.id);
        setProfile(prof);
        setLoading(false);
      };
      syncProfile();
    }
  }, [activeChild]);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      // Check local storage for active child session first
      const childId = localStorage.getItem('spaceece_child_id');
      const role = localStorage.getItem('spaceece_role');
      if (role === 'child' && childId) {
        const prof = await getUserProfile(childId);
        setUser({ uid: childId, isAnonymous: false, displayName: prof?.name || 'Child' });
        setProfile(prof);
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        loggedOut.current = false;
        setUser(firebaseUser);

        // 1. Update day streak first
        await updateDayStreak(firebaseUser.uid).catch(() => {});

        // 2. Fetch profile
        const prof = await getUserProfile(firebaseUser.uid);
        setProfile(prof);

        // 3. Start session tracking
        if (!sessionId.current) {
          startSession(firebaseUser.uid).then(id => { sessionId.current = id; }).catch(() => {});
        }

        // 4. Check achievement milestones (non-blocking)
        if (prof) {
          checkAndUnlockAchievements(firebaseUser.uid, prof).then(unlocks => {
            if (unlocks.length > 0) setNewAchievements(unlocks);
          }).catch(() => {});
        }

      } else if (!loggedOut.current) {
        // Auto sign in anonymously so the app always has a user
        try {
          await loginAnonymous();
        } catch (e) {
          console.error('Anonymous sign-in failed, falling back to mock profile:', e);
          const mockUser = { uid: 'mock-user-123', isAnonymous: true };
          setUser(mockUser);
          const prof = await getUserProfile(mockUser.uid);
          setProfile(prof);
        }
      } else {
        // Explicit logout — close session and stay signed out
        endSession(sessionId.current).catch(() => {});
        sessionId.current = null;
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /** Re-fetch profile from Firestore (call after awarding XP, etc.) */
  const refreshProfile = async () => {
    if (!user) return;
    const prof = await getUserProfile(user.uid);
    setProfile(prof);
    // Re-check achievements with updated profile
    if (prof) {
      checkAndUnlockAchievements(user.uid, prof).then(unlocks => {
        if (unlocks.length > 0) setNewAchievements(prev => [...prev, ...unlocks]);
      }).catch(() => {});
    }
  };

  /** Marks that the user explicitly signed out, so auto-login is skipped. */
  const markLoggedOut = () => {
    loggedOut.current = true;
  };

  /** Clear the new-achievement toast queue once shown */
  const clearNewAchievements = () => setNewAchievements([]);

  return (
    <UserContext.Provider value={{
      user, profile, loading,
      refreshProfile, setProfile,
      markLoggedOut,
      newAchievements, clearNewAchievements,
    }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
