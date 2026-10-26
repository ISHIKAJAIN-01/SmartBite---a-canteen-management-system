
const express = require('express')
const router = express.Router()
const db = require('../db')

// Convert database rows into the format used by the frontend
const formatMenuItem = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  category: row.category,
  price: Number(row.price),
  imageUrl: '',
  tag: row.tag || 'Vegetarian',
  available: Boolean(row.available),
  isVegetarian: Boolean(row.isVegetarian),
})

// Fetch menu items from MySQL
const getMenuQuery = `
  SELECT
    m.item_id AS id,
    m.item_name AS name,
    m.description,
    c.category_name AS category,
    m.price,
    m.food_type AS tag,
    m.is_available AS available,
    m.is_vegetarian AS isVegetarian
  FROM menu_items m
  JOIN categories c ON c.category_id = m.category_id
`

// Find a category, creating it if necessary
async function findCategoryId(connection, category) {
  const [existing] = await connection.execute(
    'SELECT category_id FROM categories WHERE category_name = ?',
    [category]
  )

  if (existing.length) return existing[0].category_id

  const [result] = await connection.execute(
    'INSERT INTO categories (category_name) VALUES (?)',
    [category]
  )

  return result.insertId
}

// GET /api/menu - fetch all menu items
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `${getMenuQuery} ORDER BY m.item_id DESC`
    )
    res.json(rows.map(formatMenuItem))
  } catch (error) {
    next(error)
  }
})

// GET /api/menu/:id - fetch one menu item
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid menu item ID' })
    }

    const [rows] = await db.execute(
      `${getMenuQuery} WHERE m.item_id = ?`,
      [id]
    )

    if (!rows.length) {
      return res.status(404).json({ message: 'Menu item not found' })
    }

    res.json(formatMenuItem(rows[0]))
  } catch (error) {
    next(error)
  }
})

// POST /api/menu - create a menu item
router.post('/', async (req, res, next) => {
  const {
    name,
    category,
    price,
    description = '',
    tag = 'Vegetarian',
    available = true,
    isVegetarian,
  } = req.body

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof category !== 'string' || !category.trim() ||
    price === '' || price === null || price === undefined ||
    !Number.isFinite(Number(price)) || Number(price) <= 0
  ) {
    return res.status(400).json({
      message: 'Valid name, category and positive price are required',
    })
  }

  if (
    typeof available !== 'boolean' ||
    (isVegetarian !== undefined && typeof isVegetarian !== 'boolean')
  ) {
    return res.status(400).json({
      message: 'Availability and vegetarian status must be true or false',
    })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const categoryId = await findCategoryId(connection, category.trim())

    const vegetarian = isVegetarian ?? (
      String(tag).toLowerCase() === 'vegetarian'
    )

    const [result] = await connection.execute(
      `INSERT INTO menu_items
        (category_id, item_name, description, price, food_type,
         is_vegetarian, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId,
        name.trim(),
        description,
        Number(price),
        tag,
        vegetarian,
        available,
      ]
    )

    await connection.commit()

    const [rows] = await db.execute(
      `${getMenuQuery} WHERE m.item_id = ?`,
      [result.insertId]
    )

    res.status(201).json(formatMenuItem(rows[0]))
  } catch (error) {
    if (connection) await connection.rollback()
    next(error)
  } finally {
    if (connection) connection.release()
  }
})

// PUT /api/menu/:id - update a menu item
router.put('/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  const {
    name,
    category,
    price,
    description,
    tag,
    available,
    isVegetarian,
  } = req.body

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid menu item ID' })
  }

  if (name !== undefined &&
      (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ message: 'Name cannot be empty' })
  }

  if (category !== undefined &&
      (typeof category !== 'string' || !category.trim())) {
    return res.status(400).json({ message: 'Category cannot be empty' })
  }

  if (price !== undefined &&
      (price === '' || price === null ||
       !Number.isFinite(Number(price)) || Number(price) <= 0)) {
    return res.status(400).json({ message: 'Price must be positive' })
  }

  if (available !== undefined && typeof available !== 'boolean') {
    return res.status(400).json({ message: 'Availability must be true or false' })
  }

  if (isVegetarian !== undefined &&
      typeof isVegetarian !== 'boolean') {
    return res.status(400).json({
      message: 'Vegetarian status must be true or false',
    })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [existing] = await connection.execute(
      'SELECT * FROM menu_items WHERE item_id = ? FOR UPDATE',
      [id]
    )

    if (!existing.length) {
      await connection.rollback()
      return res.status(404).json({ message: 'Menu item not found' })
    }

    const current = existing[0]
    let categoryId = current.category_id

    if (category !== undefined) {
      categoryId = await findCategoryId(connection, category.trim())
    }

    const newTag = tag ?? current.food_type
    const vegetarian = isVegetarian ?? (
      tag !== undefined
        ? String(newTag).toLowerCase() === 'vegetarian'
        : Boolean(current.is_vegetarian)
    )

    await connection.execute(
      `UPDATE menu_items
       SET category_id = ?,
           item_name = ?,
           description = ?,
           price = ?,
           food_type = ?,
           is_vegetarian = ?,
           is_available = ?
       WHERE item_id = ?`,
      [
        categoryId,
        name === undefined ? current.item_name : name.trim(),
        description === undefined ? current.description : description,
        price === undefined ? current.price : Number(price),
        newTag,
        vegetarian,
        available === undefined ? Boolean(current.is_available) : available,
        id,
      ]
    )

    await connection.commit()

    const [rows] = await db.execute(
      `${getMenuQuery} WHERE m.item_id = ?`,
      [id]
    )

    res.json(formatMenuItem(rows[0]))
  } catch (error) {
    if (connection) await connection.rollback()
    next(error)
  } finally {
    if (connection) connection.release()
  }
})

// DELETE /api/menu/:id - delete a menu item
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid menu item ID' })
    }

    const [result] = await db.execute(
      'DELETE FROM menu_items WHERE item_id = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' })
    }

    res.json({ message: 'Menu item deleted', id })
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'This item is linked to other records and cannot be deleted.',
      })
    }

    next(error)
  }
})

module.exports = router
