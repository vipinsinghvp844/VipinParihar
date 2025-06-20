const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
  },
  clockInTime: {
    type: Date,
    default: null,
  },
  clockOutTime: {
    type: Date,
    default: null,
  },
  totalWork:String,
  breaks: [
    {
      breakInTime: {
        type: Date,
        required: true,
      },
      breakOutTime: {
        type: Date,
        default: null,
      },
      durations : String,
    },
  ],
  totalBreak :String,
});
attendanceSchema.index({ user_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("attendanceData", attendanceSchema);
