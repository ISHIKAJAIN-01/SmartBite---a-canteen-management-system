/**
 * SmartBite Authentication & Authorization Middleware
 * Verifies student/staff identity via JWT Bearer tokens.
 * Provides safe development testing helper to easily test different student profiles.
 */

const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'smartbite_college_canteen_jwt_secret_key_2026';

/**
 * Generate a JWT token for a given user object
 */
function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Middleware: Verify user authentication
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // =========================================================================
    // [DEVELOPMENT-ONLY FIXTURE]
    // Safe development-only testing support for viva/evaluation demonstrations:
    // If running in development and client passes 'x-user-id' or 'x-auth-user-id',
    // allow selecting one of the known demo accounts if no Bearer token is provided.
    // In production environments (NODE_ENV === 'production'), this bypass is
    // completely disabled and a valid signed JWT Bearer token is strictly required.
    // NOTE: This will be replaced with the team's shared production authentication
    // during multi-member integration.
    // =========================================================================
    const isDevMode = process.env.NODE_ENV !== 'production';
    const devUserIdHeader = req.headers['x-user-id'] || req.headers['x-auth-user-id'];

    if (!token && isDevMode && devUserIdHeader) {
      const devUserId = parseInt(devUserIdHeader, 10);
      if (!isNaN(devUserId)) {
        const rows = await db.query('SELECT user_id, name, email, role FROM Users WHERE user_id = ?', [devUserId]);
        if (rows && rows.length > 0) {
          req.user = rows[0];
          return next();
        }
      }
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is required to access order details.',
      });
    }

    // Verify JWT
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired authentication token. Please sign in again.',
        });
      }

      req.user = {
        user_id: decoded.user_id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role || 'student',
      };
      next();
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to authenticate request.',
    });
  }
}

/**
 * Middleware: Ensure the user is canteen staff or administrator
 */
function requireStaff(req, res, next) {
  if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'admin')) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'This action requires canteen staff privileges.',
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireStaff,
  generateToken,
};
