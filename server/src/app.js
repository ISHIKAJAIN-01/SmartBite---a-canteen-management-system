/**
 * SmartBite Express Application
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const orderTrackingRoutes = require('./routes/orderTrackingRoutes');

dotenv.config();

const app = express();

// Security and middleware
app.use(cors({
  origin: true, // Allow frontend dev server
  credentials: true,
}));

app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

const db = require('./config/db');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SmartBite Member 3 - Order Tracking & Queue API',
    database: {
      mode: db.isLiveMySQL() ? 'live_mysql' : 'development_fallback',
      is_live_mysql: db.isLiveMySQL(),
      shared_db_reconciliation: 'deferred_to_team_integration_phase',
    },
  });
});

// Mount tracking routes
app.use('/api', orderTrackingRoutes);

// 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API route ${req.method} ${req.url} does not exist.`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[SmartBite Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.',
  });
});

module.exports = app;
