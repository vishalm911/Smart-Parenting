export const updateVersion = (
  version
) => {

  return {
    version
  };
};

export const setMaintenanceMode = (
  enabled
) => {

  return {
    maintenanceMode: enabled
  };
};

export const updateFeatureFlags = (
  flags
) => {

  return flags;
};