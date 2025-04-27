const express = require('express');
const router = express.Router();
const { User, ActivationCode, Transaction, Budget } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { rules, validate } = require('../middleware/validator');
const whatsappBot = require('../config/whatsapp');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

// All routes in this file require admin privileges
router.use(protect, authorize('admin'));

// @route   POST /api/v1/admin/users
// @desc    Create a new user
// @access  Admin
router.post('/users',
  rules.createUser,
  validate,
  asyncHandler(async (req, res) => {
    const { username, password, phoneNumber, role } = req.body;

    const user = await User.create({
      username,
      password,
      role: role || 'user',
      phoneNumbers: phoneNumber ? [{ number: phoneNumber }] : []
    });

    res.status(201).json({
      success: true,
      data: user
    });
  })
);

// @route   GET /api/v1/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users',
  asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      data: users
    });
  })
);

// @route   POST /api/v1/admin/activation-codes
// @desc    Generate activation code
// @access  Admin
router.post('/activation-codes',
  rules.createActivationCode,
  validate,
  asyncHandler(async (req, res) => {
    const { userId, duration, maxPhoneNumbers } = req.body;

    // Generate random code
    const code = Math.random().toString(36).substring(2, 15).toUpperCase();
    
    const activationCode = await ActivationCode.create({
      code,
      user: userId,
      expiresAt: moment().add(duration, 'milliseconds'),
      maxPhoneNumbers: maxPhoneNumbers || 1
    });

    res.status(201).json({
      success: true,
      data: activationCode
    });
  })
);

// @route   GET /api/v1/admin/activation-codes
// @desc    Get all activation codes
// @access  Admin
router.get('/activation-codes',
  asyncHandler(async (req, res) => {
    const { active, userId } = req.query;
    
    const query = {};
    if (active === 'true') {
      query.isActive = true;
      query.expiresAt = { $gt: new Date() };
    }
    if (userId) query.user = userId;

    const codes = await ActivationCode.find(query)
      .populate('user', 'username')
      .sort('-createdAt');

    res.json({
      success: true,
      data: codes
    });
  })
);

// @route   POST /api/v1/admin/whatsapp/restart
// @desc    Restart WhatsApp bot
// @access  Admin
router.post('/whatsapp/restart',
  asyncHandler(async (req, res) => {
    await whatsappBot.client.destroy();
    await whatsappBot.initialize();

    res.json({
      success: true,
      message: 'WhatsApp bot restarted successfully'
    });
  })
);

// @route   GET /api/v1/admin/whatsapp/status
// @desc    Get WhatsApp bot status
// @access  Admin
router.get('/whatsapp/status',
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        isReady: whatsappBot.isReady,
        sessionPath: whatsappBot.client?.options?.authStrategy?.dataPath
      }
    });
  })
);

// @route   POST /api/v1/admin/backup
// @desc    Create database backup
// @access  Admin
router.post('/backup',
  asyncHandler(async (req, res) => {
    const timestamp = moment().format('YYYY-MM-DD-HH-mm-ss');
    const backupPath = path.join(process.cwd(), 'backups', `backup-${timestamp}`);

    // Create backup directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), 'backups'), { recursive: true });

    // Backup collections
    const collections = {
      users: await User.find().select('-password'),
      transactions: await Transaction.find(),
      budgets: await Budget.find(),
      activationCodes: await ActivationCode.find()
    };

    // Save backup
    await fs.writeFile(
      `${backupPath}.json`,
      JSON.stringify(collections, null, 2)
    );

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        path: `${backupPath}.json`,
        timestamp
      }
    });
  })
);

// @route   POST /api/v1/admin/restore
// @desc    Restore database from backup
// @access  Admin
router.post('/restore',
  asyncHandler(async (req, res) => {
    const { backupFile } = req.body;

    // Read backup file
    const backup = JSON.parse(
      await fs.readFile(backupFile, 'utf8')
    );

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      ActivationCode.deleteMany({})
    ]);

    // Restore collections
    await Promise.all([
      User.insertMany(backup.users),
      Transaction.insertMany(backup.transactions),
      Budget.insertMany(backup.budgets),
      ActivationCode.insertMany(backup.activationCodes)
    ]);

    res.json({
      success: true,
      message: 'Database restored successfully'
    });
  })
);

// @route   GET /api/v1/admin/stats
// @desc    Get system statistics
// @access  Admin
router.get('/stats',
  asyncHandler(async (req, res) => {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalBudgets,
      activeActivationCodes
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
      Budget.countDocuments(),
      ActivationCode.countDocuments({
        isActive: true,
        expiresAt: { $gt: new Date() }
      })
    ]);

    // Get recent activity
    const recentActivity = await Transaction.find()
      .sort('-createdAt')
      .limit(10)
      .populate('user', 'username');

    // Get system usage stats
    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers
      },
      transactions: {
        total: totalTransactions,
        today: await Transaction.countDocuments({
          createdAt: { $gte: moment().startOf('day') }
        })
      },
      budgets: {
        total: totalBudgets,
        active: await Budget.countDocuments({
          isActive: true,
          endDate: { $gte: new Date() }
        })
      },
      activationCodes: {
        active: activeActivationCodes
      },
      recentActivity
    };

    res.json({
      success: true,
      data: stats
    });
  })
);

module.exports = router;
