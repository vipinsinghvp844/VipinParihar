const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const genrateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.registerUser = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      username,
      mobile,
      dob,
      user_state,
      email,
      password,
      role,
    } = req.body;
    // console.log(firstname);
    const userExxist = await User.findOne({ email });
    if (userExxist)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      firstname,
      lastname,
      username,
      mobile,
      dob,
      email,
      password,
      role,
      user_state,
    });
    const token = genrateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        dob: user.dob,
        mobile: user.mobile,
        user_state: "",
        email: user.email,
        role: "",
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) res.status(400).json({ message: "Invalid Credentials" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) res.status(400).json({ message: "Invalid Credentials" });
    const token = genrateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    console.log(req.user);
    const { userId } = req.body;
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete user" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deleteUser = await User.findOneAndDelete({ _id: userId });

    if (!deleteUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Delete Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { updateData } = req.body; //name email etc
    const { role } = req.user;
    // if (role !== "admin") {
    //   return res.status(403).json({ message: "Not authorized to update user" });
    // }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const updateUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User updated successfully",
      user: updateUser,
    });
  } catch (err) {
    console.error("update Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getUserAll = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;
    const { page = 1, limit = 20 } = req.query;
    if (page)
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid ser ID" });
      }
    if (role !== "admin" && role !== "hr") {
      return res.status(400).json({ message: "Access denied " });
    }
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const totalUsers = await User.countDocuments();

    const users = await User.find({}, "-password -__V")
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User fetched successfully",
      data: users,
      pegination: {
        total: totalUsers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
      },
    });
  } catch (err) {
    console.error("Error fetch error", err);
    res.status(500).json({ message: "Failed to fettch user" });
  }
};

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
    console.error("Error counting users", err);
    res.status(500).json({ message: "Failed to count users" });
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(id).select("-password -__v");

    return res
      .status(200)
      .json({ message: "Single user fetch successfully", data: user });
  } catch (err) {
    console.log(err, "Failed to fetch user");
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
