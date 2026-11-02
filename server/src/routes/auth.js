const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

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
      `SELECT u.user_id, u.full_name, u.email, u.password_hash,
              u.is_active, r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = ?
       LIMIT 1`,
      [email]
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

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        userId: admin.user_id,
        role: "Admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

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