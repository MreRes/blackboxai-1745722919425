const express = require('express');
const router = express.Router();
const { User, ActivationCode } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { rules, validate } = require('../middleware/validator');
const moment = require('moment');

// @route   POST /api/v1/activations/verify
// @desc    Verify activation code
// @access  Public
router.post('/verify',
  asyncHandler(async (req, res) => {
    const { username, activationCode, phoneNumber } = req.body;

    // Validate phone number format
    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find activation code
    const code = await ActivationCode.findOne({
      code: activationCode,
      user: user._id,
      isActive: true
    });

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activation code'
      });
    }

    if (code.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Activation code has expired'
      });
    }

    // Check if phone number is already activated
    const existingPhone = user.phoneNumbers.find(p => p.number === phoneNumber);
    if (existingPhone && existingPhone.isActive && existingPhone.expiresAt > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already activated'
      });
    }

    // Check if maximum phone numbers limit is reached
    if (!code.canAddPhoneNumber()) {
      return res.status(400).json({
        success: false,
        message: 'Maximum number of phone numbers reached for this activation code'
      });
    }

    res.json({
      success: true,
      message: 'Activation code is valid',
      data: {
        expiresAt: code.expiresAt,
        maxPhoneNumbers: code.maxPhoneNumbers,
        usedPhoneNumbers: code.usedPhoneNumbers.length
      }
    });
  })
);

// @route   POST /api/v1/activations/activate
// @desc    Activate phone number
// @access  Public
router.post('/activate',
  asyncHandler(async (req, res) => {
    const { username, activationCode, phoneNumber } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find activation code
    const code = await ActivationCode.findOne({
      code: activationCode,
      user: user._id,
      isActive: true
    });

    if (!code || code.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired activation code'
      });
    }

    // Add phone number to activation code
    if (!code.addPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Maximum number of phone numbers reached for this activation code'
      });
    }
    await code.save();

    // Update user's phone number status
    const phoneIndex = user.phoneNumbers.findIndex(p => p.number === phoneNumber);
    if (phoneIndex >= 0) {
      user.phoneNumbers[phoneIndex].isActive = true;
      user.phoneNumbers[phoneIndex].activatedAt = new Date();
      user.phoneNumbers[phoneIndex].expiresAt = code.expiresAt;
    } else {
      user.phoneNumbers.push({
        number: phoneNumber,
        isActive: true,
        activatedAt: new Date(),
        expiresAt: code.expiresAt
      });
    }
    await user.save();

    res.json({
      success: true,
      message: 'Phone number activated successfully',
      data: {
        expiresAt: code.expiresAt,
        phoneNumber
      }
    });
  })
);

// @route   GET /api/v1/activations/status
// @desc    Check activation status
// @access  Private
router.get('/status',
  protect,
  asyncHandler(async (req, res) => {
    const { phoneNumber } = req.query;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const phone = req.user.phoneNumbers.find(p => p.number === phoneNumber);
    if (!phone) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found'
      });
    }

    res.json({
      success: true,
      data: {
        isActive: phone.isActive,
        activatedAt: phone.activatedAt,
        expiresAt: phone.expiresAt,
        daysRemaining: moment(phone.expiresAt).diff(moment(), 'days')
      }
    });
  })
);

// @route   POST /api/v1/activations/extend
// @desc    Extend activation period
// @access  Private
router.post('/extend',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { userId, phoneNumber, duration } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const phoneIndex = user.phoneNumbers.findIndex(p => p.number === phoneNumber);
    if (phoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found'
      });
    }

    // Extend expiration date
    const currentExpiry = user.phoneNumbers[phoneIndex].expiresAt || new Date();
    user.phoneNumbers[phoneIndex].expiresAt = moment(currentExpiry)
      .add(duration, 'milliseconds')
      .toDate();
    
    await user.save();

    res.json({
      success: true,
      message: 'Activation period extended successfully',
      data: {
        phoneNumber,
        newExpiryDate: user.phoneNumbers[phoneIndex].expiresAt
      }
    });
  })
);

// @route   POST /api/v1/activations/deactivate
// @desc    Deactivate phone number
// @access  Private
router.post('/deactivate',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { userId, phoneNumber } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const phoneIndex = user.phoneNumbers.findIndex(p => p.number === phoneNumber);
    if (phoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found'
      });
    }

    user.phoneNumbers[phoneIndex].isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Phone number deactivated successfully'
    });
  })
);

module.exports = router;
