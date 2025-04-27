const { validationResult, check } = require('express-validator');
const mongoose = require('mongoose');

// Validation result middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Common validation rules
exports.rules = {
  // User validation rules
  createUser: [
    check('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    check('phoneNumber')
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please enter a valid phone number')
  ],

  // Transaction validation rules
  createTransaction: [
    check('type')
      .isIn(['income', 'expense'])
      .withMessage('Transaction type must be either income or expense'),
    check('amount')
      .isNumeric()
      .withMessage('Amount must be a number')
      .custom(value => value > 0)
      .withMessage('Amount must be greater than 0'),
    check('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
    check('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
    check('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format')
  ],

  // Budget validation rules
  createBudget: [
    check('period')
      .isIn(['daily', 'weekly', 'monthly', 'yearly'])
      .withMessage('Invalid budget period'),
    check('totalBudget')
      .isNumeric()
      .withMessage('Total budget must be a number')
      .custom(value => value > 0)
      .withMessage('Total budget must be greater than 0'),
    check('startDate')
      .isISO8601()
      .withMessage('Invalid start date format'),
    check('endDate')
      .isISO8601()
      .withMessage('Invalid end date format')
      .custom((endDate, { req }) => {
        return new Date(endDate) > new Date(req.body.startDate);
      })
      .withMessage('End date must be after start date'),
    check('categories.*.category')
      .trim()
      .notEmpty()
      .withMessage('Category name is required'),
    check('categories.*.amount')
      .isNumeric()
      .withMessage('Category amount must be a number')
      .custom(value => value > 0)
      .withMessage('Category amount must be greater than 0')
  ],

  // Activation code validation rules
  createActivationCode: [
    check('userId')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid user ID'),
    check('duration')
      .isNumeric()
      .withMessage('Duration must be a number')
      .custom(value => value > 0)
      .withMessage('Duration must be greater than 0'),
    check('maxPhoneNumbers')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Max phone numbers must be at least 1')
  ],

  // Date range validation rules
  dateRange: [
    check('startDate')
      .isISO8601()
      .withMessage('Invalid start date format'),
    check('endDate')
      .isISO8601()
      .withMessage('Invalid end date format')
      .custom((endDate, { req }) => {
        return new Date(endDate) > new Date(req.body.startDate);
      })
      .withMessage('End date must be after start date')
  ],

  // ID parameter validation
  idParam: [
    check('id')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid ID format')
  ]
};

// Custom validation middleware
exports.validateMongoId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    next();
  };
};

// Sanitization middleware
exports.sanitize = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};
