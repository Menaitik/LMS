const Notification = require("../models/Notification");

// ── Get my notifications ──────────────────────────────────────────────────────
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    return res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Mark one as read ──────────────────────────────────────────────────────────
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user.id },
      { isRead: true }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Mark all as read ──────────────────────────────────────────────────────────
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete a notification ─────────────────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findOneAndDelete({ _id: notificationId, recipient: req.user.id });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Helper: create a notification (used internally) ──────────────────────────
exports.createNotification = async ({ recipient, type, title, message, link = "" }) => {
  try {
    await Notification.create({ recipient, type, title, message, link });
  } catch (_) {
    // non-critical, swallow errors
  }
};
