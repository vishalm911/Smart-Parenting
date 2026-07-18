import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  loginUser, registerUser, logoutUser, loginChild, loginWithGoogle,
  sendPasswordReset, changePassword,
  fetchCurrentUser, getCurrentUser, isAuthenticated,
} from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUserVal] = useState(null);
  const setCurrentUser = useCallback((val) => {
    if (val) {
      const mapped = { ...val };
      if (!mapped.uid && mapped._id) {
        mapped.uid = mapped._id.toString();
      }
      setCurrentUserVal(mapped);
    } else {
      setCurrentUserVal(null);
    }
  }, []);
  const [loading, setLoading]         = useState(true);
  const bootDone = useRef(false);

  useEffect(() => {
    if (bootDone.current) return;
    bootDone.current = true;

    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    // Use cached user instantly — no flicker
    const cached = getCurrentUser();
    if (cached) setCurrentUser(cached);

    // Verify in background
    fetchCurrentUser().then(({ user }) => {
      if (user) {
        setCurrentUser(user);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email, password) => {
    const { user, error } = await loginUser(email, password);
    if (user) {
      setCurrentUser(user);
      setLoading(false);
    }
    return { user, error };
  }, []);

  const register = useCallback(async (email, password, displayName, role) => {
    const { user, error } = await registerUser(email, password, displayName, role);
    if (user) {
      setCurrentUser(user);
      setLoading(false);
    }
    return { user, error };
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setCurrentUser(null);
    bootDone.current = false;
  }, []);

  const loginChildProfile = useCallback(async (profileId, pin) => {
    const { profile, error } = await loginChild(profileId, pin);
    if (profile) {
      setCurrentUser(profile);
      setLoading(false);
    }
    return { profile, error };
  }, []);

  const loginGoogle = useCallback(async (role) => {
    const { user, error } = await loginWithGoogle(role);
    if (user) {
      setCurrentUser(user);
      setLoading(false);
    }
    return { user, error };
  }, []);

  const refreshUser = useCallback(async () => {
    const { user } = await fetchCurrentUser();
    if (user) setCurrentUser(user);
    return user;
  }, []);

  // Stable uid — prevents object reference changes from causing re-renders
  const uid      = currentUser?._id || currentUser?.uid || currentUser?.id || null;
  const userRole = currentUser?.role || null;

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    loginChild:       loginChildProfile,
    loginGoogle,
    sendPasswordReset,
    changePassword,
    refreshUser,
    isAuthenticated:  !!currentUser,
    userRole,
    uid,
    isRoleReady:      !loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;