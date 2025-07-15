const mongoose = require("mongoose");
const leaveSchema = require("../models/leaveModel");
const User = require("../models/User");
const { leaveApplySchema } = require("../validation/leaveValidator");

exports.addLeave = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error, value } = leaveApplySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      username,
      apply_date,
      start_date,
      end_date,
      reason_for_leave,
      paid_leave_days = 0,
      status,
      hr_note,
    } = value;

    const start = new Date(start_date);
    const end = new Date(end_date);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      return res.status(400).json({ message: "Invalid date range." });
    }

    const unpaidDays = totalDays - paid_leave_days;

    const overlap = await leaveSchema.countDocuments({
      user_id: userId,
      $or: [{ start_date: { $lte: end }, end_date: { $gte: start } }],
    });

    if (overlap > 0) {
      return res.status(409).json({
        message: "Leave already exists for these dates.",
      });
    }

    const leave = await leaveSchema.create({
      user_id: userId,
      username,
      apply_date,
      start_date: start,
      end_date: end,
      total_leave_days: totalDays,
      paid_leave_days,
      unpaid_leave_days: unpaidDays,
      reason_for_leave,
      status: status.toLowerCase(),
      hr_note,
    });

    return res.status(201).json({
      message: "Leave applied successfully.",
      leave,
    });
  } catch (err) {
    console.error("Leave Apply Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getLeave = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const role = req.user.role;
    const { user_id, month, year, page = 1, limit = 10 } = req.query;

    const targetUserId =
      role === "admin" && user_id && mongoose.Types.ObjectId.isValid(user_id)
        ? user_id
        : loggedInUserId;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const filter = { user_id: targetUserId };

    if (month && year) {
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      filter.start_date = { $lt: endDate };
      filter.end_date = { $gte: startDate };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leaves, totalCount] = await Promise.all([
      leaveSchema
        .find(filter)
        .sort({ start_date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      leaveSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      message: "Leave records fetched successfully",
      data: leaves,
      pagination: {
        totalRecords: totalCount,
        currentPage: parseInt(page),
        totalPages,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Failed to fetch leave:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// get all leave by status and admin hr

exports.getAllLeaves = async (req, res) => {
  try {
    if (!["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      status = ["submitted", "accepted", "rejected"],
      page = 1,
      limit = 10,
    } = req.query;
    const filter = { status };

    const skip = (page - 1) * limit;
    const [leaves, total] = await Promise.all([
      leaveSchema.find(filter).skip(skip).limit(limit),
      leaveSchema.countDocuments(filter),
    ]);

    res.status(200).json({
      data: leaves,
      pagination: {
        currentPage: page,
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// accept resject dicision to hr and admin

exports.takeLeaveDecision = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, hr_note } = req.body;
    const userRole = req.user.role;

    if (!["admin", "hr"].includes(userRole)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const allowed = ["accepted", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await leaveSchema.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "submitted") {
      return res.status(400).json({ message: "Leave already processed" });
    }

    leave.status = status;
    leave.hr_note = hr_note || "";
    await leave.save();

    // Optional: send notification/email
    return res.status(200).json({ message: `Leave ${status} successfully` });
  } catch (err) {
    console.error("Leave decision error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Leave (Employee only, status = submitted)
exports.updateLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const userId = req.user.id;

    const {
      start_date,
      end_date,
      paid_leave_days = 0,
      unpaid_leave_days = 0,
      reason_for_leave,
    } = req.body;

    const leave = await leaveSchema.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.user_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (leave.status !== "submitted") {
      return res
        .status(400)
        .json({ message: "Leave already processed and cannot be edited" });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (start > end) {
      return res
        .status(400)
        .json({ message: "End date cannot be before start date" });
    }

    const totalLeaveDays = Number(paid_leave_days) + Number(unpaid_leave_days);

    const dateDiff =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalLeaveDays !== dateDiff) {
      return res.status(400).json({
        message: `Mismatch in leave count. Total days between ${start_date} and ${end_date} is ${dateDiff}, but you submitted ${totalLeaveDays}.`,
      });
    }

    // 🔍 Check for overlapping leave excluding the current one
    const overlappingLeave = await leaveSchema.findOne({
      user_id: userId,
      _id: { $ne: leaveId },
      $or: [
        {
          start_date: { $lte: end },
          end_date: { $gte: start },
        },
      ],
    });

    if (overlappingLeave) {
      return res.status(400).json({
        message:
          "You already have a leave request overlapping with this date range.",
      });
    }

    // ✅ Update values
    leave.start_date = start_date;
    leave.end_date = end_date;
    leave.paid_leave_days = Number(paid_leave_days);
    leave.unpaid_leave_days = Number(unpaid_leave_days);
    leave.total_leave_days = totalLeaveDays;
    leave.reason_for_leave = reason_for_leave;

    await leave.save();

    return res.status(200).json({
      message: "Leave updated successfully",
      data: leave,
    });
  } catch (err) {
    console.error("Update Leave Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Leave (Employee only, status = submitted)
exports.deleteLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const userId = req.user.id;

    const leave = await leaveSchema.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (
      leave.user_id.toString() !== userId &&
      req.user.role !== "admin" &&
      req.user.role !== "hr"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (leave.status !== "submitted") {
      return res
        .status(400)
        .json({ message: "Leave already processed and cannot be deleted" });
    }

    await leave.deleteOne();

    return res.status(200).json({ message: "Leave deleted successfully" });
  } catch (err) {
    console.error("Delete Leave Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLeavedUserCount = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;
    const { date } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (role !== "admin" && role !== "hr") {
      return res.status(403).json({ message: "Access denied" });
    }
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    const leaveRecords = await leaveSchema.find({
      start_date: { $lte: formattedDate },
      end_date: { $gte: formattedDate },
      status: "accepted",
    });
    const pendingLeaveRequest = await leaveSchema.find({
      end_date: { $gte: formattedDate },
      status: "submitted",
    });
    const leaveUsernames = leaveRecords
      .map((entry) => entry.username)
      .filter(Boolean);
    // const pendingUsernames  = pendingLeaveRequest
    //   .map((entry) => entry.username)
    //   .filter(Boolean);
    
      const pendingCountByUser = {};
      for (const leave of pendingLeaveRequest) {
        if (leave.username) {
          pendingCountByUser[leave.username] = (pendingCountByUser[leave.username] || 0) + 1;
        }
      }
  
      const pendingUsers = Object.entries(pendingCountByUser).map(
        ([username, count]) => ({ username, count })
      );

    return res.status(200).json({
      date: formattedDate.toLocaleDateString("en-CA"),
      totalLeavedUsers: leaveUsernames.length,
      users: leaveUsernames,
      totalpendingleave: pendingUsers.length,
      pendingUsers,
    });
  } catch (err) {
    console.error("Failed to fetch leaved user count", err);
    res.status(500).json({
      message: "Failed to fetch leaved user count",
      error: err.message,
    });
  }
};
