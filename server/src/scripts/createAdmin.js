require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdmin() {
  try {
    const name = await ask("Admin name: ");
    const email = await ask("Admin email: ");
    const password = await ask("Admin password: ");

    const [roles] = await pool.query(
      "SELECT role_id FROM roles WHERE role_name = 'Admin'"
    );

    if (!roles.length) {
      throw new Error("Admin role not found. Add Admin role first.");
    }

    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length) {
      throw new Error("This email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users
       (full_name, email, password_hash, role_id, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [name, email, passwordHash, roles[0].role_id]
    );

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

createAdmin();