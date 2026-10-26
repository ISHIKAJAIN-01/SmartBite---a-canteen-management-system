
const express = require('express')
const router = express.Router()
const db = require('../db')

const validStatuses = [
  'Placed',
  'Preparing',
  'Ready',
  'Collected',
  'Cancelled',
]

function formatOrder(row) {
  const date = new Date(row.created_at)

  return {
    id: row.order_code,
    student: row.student_name,
    items: row.items_summary,
    total: Number(row.total),
    status: row.status,
    time: date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

function getOrderCodeNumber(code) {
  const match = /^SB-(\d+)$/.exec(String(code || ''))
  return match ? Number(match[1]) : null
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM orders ORDER BY created_at DESC, order_id DESC'
    )

    res.json(rows.map(formatOrder))
  } catch (error) {
    console.error('Fetch orders error:', error)
    res.status(500).json({ message: 'Could not fetch orders' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE order_code = ?',
      [req.params.id]
    )

    if (!rows.length) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json(formatOrder(rows[0]))
  } catch (error) {
    console.error('Fetch order error:', error)
    res.status(500).json({ message: 'Could not fetch order' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { student, items, total } = req.body

    if (
      typeof student !== 'string' ||
      !student.trim() ||
      (typeof items !== 'string' && !Array.isArray(items)) ||
      !items.length ||
      !Number.isFinite(Number(total)) ||
      Number(total) < 0
    ) {
      return res.status(400).json({
        message: 'Valid student, items and total are required',
      })
    }

    const itemsSummary = Array.isArray(items)
      ? items.map(item =>
          typeof item === 'string'
            ? item
            : `${item.name || item.item_name || 'Item'} × ${Number(item.quantity || 1)}`
        ).join(', ')
      : items.trim()

    if (!itemsSummary) {
      return res.status(400).json({ message: 'Order items are required' })
    }

    // Generate the next order number from the highest existing SB number.
    const [latest] = await db.query(
      "SELECT order_code FROM orders WHERE order_code REGEXP '^SB-[0-9]+$' ORDER BY CAST(SUBSTRING(order_code, 4) AS UNSIGNED) DESC LIMIT 1"
    )

    const nextNumber = Math.max(
      1049,
      (getOrderCodeNumber(latest[0]?.order_code) || 1048) + 1
    )
    const orderCode = `SB-${nextNumber}`

    const [result] = await db.query(
      `INSERT INTO orders
        (order_code, student_name, items_summary, total, status)
       VALUES (?, ?, ?, ?, ?)`,
      [orderCode, student.trim(), itemsSummary, Number(total), 'Placed']
    )

    const [rows] = await db.query(
      'SELECT * FROM orders WHERE order_id = ?',
      [result.insertId]
    )

    res.status(201).json(formatOrder(rows[0]))
  } catch (error) {
    console.error('Create order error:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Order ID already exists. Please retry.',
      })
    }

    res.status(500).json({ message: 'Could not create order' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { status, student, items, total } = req.body

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' })
    }

    if (student !== undefined &&
        (typeof student !== 'string' || !student.trim())) {
      return res.status(400).json({ message: 'Invalid student name' })
    }

    if (total !== undefined &&
        (!Number.isFinite(Number(total)) || Number(total) < 0)) {
      return res.status(400).json({ message: 'Invalid order total' })
    }

    const updates = []
    const values = []

    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
    }

    if (student !== undefined) {
      updates.push('student_name = ?')
      values.push(student.trim())
    }

    if (items !== undefined) {
      const itemsSummary = Array.isArray(items)
        ? items.map(item =>
            typeof item === 'string'
              ? item
              : `${item.name || item.item_name || 'Item'} × ${Number(item.quantity || 1)}`
          ).join(', ')
        : String(items).trim()

      if (!itemsSummary) {
        return res.status(400).json({ message: 'Invalid order items' })
      }

      updates.push('items_summary = ?')
      values.push(itemsSummary)
    }

    if (total !== undefined) {
      updates.push('total = ?')
      values.push(Number(total))
    }

    if (!updates.length) {
      return res.status(400).json({ message: 'No valid fields provided' })
    }

    values.push(req.params.id)

    const [result] = await db.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE order_code = ?`,
      values
    )

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const [rows] = await db.query(
      'SELECT * FROM orders WHERE order_code = ?',
      [req.params.id]
    )

    res.json(formatOrder(rows[0]))
  } catch (error) {
    console.error('Update order error:', error)
    res.status(500).json({ message: 'Could not update order' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE order_code = ?',
      [req.params.id]
    )

    if (!rows.length) {
      return res.status(404).json({ message: 'Order not found' })
    }

    await db.query(
      'DELETE FROM orders WHERE order_code = ?',
      [req.params.id]
    )

    res.json({
      message: 'Order deleted',
      order: formatOrder(rows[0]),
    })
  } catch (error) {
    console.error('Delete order error:', error)
    res.status(500).json({ message: 'Could not delete order' })
  }
})

module.exports = router
