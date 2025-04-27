const express = require('express');
const router = express.Router();
const { Transaction, Budget } = require('../config/database');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { rules, validate } = require('../middleware/validator');
const moment = require('moment');

// @route   POST /api/v1/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/',
  protect,
  rules.createTransaction,
  validate,
  asyncHandler(async (req, res) => {
    const { type, amount, category, description, date } = req.body;

    // Create transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      category,
      description,
      date: date || new Date(),
      source: 'web'
    });

    // If it's an expense, update budget
    if (type === 'expense') {
      const budget = await Budget.findOne({
        user: req.user.id,
        'categories.category': category,
        startDate: { $lte: transaction.date },
        endDate: { $gte: transaction.date }
      });

      if (budget) {
        await budget.updateCategorySpending(category, amount);
      }
    }

    res.status(201).json({
      success: true,
      data: transaction
    });
  })
);

// @route   GET /api/v1/transactions
// @desc    Get all transactions with filters
// @access  Private
router.get('/',
  protect,
  asyncHandler(async (req, res) => {
    const {
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      source,
      page = 1,
      limit = 10,
      sort = '-date'
    } = req.query;

    // Build query
    const query = { user: req.user.id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (source) query.source = source;
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };

    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    // Get total count
    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  })
);

// @route   GET /api/v1/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id',
  protect,
  rules.idParam,
  validate,
  asyncHandler(async (req, res) => {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  })
);

// @route   PUT /api/v1/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id',
  protect,
  rules.createTransaction,
  validate,
  asyncHandler(async (req, res) => {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // If changing expense amount or category, update budgets
    if (transaction.type === 'expense' && 
        (req.body.amount !== transaction.amount || 
         req.body.category !== transaction.category)) {
      // Revert old budget
      const oldBudget = await Budget.findOne({
        user: req.user.id,
        'categories.category': transaction.category,
        startDate: { $lte: transaction.date },
        endDate: { $gte: transaction.date }
      });

      if (oldBudget) {
        await oldBudget.updateCategorySpending(transaction.category, -transaction.amount);
      }

      // Update new budget
      if (req.body.type === 'expense') {
        const newBudget = await Budget.findOne({
          user: req.user.id,
          'categories.category': req.body.category || transaction.category,
          startDate: { $lte: req.body.date || transaction.date },
          endDate: { $gte: req.body.date || transaction.date }
        });

        if (newBudget) {
          await newBudget.updateCategorySpending(
            req.body.category || transaction.category,
            req.body.amount || transaction.amount
          );
        }
      }
    }

    // Update transaction
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: transaction
    });
  })
);

// @route   DELETE /api/v1/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id',
  protect,
  rules.idParam,
  validate,
  asyncHandler(async (req, res) => {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // If deleting an expense, update budget
    if (transaction.type === 'expense') {
      const budget = await Budget.findOne({
        user: req.user.id,
        'categories.category': transaction.category,
        startDate: { $lte: transaction.date },
        endDate: { $gte: transaction.date }
      });

      if (budget) {
        await budget.updateCategorySpending(transaction.category, -transaction.amount);
      }
    }

    await transaction.remove();

    res.json({
      success: true,
      data: {}
    });
  })
);

// @route   GET /api/v1/transactions/summary/period
// @desc    Get transaction summary for a period
// @access  Private
router.get('/summary/period',
  protect,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : moment().startOf('month').toDate();
    const end = endDate ? new Date(endDate) : moment().endOf('month').toDate();

    const summary = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          categories: {
            $push: {
              category: '$category',
              amount: '$amount'
            }
          }
        }
      }
    ]);

    // Process category summaries
    const categorySummary = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary,
        categorySummary
      }
    });
  })
);

module.exports = router;
