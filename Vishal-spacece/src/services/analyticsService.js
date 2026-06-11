import { FirestoreRepository } from "../repositories/FirestoreRepository";
import { COLLECTIONS } from "../constants/collections";

const repository = new FirestoreRepository();

export const getChildAnalytics = async () => {
  return await repository.getAll(
    COLLECTIONS.PROGRESS_TRACKING
  );
};

export const getLanguageScores = async () => {
  return await repository.getAll(
    "language_scores"
  );
};

export const getNumeracyScores = async () => {
  return await repository.getAll(
    "numeracy_scores"
  );
};