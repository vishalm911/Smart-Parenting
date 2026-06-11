import {
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";

import { getDb } from "../firebase/firebase";

export const createAssessment = async (assessmentData) => {
  const db = getDb();

  return await addDoc(
    collection(db, "assessments"),
    assessmentData
  );
};

export const getAssessments = async () => {
  const db = getDb();

  const snapshot = await getDocs(
    collection(db, "assessments")
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};