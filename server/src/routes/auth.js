
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

// Generate authentication token
function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      userId: user.user_id,
      role: user.role_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

// REGISTER STUDENT
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "Please enter a valid full name",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    // Check whether email is already registered
    const [existingUsers] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // Find Student role from roles table
    const [roles] = await pool.query(
      "SELECT role_id, role_name FROM roles WHERE role_name = ? LIMIT 1",
      ["Student"]
    );

    if (roles.length === 0) {
      return res.status(500).json({
        message: "Student role is not configured in the database",
      });
    }

    // Hash password before storing it
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users
        (role_id, full_name, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [
        roles[0].role_id,
        cleanName,
        cleanEmail,
        passwordHash,
      ]
    );

    res.status(201).json({
      message: "Student account created successfully",
      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        role: "Student",
      },
    });
  } catch (error) {
    // Also handle duplicate-email race conditions
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    next(error);
  }
});

// STUDENT LOGIN
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [users] = await pool.query(
      `SELECT
         u.user_id,
         u.full_name,
         u.email,
         u.password_hash,
         u.is_active,
         r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = ?
       LIMIT 1`,
      [cleanEmail]
    );

    if (
      users.length === 0 ||
      users[0].role_name.toLowerCase() !== "student" ||
      !users[0].is_active
    ) {
      return res.status(401).json({
        message: "Invalid student email or password",
      });
    }

    const student = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      student.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid student email or password",
      });
    }

    const token = generateToken(student);

    res.json({
      message: "Student login successful",
      token,
      user: {
        id: student.user_id,
        name: student.full_name,
        email: student.email,
        role: student.role_name,
      },
    });
  } catch (error) {
    next(error);
  }
});

// EXISTING ADMIN LOGIN
router.post("/admin-login", async (req, res, next) => {
  try {
    const { email, password, adminCode } = req.body;

    if (!email || !password || !adminCode) {
      return res.status(400).json({
        message: "Email, password and admin code are required",
      });
    }

    if (adminCode !== process.env.ADMIN_ACCESS_CODE) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    const [users] = await pool.query(
      `SELECT
         u.user_id,
         u.full_name,
         u.email,
         u.password_hash,
         u.is_active,
         r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (
      users.length === 0 ||
      users[0].role_name.toLowerCase() !== "admin" ||
      !users[0].is_active
    ) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    const admin = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    const token = generateToken(admin);

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: admin.user_id,
        name: admin.full_name,
        email: admin.email,
        role: admin.role_name,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
