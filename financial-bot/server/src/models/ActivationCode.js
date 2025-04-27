const mongoose = require('mongoose');

const activationCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  maxPhoneNumbers: {
    type: Number,
    default: 1
  },
  usedPhoneNumbers: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Method to check if code is expired
activationCodeSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to check if phone number can be added
activationCodeSchema.methods.canAddPhoneNumber = function() {
  return this.usedPhoneNumbers.length < this.maxPhoneNumbers;
};

// Method to add phone number
activationCodeSchema.methods.addPhoneNumber = function(phoneNumber) {
  if (this.canAddPhoneNumber()) {
    this.usedPhoneNumbers.push(phoneNumber);
    return true;
  }
  return false;
};

module.exports = mongoose.model('ActivationCode', activationCodeSchema);
