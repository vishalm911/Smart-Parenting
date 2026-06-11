export const awardCoins = async (
  childId,
  coinsEarned = 10
) => {

  return {
    childId,
    coinsEarned,
    success: true
  };
};

export const deductCoins = async (
  childId,
  coins
) => {

  return {
    childId,
    coinsDeducted: coins,
    success: true
  };
};

export const getCoinBalance = async (
  childId
) => {

  return {
    childId,
    balance: 0
  };
};