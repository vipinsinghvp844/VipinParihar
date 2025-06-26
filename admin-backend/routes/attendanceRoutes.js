const express = require("express");
const {
  addAttendance,
  getUserAttendance,
  updateAttendance,
  getAttendanceByUserId,
  getUserAttendanceIdAndDate,
  getUserAttendanceByDate,
} = require("../controllers/attendanceController");
const router = express.Router();
const protect = require("../middleware/auth");

router.post("/mark-attendance", protect, addAttendance);
router.get("/get-all-attendance", protect, getUserAttendance);
router.put("/update-attendance", protect, updateAttendance);
router.get("/get-Attendance-by-id", protect, getAttendanceByUserId);
router.get('/get-attendance-date/:userId/:currentDate', protect, getUserAttendanceIdAndDate);
router.get('/attendance-get-by-date/:date', protect, getUserAttendanceByDate)

module.exports = router;
