
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required. Please log in.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired login session. Please log in again.",
    });
  }
}

function requireStudent(req, res, next) {
  if (req.user?.role?.toLowerCase() !== "student") {
    return res.status(403).json({
      status: "error",
      message: "Access restricted to student accounts.",
    });
  }

  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role?.toLowerCase() !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Admin access required.",
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireStudent,
  requireAdmin,
};
