// ============================================
// KhataSnap AI — Challenge Routes
// ============================================

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createChallenge,
  getChallenges,
  deleteChallenge,
  getMotivation
} = require('../controllers/challengeController');

router.use(auth);

router.post('/', createChallenge);
router.get('/', getChallenges);
router.delete('/:id', deleteChallenge);
router.get('/:id/motivation', getMotivation);

module.exports = router;
