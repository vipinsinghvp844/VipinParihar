const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender_username: {
      type: String,
      required: true,
    },
    receiver_username: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    media: {
      base64: { type: String, default: "" },
      type: { type: String, enum: ["image", "video", "audio", "none"], default: "none" },
    },
    read_status: {
      type: Number,
      default: 0, // 0 = unread, 1 = read
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_by_sender: {
      type: Boolean,
      default:false,
    },
    deleted_by_receiver: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
