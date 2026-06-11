export const logAction = (
  action,
  userId,
  collectionAffected
) => {

  return {
    action,
    userId,
    collectionAffected,
    timestamp: new Date()
  };
};

export const getLogs = () => {
  return [];
};