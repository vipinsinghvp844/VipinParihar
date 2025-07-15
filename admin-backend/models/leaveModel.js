const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  username: {
    type: String,
    required: true,
  },
  apply_date: {
    type: Date,
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  total_leave_days: {
    type: Number,
  },
  paid_leave_days: {
    type: Number,
    default: 0,
  },
  unpaid_leave_days: {
    type: Number,
    default: 0,
  },
  reason_for_leave: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["submitted", "accepted", "rejected"],
    default: "submitted",
  },
  hr_note: {
    type: String,
    default: "",
  },
}, { timestamps: true });

module.exports = mongoose.model("leavedatas", leaveSchema);
