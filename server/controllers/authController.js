const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { USER_GENDERS } = require("../constants/genderPreferences");

const generateToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const buildAuthPayload = (user) => ({
  token: generateToken(user._id, user.role),
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skills: user.skills,
    interests: user.interests,
    bio: user.bio,
    profileImage: user.profileImage,
    avatar: user.profileImage?.url || user.avatar,
    githubLink: user.githubLink,
    availability: user.availability,
    gender: user.gender,
    bookmarks: user.bookmarks,
    createdAt: user.createdAt,
  },
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, gender } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    gender: USER_GENDERS.includes(gender) ? gender : "prefer-not-to-say",
  });

  res.status(201).json(buildAuthPayload(user));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  res.json(buildAuthPayload(user));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { registerUser, loginUser, getCurrentUser };
