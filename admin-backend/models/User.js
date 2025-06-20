const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
  user_state: {
    type: String,
    enum:['active'],
  },
  firstname: {
    type: String,
    required: [true, 'First Name is required'],
  },
  lastname: {
    type: String,
  },
  mobile: {
    type: String,
    required: [true, 'Mobile is required'],
  },
  dob: {
    type: String,
    required:[true, 'DOB is required'],
  },
  username: {
    type: String,
    required:[true, 'User name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'hr', 'employee'],
  }
}, { timestamps: true });


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('user', userSchema);