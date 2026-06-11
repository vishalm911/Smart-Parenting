import admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

export const createChildProfile = async (data) => {
  const docRef = await db.collection("child_profiles").add({
    ...data,
    created_at: new Date(),
    updated_at: new Date()
  });

  return docRef.id;
};

export const updateActivityScore = async (
  childId,
  score
) => {

  await db.collection("assessments").add({
    childId,
    score,
    created_at: new Date()
  });

  await db
    .collection("progress_tracking")
    .doc(childId)
    .set(
      {
        latestScore: score,
        updated_at: new Date()
      },
      { merge: true }
    );
};

export const getRecommendations = async (
  childId
) => {

  const snapshot = await db
    .collection("recommendations")
    .where("childId", "==", childId)
    .limit(3)
    .get();

  return snapshot.docs.map(
    doc => doc.data()
  );
};

export const generateWeeklyReport = async (
  childId
) => {

  const report = {
    childId,
    generatedAt: new Date(),
    status: "generated"
  };

  await db.collection("reports").add(report);

  return report;
};

export const flagLearningDelay = async (
  childId
) => {

  await db.collection("ai_analysis").add({
    childId,
    learning_delay_flag: true,
    created_at: new Date()
  });
};