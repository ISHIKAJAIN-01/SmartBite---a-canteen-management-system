
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/payments
// Optional: /api/payments?order_id=2
router.get("/", async (req, res) => {
  try {
    const { order_id } = req.query;

    let sql = `
      SELECT payment_id, order_id, payment_method, amount,
             payment_status, transaction_reference, payment_date
      FROM Payments
    `;
    const params = [];

    if (order_id !== undefined) {
      const id = Number(order_id);

      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
          status: "error",
          message: "Valid order_id is required",
        });
      }

      sql += " WHERE order_id = ?";
      params.push(id);
    }

    sql += " ORDER BY payment_id DESC";

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

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment ID",
      });
    }

    const [rows] = await pool.execute(
      `SELECT payment_id, order_id, payment_method, amount,
              payment_status, transaction_reference, payment_date
       FROM Payments
       WHERE payment_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }

    return res.json({ status: "success", payment: rows[0] });
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

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] = await connection.execute(
      `SELECT order_id, total_amount, status
       FROM Orders
       WHERE order_id = ?
       FOR UPDATE`,
      [orderId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    const order = orders[0];

    if (order.status === "Cancelled") {
      await connection.rollback();
      return res.status(409).json({
        status: "error",
        message: "Cannot pay for a cancelled order",
      });
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
      await connection.rollback();
      return res.status(409).json({
        status: "error",
        message: "This order already has a successful payment",
      });
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
    await connection.rollback();
    console.error("Create payment error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to process payment",
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
