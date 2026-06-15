const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  toggleBookmark,
  getAdminOverview,
  suspendUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/admin/overview", protect, adminOnly, getAdminOverview);
router.put("/update", protect, upload.single("profileImage"), updateUser);
router.put("/bookmarks/:projectId", protect, toggleBookmark);
router.put("/:id/suspend", protect, adminOnly, suspendUser);
router.delete("/:id", protect, adminOnly, deleteUser);
router.get("/:id", protect, getUserById);

module.exports = router;

