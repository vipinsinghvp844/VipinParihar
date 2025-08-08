const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// API Routes
const authRoutes = require('./routes/authRoutes');
const userImageRoutes = require('./routes/uploadRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoute');
const attendanceCSV = require('./routes/attendanceCSVRoute');
const chatsRoute = require('./routes/chatRoutes');
const notificationRoute = require('./routes/notificationRoute');
const path = require('path');


const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Route Registration
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/chatuploads", express.static(path.join(__dirname, "chatuploads")));
app.use('/api/auth', authRoutes);              // e.g., /api/auth/login, /register, /deleteuser ,/updateuser, get-user
app.use('/api/images', userImageRoutes);     // e.g., /api/uploads/upload,delete,getbyuserid,getall
app.use('/api/attendance', attendanceRoutes);//  e.g., /api/attendance/mark-attendance,get-all-attendance,update
app.use('/api/leave', leaveRoutes);          //
app.use('/api/CSV', attendanceCSV);
app.use('/api/chats', chatsRoute);
app.use('/api/notifications', notificationRoute);

// Start Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log('MongoDB Connection Error:', err));
