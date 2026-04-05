const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const {
  getDividendHistory,
  verifyRevenue,
  triggerDistribution,
  retryFailedPayouts,
  getMyDividendEarnings,
} = require('../controllers/dividend.controller');

// All routes require authentication
router.use(protect);

// Investor routes
router.get('/my-earnings', getMyDividendEarnings);

// Business dividend history (accessible by business owner and admin)
router.get('/business/:businessId', getDividendHistory);

// Admin routes
router.put('/:id/verify', adminOnly, verifyRevenue);
router.post('/:id/distribute', adminOnly, triggerDistribution);
router.post('/:id/retry', adminOnly, retryFailedPayouts);

module.exports = router;
