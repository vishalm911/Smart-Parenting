import {
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";

import { getDb } from "../firebase/firebase";

export const createProgressRecord = async (progressData) => {
  const db = getDb();

  return await addDoc(
    collection(db, "progress_tracking"),
    progressData
  );
};

export const getProgressRecords = async () => {
  const db = getDb();

  const snapshot = await getDocs(
    collection(db, "progress_tracking")
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};