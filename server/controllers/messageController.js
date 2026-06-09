const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const emitMessage = (req, receiverId, message) => {
  const io = req.app.get("io");
  if (io) {
    io.to(receiverId.toString()).emit("message:new", message);
  }
};

const emitNotification = (req, receiverId, notification) => {
  const io = req.app.get("io");
  if (io) {
    io.to(receiverId.toString()).emit("notification:new", notification);
  }
};

const getConversationList = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }],
  })
    .populate("sender", "name profileImage availability skills")
    .populate("receiver", "name profileImage availability skills")
    .sort({ createdAt: -1 });

  const conversations = [];
  const seen = new Set();

  for (const message of messages) {
    const otherUser =
      message.sender._id.toString() === req.user._id.toString()
        ? message.receiver
        : message.sender;

    if (!seen.has(otherUser._id.toString())) {
      seen.add(otherUser._id.toString());
      conversations.push({
        user: otherUser,
        lastMessage: message.message,
        updatedAt: message.createdAt,
      });
    }
  }

  res.json({ conversations });
});

const getMessages = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot open a chat with yourself.");
  }

  const otherUser = await User.findById(req.params.id).select("name profileImage");

  if (!otherUser) {
    res.status(404);
    throw new Error("Chat user not found.");
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: req.params.id },
      { sender: req.params.id, receiver: req.user._id },
    ],
  })
    .populate("sender", "name profileImage")
    .populate("receiver", "name profileImage")
    .sort({ createdAt: 1 });

  res.json({ otherUser, messages });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { receiver, message, projectId } = req.body;

  if (!receiver || !message) {
    res.status(400);
    throw new Error("receiver and message are required.");
  }

  if (receiver.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot message yourself.");
  }

  const receiverUser = await User.findById(receiver);

  if (!receiverUser) {
    res.status(404);
    throw new Error("Receiver not found.");
  }

  const createdMessage = await Message.create({
    sender: req.user._id,
    receiver,
    message,
    projectId: projectId || undefined,
  });

  const populatedMessage = await Message.findById(createdMessage._id)
    .populate("sender", "name profileImage")
    .populate("receiver", "name profileImage");

  const notification = await Notification.create({
    userId: receiver,
    text: `New message from ${req.user.name}.`,
    type: "message",
    referenceId: createdMessage._id,
    referenceModel: "Message",
  });

  emitMessage(req, receiver, populatedMessage);
  emitNotification(req, receiver, notification);

  res.status(201).json({ message: populatedMessage });
});

module.exports = {
  getConversationList,
  getMessages,
  sendMessage,
};
