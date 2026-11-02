/**
 * Admin Order Management Routes
 * GET /api/admin/orders
 * GET /api/admin/orders/:id
 * PUT /api/admin/orders/:id  { status }
 */

const express = require('express')
const router = express.Router()
const db = require('../../config/db')

const {
  authenticateToken,
  requireAdmin,
} = require('../../../middleware/authMiddleware')

router.use(authenticateToken, requireAdmin)

const validStatuses = [
  'Pending',
  'Placed',
  'Preparing',
  'Ready',
  'Collected',
  'Cancelled',
]

const ACTIVE_QUEUE_STATUSES = new Set(['Pending', 'Placed', 'Preparing'])

function formatOrder(row, queuePosition = null) {
  const date = row.order_date ? new Date(row.order_date) : new Date()

  return {
    id: row.order_id,
    order_id: row.order_id,
    user_id: row.user_id,
    student: row.student_name || `User #${row.user_id}`,
    items: row.items_summary || 'No items found',
    total: Number(row.total_amount),
    status: row.status,
    order_date: row.order_date,
    time: date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    estimated_prep_minutes:
      row.estimated_prep_minutes != null
        ? Number(row.estimated_prep_minutes)
        : null,
    estimated_ready_at: row.estimated_ready_at || null,
    queue_position: queuePosition,
  }
}

/**
 * Assign FIFO queue positions to active orders only.
 * Position 1 = earliest order_date, then order_id.
 */
function assignQueuePositions(rows) {
  const active = rows
    .filter((r) => ACTIVE_QUEUE_STATUSES.has(r.status))
    .slice()
    .sort((a, b) => {
      const ta = new Date(a.order_date).getTime()
      const tb = new Date(b.order_date).getTime()
      if (ta !== tb) return ta - tb
      return Number(a.order_id) - Number(b.order_id)
    })

  const positionById = new Map()
  active.forEach((row, index) => {
    positionById.set(Number(row.order_id), index + 1)
  })
  return positionById
}

// Prefer canonical table names used by student order APIs
const orderDetailsQuery = `
  SELECT
    o.order_id,
    o.user_id,
    o.order_date,
    o.status,
    o.total_amount,
    o.estimated_prep_minutes,
    o.estimated_ready_at,
    COALESCE(u.full_name, CONCAT('User #', o.user_id)) AS student_name,
    GROUP_CONCAT(
      CONCAT(COALESCE(mi.item_name, CONCAT('Item ', oi.item_id)), ' × ', oi.quantity)
      ORDER BY oi.order_item_id
      SEPARATOR ', '
    ) AS items_summary
  FROM Orders o
  LEFT JOIN users u
    ON o.user_id = u.user_id
  LEFT JOIN Order_Items oi
    ON o.order_id = oi.order_id
  LEFT JOIN menu_items mi
    ON oi.item_id = mi.item_id
`

// GET all orders
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      ${orderDetailsQuery}
      GROUP BY
        o.order_id,
        o.user_id,
        o.order_date,
        o.status,
        o.total_amount,
        o.estimated_prep_minutes,
        o.estimated_ready_at,
        u.full_name
      ORDER BY o.order_date DESC, o.order_id DESC
    `)

    const positions = assignQueuePositions(rows)
    res.json(
      rows.map((row) =>
        formatOrder(row, positions.get(Number(row.order_id)) || null)
      )
    )
  } catch (error) {
    console.error('Fetch orders error:', error)
    res.status(500).json({ message: 'Could not fetch orders', detail: error.message })
  }
})

// GET one order
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      ${orderDetailsQuery}
      WHERE o.order_id = ?
      GROUP BY
        o.order_id,
        o.user_id,
        o.order_date,
        o.status,
        o.total_amount,
        o.estimated_prep_minutes,
        o.estimated_ready_at,
        u.full_name
    `,
      [req.params.id]
    )

    if (!rows.length) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Position among active orders
    let queuePosition = null
    if (ACTIVE_QUEUE_STATUSES.has(rows[0].status)) {
      const [activeRows] = await db.query(
        `SELECT order_id, order_date, status
         FROM Orders
         WHERE status IN ('Pending', 'Placed', 'Preparing')
         ORDER BY order_date ASC, order_id ASC`
      )
      const idx = activeRows.findIndex(
        (r) => Number(r.order_id) === Number(rows[0].order_id)
      )
      if (idx >= 0) queuePosition = idx + 1
    }

    res.json(formatOrder(rows[0], queuePosition))
  } catch (error) {
    console.error('Fetch order error:', error)
    res.status(500).json({ message: 'Could not fetch order' })
  }
})

// PUT update status (and related timestamps when Ready / Cancelled)
router.put('/:id', async (req, res) => {
  try {
    const { status, special_instructions } = req.body || {}
    const orderId = req.params.id

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' })
    }

    const updates = []
    const values = []

    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)

      if (status === 'Ready') {
        updates.push('actual_ready_at = COALESCE(actual_ready_at, CURRENT_TIMESTAMP)')
      }
      if (status === 'Cancelled') {
        updates.push('cancelled_at = COALESCE(cancelled_at, CURRENT_TIMESTAMP)')
      }
    }

    if (special_instructions !== undefined) {
      updates.push('special_instructions = ?')
      values.push(special_instructions)
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields provided' })
    }

    values.push(orderId)

    const [result] = await db.query(
      `UPDATE Orders SET ${updates.join(', ')} WHERE order_id = ?`,
      values
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const [rows] = await db.query(
      `
      ${orderDetailsQuery}
      WHERE o.order_id = ?
      GROUP BY
        o.order_id,
        o.user_id,
        o.order_date,
        o.status,
        o.total_amount,
        o.estimated_prep_minutes,
        o.estimated_ready_at,
        u.full_name
    `,
      [orderId]
    )

    let queuePosition = null
    if (rows.length && ACTIVE_QUEUE_STATUSES.has(rows[0].status)) {
      const [activeRows] = await db.query(
        `SELECT order_id FROM Orders
         WHERE status IN ('Pending', 'Placed', 'Preparing')
         ORDER BY order_date ASC, order_id ASC`
      )
      const idx = activeRows.findIndex(
        (r) => Number(r.order_id) === Number(orderId)
      )
      if (idx >= 0) queuePosition = idx + 1
    }

    res.json(formatOrder(rows[0], queuePosition))
  } catch (error) {
    console.error('Update order error:', error)
    res.status(500).json({ message: 'Could not update order', detail: error.message })
  }
})

module.exports = router

