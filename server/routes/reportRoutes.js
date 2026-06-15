const express = require("express");
const {
  createReport,
  getReports,
  resolveReport,
} = require("../controllers/reportController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReport);
router.get("/", protect, adminOnly, getReports);
router.put("/:id", protect, adminOnly, resolveReport);

module.exports = router;
