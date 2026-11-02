const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");
const paymentsRouter = require("./routes/payments");
const productLikesRouter = require("./routes/productLikes");
const favoritesRouter = require("./routes/favorites");
const adminInventoryRouter = require("./routes/admin/inventoryRoutes");
const adminMenuRouter = require("./routes/admin/menuRoutes");
const adminOrdersRouter = require("./routes/admin/orderRoutes");
const orderTrackingRouter = require("./routes/orderTrackingRoutes");

const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authMiddleware");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
  })
);

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SmartBite API",
  });
});

// Health check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SmartBite API",
  });
});

// Database connection test API
// Admin only
app.get(
  "/api/db-test",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT DATABASE() AS database_name"
      );

      res.json({
        status: "success",
        message: "MySQL connected successfully!",
        database: rows[0].database_name,
      });
    } catch (error) {
      console.error("Database test failed:", error.message);

      res.status(500).json({
        status: "error",
        message: "Database connection failed",
      });
    }
  }
);

// Feature routers
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/auth", authRouter);
app.use("/api/product-likes", productLikesRouter);
app.use("/api/favorites", favoritesRouter);

// Admin and menu routers
app.use("/api/inventory", adminInventoryRouter);
app.use("/api/menu", adminMenuRouter);
app.use("/api/admin/orders", adminOrdersRouter);

// Order tracking & queue routes (queue position, estimates, active orders)
app.use("/api", orderTrackingRouter);

// 404 route
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "API route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const isClientError = status >= 400 && status < 500;

  if (!isClientError) {
    console.error("Unhandled error:", err.message);
  }

  res.status(status).json({
    status: "error",
    message: isClientError
      ? err.type === "entity.parse.failed"
        ? "Invalid JSON in request body"
        : err.message
      : "Internal server error",
  });
});

module.exports = app;
