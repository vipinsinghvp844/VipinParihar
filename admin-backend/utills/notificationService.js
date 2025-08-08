const Notification = require("../models/Notification");
const User = require("../models/User");

// Send to all HRs and Admins
exports.notifyHRAndAdmin = async ({ title, message, type }) => {
  const recipients = await User.find({ role: { $in: ["admin", "hr"] } });

  const notifications = recipients.map(user => ({
    receiver_id: user._id,
    receiver_role: user.role,
    title,
    message,
    type,
  }));

  await Notification.insertMany(notifications);
};

// Send to a specific user
exports.notifyUser = async ({ userId, role, title, message, type }) => {
  const notification = new Notification({
    receiver_id: userId,
    receiver_role: role,
    title,
    message,
    type,
  });
  await notification.save();
};
