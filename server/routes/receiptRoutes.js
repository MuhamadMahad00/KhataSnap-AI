// ============================================
// KhataSnap AI — Receipt Routes
// ============================================

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  scanReceipt,
  saveReceipt,
  getReceipts,
  getStats,
  getHeatmapData,
  getReceiptById,
  updateReceipt,
  deleteReceipt
} = require('../controllers/receiptController');

// All receipt routes are protected
router.use(auth);

// AI scan (upload + Groq Vision)
router.post('/scan', upload.single('receipt'), scanReceipt);

// CRUD operations
router.post('/', saveReceipt);
router.get('/', getReceipts);
router.get('/stats', getStats);
router.get('/heatmap', getHeatmapData);
router.get('/:id', getReceiptById);
router.put('/:id', updateReceipt);
router.delete('/:id', deleteReceipt);

module.exports = router;
