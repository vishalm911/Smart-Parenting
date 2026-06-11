export const activateUser = (uid) => {
  return {
    uid,
    status: "active"
  };
};

export const deactivateUser = (uid) => {
  return {
    uid,
    status: "inactive"
  };
};

export const toggleFeatureFlag = (
  flag,
  value
) => {
  return {
    flag,
    value
  };
};

export const getPlatformStats = () => {
  return {
    totalUsers: 0,
    activeUsers: 0,
    totalChildren: 0
  };
};