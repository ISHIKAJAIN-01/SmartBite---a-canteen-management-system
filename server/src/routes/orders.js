
const express = require("express");
const pool = require("../config/db");
const menuSchema = require("../config/menuSchema");

const router = express.Router();

const ORDER_STATUS_PENDING = "Pending";
const ORDER_STATUS_CANCELLED = "Cancelled";

const CART_TYPES = {
  MEALS_DRINKS: "meals_drinks",
  SNACKS_DESSERTS: "snacks_desserts",
};

const MAX_INT = 2147483647;
const MAX_ITEM_LINES = 50;
const MAX_QUANTITY_PER_ITEM = 100;
const MAX_TOTAL_CENTS = 9999999999;

const ALLOWED_CATEGORIES = {
  [CART_TYPES.MEALS_DRINKS]: ["Meals", "Drinks"],
  [CART_TYPES.SNACKS_DESSERTS]: ["Snacks", "Desserts"],
};

class OrderRequestError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function toPositiveInt(value) {
  let number = value;

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    number = Number(value.trim());
  }

  return Number.isSafeInteger(number) &&
    number > 0 &&
    number <= MAX_INT
    ? number
    : null;
}

function isPlainObject(value) {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function isSafeIdentifier(name) {
  return typeof name === "string" &&
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

function priceToCents(value) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value));

  if (!match) return null;

  return Number(match[1]) * 100 +
    Number((match[2] || "").padEnd(2, "0"));
}

function formatCents(cents) {
  return `${Math.floor(cents / 100)}.${String(cents % 100)
    .padStart(2, "0")}`;
}

function validateOrderBody(body) {
  if (!isPlainObject(body)) {
    return {
      errors: ["Request body must be a JSON object"],
    };
  }

  const errors = [];
  const userId = toPositiveInt(body.user_id);
  const cartType = body.cart_type;

  if (userId === null) {
    errors.push("user_id must be a positive integer");
  }

  if (!Object.values(CART_TYPES).includes(cartType)) {
    errors.push(
      'cart_type must be "meals_drinks" or "snacks_desserts"'
    );
  }

  const lines = new Map();

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push("items must be a non-empty array");
  } else if (body.items.length > MAX_ITEM_LINES) {
    errors.push(
      `items cannot contain more than ${MAX_ITEM_LINES} entries`
    );
  } else {
    body.items.forEach((entry, index) => {
      const itemId = isPlainObject(entry)
        ? toPositiveInt(entry.item_id)
        : null;

      const quantity = isPlainObject(entry)
        ? toPositiveInt(entry.quantity)
        : null;

      if (itemId === null) {
        errors.push(
          `items[${index}].item_id must be a positive integer`
        );
      }

      if (quantity === null) {
        errors.push(
          `items[${index}].quantity must be a positive integer`
        );
      }

      if (itemId !== null && quantity !== null) {
        lines.set(
          itemId,
          (lines.get(itemId) || 0) + quantity
        );
      }
    });

    for (const [itemId, quantity] of lines) {
      if (quantity > MAX_QUANTITY_PER_ITEM) {
        errors.push(
          `quantity for item_id ${itemId} cannot exceed ${MAX_QUANTITY_PER_ITEM}`
        );
      }
    }
  }

  return { errors, userId, cartType, lines };
}

function getMenuConfig() {
  const { table, idColumn, priceColumn } = menuSchema;

  if (
    !isSafeIdentifier(table) ||
    !isSafeIdentifier(idColumn) ||
    !isSafeIdentifier(priceColumn)
  ) {
    throw new Error(
      "Invalid menuSchema.js configuration"
    );
  }

  // The temporary menu table must contain a category column.
  return {
    table,
    idColumn,
    priceColumn,
    categoryColumn: "category",
  };
}

function menuLookupSql(config, count) {
  const placeholders = Array(count).fill("?").join(", ");

  return `
    SELECT
      \`${config.idColumn}\` AS item_id,
      \`${config.priceColumn}\` AS unit_price,
      \`${config.categoryColumn}\` AS category
    FROM \`${config.table}\`
    WHERE \`${config.idColumn}\` IN (${placeholders})
  `;
}

