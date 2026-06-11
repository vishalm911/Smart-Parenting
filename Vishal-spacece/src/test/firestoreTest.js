import { initFirebase, getDb } from "../firebase/firebase.js";
import { collection, getDocs } from "firebase/firestore";

async function testFirestore() {
  await initFirebase();

  const db = getDb();

  const snapshot = await getDocs(
    collection(db, "child_profiles")
  );

  console.log(
    snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  );
}

testFirestore();