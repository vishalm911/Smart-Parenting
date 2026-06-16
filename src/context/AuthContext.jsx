import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, logout as firebaseLogout } from '../firebase/authService';
import { getUserAccount, createUserAccount, createSession, endSession } from '../firebase/firestoreService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ─────────────────────────────────────────────────────────────────────────────
// DEV MODE flag — read once at module load time
// ─────────────────────────────────────────────────────────────────────────────
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// ─────────────────────────────────────────────────────────────────────────────
// REAL AuthProvider — untouched Firebase implementation
// ─────────────────────────────────────────────────────────────────────────────
const RealAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userAccount, setUserAccount] = useState(null);
  // Seed role from localStorage so child sessions survive page refresh
  const [userRole, setUserRole] = useState(() => localStorage.getItem('spaceece_role') || null);
  // loading = true until Firebase resolves the first auth state AND Firestore role is fetched
  const [loading, setLoading] = useState(true);
  // isRoleReady = false when user is authenticated but role is still being loaded from Firestore
  const [isRoleReady, setIsRoleReady] = useState(() => {
    // If we have a persisted role already, we can consider it ready immediately
    return !!localStorage.getItem('spaceece_role');
  });
  // Restore session ID from sessionStorage so that:
  //  • logout() can still call endSession() after a page refresh
  //  • we never lose track of the current active session
  const [sessionId, setSessionId] = useState(
    () => sessionStorage.getItem('spaceece_session_id') || null
  );

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);

      if (user) {
        setIsRoleReady(false);

        // Regular Firebase user (parent/teacher/admin)
        // Fetch the Firestore account to get the canonical role
        const { data } = await getUserAccount(user.uid);
        if (data) {
          setUserAccount(data);
          setUserRole(data.role);
          localStorage.setItem('spaceece_role', data.role);
        } else {
          // Firestore account not found yet (e.g. race condition on first register)
          // Role will be set by setupUserAccount after registration
          setUserAccount(null);
          // Do NOT clear userRole — allow RoleRoute to redirect after setup
        }

        setIsRoleReady(true);

        // Create session record only once per login — NOT on every page refresh.
        // sessionStorage persists across refreshes within the same tab, so if
        // spaceece_session_id is already set we know this is a reload, not a new login.
        const existingSessionId = sessionStorage.getItem('spaceece_session_id');
        if (!existingSessionId) {
          const { sessionId: sid } = await createSession(user.uid);
          if (sid) {
            setSessionId(sid);
            sessionStorage.setItem('spaceece_session_id', sid);
          }
        }

        localStorage.setItem('spaceece_uid', user.uid);
      } else {
        // No Firebase user — check whether we have a child session in localStorage.
        // Children don't have Firebase Auth accounts; their session is stored
        // via loginAsChild() which writes 'spaceece_role' = 'child' and
        // 'spaceece_child_id' to localStorage.
        const savedRole = localStorage.getItem('spaceece_role');
        if (savedRole === 'child') {
          // Keep the child session alive — do NOT clear userRole/account.
          setUserRole('child');
          setIsRoleReady(true);
          setLoading(false);
          return;
        }

        // No child session either — fully signed out
        setUserAccount(null);
        setUserRole(null);
        setIsRoleReady(true);
        sessionStorage.removeItem('spaceece_session_id');
        localStorage.removeItem('spaceece_uid');
        localStorage.removeItem('spaceece_role');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cross-tab session sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'spaceece_uid' && !e.newValue) {
        // Another tab logged out a Firebase user
        const savedRole = localStorage.getItem('spaceece_role');
        if (savedRole !== 'child') {
          setCurrentUser(null);
          setUserAccount(null);
          setUserRole(null);
          setIsRoleReady(true);
        }
      }
      if (e.key === 'spaceece_role' && !e.newValue) {
        // Child logged out in another tab
        setCurrentUser(null);
        setUserAccount(null);
        setUserRole(null);
        setIsRoleReady(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Setup user account in Firestore after registration
   */
  const setupUserAccount = async (user, role, displayName) => {
    await createUserAccount(user.uid, {
      email: user.email,
      role,
      displayName: displayName || user.displayName || '',
    });
    const { data } = await getUserAccount(user.uid);
    setUserAccount(data);
    setUserRole(role);
    setIsRoleReady(true);
    localStorage.setItem('spaceece_role', role);
  };

  /**
   * Set role for child login (no Firebase auth account needed).
   * Persists to localStorage so the child session survives page reload.
   */
  const loginAsChild = (childProfile) => {
    setUserRole('child');
    setIsRoleReady(true);
    localStorage.setItem('spaceece_role', 'child');
    localStorage.setItem('spaceece_child_id', childProfile.id);
  };

  /**
   * Logout — ends session record, signs out Firebase, clears all local state
   */
  const logout = async () => {
    // Use sessionStorage as the source of truth for the active session ID
    // (state may be null if this is called after a page refresh)
    const activeSessionId = sessionStorage.getItem('spaceece_session_id') || sessionId;
    if (activeSessionId) {
      await endSession(activeSessionId);
    }
    await firebaseLogout();
    setCurrentUser(null);
    setUserAccount(null);
    setUserRole(null);
    setSessionId(null);
    setIsRoleReady(true);
    sessionStorage.removeItem('spaceece_session_id');
    localStorage.removeItem('spaceece_uid');
    localStorage.removeItem('spaceece_role');
    localStorage.removeItem('spaceece_child_id');
  };

  // A child is "authenticated" when userRole === 'child' even without a Firebase user
  const isChildSession = userRole === 'child' && !currentUser;

  const value = {
    currentUser,
    userAccount,
    userRole,
    loading,
    isRoleReady,
    sessionId,
    setupUserAccount,
    loginAsChild,
    logout,
    isAuthenticated: !!currentUser || isChildSession,
    isChild: userRole === 'child',
    isParent: userRole === 'parent',
    isTeacher: userRole === 'teacher',
    isAdmin: userRole === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─────────────────────────────────────────────────────────────────────────────
// DEV AuthProvider — mock user, bypasses Firebase entirely
// Only active when VITE_DEV_MODE=true. Firebase imports above are never called.
// ─────────────────────────────────────────────────────────────────────────────
const DevAuthProvider = ({ children }) => {
  // Derive the active role from the current URL path so every dashboard
  // gets the correct role automatically (e.g. /parent/dashboard → 'parent').
  const deriveRoleFromPath = () => {
    const path = window.location.pathname;
    if (path.startsWith('/parent')) return 'parent';
    if (path.startsWith('/teacher')) return 'teacher';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/child')) return 'child';
    return 'parent'; // sensible default on the root/unknown path
  };

  const [userRole, setUserRole] = useState(deriveRoleFromPath);

  // Re-derive role whenever navigation happens (SPA route changes)
  useEffect(() => {
    const onPopState = () => setUserRole(deriveRoleFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const mockUser = {
    uid: 'dev-mock-uid',
    email: 'dev@spaceece.local',
    displayName: 'Dev User',
  };

  const mockAccount = {
    uid: 'dev-mock-uid',
    email: 'dev@spaceece.local',
    displayName: 'Dev User',
    role: userRole,
  };

  const value = {
    currentUser: mockUser,
    userAccount: mockAccount,
    userRole,
    loading: false,
    isRoleReady: true,
    sessionId: 'dev-session',
    setupUserAccount: async () => {},
    loginAsChild: () => setUserRole('child'),
    logout: async () => {},
    isAuthenticated: true,
    isChild: userRole === 'child',
    isParent: userRole === 'parent',
    isTeacher: userRole === 'teacher',
    isAdmin: userRole === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Export: swap provider based on DEV_MODE flag
// Production always uses RealAuthProvider (Firebase untouched).
// ─────────────────────────────────────────────────────────────────────────────
export const AuthProvider = DEV_MODE ? DevAuthProvider : RealAuthProvider;

export default AuthContext;
