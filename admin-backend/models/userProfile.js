const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: 'User',
    required: true,
    unique: true
  },
  profile_image: {
    type: String,
    required:true
  }
});

module.exports = mongoose.model('userProfile', userProfileSchema);
