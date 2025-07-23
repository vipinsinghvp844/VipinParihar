const express = require("express");
const { attendanceCSV } = require("../controllers/attendanceCSVController");
const router = express.Router();
const protect = require("../middleware/auth");

router.get("/get-csv-data", protect, attendanceCSV);

module.exports = router;
