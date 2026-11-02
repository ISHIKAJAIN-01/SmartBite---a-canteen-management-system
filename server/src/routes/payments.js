
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const {
  authenticateToken,
  requireStudent,
} = require("../../middleware/authMiddleware");

// All customer payment routes require student authentication.
router.use(authenticateToken, requireStudent);

// GET /api/payments
// Optional: /api/payments?order_id=2
router.get("/", async (req, res) => {
  try {
    const { order_id } = req.query;
    const userId = req.user.userId;

    let sql = `
      SELECT
        p.payment_id,
        p.order_id,
        p.payment_method,
        p.amount,
        p.payment_status,
        p.transaction_reference,
        p.payment_date
      FROM Payments p
      JOIN Orders o ON o.order_id = p.order_id
      WHERE o.user_id = ?
    `;

    const params = [userId];

    if (order_id !== undefined) {
      const id = Number(order_id);

      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
          status: "error",
          message: "Valid order_id is required",
        });
      }

      sql += " AND p.order_id = ?";
      params.push(id);
    }

    sql += " ORDER BY p.payment_id DESC";

    const [payments] = await pool.execute(sql, params);

    return res.json({
      status: "success",
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Fetch payments error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to fetch payments",
    });
  }
});

// GET /api/payments/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.userId;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment ID",
      });
    }

    const [rows] = await pool.execute(
      `SELECT
         p.payment_id,
         p.order_id,
         p.payment_method,
         p.amount,
         p.payment_status,
         p.transaction_reference,
         p.payment_date
       FROM Payments p
       JOIN Orders o ON o.order_id = p.order_id
       WHERE p.payment_id = ?
         AND o.user_id = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }

    return res.json({
      status: "success",
      payment: rows[0],
    });
  } catch (error) {
    console.error("Fetch payment error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to fetch payment",
    });
  }
});

// POST /api/payments
// Simulated payment only. No real money is charged.
router.post("/", async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      status: "error",
      message: "Request body must be a JSON object",
    });
  }

  const orderId = Number(body.order_id);

  const method =
    typeof body.payment_method === "string"
      ? body.payment_method.trim().toUpperCase()
      : "";

  if (!Number.isInteger(orderId) || orderId < 1) {
    return res.status(400).json({
      status: "error",
      message: "Valid order_id is required",
    });
  }

  if (!["UPI", "CASH"].includes(method)) {
    return res.status(400).json({
      status: "error",
      message: "payment_method must be UPI or Cash",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    const [orders] = await connection.execute(
      `SELECT order_id, user_id, total_amount, status
       FROM Orders
       WHERE order_id = ?
       FOR UPDATE`,
      [orderId]
    );

    if (orders.length === 0) {
      throw Object.assign(new Error("Order not found"), {
        statusCode: 404,
      });
    }

    const order = orders[0];

    // Verify that the order belongs to the logged-in student.
    if (Number(order.user_id) !== Number(req.user.userId)) {
      throw Object.assign(
        new Error("You cannot make payment for another user's order"),
        { statusCode: 403 }
      );
    }

    if (order.status === "Cancelled") {
      throw Object.assign(
        new Error("Cannot pay for a cancelled order"),
        { statusCode: 409 }
      );
    }

    const [existing] = await connection.execute(
      `SELECT payment_id
       FROM Payments
       WHERE order_id = ?
         AND payment_status = 'Success'
       LIMIT 1`,
      [orderId]
    );

    if (existing.length > 0) {
      throw Object.assign(
        new Error("This order already has a successful payment"),
        { statusCode: 409 }
      );
    }

    // Demo simulation: payment succeeds by default.
    // Set simulate_failure: true to test a failed payment.
    const failed = body.simulate_failure === true;

    const paymentStatus = failed ? "Failed" : "Success";
    const amount = Number(order.total_amount).toFixed(2);
    const reference = `SIM-${Date.now()}-${orderId}`;

    const [result] = await connection.execute(
      `INSERT INTO Payments
       (order_id, payment_method, amount, payment_status,
        transaction_reference)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, method, amount, paymentStatus, reference]
    );

    await connection.commit();

    return res.status(201).json({
      status: "success",
      message: failed
        ? "Simulated payment failed"
        : "Simulated payment successful",
      payment: {
        payment_id: result.insertId,
        order_id: orderId,
        payment_method: method,
        amount,
        payment_status: paymentStatus,
        transaction_reference: reference,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Payment rollback failed:", rollbackError);
      }
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }

    console.error("Create payment error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to process payment",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;

