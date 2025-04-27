const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['whatsapp', 'web'],
    required: true
  },
  tags: [{
    type: String
  }],
  attachments: [{
    type: String // URLs to any attached files/receipts
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // For any additional data
  }
}, {
  timestamps: true
});

// Index for efficient date-based queries
transactionSchema.index({ date: -1 });
transactionSchema.index({ user: 1, date: -1 });

// Index for geospatial queries if needed
transactionSchema.index({ location: '2dsphere' });

// Method to calculate total by type for a date range
transactionSchema.statics.getTotal = async function(userId, type, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        type: type,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Method to get category-wise summary
transactionSchema.statics.getCategorySummary = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          category: '$category',
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        categories: {
          $push: {
            name: '$_id.category',
            total: '$total',
            count: '$count'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);
