export const USER_GENDER_OPTIONS = [
  { value: "prefer-not-to-say", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export const PROJECT_GENDER_OPTIONS = [
  { value: "any", label: "Anyone can join" },
  { value: "male", label: "Male teammates only" },
  { value: "female", label: "Female teammates only" },
];

export const getUserGenderLabel = (gender) => {
  if (gender === "male") {
    return "Male";
  }

  if (gender === "female") {
    return "Female";
  }

  return "Prefer not to say";
};

export const getProjectGenderLabel = (preferredGender) => {
  if (preferredGender === "male") {
    return "Male teammates only";
  }

  if (preferredGender === "female") {
    return "Female teammates only";
  }

  return "Open to all teammates";
};

export const getProjectEligibility = ({ project, user }) => {
  const preferredGender = project?.preferredGender || "any";

  if (preferredGender === "any") {
    return { allowed: true, message: "" };
  }

  if (!user || !["male", "female"].includes(user.gender)) {
    return {
      allowed: false,
      message: `This project is only for ${preferredGender} teammates. Update your profile gender first.`,
    };
  }

  if (user.gender !== preferredGender) {
    return {
      allowed: false,
      message: `This project is only for ${preferredGender} teammates.`,
    };
  }

  return { allowed: true, message: "" };
};
