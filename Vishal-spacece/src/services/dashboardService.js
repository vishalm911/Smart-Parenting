import { FirestoreRepository } from "../repositories/FirestoreRepository";

const repository = new FirestoreRepository();

export const getDashboardData = async () => {

  const achievements =
    await repository.getAll("achievements");

  const rewards =
    await repository.getAll("rewards");

  const streaks =
    await repository.getAll("streaks");

  return {
    achievements,
    rewards,
    streaks
  };
};