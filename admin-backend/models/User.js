const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  user_state: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  // Login/Auth Details
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'hr', 'employee']
  },

  //  Personal Info
  personalInfo: {
    firstname: {
      type: String,
      required: [true, 'First Name is required']
    },
    lastname: {
      type: String
    },
    mobile: {
      type: String,
      required: [true, 'Mobile is required'],
      match: [/^\d{10}$/, 'Mobile number must be 10 digits']
    },
    dob: {
      type: String,
      required: [true, 'DOB is required']
    },
    address: {
      type: String
    }
  },

  //  Employment Info
  employmentInfo: {
    designation: String,
    department: String,
    dutyType: String,
    emloyeementType: String,
    dateOfJoining: String,
    dateOfLeaving: String,
    salary: Number,
  },

  //  Bank Details
  bankDetails: {
    bankName: String,
    accountNumber: String,
    bankBranch: String,
    IFSC: String
  },

  //  Additional Info
  additionalInfoDetail: {
    address: String,
    dateOfLeaving: String,
    graduationYear: String,
    previousEmpName: String,
 }

}, { timestamps: true });


//  Password Hash Hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare Password Method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
