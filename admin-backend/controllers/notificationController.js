const mongoose = require("mongoose");
const Notification = require("../models/notificationModel");

// Create Notification (Admin/HR only)
exports.createNotification = async (req, res) => {
  try {
    const { receiver_id, receiver_role, title, message, type } = req.body;
    const userRole = req.user.role;

    if (!["admin", "hr"].includes(userRole)) {
      return res.status(403).json({ error: "Only admin and HR can send notifications" });
    }

    if (!receiver_id || !title || !message || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const notification = new Notification({
      receiver_id,
      receiver_role,
      title,
      message,
      type,
    });

    await notification.save();
    res.status(201).json({ message: "Notification created successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get All Notifications (Only receiver or admin/hr can fetch)
exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;

    const query = user.role === "admin" || user.role === "hr"
      ? { receiver_id: user._id } // restrict to own unless implementing broader access
      : { receiver_id: user._id };

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Get Notifications by Receiver ID (Only receiver, admin, or HR)
exports.getNotificationsByUserId = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const user = req.user;

    if (String(receiverId) !== String(user._id) && !["admin", "hr"].includes(user.role)) {
      return res.status(403).json({ error: "You can only access your own notifications." });
    }

    const notifications = await Notification.find({ receiver_id: receiverId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark Notification as Read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const user = req.user;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (String(notification.receiver_id) !== String(user._id)) {
      return res.status(403).json({ error: "You cannot mark this notification as read" });
    }

    notification.is_read = true;
    await notification.save();

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update notification" });
  }
};
