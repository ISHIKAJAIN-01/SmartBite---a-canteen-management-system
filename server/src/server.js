/**
 * SmartBite HTTP Server Entrypoint
 */

const app = require('./app');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`☕ SmartBite Server (Member 3: Order Tracking & Queue)`);
  console.log(`🚀 Running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[SmartBite] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[SmartBite] Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[SmartBite] SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('[SmartBite] Server closed.');
    process.exit(0);
  });
});
