const mongoose = require("mongoose");
const attendanceData = require("../models/attendanceApi");
const leaveSchema = require('../models/leaveModel');
const { response } = require("express");
const User = require("../models/User");



exports.attendanceCSV = async (req, res) => {
  try {
    const { role } = req.user;
    const { month, year } = req.query;

    if (role !== "admin" && role !== "hr") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const monthInt = parseInt(month); 
    const yearInt = parseInt(year);

    if (!monthInt || !yearInt) {
      return res.status(400).json({ message: "Month and Year are required" });
    }


    const daysInMonth = new Date(yearInt, monthInt, 0).getDate();


    const allUsers = await User.find({}, "username");
    const usernames = allUsers.map((u) => u.username);


    const monthStart = new Date(yearInt, monthInt - 1, 1);
    const monthEnd = new Date(yearInt, monthInt, 1);

    const attendanceRecords = await attendanceData.find({
      date: { $gte: monthStart, $lt: monthEnd },
      clockInTime: { $exists: true, $ne: null },
    });

    const leaveRecords = await leaveSchema.find({
      status: "accepted",
      $or: [
        { start_date: { $lt: monthEnd }, end_date: { $gte: monthStart } }
      ],
    });


    const result = usernames.map((username) => {
      const row = { username };
      let present = 0;
      let leave = 0;
      let absent = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(yearInt, monthInt - 1, day);
        currentDate.setHours(0, 0, 0, 0);

        const isPresent = attendanceRecords.some(
          (rec) =>
            rec.username === username &&
            new Date(rec.date).toDateString() === currentDate.toDateString()
        );

        const isOnLeave = leaveRecords.some((leave) => {
          return (
            leave.username === username &&
            leave.start_date <= currentDate &&
            leave.end_date >= currentDate
          );
        });

        if (isPresent) {
          row[day] = "P";
          present++;
        } else if (isOnLeave) {
          row[day] = "L";
          leave++;
        } else {
          row[day] = "A";
          absent++;
        }
      }
      row.totalPresent = present;
      row.totalLeave = leave;
      row.totalAbsent = absent;

      return row;
    });

    return res.status(200).json({
      month,
      year,
      days: daysInMonth,
      data: result,
    });
  } catch (err) {
    console.error("Failed to generate attendance export:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
