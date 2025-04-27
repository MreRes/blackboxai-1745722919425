const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumbers: [{
    number: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    activatedAt: Date,
    expiresAt: Date
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if phone number is active
userSchema.methods.isPhoneNumberActive = function(phoneNumber) {
  const phone = this.phoneNumbers.find(p => p.number === phoneNumber);
  if (!phone) return false;
  
  return phone.isActive && phone.expiresAt > new Date();
};

module.exports = mongoose.model('User', userSchema);
