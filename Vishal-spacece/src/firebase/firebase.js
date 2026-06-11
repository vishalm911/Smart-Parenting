import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCak7soakNuc_Yi4T8kLLpnANjkq-8uUIg",
  authDomain: "spaceece-82a58.firebaseapp.com",
  projectId: "spaceece-82a58",
  storageBucket: "spaceece-82a58.firebasestorage.app",
  messagingSenderId: "109356466572",
  appId: "1:109356466572:web:fb39accb4c80e0ded996a9"
};

let db = null;

export const initFirebase = async () => {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
};

export const getDb = () => db;