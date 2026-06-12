import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getChildProfiles,
  getChildProfile,
  createChildProfile as createProfile,
  updateChildProfile as updateProfile,
  deleteChildProfile as deleteProfile,
} from '../firebase/childProfileService';

const ChildProfileContext = createContext(null);

export const useChildProfile = () => {
  const context = useContext(ChildProfileContext);
  if (!context) {
    throw new Error('useChildProfile must be used within a ChildProfileProvider');
  }
  return context;
};

export const ChildProfileProvider = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  const [childProfiles, setChildProfiles] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load child profiles when parent logs in
  const loadProfiles = useCallback(async () => {
    if (!currentUser || userRole !== 'parent') return;

    setLoading(true);
    const { data, error } = await getChildProfiles(currentUser.uid);
    if (!error && data) {
      setChildProfiles(data);

      // Restore active child from localStorage
      const savedChildId = localStorage.getItem('spaceece_active_child');
      if (savedChildId) {
        const saved = data.find((p) => p.id === savedChildId);
        if (saved) setActiveChild(saved);
      } else if (data.length > 0) {
        setActiveChild(data[0]);
      }
    }
    setLoading(false);
  }, [currentUser, userRole]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  /**
   * Restore the active child profile for a child session (e.g. after page refresh).
   * When userRole === 'child', the child's profile ID is stored in localStorage
   * under 'spaceece_child_id'. We fetch that profile from Firestore and set it
   * as the active child so the session persists across reloads.
   */
  useEffect(() => {
    if (userRole !== 'child') return;
    if (activeChild) return; // already restored

    const savedChildId = localStorage.getItem('spaceece_child_id');
    if (!savedChildId) return;

    setLoading(true);
    getChildProfile(savedChildId).then(({ data, error }) => {
      if (!error && data) {
        setActiveChild(data);
      }
      setLoading(false);
    });
  }, [userRole, activeChild]);

  /**
   * Switch to a different child profile
   */
  const switchChild = (profileId) => {
    const profile = childProfiles.find((p) => p.id === profileId);
    if (profile) {
      setActiveChild(profile);
      localStorage.setItem('spaceece_active_child', profileId);
    }
  };

  /**
   * Create a new child profile
   */
  const createChildProfile = async (data) => {
    if (!currentUser) return { error: 'Not authenticated' };

    const result = await createProfile(currentUser.uid, data);
    if (!result.error) {
      await loadProfiles();
    }
    return result;
  };

  /**
   * Update an existing child profile
   */
  const updateChildProfile = async (profileId, data) => {
    const result = await updateProfile(profileId, data);
    if (!result.error) {
      await loadProfiles();
      // Update active child if it's the one being edited
      if (activeChild?.id === profileId) {
        setActiveChild((prev) => ({ ...prev, ...data }));
      }
    }
    return result;
  };

  /**
   * Delete a child profile
   */
  const deleteChildProfile = async (profileId) => {
    const result = await deleteProfile(profileId);
    if (!result.error) {
      if (activeChild?.id === profileId) {
        setActiveChild(null);
        localStorage.removeItem('spaceece_active_child');
      }
      await loadProfiles();
    }
    return result;
  };

  const coinCount = activeChild?.coin_count || 0;

  const value = {
    childProfiles,
    activeChild,
    coinCount,
    loading,
    switchChild,
    createChildProfile,
    updateChildProfile,
    deleteChildProfile,
    refreshProfiles: loadProfiles,
  };

  return (
    <ChildProfileContext.Provider value={value}>
      {children}
    </ChildProfileContext.Provider>
  );
};

export default ChildProfileContext;
