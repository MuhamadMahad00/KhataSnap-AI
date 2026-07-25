// ============================================
// KhataSnap AI — Challenge Model
// ============================================
// Expense challenges that users create to control spending.

const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Challenge title (e.g., "Spend under $400")
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true
  },
  // Target spending limit
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: 0
  },
  // Challenge period
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  // Optional: limit to a specific category
  category: {
    type: String,
    default: ''
  },
  // Challenge status
  status: {
    type: String,
    enum: ['active', 'completed', 'failed'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);
