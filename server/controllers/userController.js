const User = require("../models/User");
const Project = require("../models/Project");
const Request = require("../models/Request");
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const { hasCloudinaryConfig } = require("../config/cloudinary");
const { createDefaultProfileImage } = require("../constants/defaultAvatar");
const { USER_GENDERS } = require("../constants/genderPreferences");

const normaliseList = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (error) {
      // Ignore JSON parsing errors and fall back to comma-separated parsing.
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getUsers = asyncHandler(async (req, res) => {
  const { search, skill, excludeSelf } = req.query;
  const filters = [];

  if (excludeSelf === "true") {
    filters.push({ _id: { $ne: req.user._id } });
  }

  if (skill) {
    filters.push({ skills: { $regex: skill, $options: "i" } });
  }

  if (search) {
    filters.push({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ],
    });
  }

  const users = await User.find(filters.length ? { $and: filters } : {})
    .sort({ createdAt: -1 })
    .select("-__v");

  res.json({ users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-__v");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const projects = await Project.find({
    $or: [{ createdBy: user._id }, { members: user._id }],
  })
    .sort({ createdAt: -1 })
    .populate("createdBy", "name profileImage");

  res.json({ user, projects });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, bio, githubLink, availability, profileImageUrl, gender } = req.body;

  if (name !== undefined) {
    req.user.name = name;
  }

  if (bio !== undefined) {
    req.user.bio = bio;
  }

  if (githubLink !== undefined) {
    req.user.githubLink = githubLink;
  }

  if (availability !== undefined) {
    req.user.availability = availability;
  }

  if (gender !== undefined) {
    req.user.gender = USER_GENDERS.includes(gender) ? gender : "prefer-not-to-say";
  }

  if (req.body.skills !== undefined) {
    req.user.skills = normaliseList(req.body.skills);
  }

  if (req.body.interests !== undefined) {
    req.user.interests = normaliseList(req.body.interests);
  }

  if (req.file) {
    if (hasCloudinaryConfig && req.file.path) {
      req.user.profileImage = {
        url: req.file.path,
        publicId: req.file.filename || "",
      };
    } else if (req.file.buffer) {
      // Fallback to storing as a Base64 data URI if Cloudinary is not configured
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      req.user.profileImage = {
        url: base64Image,
        publicId: "",
      };
    } else {
      res.status(400);
      throw new Error("Unable to process the uploaded file.");
    }
  } else if (profileImageUrl !== undefined) {
    const trimmedProfileImageUrl = String(profileImageUrl || "").trim();

    req.user.profileImage = {
      ...(trimmedProfileImageUrl ? req.user.profileImage || {} : createDefaultProfileImage()),
      url: trimmedProfileImageUrl || createDefaultProfileImage().url,
      publicId: "",
    };
  }

  const user = await req.user.save();
  res.json({ user });
});

const toggleBookmark = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    res.status(404);
    throw new Error("Project not found.");
  }

  const existingBookmark = req.user.bookmarks.find(
    (bookmarkId) => bookmarkId.toString() === project._id.toString()
  );

  if (existingBookmark) {
    req.user.bookmarks = req.user.bookmarks.filter(
      (bookmarkId) => bookmarkId.toString() !== project._id.toString()
    );
    project.bookmarkedBy = project.bookmarkedBy.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );
  } else {
    req.user.bookmarks.push(project._id);
    project.bookmarkedBy.push(req.user._id);
  }

  await Promise.all([req.user.save(), project.save()]);

  res.json({
    bookmarks: req.user.bookmarks,
    message: existingBookmark ? "Bookmark removed." : "Project bookmarked.",
  });
});

const getAdminOverview = asyncHandler(async (req, res) => {
  const [userCount, projectCount, requestCount, notificationCount] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Request.countDocuments(),
    Notification.countDocuments(),
  ]);

  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
  const recentProjects = await Project.find()
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    stats: {
      userCount,
      projectCount,
      requestCount,
      notificationCount,
    },
    recentUsers,
    recentProjects,
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  toggleBookmark,
  getAdminOverview,
};
