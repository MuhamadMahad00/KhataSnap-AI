// ============================================
// KhataSnap AI — Budget Controller
// ============================================
// Manage monthly budget targets and track spending against them.

const Budget = require('../models/Budget');
const Receipt = require('../models/Receipt');
const mongoose = require('mongoose');

// ============================================
// POST /api/budgets — Create/Update Monthly Budget
// ============================================
exports.setBudget = async (req, res) => {
  try {
    const { month, year, amount } = req.body;

    if (!month || !year || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month, year, and amount'
      });
    }

    // Upsert: create if not exists, update if exists
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.id, month: parseInt(month), year: parseInt(year) },
      { amount: parseFloat(amount) },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to set budget'
    });
  }
};

// ============================================
// GET /api/budgets/current — Get Current Month's Budget + Spending
// ============================================
exports.getCurrentBudget = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const uid = new mongoose.Types.ObjectId(req.user.id);

    // Get budget and total spending for current month
    const [budget, spending] = await Promise.all([
      Budget.findOne({ userId: req.user.id, month, year }),
      Receipt.aggregate([
        {
          $match: {
            userId: uid,
            date: {
              $gte: new Date(year, month - 1, 1),
              $lte: new Date(year, month, 0, 23, 59, 59)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    const spent = spending[0]?.total || 0;
    const budgetAmount = budget?.amount || 0;
    const remaining = budgetAmount - spent;
    const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

    res.json({
      success: true,
      data: {
        budget: budgetAmount,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentage,
        month,
        year,
        isOverBudget: spent > budgetAmount && budgetAmount > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get budget'
    });
  }
};

// ============================================
// GET /api/budgets/history — Budget History (Last 6 Months)
// ============================================
exports.getBudgetHistory = async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    // Get budgets and spending for last 6 months
    const history = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const monthName = date.toLocaleString('default', { month: 'short' });

      const [budget, spending] = await Promise.all([
        Budget.findOne({ userId: req.user.id, month: m, year: y }),
        Receipt.aggregate([
          {
            $match: {
              userId: uid,
              date: {
                $gte: new Date(y, m - 1, 1),
                $lte: new Date(y, m, 0, 23, 59, 59)
              }
            }
          },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ])
      ]);

      history.push({
        month: m,
        year: y,
        monthName: `${monthName} ${y}`,
        budget: budget?.amount || 0,
        spent: Math.round((spending[0]?.total || 0) * 100) / 100
      });
    }

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get budget history'
    });
  }
};
