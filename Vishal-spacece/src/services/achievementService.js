export const unlockAchievement = (
  score
) => {

  if (score >= 90) {
    return {
      unlocked: true,
      badge: "Top Performer"
    };
  }

  return {
    unlocked: false
  };
};