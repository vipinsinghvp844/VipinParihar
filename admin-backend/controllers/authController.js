const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { registerUserSchema } = require("../validation/userValidation");


const genrateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.log("Failed to update password", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { error } = registerUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((e) => e.message);
      return res.status(400).json({ message: "Validation failed", errors: errorMessages });
    }
    const {
      username,
      email,
      password,
      role,
      user_state,
      personalInfo,
      employmentInfo,
      bankDetails,
      additionalInfoDetail,
    } = req.body;   

    const userExist = await User.findOne({ email });
    if (userExist)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      username,
      email,
      password,
      role,
      user_state,
      personalInfo,
      employmentInfo,
      bankDetails,
      additionalInfoDetail,
    });
        
    const token = genrateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        personalInfo: user.personalInfo,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Update User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = genrateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete user" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};



// Get All Users
exports.getUserAll = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;
    const { page = 1, limit = 20 } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    // if (role !== "admin" && role !== "hr") {
    //   return res.status(403).json({ message: "Access denied" });
    // }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalUsers = await User.countDocuments();

    const users = await User.find({}, "-password -__v")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users,
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get User Count
exports.getUserCount = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (role !== "admin" && role !== "hr") {
      return res.status(403).json({ message: "Access denied" });
    }

    const totalUsers = await User.countDocuments();
    return res.status(200).json({ total: totalUsers });
  } catch (err) {
    console.error("Count Users Error:", err);
    res.status(500).json({ message: "Failed to count users" });
  }
};

// Get Single User
exports.getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Single user fetched successfully",
      data: user,
    });
  } catch (err) {
    console.log("Fetch User Error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
