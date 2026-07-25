// ============================================
// KhataSnap AI — Budget Model
// ============================================
// Monthly budget targets set by the user.

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Month (1-12)
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  // Year (e.g., 2024)
  year: {
    type: Number,
    required: true
  },
  // Budget amount
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget must be positive']
  }
}, {
  timestamps: true
});

// Ensure one budget per user per month
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
