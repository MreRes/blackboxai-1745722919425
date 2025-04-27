const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, ActivationCode } = require('../config/database');
const { asyncHandler } = require('../middleware/error');
const { rules, validate } = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const config = require('../config/config');

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  rules.createUser,
  validate,
  asyncHandler(async (req, res) => {
    const { username, password, phoneNumber } = req.body;

    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create user
    user = await User.create({
      username,
      password,
      phoneNumbers: [{
        number: phoneNumber,
        isActive: false
      }]
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: config.jwtExpiration
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          phoneNumbers: user.phoneNumbers
        },
        token
      }
    });
  })
);

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  [
    rules.createUser[0], // username validation
    rules.createUser[1], // password validation
    validate
  ],
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: config.jwtExpiration
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          phoneNumbers: user.phoneNumbers
        },
        token
      }
    });
  })
);

// @route   POST /api/v1/auth/activate
// @desc    Activate phone number with activation code
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

    // Check if phone number can be added
    if (!code.canAddPhoneNumber()) {
      return res.status(400).json({
        success: false,
        message: 'Maximum number of phone numbers reached for this activation code'
      });
    }

    // Add phone number to activation code
    code.addPhoneNumber(phoneNumber);
    await code.save();

    // Update user's phone number status
    const phoneIndex = user.phoneNumbers.findIndex(p => p.number === phoneNumber);
    if (phoneIndex >= 0) {
      user.phoneNumbers[phoneIndex].isActive = true;
      user.phoneNumbers[phoneIndex].activatedAt = new Date();
      user.phoneNumbers[phoneIndex].expiresAt = new Date(code.expiresAt);
    } else {
      user.phoneNumbers.push({
        number: phoneNumber,
        isActive: true,
        activatedAt: new Date(),
        expiresAt: new Date(code.expiresAt)
      });
    }
    await user.save();

    res.json({
      success: true,
      message: 'Phone number activated successfully',
      data: {
        expiresAt: code.expiresAt
      }
    });
  })
);

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      data: user
    });
  })
);

// @route   PUT /api/v1/auth/password
// @desc    Change password
// @access  Private
router.put('/password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  })
);

module.exports = router;
