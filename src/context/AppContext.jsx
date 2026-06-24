import { createContext, useContext, useState, useEffect } from 'react';
import { AuthProvider } from './AuthContext';
import { ChildProfileProvider } from './ChildProfileContext';
import { NotificationProvider } from './NotificationContext';
import { subscribeToFeatureFlags, saveFeatureFlags } from '../firebase/firestoreService';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Default values used until Firestore responds or if no document exists yet
const DEFAULT_FLAGS = {
  enableChildDashboard: true,
  enableTeacherDashboard: true,
  enableNotifications: true,
  enableCoinRewards: true,
  enableAvatarCustomization: true,
  enableGoogleSignIn: true,
  maintenanceMode: false,
};

const AppStateProvider = ({ children }) => {
  const [currentActivity, setCurrentActivity] = useState(null);
  const [featureFlags, setFeatureFlags] = useState(DEFAULT_FLAGS);
  const [flagsLoaded, setFlagsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Subscribe to feature flags from Firestore in real-time
  useEffect(() => {
    const unsubscribe = subscribeToFeatureFlags((remoteFlags) => {
      // Merge remote flags over defaults so any new default keys are preserved
      setFeatureFlags((prev) => ({ ...DEFAULT_FLAGS, ...remoteFlags }));
      setFlagsLoaded(true);
    });
    // Mark as loaded (with defaults) even if Firestore never fires (e.g., offline)
    const fallbackTimer = setTimeout(() => setFlagsLoaded(true), 3000);
    return () => {
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  /**
   * Update a single feature flag and persist to Firestore
   */
  const updateFeatureFlag = async (flag, value) => {
    const updated = { ...featureFlags, [flag]: value };
    setFeatureFlags(updated);
    // Persist to Firestore (strip internal fields)
    const { updated_at, ...flagsToSave } = updated;
    await saveFeatureFlags(flagsToSave);
  };

  const value = {
    currentActivity,
    setCurrentActivity,
    featureFlags,
    setFeatureFlags,
    updateFeatureFlag,
    flagsLoaded,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Combined provider that wraps the entire app
 * Order matters: Auth → ChildProfile → Notification → AppState
 */
export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <ChildProfileProvider>
        <NotificationProvider>
          <AppStateProvider>{children}</AppStateProvider>
        </NotificationProvider>
      </ChildProfileProvider>
    </AuthProvider>
  );
};

export default AppContext;
