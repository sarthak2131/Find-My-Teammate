const Project = require("../models/Project");
const Request = require("../models/Request");
const Report = require("../models/Report");
const asyncHandler = require("../middleware/asyncHandler");
const { PROJECT_GENDER_PREFERENCES } = require("../constants/genderPreferences");
const { hasCloudinaryConfig } = require("../config/cloudinary");

const resolvePosterUrl = (req) => {
  if (req.file) {
    if (hasCloudinaryConfig && req.file.path) {
      return req.file.path;
    }

    if (req.file.buffer) {
      return `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    return "";
  }

  const posterUrl = String(req.body.posterUrl || "").trim();

  if (posterUrl.length > 12 * 1024 * 1024) {
    const error = new Error("Poster is too large. Upload a smaller image or video (max 10MB).");
    error.statusCode = 413;
    throw error;
  }

  return posterUrl;
};

const normaliseList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseMaxMembers = (value, fallback = 4) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(12, Math.max(1, parsed));
};

const createProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requiredSkills,
    maxMembers,
    deadline,
    status,
    preferredGender,
    preferredTeammateNote,
    isHackathon,
    hackathonName,
    venue,
    prizePool,
  } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error("Title and description are required.");
  }

  const project = await Project.create({
    title,
    description,
    requiredSkills: normaliseList(requiredSkills),
    maxMembers: parseMaxMembers(maxMembers, 4),
    deadline: deadline || undefined,
    status: status || "open",
    preferredGender: PROJECT_GENDER_PREFERENCES.includes(preferredGender) ? preferredGender : "any",
    preferredTeammateNote: String(preferredTeammateNote || "").trim(),
    posterUrl: resolvePosterUrl(req),
    createdBy: req.user._id,
    teamLead: req.user._id,
    members: [req.user._id],
    isShowcase: req.body.isShowcase === "true" || req.body.isShowcase === true,
    isHackathon: isHackathon === "true" || isHackathon === true,
    hackathonName: String(hackathonName || "").trim(),
    venue: String(venue || "").trim(),
    prizePool: String(prizePool || "").trim(),
  });

  const populatedProject = await Project.findById(project._id)
    .populate("createdBy", "name email profileImage gender")
    .populate("members", "name email profileImage gender");

  res.status(201).json({ project: populatedProject });
});

const getProjects = asyncHandler(async (req, res) => {
  const { status, search, skill, mine, owner, excludeOwner, preferredGender, liked, excludeShowcase } = req.query;
  const filters = [];

  if (status) {
    filters.push({ status });
  }

  if (mine === "true") {
    filters.push({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    });
  }

  if (liked === "true") {
    filters.push({ bookmarkedBy: req.user._id });
  }

  if (owner) {
    filters.push({ createdBy: owner });
  }

  if (excludeOwner === "true") {
    filters.push({ createdBy: { $ne: req.user._id } });
  }

  if (excludeShowcase === "true") {
    filters.push({ isShowcase: { $ne: true } });
  }

  // Filter by type: hackathon vs project
  if (req.query.isHackathon === "true") {
    filters.push({ isHackathon: true });
  } else if (req.query.isHackathon === "false") {
    filters.push({ $or: [{ isHackathon: false }, { isHackathon: { $exists: false } }] });
  }

  if (skill) {
    filters.push({ requiredSkills: { $regex: skill, $options: "i" } });
  }

  if (PROJECT_GENDER_PREFERENCES.includes(preferredGender) && preferredGender !== "any") {
    filters.push({ preferredGender });
  } else if (preferredGender === "any") {
    filters.push({ preferredGender: "any" });
  }

  if (search) {
    filters.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requiredSkills: { $regex: search, $options: "i" } },
        { preferredTeammateNote: { $regex: search, $options: "i" } },
      ],
    });
  }

  const projects = await Project.find(filters.length ? { $and: filters } : {})
    .populate("createdBy", "name email profileImage skills gender")
    .populate("members", "name email profileImage gender")
    .sort({ createdAt: -1 });

  res.json({ projects });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("createdBy", "name email profileImage bio skills githubLink gender")
    .populate("teamLead", "name email profileImage gender")
    .populate("members", "name email profileImage skills gender");

  if (!project) {
    res.status(404);
    throw new Error("Project not found.");
  }

  const isOwner = project.createdBy._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  const requestQuery =
    isOwner || isAdmin
      ? { projectId: project._id }
      : { projectId: project._id, $or: [{ sender: req.user._id }, { receiver: req.user._id }] };

  const requests = await Request.find(requestQuery)
    .populate("sender", "name email profileImage skills")
    .populate("receiver", "name email profileImage")
    .sort({ createdAt: -1 });

  res.json({ project, requests });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found.");
  }

  const isOwner = project.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("You can only delete your own projects.");
  }

  await Request.deleteMany({ projectId: project._id });
  await Report.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({ message: "Project deleted successfully." });
});

const removeMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found.");
  }

  const isOwner = project.createdBy.toString() === req.user._id.toString();
  const isTeamLead = project.teamLead.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isTeamLead && !isAdmin) {
    res.status(403);
    throw new Error("Only the project lead can remove teammates.");
  }

  if (
    project.createdBy.toString() === memberId ||
    project.teamLead.toString() === memberId
  ) {
    res.status(400);
    throw new Error("The project lead cannot be removed from the team.");
  }

  const wasMember = project.members.some((existingMemberId) => existingMemberId.toString() === memberId);

  if (!wasMember) {
    res.status(404);
    throw new Error("This user is not part of the project team.");
  }

  project.members = project.members.filter(
    (existingMemberId) => existingMemberId.toString() !== memberId
  );
  await project.save();

  const updatedProject = await Project.findById(project._id)
    .populate("createdBy", "name email profileImage skills gender")
    .populate("members", "name email profileImage skills gender");

  res.json({
    message: "Teammate removed successfully.",
    project: updatedProject,
  });
});

const updateProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requiredSkills,
    maxMembers,
    deadline,
    status,
    preferredGender,
    preferredTeammateNote,
  } = req.body;

  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found.");
  }

  const isOwner = project.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("You are not authorized to update this project.");
  }

  if (title) project.title = title;
  if (description) project.description = description;
  if (requiredSkills !== undefined) project.requiredSkills = normaliseList(requiredSkills);
  if (maxMembers !== undefined) {
    const nextMaxMembers = parseMaxMembers(maxMembers, project.maxMembers || 4);

    if ((project.members?.length || 0) > nextMaxMembers) {
      res.status(400);
      throw new Error("Max members cannot be less than the current team size.");
    }

    project.maxMembers = nextMaxMembers;
  }
  if (deadline !== undefined) project.deadline = deadline || undefined;
  if (status !== undefined) project.status = status || "open";
  if (preferredGender !== undefined) {
    project.preferredGender = PROJECT_GENDER_PREFERENCES.includes(preferredGender) ? preferredGender : "any";
  }
  if (preferredTeammateNote !== undefined) {
    project.preferredTeammateNote = String(preferredTeammateNote || "").trim();
  }

  if (req.file || req.body.posterUrl !== undefined) {
    project.posterUrl = resolvePosterUrl(req);
  }

  // Update hackathon-specific fields if provided
  if (req.body.hackathonName !== undefined) project.hackathonName = String(req.body.hackathonName || "").trim();
  if (req.body.venue !== undefined) project.venue = String(req.body.venue || "").trim();
  if (req.body.prizePool !== undefined) project.prizePool = String(req.body.prizePool || "").trim();

  await project.save();

  const populatedProject = await Project.findById(project._id)
    .populate("createdBy", "name email profileImage skills gender")
    .populate("members", "name email profileImage skills gender");

  res.json({ project: populatedProject });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  removeMember,
};
