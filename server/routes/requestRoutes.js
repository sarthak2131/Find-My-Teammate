const express = require("express");
const {
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
} = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getRequests);
router.post("/send", protect, sendRequest);
router.put("/accept", protect, acceptRequest);
router.put("/reject", protect, rejectRequest);

module.exports = router;

