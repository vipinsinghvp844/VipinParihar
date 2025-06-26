const express = require("express");
const {
  registerUser,
  loginUser,
  deleteUser,
  updateUser,
  getUserAll,
  getUserCount,
  getSingleUser,
  changePassword,
} = require("../controllers/authController");
const router = express.Router();
const protect = require("../middleware/auth");

router.post("/register", protect, registerUser);
router.post("/login", loginUser);
router.delete("/deleteuser", protect, deleteUser);
router.put("/updateuser/:id", protect, updateUser);
router.get("/get-user", protect, getUserAll);
router.get("/user-count", protect, getUserCount);
router.get("/get-user-by-id/:id", protect, getSingleUser);
router.post("/change-password", protect, changePassword);

module.exports = router;
