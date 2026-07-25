// ============================================
// KhataSnap AI — AI Routes
// ============================================

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  chatAssistant,
  smartSearch,
  getInsights,
  getFinancialScore,
  getMonthlyComparison
} = require('../controllers/aiController');

// All AI routes are protected
router.use(auth);

router.post('/chat', chatAssistant);
router.post('/smart-search', smartSearch);
router.get('/insights', getInsights);
router.get('/financial-score', getFinancialScore);
router.get('/monthly-comparison', getMonthlyComparison);

module.exports = router;
