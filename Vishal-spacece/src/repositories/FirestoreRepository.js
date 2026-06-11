import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import { getDb } from "../firebase/firebase";

export class FirestoreRepository {

  async create(collectionName, data) {
    const db = getDb();

    return await addDoc(
      collection(db, collectionName),
      data
    );
  }

  async getAll(collectionName) {
    const db = getDb();

    const snapshot = await getDocs(
      collection(db, collectionName)
    );

    return snapshot.docs.map(document => ({
      id: document.id,
      ...document.data()
    }));
  }

  async getById(collectionName, id) {
    const db = getDb();

    const document = await getDoc(
      doc(db, collectionName, id)
    );

    if (!document.exists()) {
      return null;
    }

    return {
      id: document.id,
      ...document.data()
    };
  }

  async update(collectionName, id, data) {
    const db = getDb();

    await updateDoc(
      doc(db, collectionName, id),
      data
    );
  }

  async delete(collectionName, id) {
    const db = getDb();

    await deleteDoc(
      doc(db, collectionName, id)
    );
  }
}