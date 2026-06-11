export const unlockAchievement = (
  score,
  domain
) => {

  if (score >= 90) {
    return {
      unlocked: true,
      badge: `${domain} Champion`
    };
  }

  return {
    unlocked: false
  };
};