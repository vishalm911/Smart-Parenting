import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUserProfile, updateDayStreak, startSession, endSession } from '../api/services';
import { useAuth } from './AuthContext';
import { getChildProfile } from '../api/childProfileService';

const UserContext = createContext();

export function UserProvider({ children }) {
  const { currentUser, uid, userRole } = useAuth();
  const [user, setUserVal]         = useState(null);
  const setUser = useCallback((val) => {
    if (val) {
      const mapped = { ...val };
      if (!mapped.uid && mapped._id) {
        mapped.uid = mapped._id.toString();
      }
      setUserVal(mapped);
    } else {
      setUserVal(null);
    }
  }, []);
  const [profile, setProfileVal]   = useState(null);
  const setProfile = useCallback((val) => {
    if (val) {
      const mapped = { ...val };
      if (!mapped.uid && mapped._id) {
        mapped.uid = mapped._id.toString();
      }
      setProfileVal(mapped);
    } else {
      setProfileVal(null);
    }
  }, []);
  const [loading, setLoading]   = useState(true);
  const [newAchievements, setNewAchievements] = useState([]);
  const sessionId   = useRef(null);

  useEffect(() => {
    if (!uid) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      if (sessionId.current) {
        endSession(sessionId.current).catch(() => {});
        sessionId.current = null;
      }
      return;
    }

    setLoading(true);
    setUser(currentUser);

    if (userRole === 'child') {
      // Set initial cached profile instantly
      setProfile(currentUser);
      getChildProfile(uid)
        .then(res => { if (res && res.data) setProfile(res.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      getUserProfile(uid)
        .then(prof => { if (prof) setProfile(prof); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }

    // Non-blocking side effects
    updateDayStreak(uid).catch(() => {});
    startSession(uid).then(id => { sessionId.current = id; }).catch(() => {});

    return () => {
      if (sessionId.current) {
        endSession(sessionId.current).catch(() => {});
        sessionId.current = null;
      }
    };
  }, [uid, userRole]);

  const refreshProfile = async () => {
    if (!uid) return;
    if (userRole === 'child') {
      const res = await getChildProfile(uid);
      if (res && res.data) setProfile(res.data);
    } else {
      const prof = await getUserProfile(uid);
      if (prof) setProfile(prof);
    }
  };

  const markLoggedOut = () => {
    setUser(null);
    setProfile(null);
    if (sessionId.current) {
      endSession(sessionId.current).catch(() => {});
      sessionId.current = null;
    }
  };

  return (
    <UserContext.Provider value={{
      user, profile, loading,
      refreshProfile, setProfile,
      markLoggedOut,
      newAchievements,
      clearNewAchievements: () => setNewAchievements([]),
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}