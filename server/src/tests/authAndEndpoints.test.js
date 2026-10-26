/**
 * In-Memory Controller & Security Integration Tests for SmartBite (Member 3)
 * Tests authentication, authorization, status mappings, and queue logic in process.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const orderTrackingController = require('../controllers/orderTrackingController');
const { authenticate, generateToken } = require('../middleware/authMiddleware');
const queueService = require('../services/queueService');

// Helper to create mock req and res
function createMockContext({ params = {}, headers = {}, user = null }) {
  const req = {
    params,
    headers,
    user,
  };

  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    getStatusCode() {
      return statusCode;
    },
    getData() {
      return responseData;
    },
  };

  return { req, res };
}

describe('Authentication Middleware Tests', () => {
  it('should return 401 Unauthorized when no Authorization header is present', async () => {
    const { req, res } = createMockContext({ headers: {} });
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.getStatusCode(), 401);
    assert.strictEqual(res.getData().error, 'Unauthorized');
  });

  it('should return 401 Unauthorized when an invalid JWT token is supplied', async () => {
    const { req, res } = createMockContext({
      headers: { authorization: 'Bearer invalid.token.signature' },
    });
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.getStatusCode(), 401);
  });

  it('should call next() and populate req.user when valid JWT token is supplied', async () => {
    const testUser = { user_id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', role: 'student' };
    const validToken = generateToken(testUser);

    const { req, res } = createMockContext({
      headers: { authorization: `Bearer ${validToken}` },
    });
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user.user_id, 1);
    assert.strictEqual(req.user.name, 'Aarav Sharma');
  });
});

describe('Controller Security & Status Handling Tests', () => {
  it('should return 400 Bad Request for non-numeric order ID', async () => {
    const { req, res } = createMockContext({
      params: { orderId: 'invalid-id' },
      user: { user_id: 1, role: 'student' },
    });

    await orderTrackingController.getOrderTracking(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    assert.strictEqual(res.getData().error, 'Bad Request');
  });

  it('should return 404 Not Found for non-existent order ID', async () => {
    const { req, res } = createMockContext({
      params: { orderId: '99999' },
      user: { user_id: 1, role: 'student' },
    });

    await orderTrackingController.getOrderTracking(req, res);
    assert.strictEqual(res.getStatusCode(), 404);
    assert.strictEqual(res.getData().error, 'Not Found');
  });

  it('should return 403 Forbidden when Student 2 attempts to view Student 1 order', async () => {
    // Order 101 belongs to user_id = 1
    const { req, res } = createMockContext({
      params: { orderId: '101' },
      user: { user_id: 2, role: 'student' }, // Student 2 is NOT owner
    });

    await orderTrackingController.getOrderTracking(req, res);
    assert.strictEqual(res.getStatusCode(), 403);
    assert.strictEqual(res.getData().error, 'Forbidden');
  });

  it('should return 200 OK with concealed pickup code for Placed order (Order 103)', async () => {
    const { req, res } = createMockContext({
      params: { orderId: '103' },
      user: { user_id: 1, role: 'student' },
    });

    await orderTrackingController.getOrderTracking(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.strictEqual(data.order.order_id, 103);
    assert.strictEqual(data.order.status, 'Placed');
    assert.strictEqual(data.pickup.available, false);
    assert.strictEqual(data.pickup.pickup_code, null);
  });

  it('should return 200 OK with concealed pickup code for Preparing order (Order 101)', async () => {
    const { req, res } = createMockContext({
      params: { orderId: '101' },
      user: { user_id: 1, role: 'student' },
    });

    await orderTrackingController.getOrderTracking(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.strictEqual(data.order.order_id, 101);
    assert.strictEqual(data.order.status, 'Preparing');
    assert.strictEqual(data.pickup.available, false);
    assert.strictEqual(data.pickup.pickup_code, null);
    assert.ok(Array.isArray(data.items));
    assert.strictEqual(data.items.length, 1);
  });

  it('should return 200 OK with revealed pickup code and instructions when Ready (Order 102)', async () => {
    const { req, res } = createMockContext({
      params: { orderId: '102' },
      user: { user_id: 1, role: 'student' },
    });

    await orderTrackingController.getOrderTracking(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.strictEqual(data.order.status, 'Ready');
    assert.strictEqual(data.pickup.available, true);
    assert.strictEqual(data.pickup.pickup_code, 'SB-2904');
    assert.ok(data.pickup.instructions.includes('Counter 2'));
  });

  it('should return 200 OK with collection confirmation for Collected order (Order 104)', async () => {
    const { req, res } = createMockContext({
      params: { orderId: '104' },
      user: { user_id: 1, role: 'student' },
    });

    await orderTrackingController.getOrderTracking(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.strictEqual(data.order.status, 'Collected');
    assert.strictEqual(data.pickup.available, true);
    assert.ok(data.pickup.instructions.includes('collected'));
  });

  it('should return 200 OK with cancellation reason and hidden code for Cancelled order (Order 105)', async () => {
    const { req, res } = createMockContext({
      params: { orderId: '105' },
      user: { user_id: 1, role: 'student' },
    });

    await orderTrackingController.getOrderTracking(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.strictEqual(data.order.status, 'Cancelled');
    assert.strictEqual(data.pickup.available, false);
    assert.strictEqual(data.pickup.pickup_code, null);
    assert.ok(data.order.cancellation_reason.includes('Out of ingredients'));
  });

  it('should allow Canteen Staff to inspect any order', async () => {
    const { req, res } = createMockContext({
      params: { orderId: '101' },
      user: { user_id: 4, role: 'staff' },
    });

    await orderTrackingController.getOrderTracking(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    assert.strictEqual(res.getData().order.order_id, 101);
  });

  it('should calculate queue position and waiting time in getOrderQueue', async () => {
    const { req, res } = createMockContext({
      params: { orderId: '101' },
      user: { user_id: 1, role: 'student' },
    });

    await orderTrackingController.getOrderQueue(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.strictEqual(data.order_id, 101);
    assert.strictEqual(data.status, 'Preparing');
    assert.ok(typeof data.queue_position === 'number');
    assert.strictEqual(data.estimate_available, true);
    assert.strictEqual(data.estimate_is_guaranteed, false);
  });

  it('should return only active orders for the authenticated student in getMyActiveOrders', async () => {
    const { req, res } = createMockContext({
      user: { user_id: 1, role: 'student' },
    });

    await orderTrackingController.getMyActiveOrders(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.ok(Array.isArray(data.orders));
    const statuses = data.orders.map(o => o.status);
    assert.ok(!statuses.includes('Collected'));
    assert.ok(!statuses.includes('Cancelled'));
    assert.ok(statuses.includes('Preparing'));
    assert.ok(statuses.includes('Ready'));
    assert.ok(statuses.includes('Placed'));
  });

  it('should calculate queue position dynamically based on active orders placed ahead', async () => {
    // Order 201 was placed 12 mins ago; Order 101 placed 8 mins ago.
    // Order 201 has 0 orders ahead -> position 1
    // Order 101 has Order 201 ahead -> position 2
    const { req: req201, res: res201 } = createMockContext({
      params: { orderId: '201' },
      user: { user_id: 2, role: 'student' },
    });
    await orderTrackingController.getOrderQueue(req201, res201);
    assert.strictEqual(res201.getStatusCode(), 200);
    assert.strictEqual(res201.getData().queue_position, 1);

    const { req: req101, res: res101 } = createMockContext({
      params: { orderId: '101' },
      user: { user_id: 1, role: 'student' },
    });
    await orderTrackingController.getOrderQueue(req101, res101);
    assert.strictEqual(res101.getStatusCode(), 200);
    assert.strictEqual(res101.getData().queue_position, 2);
  });

  it('should accept x-user-id in development environment for testing', async () => {
    const { req, res } = createMockContext({
      headers: { 'x-user-id': '1' },
    });
    let nextCalled = false;

    await authenticate(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user.user_id, 1);
    assert.strictEqual(req.user.name, 'Aarav Sharma');
  });

  it('should strictly reject x-user-id in production environment without a valid JWT token', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { req, res } = createMockContext({
        headers: { 'x-user-id': '1' },
      });
      let nextCalled = false;

      await authenticate(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.getStatusCode(), 401);
      assert.strictEqual(res.getData().error, 'Unauthorized');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('should forbid getDemoUsers endpoint in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { req, res } = createMockContext({});
      await orderTrackingController.getDemoUsers(req, res);
      assert.strictEqual(res.getStatusCode(), 403);
      assert.strictEqual(res.getData().error, 'Forbidden');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
