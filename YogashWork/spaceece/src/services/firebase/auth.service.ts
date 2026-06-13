import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import type { User } from '../../types';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  // Register with email and password
  async register(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update profile
      await updateProfile(firebaseUser, { displayName });

      // Create user document in Firestore
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        level: 1,
        xp: 0,
        totalScore: 0,
        streak: 0,
        lastLoginDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.id), user);
      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Login with email and password
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user document
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const user = userDoc.data() as User;

      // Update last login date
      await setDoc(
        doc(db, 'users', user.id),
        { lastLoginDate: new Date().toISOString() },
        { merge: true }
      );

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Login with Google
  async loginWithGoogle(): Promise<User> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      // Check if user exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const user = userDoc.data() as User;
        // Update last login
        await setDoc(
          doc(db, 'users', user.id),
          { lastLoginDate: new Date().toISOString() },
          { merge: true }
        );
        return user;
      } else {
        // Create new user
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || 'User',
          avatar: firebaseUser.photoURL || undefined,
          level: 1,
          xp: 0,
          totalScore: 0,
          streak: 0,
          lastLoginDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.id), user);
        return user;
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },
};
