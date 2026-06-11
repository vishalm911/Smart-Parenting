import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import { getDb } from "../firebase/firebase";

export const createChildProfile = async (profileData) => {
  try {
    if (!profileData.name) {
      throw new Error("Child name is required");
    }

    const db = getDb();

    const result = await addDoc(
      collection(db, "child_profiles"),
      profileData
    );

    return {
      success: true,
      id: result.id
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};