const express = require("express");
const {
  uploadBase64Image,
  updateBase64Image,
  getProfileBase64Image,
  getProfileByUserId,
  deleteProfileImage
} = require("../controllers/upGetImgController");
const router = express.Router();
const protect = require("../middleware/auth");

//Post /api/upload

router.post("/uploadimage", protect, uploadBase64Image);
router.put("/updateimage", protect, updateBase64Image);
router.get("/getallimage", protect, getProfileBase64Image);
router.get("/getprofile", protect, getProfileByUserId);
router.delete("/deleteprofile", protect, deleteProfileImage);


module.exports = router;
