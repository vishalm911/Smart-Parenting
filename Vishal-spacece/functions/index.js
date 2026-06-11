import admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * createChildProfile
 */
export const createChildProfile = async (data) => {
  const childProfile = {
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
    coins: 0,
    stars: 0
  };

  const docRef = await db
    .collection("child_profiles")
    .add(childProfile);

  return {
    success: true,
    id: docRef.id
  };
};

/**
 * updateActivityScore
 */
export const updateActivityScore = async (
  childId,
  activityId,
  score,
  domain
) => {

  const batch = db.batch();

  const assessmentRef = db
    .collection("assessments")
    .doc();

  batch.set(assessmentRef, {
    child_id: childId,
    activity_id: activityId,
    score,
    domain,
    created_at: new Date()
  });

  const progressRef = db
    .collection("progress_tracking")
    .doc(childId);

  batch.set(
    progressRef,
    {
      latest_score: score,
      domain,
      updated_at: new Date()
    },
    { merge: true }
  );

  await batch.commit();

  return {
    success: true
  };
};

/**
 * getRecommendations
 */
export const getRecommendations = async (
  childId
) => {

  const snapshot = await db
    .collection("recommendations")
    .where(
      "child_id",
      "==",
      childId
    )
    .limit(3)
    .get();

  return snapshot.docs.map(
    doc => doc.data()
  );
};

/**
 * generateWeeklyReport
 */
export const generateWeeklyReport = async (
  childId
) => {

  const report = {
    child_id: childId,
    generated_at: new Date(),
    status: "completed"
  };

  await db
    .collection("reports")
    .add(report);

  return report;
};

/**
 * flagLearningDelay
 */
export const flagLearningDelay = async (
  childId
) => {

  await db
    .collection("ai_analysis")
    .add({
      child_id: childId,
      learning_delay_flag: true,
      created_at: new Date()
    });

  return {
    success: true
  };
};
