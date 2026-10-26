/**
 * SmartBite Order Tracking Routes
 */

const express = require('express');
const router = express.Router();
const orderTrackingController = require('../controllers/orderTrackingController');
const { authenticate } = require('../middleware/authMiddleware');

// Public/Demo endpoints for testing
router.get('/auth/demo-users', orderTrackingController.getDemoUsers);

// Protected routes (require valid student or staff token)
router.get('/orders/my/active', authenticate, orderTrackingController.getMyActiveOrders);
router.get('/orders/:orderId/tracking', authenticate, orderTrackingController.getOrderTracking);
router.get('/orders/:orderId/queue', authenticate, orderTrackingController.getOrderQueue);

module.exports = router;
