import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getParentNotifications,
  getNotifications,
  markNotificationAsRead,
  getUnreadCount,
  subscribeToNotifications,
} from '../api/userService';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser, userRole, uid } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  /**
   * Resolve the effective user ID for notification queries.
   * - Authenticated users (parent/teacher/admin): use currentUser.uid
   * - Child sessions (no JWT auth): use localStorage spaceece_child_id
   */
  const getEffectiveUserId = useCallback(() => {
    if (uid) return uid;
    if (currentUser?.uid) return currentUser.uid;
    if (currentUser?._id) return currentUser._id;
    if (userRole === 'child') {
      return localStorage.getItem('spaceece_child_id') || null;
    }
    return null;
  }, [currentUser, userRole, uid]);

  /**
   * Resolve the Firestore field to query by for the current user.
   */
  const getNotifField = useCallback(() => {
    if (userRole === 'parent') return 'parent_id';
    if (userRole === 'child') return 'child_id';
    // teacher/admin: use parent_id as fallback (adjust if you have a user_id field)
    return 'parent_id';
  }, [userRole]);

  // Fetch notifications
  const refreshNotifications = useCallback(async () => {
    const userId = getEffectiveUserId();
    if (!userId) return;

    setLoading(true);
    try {
      let result;
      if (userRole === 'parent') {
        result = await getParentNotifications(userId);
      } else {
        result = await getNotifications(userId);
      }

      if (!result.error) {
        setNotifications(result.data);
      }

      // Get unread count
      const field = getNotifField();
      const countResult = await getUnreadCount(userId, field);
      if (!countResult.error) {
        setUnreadCount(countResult.count);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
    setLoading(false);
  }, [getEffectiveUserId, getNotifField, userRole]);

  // Load notifications on auth change
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Real-time subscription
  useEffect(() => {
    const userId = getEffectiveUserId();
    if (!userId) return;

    const field = getNotifField();
    const unsubscribe = subscribeToNotifications(userId, field, (newNotifications) => {
      setNotifications(newNotifications);
      const unread = newNotifications.filter((n) => !n.read_status).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [getEffectiveUserId, getNotifField]);

  /**
   * Mark a single notification as read — optimistic UI update
   */
  const markAsRead = async (notifId) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read_status: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    const result = await markNotificationAsRead(notifId);
    if (result.error) {
      // Rollback on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read_status: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
    return result;
  };

  /**
   * Mark all notifications as read — optimistic UI update
   */
  const markAllAsRead = async () => {
    const unreadNotifs = notifications.filter((n) => !n.read_status);
    if (unreadNotifs.length === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })));
    setUnreadCount(0);

    // Persist all in parallel; rollback not implemented for batch (acceptable)
    await Promise.all(unreadNotifs.map((n) => markNotificationAsRead(n.id)));
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
