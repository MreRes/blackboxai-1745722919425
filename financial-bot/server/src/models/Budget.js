const mongoose = require('mongoose');

const budgetCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  spent: {
    type: Number,
    default: 0
  },
  alerts: [{
    threshold: {
      type: Number,
      required: true
    },
    isTriggered: {
      type: Boolean,
      default: false
    }
  }]
});

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalBudget: {
    type: Number,
    required: true
  },
  categories: [budgetCategorySchema],
  isActive: {
    type: Boolean,
    default: true
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    whatsapp: {
      type: Boolean,
      default: true
    },
    thresholds: {
      warning: {
        type: Number,
        default: 80 // percentage
      },
      critical: {
        type: Number,
        default: 90 // percentage
      }
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
budgetSchema.index({ user: 1, startDate: -1 });
budgetSchema.index({ user: 1, isActive: 1 });

// Method to check if budget exists for a date range
budgetSchema.statics.findOverlapping = async function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    isActive: true,
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });
};

// Method to update category spending
budgetSchema.methods.updateCategorySpending = async function(category, amount) {
  const categoryBudget = this.categories.find(c => c.category === category);
  if (categoryBudget) {
    categoryBudget.spent += amount;
    
    // Check and update alert triggers
    categoryBudget.alerts.forEach(alert => {
      if (!alert.isTriggered && categoryBudget.spent >= alert.threshold) {
        alert.isTriggered = true;
      }
    });

    await this.save();
    return true;
  }
  return false;
};

// Method to get budget status
budgetSchema.methods.getStatus = function() {
  const totalSpent = this.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = this.totalBudget - totalSpent;
  const spentPercentage = (totalSpent / this.totalBudget) * 100;

  return {
    totalBudget: this.totalBudget,
    totalSpent,
    remainingBudget,
    spentPercentage,
    isWarning: spentPercentage >= this.notifications.thresholds.warning,
    isCritical: spentPercentage >= this.notifications.thresholds.critical,
    categoryStatus: this.categories.map(cat => ({
      category: cat.category,
      budgeted: cat.amount,
      spent: cat.spent,
      remaining: cat.amount - cat.spent,
      spentPercentage: (cat.spent / cat.amount) * 100
    }))
  };
};

module.exports = mongoose.model('Budget', budgetSchema);
