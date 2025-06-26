const mongoose = require("mongoose");
const attendanceData = require("../models/attendanceApi");
const { response } = require("express");

// 🧠 Helper function to calculate break durations
const getBreakDurations = (breaks) => {
  let totalMilliseconds = 0;

  const detailedBreaks = breaks.map((b) => {
    let durations = null;
    if (b.breakInTime && b.breakOutTime) {
      const diff = new Date(b.breakOutTime) - new Date(b.breakInTime); 
      if (!isNaN(diff) && diff > 0) {
        totalMilliseconds += diff;
        const mins = Math.floor(diff / 1000 / 60);
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        durations = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }
    }
    return {
      breakInTime: b.breakInTime,
      breakOutTime: b.breakOutTime,
      durations,
    };
  });

  const totalMinutes = Math.floor(totalMilliseconds / 1000 / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const totalFormatted =
    totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  return {
    breaks: detailedBreaks,
    totalBreak: totalFormatted,
    totalBreakMilliseconds: totalMilliseconds,
  };
};
const calculateTotalWork = (clockInTime, clockOutTime, totalBreakMs) => {
  if (!clockInTime || !clockOutTime) return null;
  const totalWorkMs =
    new Date(clockOutTime) - new Date(clockInTime) - totalBreakMs;
  if (totalWorkMs <= 0) return "0m";

  const mins = Math.floor(totalWorkMs / 1000 / 60);
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

exports.addAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      username,
      date,
      clockInTime,
      clockOutTime,
      breakInTime,
      breakOutTime,
    } = req.body;
    const normalizedDate = new Date(date).toISOString().split('T')[0];

    if (!userId || !date) {
      return res.status(400).json({ message: "Missing required params" });
    }
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const objectUserId = new mongoose.Types.ObjectId(userId);
    let attendance = await attendanceData.findOne({ user_id: objectUserId, date:normalizedDate });

    if (attendance) {
      if (clockInTime && attendance.clockInTime) {
        return res.status(400).json({ message: "Already checked in for this date" });
      }
      if (clockOutTime && attendance.clockOutTime) {
        return res.status(400).json({ message: "Already checked out for this date" });
      }
    

        if (clockInTime) attendance.clockInTime = new Date(clockInTime);
        if (clockOutTime) attendance.clockOutTime = new Date(clockOutTime);

        if (breakInTime) {
          attendance.breaks.push({ breakInTime: new Date(breakInTime) });
        }

        if (breakOutTime) {
          const lastBreak = attendance.breaks[attendance.breaks.length - 1];
          if (lastBreak && !lastBreak.breakOutTime) {
            lastBreak.breakOutTime = new Date(breakOutTime);
          } else {
            return res.status(400).json({ message: "No open breaks to end" });
          }
      }
      // 🔁 Recalculate break durations and total
      const {
        breaks: detailedBreaks,
        totalBreak,
        totalBreakMilliseconds,
      } = getBreakDurations(attendance.breaks);
      attendance.breaks = detailedBreaks;
      attendance.totalBreak = totalBreak;
      attendance.totalWork = calculateTotalWork(
        attendance.clockInTime,
        attendance.clockOutTime,
        totalBreakMilliseconds
      );

      await attendance.save();
      return res.status(200).json({
        message: "Attendance updated",
        attendance,
      });
    } else {
      const newAttendance = await attendanceData.create({
        user_id: objectUserId,
        username,
        date:normalizedDate,
        clockInTime: clockInTime ? new Date(clockInTime) : null,
        clockOutTime: clockOutTime ? new Date(clockOutTime) : null,
        breaks: [],
        totalBreak: "0m",
        totalWork: "0m",
      });

      if (breakInTime) {
        newAttendance.breaks.push({ breakInTime: new Date(breakInTime) });
      }

      if (breakOutTime) {
        return res
          .status(400)
          .json({ message: "Cannot record break-out without prior break-in" });
      }

      await newAttendance.save();
      return res.status(201).json({
        message: "Attendance created",
        attendance: newAttendance,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getUserAttendance = async (req, res) => {
  try {
    const { userId, month, year} = req.query;

    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied" });
    }
    if (!month || !year || !userId) {
      return res.status(400).json({ message: "Month, year, and userId are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    const getAttendanceData = await attendanceData.find({ user_id:userId, date: {
      $gte: startDate,
      $lt:endDate,
    }});
    res.status(200).json({
      message: "All attendance record fetched successfully",
      data: getAttendanceData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ateendance fetch failed" });
  }
};

exports.getUserAttendanceIdAndDate = async (req, res) => {
  try {
    const { userId, currentDate } = req.params;

    if (!currentDate || !userId) {
      return res.status(400).json({ message: "currentDate and userId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Parse and normalize currentDate (remove time part)
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(currentDate);
    end.setHours(23, 59, 59, 999);

    const getAttendanceData = await attendanceData.find({
      user_id: userId,
      date: { $gte: start, $lte: end }
    });

    res.status(200).json({
      message: "Attendance fetched successfully",
      data: getAttendanceData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Attendance fetch failed" });
  }
};
// get attendance only date

exports.getUserAttendanceByDate = async (req, res) => {
  try {
    const { role } = req.user;
    const inputDate = req.params.date || new Date().toISOString().split("T")[0];
    if(role !== "admin" && role !== "hr"){
      return res.status(400).json({ message: "Only admin or HR can get attendance" });
    }
    const start = new Date(inputDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(inputDate);
    end.setHours(23, 59, 59, 999);
    const getAttendanceData = await attendanceData.find({
      date: { $gte: start, $lte: end }
    });

    if (getAttendanceData.length === 0) {
      return res.status(404).json({ message: "No attendance data found for this date" });
    }

    res.status(200).json({
      message: "Attendance fetched successfully",
      data: getAttendanceData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Attendance fetch failed" });
  }
};


exports.getAttendanceByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    
    if (!userId)
      return res
        .status(400)
        .json({ message: "Invalid user ID" });
    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year are required" });
    }
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);


    const attendance = await attendanceData.find({
      user_id: userId,
      date: {
        $gte: startDate,
        $lt:endDate,
      }
     });
    if (!attendance || attendance.length === 0) {
      return res.status(404).json({ message: "No attendance found this user" });
    }
    return res.status(200).json({
      message: "Your Attendance fetched ",
      data: attendance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Faild to fetch get attendance by user " });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { userId, date, clockInTime, clockOutTime, breaks } = req.body;
    // console.log(userId, date,"check");

    if (!userId) return res.status(400).json({ message: "userId Not found" });
    if (!date) return res.status(400).json({ message: "Date Not found" });

    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res
        .status(400)
        .json({ message: "Access denied only admin and hr can edit" });
    }
    const attendance = await attendanceData.findOne({
      user_id: userId,
      date: date,
    });
    // console.log(attendance,"att");
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (clockInTime) attendance.clockInTime = new Date(clockInTime);
    if (clockOutTime) attendance.clockOutTime = new Date(clockOutTime);

    if (Array.isArray(breaks))
      attendance.breaks = breaks.map((b) => ({
        breakInTime: new Date(b.breakInTime),
        breakOutTime: b.breakOutTime ? new Date(b.breakOutTime) : null,
      }));

    const {
      breaks: detailedBreaks,
      totalBreak,
      totalBreakMilliseconds,
    } = getBreakDurations(attendance.breaks);
    attendance.breaks = detailedBreaks;
    attendance.totalBreak = totalBreak;
    attendance.totalWork = calculateTotalWork(
      attendance.clockInTime,
      attendance.clockOutTime,
      totalBreakMilliseconds
    );
    await attendance.save();
    return res.status(200).json({
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Attendance update failed", error: err.message });
  }
};
