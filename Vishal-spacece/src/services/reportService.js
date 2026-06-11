export const createReport = (
  childId,
  scores
) => {

  return {
    childId,
    scores,
    generatedAt: new Date()
  };
};