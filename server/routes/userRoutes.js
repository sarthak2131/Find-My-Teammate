const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  toggleBookmark,
  getAdminOverview,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/admin/overview", protect, adminOnly, getAdminOverview);
router.put("/update", protect, upload.single("profileImage"), updateUser);
router.put("/bookmarks/:projectId", protect, toggleBookmark);
router.get("/:id", protect, getUserById);

module.exports = router;

