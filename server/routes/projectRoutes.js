const express = require("express");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  removeMember,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { posterUpload } = require("../config/cloudinary");

const router = express.Router();

router.post("/create", protect, posterUpload.single("poster"), createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, posterUpload.single("poster"), updateProject);
router.delete("/:id/members/:memberId", protect, removeMember);
router.delete("/:id", protect, deleteProject);

module.exports = router;
