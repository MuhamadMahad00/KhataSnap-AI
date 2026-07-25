// ============================================
// KhataSnap AI — Receipt Model
// ============================================
// Stores receipt data extracted by Groq Vision AI.
// Each receipt belongs to a user and contains items, totals, and AI-generated metadata.

const mongoose = require('mongoose');

// Sub-schema for individual line items on a receipt
const receiptItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 }
}, { _id: false });

const receiptSchema = new mongoose.Schema({
  // Which user owns this receipt
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Vendor / store info
  vendor: {
    type: String,
    default: 'Unknown Vendor',
    trim: true
  },

  // Receipt date (from the receipt itself, not upload date)
  date: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Currency code (USD, PKR, EUR, etc.)
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },

  // Receipt number if available
  receiptNumber: {
    type: String,
    default: '',
    trim: true
  },

  // Array of items on the receipt
  items: [receiptItemSchema],

  // Financial totals
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },

  // Payment method if detected
  paymentMethod: {
    type: String,
    default: '',
    trim: true
  },

  // AI-assigned expense category
  category: {
    type: String,
    default: 'Other',
    enum: [
      'Groceries', 'Food', 'Restaurant', 'Transport', 'Shopping',
      'Medical', 'Office', 'Education', 'Entertainment', 'Travel',
      'Utilities', 'Electronics', 'Fuel', 'Personal', 'Business', 'Other'
    ],
    index: true
  },

  // AI-generated tags for searchability
  tags: [{
    type: String,
    trim: true
  }],

  // AI confidence score (0-100)
  confidenceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Path to uploaded receipt image
  imagePath: {
    type: String,
    default: ''
  },

  // Optional user notes
  notes: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
receiptSchema.index({ userId: 1, date: -1 });
receiptSchema.index({ userId: 1, category: 1 });
receiptSchema.index({ userId: 1, vendor: 1 });

module.exports = mongoose.model('Receipt', receiptSchema);
