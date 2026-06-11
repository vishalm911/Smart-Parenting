export const detectLearningDelay = (
  scores
) => {

  const lowScores =
    scores.filter(
      score => score < 60
    );

  return lowScores.length >= 3;
};