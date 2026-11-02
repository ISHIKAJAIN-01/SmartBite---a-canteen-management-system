
const express = require('express')
const router = express.Router()
const db = require('../config/db')

const {
  authenticateToken,
  requireStudent,
} = require('../../middleware/authMiddleware')

// All likes APIs require a logged-in student.
router.use(authenticateToken, requireStudent)

// GET /api/product-likes
// Fetch public like counts and current student's like status.
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         item_id,
         COUNT(*) AS likeCount,
         MAX(CASE WHEN user_id = ? THEN 1 ELSE 0 END) AS isLiked
       FROM product_likes
       GROUP BY item_id`,
      [req.user.userId]
    )

    res.json(
      rows.map(row => ({
        item_id: row.item_id,
        likeCount: Number(row.likeCount),
        isLiked: Boolean(row.isLiked),
      }))
    )
  } catch (error) {
    next(error)
  }
})

// POST /api/product-likes/:itemId
// Like a product.
router.post('/:itemId', async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId)

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({ message: 'Invalid product ID' })
    }

    await db.execute(
      `INSERT IGNORE INTO product_likes (user_id, item_id)
       VALUES (?, ?)`,
      [req.user.userId, itemId]
    )

    const [rows] = await db.execute(
      'SELECT COUNT(*) AS likeCount FROM product_likes WHERE item_id = ?',
      [itemId]
    )

    res.json({
      item_id: itemId,
      likeCount: Number(rows[0].likeCount),
      isLiked: true,
    })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/product-likes/:itemId
// Unlike a product.
router.delete('/:itemId', async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId)

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({ message: 'Invalid product ID' })
    }

    await db.execute(
      'DELETE FROM product_likes WHERE user_id = ? AND item_id = ?',
      [req.user.userId, itemId]
    )

    const [rows] = await db.execute(
      'SELECT COUNT(*) AS likeCount FROM product_likes WHERE item_id = ?',
      [itemId]
    )

    res.json({
      item_id: itemId,
      likeCount: Number(rows[0].likeCount),
      isLiked: false,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
