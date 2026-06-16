import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  updateProfile,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider } from './config';

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Register a new user with email and password
 */
export const registerWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await sendEmailVerification(result.user);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Sign in with Google OAuth
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Sign out the current user
 */
export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Send email verification to current user
 */
export const sendVerificationEmail = async () => {
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      return { error: null };
    }
    return { error: 'No user is currently signed in.' };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Update user email — uses verifyBeforeUpdateEmail (Firebase v9+).
 * Sends a verification email to the new address; the change only
 * takes effect once the user clicks the link in that email.
 */
export const changeEmail = async (newEmail, currentPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) return { error: 'No user is currently signed in.' };

    // Re-authenticate first (required by Firebase for sensitive operations)
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Send verification to new address; change applies after user clicks link
    await verifyBeforeUpdateEmail(user, newEmail);
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Update user password
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) return { error: 'No user is currently signed in.' };

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { error: null };
  } catch (error) {
    return { error: getAuthErrorMessage(error.code) };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get the current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Force-reload the current user's profile from Firebase.
 * Call this after the user clicks an email verification link so that
 * emailVerified reflects the new state without requiring a sign-out/sign-in.
 */
export const reloadUser = async () => {
  try {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      return { user: auth.currentUser, error: null };
    }
    return { user: null, error: 'No user signed in.' };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please register first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/requires-recent-login': 'Please sign in again to perform this action.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
  };
  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};
