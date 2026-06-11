export const validateAssessment = (
  assessmentData
) => {

  const errors = [];

  if (!assessmentData.childId) {
    errors.push(
      "Child ID is required"
    );
  }

  if (
    assessmentData.score < 0 ||
    assessmentData.score > 100
  ) {
    errors.push(
      "Score must be between 0 and 100"
    );
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};