function orderItemsSql(config) {
  return `
    SELECT
      oi.order_item_id,
      oi.item_id,
      m.name AS item_name,
      oi.quantity,
      oi.unit_price,
      oi.subtotal
    FROM Order_Items oi
    LEFT JOIN \`${config.table}\` m
      ON m.\`${config.idColumn}\` = oi.item_id
    WHERE oi.order_id = ?
    ORDER BY oi.order_item_id
  `;
}

function sendError(res, error) {
  if (error instanceof OrderRequestError) {
    return res.status(error.status).json({
      status: "error",
      message: error.message,
      ...error.details,
    });
  }

  console.error("Orders API error:", error.message);

  return res.status(500).json({
    status: "error",
    message: "An internal server error occurred",
  });
}

// GET /api/orders
// Optional filter: GET /api/orders?user_id=1
router.get("/", async (req, res) => {
  const userId = req.query.user_id === undefined
    ? null
    : toPositiveInt(req.query.user_id);

  if (req.query.user_id !== undefined && userId === null) {
    return res.status(400).json({
      status: "error",
      message: "user_id must be a positive integer",
    });
  }

  try {
    let sql = `
      SELECT order_id, user_id, order_date, status,
             total_amount, pickup_code, cart_type
      FROM Orders
    `;
    const params = [];

    if (userId !== null) {
      sql += " WHERE user_id = ?";
      params.push(userId);
    }

    sql += " ORDER BY order_date DESC, order_id DESC";

    const [orders] = await pool.execute(sql, params);

    return res.json({
      status: "success",
      count: orders.length,
      orders,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

// GET /api/orders/user/:userId
router.get("/user/:userId", async (req, res) => {
  const userId = toPositiveInt(req.params.userId);

  if (userId === null) {
    return res.status(400).json({
      status: "error",
      message: "Invalid user ID",
    });
  }

  try {
    const [orders] = await pool.execute(
      `SELECT order_id, user_id, order_date, status,
              total_amount, pickup_code, cart_type
       FROM Orders
       WHERE user_id = ?
       ORDER BY order_date DESC, order_id DESC`,
      [userId]
    );

    return res.json({
      status: "success",
      count: orders.length,
      orders,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

// GET /api/orders/:id
router.get("/:id", async (req, res) => {
  const orderId = toPositiveInt(req.params.id);

  if (orderId === null) {
    return res.status(400).json({
      status: "error",
      message: "Invalid order ID",
    });
  }

  try {
    const config = getMenuConfig();

    const [orders] = await pool.execute(
      `SELECT order_id, user_id, order_date, status,
              total_amount, pickup_code, special_instructions,
              estimated_prep_minutes, estimated_ready_at,
              actual_ready_at, cancelled_at, cancellation_reason,
              cart_type
       FROM Orders
       WHERE order_id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    const [items] = await pool.execute(
      orderItemsSql(config),
      [orderId]
    );

    return res.json({
      status: "success",
      order: {
        ...orders[0],
        items,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
});

// POST /api/orders
// Body:
// {
//   "user_id": 1,
//   "cart_type": "meals_drinks",
//   "items": [
//     { "item_id": 1, "quantity": 2 }
//   ]
// }
router.post("/", async (req, res) => {
  const { errors, userId, cartType, lines } =
    validateOrderBody(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      status: "error",
      message: "Invalid order request",
      errors,
    });
  }

  let config;

  try {
    config = getMenuConfig();
  } catch (error) {
    return sendError(res, error);
  }

  const itemIds = [...lines.keys()].sort((a, b) => a - b);
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [menuRows] = await connection.execute(
      menuLookupSql(config, itemIds.length),
      itemIds
    );

    const menuById = new Map(
      menuRows.map((row) => [Number(row.item_id), row])
    );

    const missing = itemIds.filter((id) => !menuById.has(id));

    if (missing.length > 0) {
      throw new OrderRequestError(
        400,
        "Some menu items do not exist",
        { missing_item_ids: missing }
      );
    }

    const allowedCategories = ALLOWED_CATEGORIES[cartType];

    const invalidItems = itemIds
      .map((id) => menuById.get(id))
      .filter(
        (item) =>
          !allowedCategories.includes(item.category)
      )
      .map((item) => ({
        item_id: Number(item.item_id),
        category: item.category,
      }));

    if (invalidItems.length > 0) {
      throw new OrderRequestError(
        400,
        "One or more items do not belong to this cart",
        {
          cart_type: cartType,
          allowed_categories: allowedCategories,
          invalid_items: invalidItems,
        }
      );
    }

    let totalCents = 0;

    const orderLines = itemIds.map((itemId) => {
      const item = menuById.get(itemId);
      const unitCents = priceToCents(item.unit_price);

      if (unitCents === null) {
        throw new Error(
          `Invalid price for menu item ${itemId}`
        );
      }

      const quantity = lines.get(itemId);
      const subtotalCents = unitCents * quantity;

      totalCents += subtotalCents;

      return {
        item_id: itemId,
        quantity,
        unit_price: formatCents(unitCents),
        subtotal: formatCents(subtotalCents),
      };
    });

    if (totalCents > MAX_TOTAL_CENTS) {
      throw new OrderRequestError(
        400,
        "Order total exceeds the maximum allowed amount"
      );
    }

    const totalAmount = formatCents(totalCents);

    const [orderResult] = await connection.execute(
      `INSERT INTO Orders
        (user_id, status, total_amount, cart_type)
       VALUES (?, ?, ?, ?)`,
      [
        userId,
        ORDER_STATUS_PENDING,
        totalAmount,
        cartType,
      ]
    );

    const orderId = orderResult.insertId;

    const placeholders = orderLines
      .map(() => "(?, ?, ?, ?, ?)")
      .join(", ");

    const params = orderLines.flatMap((line) => [
      orderId,
      line.item_id,
      line.quantity,
      line.unit_price,
      line.subtotal,
    ]);

    await connection.execute(
      `INSERT INTO Order_Items
        (order_id, item_id, quantity, unit_price, subtotal)
       VALUES ${placeholders}`,
      params
    );

    await connection.commit();

    return res.status(201).json({
      status: "success",
      message: "Order placed successfully",
      order: {
        order_id: orderId,
        user_id: userId,
        cart_type: cartType,
        status: ORDER_STATUS_PENDING,
        total_amount: totalAmount,
        items: orderLines,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Order rollback failed:",
          rollbackError.message
        );
      }
    }

    if (error.errno === 1452) {
      return res.status(400).json({
        status: "error",
        message:
          "A referenced user or database record does not exist",
      });
    }

    return sendError(res, error);
  } finally {
    if (connection) connection.release();
  }
});

// PATCH /api/orders/:id/cancel
// Body (optional): { "reason": "Changed my mind" }
router.patch("/:id/cancel", async (req, res) => {
  const orderId = toPositiveInt(req.params.id);

  if (orderId === null) {
    return res.status(400).json({
      status: "error",
      message: "Invalid order ID",
    });
  }

  const reason =
    isPlainObject(req.body) &&
    typeof req.body.reason === "string"
      ? req.body.reason.trim().slice(0, 2000)
      : "";

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orders] = await connection.execute(
      `SELECT order_id, user_id, status, cart_type
       FROM Orders
       WHERE order_id = ?
       FOR UPDATE`,
      [orderId]
    );

    if (orders.length === 0) {
      throw new OrderRequestError(404, "Order not found");
    }

    const order = orders[0];

    if (order.cart_type !== CART_TYPES.SNACKS_DESSERTS) {
      throw new OrderRequestError(
        403,
        "Meals and Drinks orders cannot be cancelled"
      );
    }

    if (order.status === ORDER_STATUS_CANCELLED) {
      throw new OrderRequestError(
        409,
        "Order is already cancelled"
      );
    }

    if (order.status === "Completed") {
      throw new OrderRequestError(
        409,
        "Completed orders cannot be cancelled"
      );
    }

    await connection.execute(
      `UPDATE Orders
       SET status = ?,
           cancelled_at = CURRENT_TIMESTAMP,
           cancellation_reason = ?
       WHERE order_id = ?`,
      [
        ORDER_STATUS_CANCELLED,
        reason || null,
        orderId,
      ]
    );

    await connection.commit();

    return res.json({
      status: "success",
      message: "Order cancelled successfully",
      order: {
        order_id: orderId,
        user_id: order.user_id,
        cart_type: order.cart_type,
        status: ORDER_STATUS_CANCELLED,
        cancellation_reason: reason || null,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Cancellation rollback failed:",
          rollbackError.message
        );
      }
    }

    return sendError(res, error);
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
