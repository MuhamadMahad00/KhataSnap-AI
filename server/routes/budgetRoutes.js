// ============================================
// KhataSnap AI — Budget Routes
// ============================================

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { setBudget, getCurrentBudget, getBudgetHistory } = require('../controllers/budgetController');

router.use(auth);

router.post('/', setBudget);
router.get('/current', getCurrentBudget);
router.get('/history', getBudgetHistory);

module.exports = router;
