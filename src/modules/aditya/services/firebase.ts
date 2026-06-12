import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCak7soakNuc_Yi4T8kLLpnANjkq-8uUIg",
  authDomain: "spaceece-82a58.firebaseapp.com",
  projectId: "spaceece-82a58",
  storageBucket: "spaceece-82a58.firebasestorage.app",
  messagingSenderId: "109356466572",
  appId: "1:109356466572:web:fb39accb4c80e0ded996a9",
  measurementId: "G-PG0XQRH3T9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
