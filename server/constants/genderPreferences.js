const USER_GENDERS = ["male", "female", "prefer-not-to-say"];
const PROJECT_GENDER_PREFERENCES = ["any", "male", "female"];
const MATCHABLE_USER_GENDERS = ["male", "female"];

const getProjectGenderAudienceLabel = (value) => {
  if (value === "male") {
    return "male teammates";
  }

  if (value === "female") {
    return "female teammates";
  }

  return "all teammates";
};

module.exports = {
  USER_GENDERS,
  PROJECT_GENDER_PREFERENCES,
  MATCHABLE_USER_GENDERS,
  getProjectGenderAudienceLabel,
};
