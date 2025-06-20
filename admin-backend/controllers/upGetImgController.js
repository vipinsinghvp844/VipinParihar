const mongoose = require("mongoose");
const userProfile = require("../models/userProfile");

exports.uploadBase64Image = async (req, res) => {
  try {
    const userId = req.user.id;
    const { base64Image } = req.body;
    if (!userId || !base64Image) {
      return res.status(400).json({ message: "Missing userId or base64Image" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const existingProfile = await userProfile.findOne({
      user_id: objectUserId,
    });
    if (existingProfile) {
      return res
        .status(400)
        .json({ message: "Profile already exists for this user" });
    }

    const newProfile = new userProfile({
      user_id: objectUserId,
      profile_image: base64Image,
    });

    await newProfile.save();

    return res.status(200).json({
      message: "Image uploaded successfully",
      profile: newProfile,
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.updateBase64Image = async (req, res) => {
  try {
    const userId = req.user.id;

    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ message: "base64Image missing" });
    }

    if (!userId || !base64Image) {
      return res.status(400).json({ message: "Missing userId or base64Image" });
    }
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const updatedProfile = await userProfile.findOneAndUpdate(
      { user_id: objectUserId },
      { profile_image: base64Image },
      { new: true }
    );
    if (!updatedProfile) {
      return res
        .status(404)
        .json({ message: "Profile not found for this user" });
    }
    return res.status(200).json({
      message: "Image updated successfully",
      profile: updatedProfile,
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getProfileBase64Image = async (req, res) => {
  try {
    const getProfileImage = await userProfile.find(
      {},
      { user_id: 1, profile_image: 1, _id: 0 }
    );
    if (!getProfileImage || getProfileImage.length === 0) {
      res.status(404).json({ message: "Profile not found" });
    }
    return res.status(200).json({
      message: "Profile fetched successfully",
      profile: getProfileImage,
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getProfileByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) return res.status(400).json({ message: "Invalid User" });

    const profile = await userProfile.findOne(
      { user_id: userId },
      { profile_image: 1, _id: 0 }
    );
    if (!profile) {
      return res
        .status(200)
        .json({
          message: "No profile found, returning placeholder image",
          profile_image:
            "https://devsite.digitalpractice.net/devsite/wp-content/uploads/2024/07/placeholder-image-hrm.png",
        });
    }
    return res.status(200).json({
      message: "profile image fetched successfully",
      profile: profile,
    });
  } catch (err) {
    console.error("Server error");
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const deleteProfile = await userProfile.findOneAndDelete({
      user_id: userId,
    });
    if (!deleteProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.status(200).json({
      message: "Profile deleted successfully",
    });
  } catch (err) {
    console.error("Server error", err);
    res.status(500).json({ message: "Server Error" });
  }
};
