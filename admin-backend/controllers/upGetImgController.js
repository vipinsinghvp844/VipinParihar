const mongoose = require("mongoose");
const userProfile = require("../models/userProfile");
const fs = require('fs');
const path = require('path');

exports.uploadBase64Image = async (req, res) => {
  try {
    const userId = req.user.id;
    const { base64Image } = req.body;

    if (!userId || !base64Image) {
      return res.status(400).json({ message: "Missing userId or base64Image" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const existingProfile = await userProfile.findOne({ user_id: objectUserId });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists for this user" });
    }

    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: "Invalid base64 image format" });
    }

    const mimeType = matches[1]; // e.g., image/png
    const imageData = matches[2];
    const extension = mimeType.split('/')[1]; // "png", "jpeg" etc.

    const fileName = `profile_${userId}_${Date.now()}.${extension}`;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);

    fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

    const newProfile = new userProfile({
      user_id: objectUserId,
      profile_image: imageUrl, 
    });

    await newProfile.save();

    return res.status(200).json({
      message: "Image uploaded successfully",
      profile: newProfile,
    });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.updateBase64Image = async (req, res) => {
  try {
    const userId = req.user.id;
    const { base64Image } = req.body;

    if (!userId || !base64Image) {
      return res.status(400).json({ message: "Missing userId or base64Image" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const profile = await userProfile.findOne({ user_id: objectUserId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found for this user" });
    }

    if (profile.profile_image && profile.profile_image.startsWith("http")) {
      const oldPath = path.join(__dirname, '..', 'uploads', path.basename(profile.profile_image));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: "Invalid base64 image format" });
    }

    const mimeType = matches[1];
    const imageData = matches[2];
    const extension = mimeType.split('/')[1];
    const fileName = `profile_${userId}_${Date.now()}.${extension}`;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);

    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

    const updatedProfile = await userProfile.findOneAndUpdate(
      { user_id: objectUserId },
      { profile_image: imageUrl },
      { new: true }
    );

    return res.status(200).json({
      message: "Image updated successfully",
      profile: updatedProfile,
    });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getProfileBase64Image = async (req, res) => {
  try {
    const profiles = await userProfile.find(
      {},
      { user_id: 1, profile_image: 1, _id: 0 }
    );

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }

    return res.status(200).json({
      message: "Profiles fetched successfully",
      profiles, // plural for clarity
    });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
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
      return res.status(200).json({
        message: "No profile found, returning placeholder image",
        profile_image: "https://devsite.digitalpractice.net/devsite/wp-content/uploads/2024/07/placeholder-image-hrm.png",
        isActualProfile: false, // 👈 add this flag
      });
    }

    return res.status(200).json({
      message: "Profile image fetched successfully",
      profile: profile,
      isActualProfile: true, // 👈 user has real profile
    });
  } catch (err) {
    console.error("Server error");
    res.status(500).json({ message: "Server Error" });
  }
};


exports.deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await userProfile.findOne({ user_id: userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (
      profile.profile_image &&
      profile.profile_image.startsWith("http") &&
      profile.profile_image.includes("/uploads/")
    ) {
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(profile.profile_image)
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await userProfile.findOneAndDelete({ user_id: userId });

    return res.status(200).json({
      message: "Profile and image deleted successfully",
    });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};