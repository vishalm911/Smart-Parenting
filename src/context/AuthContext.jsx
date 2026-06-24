/**
 * src/context/AuthContext.jsx
 *
 * Replaces Firebase's onAuthStateChanged listener with a one-shot
 * token check on mount, then exposes the same context shape as before.
 *
 * Context value:
 *   currentUser  — user object or null
 *   loading      — boolean
 *   login(email, password)
 *   register(email, password, displayName, role)
 *   logout()
 *   loginChild(profileId, pin)
 *   sendPasswordReset(email)
 *   changePassword(current, next)
 *   refreshUser()           — re-fetch user from server
 */

import { createContext, useContext, useEffect, useState } from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  loginChild,
  sendPasswordReset,
  changePassword,
  fetchCurrentUser,
  getCurrentUser,
  isAuthenticated,
} from '../firebase/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getCurrentUser()); // optimistic from cache
  const [loading, setLoading]         = useState(true);

  // On mount: verify the stored token is still valid with the server
  useEffect(() => {
    if (!isAuthenticated()) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    fetchCurrentUser().then(({ user, error }) => {
      if (error) {
        // Token invalid/expired — clear everything
        setCurrentUser(null);
      } else {
        setCurrentUser(user);
      }
      setLoading(false);
    });
  }, []);

  // ── Auth actions ─────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { user, error } = await loginUser(email, password);
    if (user) setCurrentUser(user);
    return { user, error };
  };

  const register = async (email, password, displayName, role) => {
    const { user, error } = await registerUser(email, password, displayName, role);
    if (user) setCurrentUser(user);
    return { user, error };
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  const loginChildProfile = async (profileId, pin) => {
    const { profile, error } = await loginChild(profileId, pin);
    if (profile) setCurrentUser(profile);
    return { profile, error };
  };

  const refreshUser = async () => {
    const { user } = await fetchCurrentUser();
    if (user) setCurrentUser(user);
    return user;
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    loginChild: loginChildProfile,
    sendPasswordReset,
    changePassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
