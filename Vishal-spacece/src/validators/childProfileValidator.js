export const validateChildProfile = (
  profileData
) => {

  const errors = [];

  if (!profileData.name) {
    errors.push("Name is required");
  }

  if (!profileData.age_group) {
    errors.push("Age group is required");
  }

  if (!profileData.parent_uid) {
    errors.push("Parent UID is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};