const express = require('express');
const router = express.Router();
const { Transaction, Budget } = require('../config/database');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const moment = require('moment');

// @route   GET /api/v1/reports/summary
// @desc    Get financial summary for a period
// @access  Private
router.get('/summary',
  protect,
  asyncHandler(async (req, res) => {
    const { period = 'month', date = new Date() } = req.query;
    const startDate = moment(date).startOf(period);
    const endDate = moment(date).endOf(period);

    // Get transactions for the period
    const transactions = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate()
          }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate()
          }
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

    // Get budget status if exists
    const budget = await Budget.findOne({
      user: req.user._id,
      startDate: { $lte: endDate.toDate() },
      endDate: { $gte: startDate.toDate() }
    });

    const summary = {
      period: {
        start: startDate,
        end: endDate
      },
      totals: {
        income: 0,
        expense: 0
      },
      categories: {
        income: [],
        expense: []
      },
      budget: budget ? budget.getStatus() : null
    };

    // Process transactions
    transactions.forEach(t => {
      summary.totals[t._id] = t.total;
    });

    // Process category breakdown
    categoryBreakdown.forEach(cat => {
      summary.categories[cat._id.type].push({
        category: cat._id.category,
        amount: cat.total,
        count: cat.count,
        percentage: (cat.total / summary.totals[cat._id.type]) * 100
      });
    });

    // Calculate balance
    summary.balance = summary.totals.income - summary.totals.expense;

    res.json({
      success: true,
      data: summary
    });
  })
);

// @route   GET /api/v1/reports/trends
// @desc    Get financial trends
// @access  Private
router.get('/trends',
  protect,
  asyncHandler(async (req, res) => {
    const { months = 12 } = req.query;
    const endDate = moment().endOf('month');
    const startDate = moment().subtract(months - 1, 'months').startOf('month');

    // Get monthly trends
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate()
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Get category trends
    const categoryTrends = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate()
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
            category: '$category'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Process trends data
    const trends = {
      monthly: [],
      categories: {}
    };

    // Initialize months array
    for (let m = 0; m < months; m++) {
      const date = moment(startDate).add(m, 'months');
      trends.monthly.push({
        date: date.format('YYYY-MM'),
        income: 0,
        expense: 0,
        balance: 0
      });
    }

    // Fill in monthly trends
    monthlyTrends.forEach(trend => {
      const monthIndex = (trend._id.year - startDate.year()) * 12 + 
                        (trend._id.month - startDate.month() - 1);
      if (monthIndex >= 0 && monthIndex < months) {
        trends.monthly[monthIndex][trend._id.type] = trend.total;
        trends.monthly[monthIndex].balance = 
          trends.monthly[monthIndex].income - trends.monthly[monthIndex].expense;
      }
    });

    // Process category trends
    categoryTrends.forEach(trend => {
      const monthIndex = (trend._id.year - startDate.year()) * 12 + 
                        (trend._id.month - startDate.month() - 1);
      if (monthIndex >= 0 && monthIndex < months) {
        const category = trend._id.category;
        if (!trends.categories[category]) {
          trends.categories[category] = Array(months).fill(0);
        }
        trends.categories[category][monthIndex] = trend.total;
      }
    });

    res.json({
      success: true,
      data: trends
    });
  })
);

// @route   GET /api/v1/reports/analysis
// @desc    Get detailed financial analysis
// @access  Private
router.get('/analysis',
  protect,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? moment(startDate) : moment().subtract(1, 'year');
    const end = endDate ? moment(endDate) : moment();

    // Get transaction patterns
    const patterns = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: start.toDate(),
            $lte: end.toDate()
          }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category',
            dayOfWeek: { $dayOfWeek: '$date' },
            hour: { $hour: '$date' }
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' },
          avg: { $avg: '$amount' }
        }
      }
    ]);

    // Get spending habits
    const habits = {
      byDayOfWeek: Array(7).fill(0),
      byHour: Array(24).fill(0),
      byCategory: {},
      frequentTransactions: []
    };

    patterns.forEach(pattern => {
      if (pattern._id.type === 'expense') {
        // Day of week stats
        habits.byDayOfWeek[pattern._id.dayOfWeek - 1] += pattern.total;

        // Hour of day stats
        habits.byHour[pattern._id.hour] += pattern.total;

        // Category stats
        if (!habits.byCategory[pattern._id.category]) {
          habits.byCategory[pattern._id.category] = {
            total: 0,
            count: 0,
            average: 0
          };
        }
        habits.byCategory[pattern._id.category].total += pattern.total;
        habits.byCategory[pattern._id.category].count += pattern.count;
        habits.byCategory[pattern._id.category].average = 
          pattern.total / pattern.count;
      }
    });

    // Get frequent transactions
    const frequentTransactions = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: start.toDate(),
            $lte: end.toDate()
          }
        }
      },
      {
        $group: {
          _id: {
            category: '$category',
            description: '$description'
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' },
          avg: { $avg: '$amount' }
        }
      },
      {
        $match: {
          count: { $gt: 2 }
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 10
      }
    ]);

    habits.frequentTransactions = frequentTransactions;

    // Calculate savings rate
    const totals = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: start.toDate(),
            $lte: end.toDate()
          }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const analysis = {
      period: {
        start: start,
        end: end
      },
      habits,
      metrics: {
        savingsRate: 0,
        averageExpense: 0,
        largestExpense: 0,
        mostFrequentCategory: ''
      }
    };

    // Calculate metrics
    const income = totals.find(t => t._id === 'income')?.total || 0;
    const expenses = totals.find(t => t._id === 'expense')?.total || 0;
    
    if (income > 0) {
      analysis.metrics.savingsRate = ((income - expenses) / income) * 100;
    }

    // Get largest expense
    const largestExpense = await Transaction.findOne({
      user: req.user._id,
      type: 'expense',
      date: {
        $gte: start.toDate(),
        $lte: end.toDate()
      }
    }).sort('-amount');

    if (largestExpense) {
      analysis.metrics.largestExpense = largestExpense.amount;
    }

    // Calculate average daily expense
    const days = end.diff(start, 'days');
    analysis.metrics.averageExpense = expenses / days;

    // Find most frequent category
    const mostFrequent = Object.entries(habits.byCategory)
      .sort((a, b) => b[1].count - a[1].count)[0];
    
    if (mostFrequent) {
      analysis.metrics.mostFrequentCategory = mostFrequent[0];
    }

    res.json({
      success: true,
      data: analysis
    });
  })
);

module.exports = router;
