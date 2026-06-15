import { defaultAvatar } from "./defaultAvatar";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normaliseItems = (items = []) =>
  [...new Set((items || []).map((item) => String(item).trim()).filter(Boolean))];

const normaliseTokens = (items = []) =>
  normaliseItems(items).map((item) => item.toLowerCase());

export const getProjectCapacity = (project) => clamp(Number(project?.maxMembers) || 4, 1, 12);

export const getProjectMemberCount = (project) => project?.members?.length || 0;

export const getProjectOpenSpots = (project) =>
  Math.max(0, getProjectCapacity(project) - getProjectMemberCount(project));

export const isProjectFull = (project) => getProjectOpenSpots(project) === 0;

export const getProjectTimelineInsight = (project) => {
  if (!project?.deadline) {
    return {
      label: "Flexible",
      tone: "slate",
      daysLeft: null,
    };
  }

  const now = new Date();
  const deadline = new Date(project.deadline);
  const diffMs = deadline.setHours(23, 59, 59, 999) - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { label: "Overdue", tone: "red", daysLeft };
  }

  if (daysLeft <= 3) {
    return { label: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`, tone: "red", daysLeft };
  }

  if (daysLeft <= 10) {
    return { label: `${daysLeft} days left`, tone: "amber", daysLeft };
  }

  return { label: `${daysLeft} days left`, tone: "green", daysLeft };
};

export const getProjectFitInsights = (project, user) => {
  const requiredSkills = normaliseItems(project?.requiredSkills || []);
  const requiredTokens = normaliseTokens(requiredSkills);
  const userSkills = normaliseItems(user?.skills || []);
  const userTokens = new Set(normaliseTokens(userSkills));
  const matchedSkills = requiredSkills.filter((skill, index) => userTokens.has(requiredTokens[index]));
  const missingSkills = requiredSkills.filter((skill, index) => !userTokens.has(requiredTokens[index]));
  const coverage = requiredSkills.length ? matchedSkills.length / requiredSkills.length : 1;

  const profileBonus =
    (user?.bio ? 6 : 0) +
    (user?.githubLink ? 6 : 0) +
    ((user?.skills || []).length >= 4 ? 8 : (user?.skills || []).length >= 2 ? 4 : 0) +
    ((user?.interests || []).length >= 2 ? 4 : 0);

  const opennessBonus = isProjectFull(project) ? 0 : 6;
  const fitScore = clamp(Math.round(coverage * 70 + profileBonus + opennessBonus), 32, 99);

  let verdict = "Developing fit";
  if (fitScore >= 85) verdict = "Excellent fit";
  else if (fitScore >= 70) verdict = "Strong fit";
  else if (fitScore >= 55) verdict = "Good fit";

  return {
    fitScore,
    verdict,
    matchedSkills,
    missingSkills,
    matchedCount: matchedSkills.length,
    requiredCount: requiredSkills.length,
    coveragePercent: Math.round(coverage * 100),
  };
};

export const getProjectReadiness = (project) => {
  const checks = [
    { label: "Clear title", ok: Boolean(project?.title?.trim()) },
    { label: "Detailed description", ok: (project?.description || "").trim().length >= 80 },
    { label: "Skill requirements", ok: (project?.requiredSkills || []).length >= 3 },
    { label: "Deadline added", ok: Boolean(project?.deadline) },
    { label: "Role note", ok: Boolean(project?.preferredTeammateNote?.trim()) },
    { label: "Poster uploaded", ok: Boolean(project?.posterUrl) },
    { label: "Team capacity set", ok: Boolean(project?.maxMembers) },
  ];

  const completed = checks.filter((check) => check.ok);
  const score = Math.round((completed.length / checks.length) * 100);

  return {
    score,
    completedCount: completed.length,
    totalCount: checks.length,
    missingItems: checks.filter((check) => !check.ok).map((check) => check.label),
  };
};

