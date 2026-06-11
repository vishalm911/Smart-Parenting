import {
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";

import { getDb } from "../firebase/firebase";

export const createNotification = async (notificationData) => {
  const db = getDb();

  return await addDoc(
    collection(db, "notifications"),
    notificationData
  );
};

export const getNotifications = async () => {
  const db = getDb();

  const snapshot = await getDocs(
    collection(db, "notifications")
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};