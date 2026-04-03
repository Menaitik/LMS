const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { getMyNotifications, markAsRead, markAllAsRead, deleteNotification } = require("../controllers/Notification");

router.get("/", auth, getMyNotifications);
router.patch("/:notificationId/read", auth, markAsRead);
router.patch("/read-all", auth, markAllAsRead);
router.delete("/:notificationId", auth, deleteNotification);

module.exports = router;
