const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ notifications });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  notification.isRead = true;
  await notification.save();

  res.json({ notification });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: "All notifications marked as read." });
});

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};

