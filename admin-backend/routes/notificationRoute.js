const express = require("express");
const router = express.Router();
const { createNotification, getNotifications, getNotificationsByUserId, markAsRead } = require("../controllers/notificationController");
console.log(getNotifications);

const protect = require("../middleware/auth");

router.post("/notification", protect, createNotification);
router.get("/notification", protect, getNotifications);
router.get("/notification/:receiverId", protect, getNotificationsByUserId);
router.post("/notification/read/:notificationId", protect, markAsRead);

module.exports = router;
