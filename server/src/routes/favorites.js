
const express = require('express');
const router = express.Router();
const db = require('../config/db');

const {
  authenticateToken,
  requireStudent,
} = require('../../middleware/authMiddleware');

// All favourites APIs require a logged-in student.
router.use(authenticateToken, requireStudent);

// GET /api/favorites
// Fetch the current student's favourite products.
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT item_id
       FROM favorites
       WHERE user_id = ?`,
      [req.user.userId]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/favorites/:itemId
// Add a product to favourites.
router.post('/:itemId', async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    await db.execute(
      `INSERT IGNORE INTO favorites (user_id, item_id)
       VALUES (?, ?)`,
      [req.user.userId, itemId]
    );

    res.json({
      item_id: itemId,
      isFavourite: true,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/favorites/:itemId
// Remove a product from favourites.
router.delete('/:itemId', async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    await db.execute(
      `DELETE FROM favorites
       WHERE user_id = ? AND item_id = ?`,
      [req.user.userId, itemId]
    );

    res.json({
      item_id: itemId,
      isFavourite: false,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
