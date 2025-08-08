const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  receiver_role: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String, // e.g., "leave", "birthday", "announcement"
    required: true,
  },
  is_read: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true }); // auto adds createdAt & updatedAt

module.exports = mongoose.model("Notification", notificationSchema);
