
const express = require('express')
const router = express.Router()
const db = require('../db')

// Frontend-compatible inventory fields
const mapItem = (row) => ({
  id: Number(row.ingredient_id),
  name: row.ingredient_name,
  quantity: Number(row.quantity_on_hand),
  unit: row.unit,
  threshold: Number(row.reorder_level),
  category: 'General',
  lowStock: Number(row.quantity_on_hand) <= Number(row.reorder_level),
})

const validNumber = (value) =>
  value !== '' &&
  value !== null &&
  value !== undefined &&
  Number.isFinite(Number(value)) &&
  Number(value) >= 0

const getItems = async (connection = db) => {
  const [rows] = await connection.query(`
    SELECT
      i.ingredient_id,
      i.ingredient_name,
      i.unit,
      inv.quantity_on_hand,
      inv.reorder_level
    FROM ingredients i
    INNER JOIN inventory inv
      ON inv.ingredient_id = i.ingredient_id
    ORDER BY i.ingredient_id
  `)

  return rows
}

// GET all inventory
router.get('/', async (req, res) => {
  try {
    res.json(await getItems())
  } catch (error) {
    console.error('Get inventory error:', error.message)
    res.status(500).json({ message: 'Failed to fetch inventory' })
  }
})

// GET one inventory item
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.ingredient_id, i.ingredient_name, i.unit,
             inv.quantity_on_hand, inv.reorder_level
      FROM ingredients i
      INNER JOIN inventory inv ON inv.ingredient_id = i.ingredient_id
      WHERE i.ingredient_id = ?
    `, [req.params.id])

    if (!rows.length) {
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    res.json(mapItem(rows[0]))
  } catch (error) {
    console.error('Get inventory item error:', error.message)
    res.status(500).json({ message: 'Failed to fetch inventory item' })
  }
})

// ADD ingredient and its inventory record
router.post('/', async (req, res) => {
  const { name, quantity, unit, threshold } = req.body

  if (
    !name?.trim() ||
    !unit?.trim() ||
    !validNumber(quantity) ||
    !validNumber(threshold)
  ) {
    return res.status(400).json({
      message: 'Valid name, quantity, unit and threshold are required',
    })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    // Reuse an existing ingredient if it has no inventory record
    const [existing] = await connection.query(
      'SELECT ingredient_id FROM ingredients WHERE ingredient_name = ? FOR UPDATE',
      [name.trim()]
    )

    let ingredientId

    if (existing.length) {
      ingredientId = existing[0].ingredient_id
    } else {
      const [ingredientResult] = await connection.query(
        'INSERT INTO ingredients (ingredient_name, unit) VALUES (?, ?)',
        [name.trim(), unit.trim()]
      )
      ingredientId = ingredientResult.insertId
    }

    // Keep the unit in sync if the ingredient already existed
    await connection.query(
      'UPDATE ingredients SET unit = ? WHERE ingredient_id = ?',
      [unit.trim(), ingredientId]
    )

    const [existingInventory] = await connection.query(
      'SELECT inventory_id FROM inventory WHERE ingredient_id = ? FOR UPDATE',
      [ingredientId]
    )

    if (existingInventory.length) {
      await connection.rollback()
      return res.status(409).json({
        message: 'This ingredient already has an inventory record',
      })
    }

    await connection.query(
      `INSERT INTO inventory
        (ingredient_id, quantity_on_hand, reorder_level)
       VALUES (?, ?, ?)`,
      [ingredientId, Number(quantity), Number(threshold)]
    )

    if (Number(quantity) > 0) {
      await connection.query(
        `INSERT INTO inventory_transactions
          (ingredient_id, transaction_type, quantity_change, notes)
         VALUES (?, 'STOCK_ADDED', ?, 'Initial stock added')`,
        [ingredientId, Number(quantity)]
      )
    }

    await connection.commit()

    res.status(201).json({
      id: Number(ingredientId),
      name: name.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      threshold: Number(threshold),
      category: 'General',
      lowStock: Number(quantity) <= Number(threshold),
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('Add inventory error:', error.message)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ingredient already exists' })
    }

    res.status(500).json({ message: 'Failed to add inventory item' })
  } finally {
    if (connection) connection.release()
  }
})

// UPDATE stock quantity and reorder threshold
router.put('/:id', async (req, res) => {
  const { name, quantity, unit, threshold } = req.body

  if (
    (name !== undefined && !name?.trim()) ||
    (unit !== undefined && !unit?.trim()) ||
    (quantity !== undefined && !validNumber(quantity)) ||
    (threshold !== undefined && !validNumber(threshold))
  ) {
    return res.status(400).json({ message: 'Invalid inventory fields' })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [rows] = await connection.query(
      `SELECT i.ingredient_id, i.ingredient_name, i.unit,
              inv.quantity_on_hand, inv.reorder_level
       FROM ingredients i
       INNER JOIN inventory inv ON inv.ingredient_id = i.ingredient_id
       WHERE i.ingredient_id = ?
       FOR UPDATE`,
      [req.params.id]
    )

    if (!rows.length) {
      await connection.rollback()
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    const current = rows[0]
    const newName = name?.trim() ?? current.ingredient_name
    const newUnit = unit?.trim() ?? current.unit
    const newQuantity = quantity === undefined
      ? Number(current.quantity_on_hand)
      : Number(quantity)
    const newThreshold = threshold === undefined
      ? Number(current.reorder_level)
      : Number(threshold)

    await connection.query(
      `UPDATE ingredients
       SET ingredient_name = ?, unit = ?
       WHERE ingredient_id = ?`,
      [newName, newUnit, current.ingredient_id]
    )

    await connection.query(
      `UPDATE inventory
       SET quantity_on_hand = ?, reorder_level = ?
       WHERE ingredient_id = ?`,
      [newQuantity, newThreshold, current.ingredient_id]
    )

    const difference = Number(
      (newQuantity - Number(current.quantity_on_hand)).toFixed(3)
    )

    if (difference !== 0) {
      await connection.query(
        `INSERT INTO inventory_transactions
          (ingredient_id, transaction_type, quantity_change, notes)
         VALUES (?, 'STOCK_ADJUSTED', ?, ?)`,
        [
          current.ingredient_id,
          difference,
          'Stock adjusted through inventory management',
        ]
      )
    }

    await connection.commit()

    res.json({
      id: Number(current.ingredient_id),
      name: newName,
      quantity: newQuantity,
      unit: newUnit,
      threshold: newThreshold,
      category: 'General',
      lowStock: newQuantity <= newThreshold,
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('Update inventory error:', error.message)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ingredient name already exists' })
    }

    res.status(500).json({ message: 'Failed to update inventory item' })
  } finally {
    if (connection) connection.release()
  }
})

// REMOVE inventory record but preserve ingredient and transaction history
router.delete('/:id', async (req, res) => {
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [rows] = await connection.query(
      `SELECT i.ingredient_id, i.ingredient_name, i.unit,
              inv.quantity_on_hand, inv.reorder_level
       FROM ingredients i
       INNER JOIN inventory inv ON inv.ingredient_id = i.ingredient_id
       WHERE i.ingredient_id = ?
       FOR UPDATE`,
      [req.params.id]
    )

    if (!rows.length) {
      await connection.rollback()
      return res.status(404).json({ message: 'Inventory item not found' })
    }

    const item = rows[0]
    const quantity = Number(item.quantity_on_hand)

    if (quantity > 0) {
      await connection.query(
        `INSERT INTO inventory_transactions
          (ingredient_id, transaction_type, quantity_change, notes)
         VALUES (?, 'STOCK_REMOVED', ?, ?)`,
        [
          item.ingredient_id,
          -quantity,
          'Inventory record removed; remaining stock taken out of active inventory',
        ]
      )
    }

    await connection.query(
      'DELETE FROM inventory WHERE ingredient_id = ?',
      [item.ingredient_id]
    )

    await connection.commit()

    res.json({
      message: 'Inventory record removed; ingredient history preserved',
      item: mapItem({
        ...item,
        quantity_on_hand: quantity,
      }),
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('Delete inventory error:', error.message)
    res.status(500).json({ message: 'Failed to remove inventory item' })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
