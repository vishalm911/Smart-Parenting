import {
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";

import { getDb } from "../firebase/firebase";

export const createUserAccount = async (
  userData
) => {

  const db = getDb();

  return await addDoc(
    collection(db, "user_accounts"),
    userData
  );
};

export const getUserAccounts = async () => {

  const db = getDb();

  const snapshot = await getDocs(
    collection(db, "user_accounts")
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};