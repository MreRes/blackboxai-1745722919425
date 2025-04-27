const express = require('express');
const router = express.Router();
const { Budget, Transaction } = require('../config/database');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { rules, validate } = require('../middleware/validator');
const moment = require('moment');

// @route   POST /api/v1/budgets
// @desc    Create a new budget
// @access  Private
router.post('/',
  protect,
  rules.createBudget,
  validate,
  asyncHandler(async (req, res) => {
    const { period, totalBudget, categories, startDate, endDate } = req.body;

    // Check for overlapping budgets
    const overlapping = await Budget.findOverlapping(
      req.user.id,
      new Date(startDate),
      new Date(endDate)
    );

    if (overlapping.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A budget already exists for this period'
      });
    }

    // Validate total budget matches sum of categories
    const categoryTotal = categories.reduce((sum, cat) => sum + cat.amount, 0);
    if (categoryTotal !== totalBudget) {
      return res.status(400).json({
        success: false,
        message: 'Category totals must equal total budget'
      });
    }

    const budget = await Budget.create({
      user: req.user.id,
      period,
      totalBudget,
      categories,
      startDate,
      endDate
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  })
);

// @route   GET /api/v1/budgets
// @desc    Get all budgets
// @access  Private
router.get('/',
  protect,
  asyncHandler(async (req, res) => {
    const { active, period, startDate, endDate } = req.query;

    const query = { user: req.user.id };

    if (active === 'true') {
      query.isActive = true;
      query.endDate = { $gte: new Date() };
    }

    if (period) query.period = period;
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const budgets = await Budget.find(query).sort('-startDate');

    res.json({
      success: true,
      data: budgets
    });
  })
);

// @route   GET /api/v1/budgets/current
// @desc    Get current active budget
// @access  Private
router.get('/current',
  protect,
  asyncHandler(async (req, res) => {
    const now = new Date();
    const budget = await Budget.findOne({
      user: req.user.id,
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No active budget found'
      });
    }

    // Get current spending
    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: { $gte: budget.startDate, $lte: now }
    });

    // Calculate budget status
    const status = budget.getStatus();

    // Add transaction details
    status.recentTransactions = transactions
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        budget,
        status
      }
    });
  })
);

// @route   GET /api/v1/budgets/:id
// @desc    Get single budget
// @access  Private
router.get('/:id',
  protect,
  rules.idParam,
  validate,
  asyncHandler(async (req, res) => {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Get transactions for this budget period
    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: { $gte: budget.startDate, $lte: budget.endDate }
    });

    const status = budget.getStatus();
    status.transactions = transactions;

    res.json({
      success: true,
      data: {
        budget,
        status
      }
    });
  })
);

// @route   PUT /api/v1/budgets/:id
// @desc    Update budget
// @access  Private
router.put('/:id',
  protect,
  rules.createBudget,
  validate,
  asyncHandler(async (req, res) => {
    let budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check for overlapping budgets (excluding current budget)
    const overlapping = await Budget.findOverlapping(
      req.user.id,
      new Date(req.body.startDate),
      new Date(req.body.endDate)
    );

    if (overlapping.some(b => b._id.toString() !== req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'A budget already exists for this period'
      });
    }

    // Validate total budget matches sum of categories
    const categoryTotal = req.body.categories.reduce((sum, cat) => sum + cat.amount, 0);
    if (categoryTotal !== req.body.totalBudget) {
      return res.status(400).json({
        success: false,
        message: 'Category totals must equal total budget'
      });
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: budget
    });
  })
);

// @route   DELETE /api/v1/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete('/:id',
  protect,
  rules.idParam,
  validate,
  asyncHandler(async (req, res) => {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await budget.remove();

    res.json({
      success: true,
      data: {}
    });
  })
);

// @route   GET /api/v1/budgets/analysis/overview
// @desc    Get budget analysis overview
// @access  Private
router.get('/analysis/overview',
  protect,
  asyncHandler(async (req, res) => {
    const { months = 6 } = req.query;
    const endDate = moment();
    const startDate = moment().subtract(months, 'months');

    const budgets = await Budget.find({
      user: req.user.id,
      startDate: { $gte: startDate.toDate() },
      endDate: { $lte: endDate.toDate() }
    }).sort('startDate');

    const analysis = {
      periods: [],
      categories: {},
      trends: {
        totalBudgeted: [],
        totalSpent: [],
        savings: []
      }
    };

    for (const budget of budgets) {
      const status = budget.getStatus();
      
      analysis.periods.push({
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate,
        budgeted: budget.totalBudget,
        spent: status.totalSpent,
        remaining: status.remainingBudget,
        categories: status.categoryStatus
      });

      // Aggregate category data
      status.categoryStatus.forEach(cat => {
        if (!analysis.categories[cat.category]) {
          analysis.categories[cat.category] = {
            totalBudgeted: 0,
            totalSpent: 0,
            occurrences: 0
          };
        }
        analysis.categories[cat.category].totalBudgeted += cat.budgeted;
        analysis.categories[cat.category].totalSpent += cat.spent;
        analysis.categories[cat.category].occurrences += 1;
      });

      // Add to trends
      analysis.trends.totalBudgeted.push({
        date: budget.startDate,
        amount: budget.totalBudget
      });
      analysis.trends.totalSpent.push({
        date: budget.startDate,
        amount: status.totalSpent
      });
      analysis.trends.savings.push({
        date: budget.startDate,
        amount: status.remainingBudget
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  })
);

module.exports = router;
