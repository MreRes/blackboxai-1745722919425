const express = require('express');
const router = express.Router();
const { User, Transaction, Budget } = require('../config/database');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { rules, validate } = require('../middleware/validator');
const bcrypt = require('bcryptjs');

// @route   GET /api/v1/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');

    // Get user statistics
    const [transactionCount, activePhones] = await Promise.all([
      Transaction.countDocuments({ user: req.user.id }),
      user.phoneNumbers.filter(phone => 
        phone.isActive && phone.expiresAt > new Date()
      ).length
    ]);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          transactionCount,
          activePhones
        }
      }
    });
  })
);

// @route   PUT /api/v1/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
  protect,
  asyncHandler(async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // Update username if provided
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
      user.username = username;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          phoneNumbers: user.phoneNumbers
        }
      }
    });
  })
);

// @route   GET /api/v1/users/phones
// @desc    Get user phone numbers
// @access  Private
router.get('/phones',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('phoneNumbers');

    const phones = user.phoneNumbers.map(phone => ({
      number: phone.number,
      isActive: phone.isActive,
      activatedAt: phone.activatedAt,
      expiresAt: phone.expiresAt,
      isExpired: phone.expiresAt < new Date()
    }));

    res.json({
      success: true,
      data: phones
    });
  })
);

// @route   DELETE /api/v1/users/phones/:number
// @desc    Remove phone number
// @access  Private
router.delete('/phones/:number',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    
    // Remove phone number
    user.phoneNumbers = user.phoneNumbers.filter(
      phone => phone.number !== req.params.number
    );
    
    await user.save();

    res.json({
      success: true,
      message: 'Phone number removed successfully'
    });
  })
);

// @route   GET /api/v1/users/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('preferences');

    res.json({
      success: true,
      data: user.preferences || {}
    });
  })
);

// @route   PUT /api/v1/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  })
);

// @route   GET /api/v1/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard',
  protect,
  asyncHandler(async (req, res) => {
    // Get current month's data
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      monthlyTransactions,
      currentBudget,
      recentTransactions
    ] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Budget.findOne({
        user: req.user._id,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }),
      Transaction.find({ user: req.user._id })
        .sort('-date')
        .limit(5)
    ]);

    // Process monthly totals
    const monthlyTotals = {
      income: 0,
      expense: 0
    };

    monthlyTransactions.forEach(t => {
      monthlyTotals[t._id] = t.total;
    });

    // Get budget status if exists
    const budgetStatus = currentBudget ? currentBudget.getStatus() : null;

    res.json({
      success: true,
      data: {
        monthlyTotals,
        balance: monthlyTotals.income - monthlyTotals.expense,
        budget: budgetStatus,
        recentTransactions
      }
    });
  })
);

// @route   POST /api/v1/users/feedback
// @desc    Submit user feedback
// @access  Private
router.post('/feedback',
  protect,
  asyncHandler(async (req, res) => {
    const { type, message } = req.body;

    // Store feedback in user's document
    const user = await User.findById(req.user.id);
    
    if (!user.feedback) {
      user.feedback = [];
    }

    user.feedback.push({
      type,
      message,
      createdAt: new Date()
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  })
);

module.exports = router;
