const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// API Routes
const authRoutes = require('./routes/authRoutes');
const userImageRoutes = require('./routes/uploadRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Route Registration
app.use('/api/auth', authRoutes);              // e.g., /api/auth/login, /register, /deleteuser ,/updateuser, get-user
app.use('/api/images', userImageRoutes);     // e.g., /api/uploads/upload,delete,getbyuserid,getall
app.use('/api/attendance', attendanceRoutes);//  e.g., /api/attendance/mark-attendance,get-all-attendance,update

// Start Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log('MongoDB Connection Error:', err));
