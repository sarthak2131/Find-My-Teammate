const express = require("express");
const {
  getConversationList,
  getMessages,
  sendMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getConversationList);
router.get("/:id", protect, getMessages);
router.post("/send", protect, sendMessage);

module.exports = router;

