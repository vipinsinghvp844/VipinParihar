const express = require("express");
const { addLeave, getLeave, getAllLeaves, takeLeaveDecision, deleteLeave, updateLeave, getLeavedUserCount } = require("../controllers/leaveController");

const router = express.Router();
const protect = require("../middleware/auth");

router.post('/add-leave', protect, addLeave);
router.put('/update-leave/:leaveId', protect, updateLeave);
router.put('/leave-decision/:leaveId', protect, takeLeaveDecision);
router.get('/get-leave', protect, getLeave);
router.get('/get-all-leave', protect, getAllLeaves);
router.delete('/delete-leave/:leaveId', protect, deleteLeave);
router.get('/leave-count-user/:date', protect, getLeavedUserCount);



module.exports = router; 

