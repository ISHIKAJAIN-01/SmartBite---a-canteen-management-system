/**
 * SmartBite Order Tracking Controller
 * Handles order tracking, queue calculations, and active order retrieval.
 */

const db = require('../config/db');
const queueService = require('../services/queueService');
const { generateToken } = require('../middleware/authMiddleware');

/**
 * Helper: Validate order ID from parameters
 */
function parseOrderId(param) {
  const orderId = parseInt(param, 10);
  if (isNaN(orderId) || orderId <= 0) {
    return null;
  }
  return orderId;
}

/**
 * GET /api/orders/:orderId/tracking
 * Retrieve detailed tracking information for an order
 */
async function getOrderTracking(req, res) {
  try {
    const orderId = parseOrderId(req.params.orderId);
    if (!orderId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid order ID provided.',
      });
    }

    // 1. Fetch order details
    const orderRows = await db.query(
      `SELECT order_id, user_id, order_date, status, total_amount, pickup_code,
              special_instructions, estimated_prep_minutes, estimated_ready_at,
              actual_ready_at, cancelled_at, cancellation_reason
       FROM Orders
       WHERE order_id = ?`,
      [orderId]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Order #${orderId} does not exist.`,
      });
    }

    const order = orderRows[0];

    // 2. Strict authorization: Verify order ownership
    const isOwner = req.user && req.user.user_id === order.user_id;
    const isStaff = req.user && (req.user.role === 'staff' || req.user.role === 'admin');

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this order.',
      });
    }

    // 3. Fetch order items
    const itemRows = await db.query(
      `SELECT oi.order_item_id, oi.item_id, mi.item_name, oi.quantity,
              oi.unit_price, oi.subtotal, mi.prep_time_minutes
       FROM Order_Items oi
       JOIN Menu_Items mi ON oi.item_id = mi.item_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    // 4. Retrieve pickup instructions from Canteen_Settings
    let pickupInstructions = null;
    const settingsRows = await db.query(
      `SELECT setting_value FROM Canteen_Settings WHERE setting_key = ?`,
      ['pickup_instructions']
    );
    if (settingsRows && settingsRows.length > 0) {
      pickupInstructions = settingsRows[0].setting_value;
    } else {
      pickupInstructions = 'Please follow the instructions provided at the canteen counter.';
    }

    // 5. Construct Pickup Information according to status and security policy
    let pickupData = {
      available: false,
      pickup_code: null,
      instructions: null,
    };

    if (order.status === 'Ready') {
      pickupData = {
        available: true,
        pickup_code: order.pickup_code,
        instructions: pickupInstructions,
      };
    } else if (order.status === 'Collected') {
      pickupData = {
        available: true,
        pickup_code: order.pickup_code,
        instructions: 'This order has already been collected. Thank you for dining with SmartBite!',
      };
    } else if (order.status === 'Placed' || order.status === 'Preparing') {
      pickupData = {
        available: false,
        pickup_code: null,
        instructions: 'Pickup code and collection instructions will be displayed here once your food is ready.',
      };
    } else if (order.status === 'Cancelled') {
      pickupData = {
        available: false,
        pickup_code: null,
        instructions: null,
      };
    }

    // Return sanitized tracking payload
    return res.status(200).json({
      order: {
        order_id: order.order_id,
        user_id: order.user_id,
        order_date: order.order_date,
        status: order.status,
        total_amount: parseFloat(order.total_amount),
        estimated_prep_minutes: order.estimated_prep_minutes,
        estimated_ready_at: order.estimated_ready_at,
        actual_ready_at: order.actual_ready_at,
        cancelled_at: order.cancelled_at,
        cancellation_reason: order.cancellation_reason,
        special_instructions: order.special_instructions,
      },
      items: (itemRows || []).map(item => ({
        order_item_id: item.order_item_id,
        item_id: item.item_id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        subtotal: parseFloat(item.subtotal),
      })),
      pickup: pickupData,
    });
  } catch (error) {
    console.error('[OrderTrackingController] getOrderTracking error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve order tracking information.',
    });
  }
}

/**
 * GET /api/orders/:orderId/queue
 * Retrieve queue position and waiting time estimation
 */
async function getOrderQueue(req, res) {
  try {
    const orderId = parseOrderId(req.params.orderId);
    if (!orderId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid order ID provided.',
      });
    }

    const orderRows = await db.query(
      `SELECT order_id, user_id, order_date, status, estimated_prep_minutes,
              estimated_ready_at, actual_ready_at, cancelled_at
       FROM Orders
       WHERE order_id = ?`,
      [orderId]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Order #${orderId} does not exist.`,
      });
    }

    const order = orderRows[0];

    // Authorization check
    const isOwner = req.user && req.user.user_id === order.user_id;
    const isStaff = req.user && (req.user.role === 'staff' || req.user.role === 'admin');

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view queue details for this order.',
      });
    }

    // Calculate queue estimates
    const queueData = await queueService.calculateQueueEstimate(order);

    return res.status(200).json(queueData);
  } catch (error) {
    console.error('[OrderTrackingController] getOrderQueue error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to calculate queue status.',
    });
  }
}

/**
 * GET /api/orders/my/active
 * Retrieve currently active orders for the authenticated student
 */
async function getMyActiveOrders(req, res) {
  try {
    const userId = req.user.user_id;

    const orders = await db.query(
      `SELECT order_id, user_id, order_date, status, total_amount,
              estimated_prep_minutes, estimated_ready_at
       FROM Orders
       WHERE user_id = ? AND status IN ('Placed', 'Preparing', 'Ready')
       ORDER BY order_date DESC`,
      [userId]
    );

    return res.status(200).json({
      count: orders.length,
      orders: orders.map(o => ({
        order_id: o.order_id,
        order_date: o.order_date,
        status: o.status,
        total_amount: parseFloat(o.total_amount),
        estimated_prep_minutes: o.estimated_prep_minutes,
        estimated_ready_at: o.estimated_ready_at,
      })),
    });
  } catch (error) {
    console.error('[OrderTrackingController] getMyActiveOrders error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve active orders.',
    });
  }
}

/**
 * GET /api/auth/demo-users
 * Helper endpoint for viva demonstration and testing different student accounts
 */
async function getDemoUsers(req, res) {
  try {
    // [DEVELOPMENT-ONLY FIXTURE]
    // Strictly prevent demo account leakage in production environments
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Demo accounts endpoint is disabled in production environments.',
      });
    }

    const demoAccounts = [
      { user_id: 1, name: 'Aarav Sharma (Student - Active Orders 101, 102, 103, 104, 105)', email: 'aarav.sharma@college.edu', role: 'student' },
      { user_id: 2, name: 'Ishika Jain (Student - Active Order 201)', email: 'ishika.jain@college.edu', role: 'student' },
      { user_id: 3, name: 'Rohan Mehta (Student - No active orders)', email: 'rohan.mehta@college.edu', role: 'student' },
      { user_id: 4, name: 'Canteen Counter Staff (Staff - Counter Access)', email: 'staff@canteen.college.edu', role: 'staff' },
    ];

    const usersWithTokens = demoAccounts.map(u => ({
      ...u,
      token: generateToken(u),
    }));

    return res.status(200).json({ users: usersWithTokens });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get demo accounts' });
  }
}

module.exports = {
  getOrderTracking,
  getOrderQueue,
  getMyActiveOrders,
  getDemoUsers,
};
