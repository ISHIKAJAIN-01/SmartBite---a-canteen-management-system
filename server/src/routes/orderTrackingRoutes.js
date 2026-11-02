/**
 * SmartBite Order Tracking Routes
 *
 * Mounted in app.js as: app.use("/api", orderTrackingRouter)
 * Effective endpoints:
 *   GET /api/orders/my/active
 *   GET /api/orders/:orderId/tracking
 *   GET /api/orders/:orderId/queue
 *   GET /api/auth/demo-users
 */

const express = require('express');
const router = express.Router();
const orderTrackingController = require('../controllers/orderTrackingController');
// Auth lives at server/middleware (not src/middleware).
const { authenticateToken, requireStudent } = require('../../middleware/authMiddleware');

// Public/Demo endpoint for testing (no auth)
router.get('/auth/demo-users', orderTrackingController.getDemoUsers);

// Student-only: list own active orders
// Registered BEFORE /:orderId routes so "my" is never treated as an order ID
router.get(
  '/orders/my/active',
  authenticateToken,
  requireStudent,
  orderTrackingController.getMyActiveOrders
);

// Owner or staff/admin: tracking details (ownership checked in controller)
router.get(
  '/orders/:orderId/tracking',
  authenticateToken,
  orderTrackingController.getOrderTracking
);

// Owner or staff/admin: queue position & estimates (ownership checked in controller)
router.get(
  '/orders/:orderId/queue',
  authenticateToken,
  orderTrackingController.getOrderQueue
);

module.exports = router;
