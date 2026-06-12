// Firebase configuration — Your SpaceECE project credentials
const firebaseConfig = {
  apiKey: "AIzaSyCak7soakNuc_Yi4T8kLLpnANjkq-8uUIg",
  authDomain: "spaceece-82a58.firebaseapp.com",
  projectId: "spaceece-82a58",
  storageBucket: "spaceece-82a58.firebasestorage.app",
  messagingSenderId: "109356466572",
  appId: "1:109356466572:web:fb39accb4c80e0ded996a9",
  measurementId: "G-PG0XQRH3T9"
};

// Firebase is now ENABLED and ready to use!
export const FIREBASE_ENABLED = true;

let db = null;
let auth = null;

export async function initFirebase() {
  if (!FIREBASE_ENABLED) return null;
  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    return { db, auth };
  } catch (e) {
    console.warn('Firebase init failed, using localStorage fallback:', e);
    return null;
  }
}

export function getDb() { return db; }
export function getAuth() { return auth; }
export default firebaseConfig;
