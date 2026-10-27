
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const ordersRouter = require("./routes/orders");
const paymentsRouter = require("./routes/payments");

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5176",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. local health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
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
app.get("/api/db-test", async (req, res) => {
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
});

// Feature routers (must stay above the 404 handler)
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);

// 404 route
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "API route not found",
  });
});

// Error handler (must be last, and must keep all 4 arguments)
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
