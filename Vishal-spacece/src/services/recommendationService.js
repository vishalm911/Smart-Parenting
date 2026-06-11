import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

import { getDb } from "../firebase/firebase";

export const createRecommendation = async (recommendationData) => {
  const db = getDb();

  return await addDoc(
    collection(db, "recommendations"),
    recommendationData
  );
};

export const getRecommendations = async () => {
  const db = getDb();

  const snapshot = await getDocs(
    collection(db, "recommendations")
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const markRecommendationCompleted = async (id) => {
  const db = getDb();

  await updateDoc(
    doc(db, "recommendations", id),
    {
      is_completed: true
    }
  );
};