/**
 * SmartBite - Database Connection Manager
 * Supports MySQL 8.0+ via mysql2/promise pool with safe fallback to
 * resilient in-memory data store if MySQL server is unreachable.
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartbite_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

let pool = null;
let isConnectedToMySQL = false;

// =============================================================================
// [DEVELOPMENT-ONLY FIXTURE]
// Local in-memory seed store used during local testing and viva demonstrations
// when MySQL is unreachable. Shared 15-table database reconciliation across
// all 4 team members will occur during the multi-member integration phase.
// =============================================================================
const inMemorySeed = {
  users: [
    { user_id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', role: 'student', phone_number: '+91 9876543210' },
    { user_id: 2, name: 'Ishika Jain', email: 'ishika.jain@college.edu', role: 'student', phone_number: '+91 9876543211' },
    { user_id: 3, name: 'Rohan Mehta', email: 'rohan.mehta@college.edu', role: 'student', phone_number: '+91 9876543212' },
    { user_id: 4, name: 'Canteen Counter Staff', email: 'staff@canteen.college.edu', role: 'staff', phone_number: '+91 9876543299' },
  ],
  menuItems: [
    { item_id: 1, item_name: 'Masala Dosa', category: 'Breakfast / South Indian', food_type: 'Veg', price: 70.00, prep_time_minutes: 12 },
    { item_id: 2, item_name: 'Paneer Grilled Sandwich', category: 'Snacks', food_type: 'Veg', price: 80.00, prep_time_minutes: 10 },
    { item_id: 3, item_name: 'Veg Hakka Noodles', category: 'Chinese', food_type: 'Veg', price: 90.00, prep_time_minutes: 15 },
    { item_id: 4, item_name: 'Cold Coffee with Ice Cream', category: 'Beverages', food_type: 'Beverage', price: 55.00, prep_time_minutes: 5 },
    { item_id: 5, item_name: 'Samosa (2 pcs)', category: 'Snacks', food_type: 'Veg', price: 30.00, prep_time_minutes: 4 },
    { item_id: 6, item_name: 'Masala Chai', category: 'Beverages', food_type: 'Beverage', price: 15.00, prep_time_minutes: 3 },
    { item_id: 7, item_name: 'Chole Bhature', category: 'Lunch Specials', food_type: 'Veg', price: 85.00, prep_time_minutes: 14 },
    { item_id: 8, item_name: 'Chicken Tikka Roll', category: 'Rolls', food_type: 'Non-Veg', price: 110.00, prep_time_minutes: 12 },
  ],
  settings: {
    pickup_instructions: 'Please proceed to Counter 2 (Express Food Delivery) on the ground floor. Present your 4-digit pickup code to the staff member to collect your order.',
    canteen_name: 'SmartBite Central Canteen',
    opening_hours: '8:00 AM – 7:30 PM (Monday to Saturday)',
    contact_phone: '+91 98765 43210',
    help_email: 'support@smartbite.college.edu',
  },
  orders: [
    {
      order_id: 101,
      user_id: 1,
      order_date: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      status: 'Preparing',
      total_amount: 160.00,
      pickup_code: 'SB-4819',
      special_instructions: 'Less spicy green chutney please',
      estimated_prep_minutes: 15,
      estimated_ready_at: new Date(Date.now() + 7 * 60 * 1000).toISOString(),
      actual_ready_at: null,
      cancelled_at: null,
      cancellation_reason: null,
    },
    {
      order_id: 102,
      user_id: 1,
      order_date: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      status: 'Ready',
      total_amount: 135.00,
      pickup_code: 'SB-2904',
      special_instructions: 'Extra napkins please',
      estimated_prep_minutes: 12,
      estimated_ready_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      actual_ready_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      cancelled_at: null,
      cancellation_reason: null,
    },
    {
      order_id: 103,
      user_id: 1,
      order_date: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      status: 'Placed',
      total_amount: 70.00,
      pickup_code: 'SB-7132',
      special_instructions: null,
      estimated_prep_minutes: 12,
      estimated_ready_at: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
      actual_ready_at: null,
      cancelled_at: null,
      cancellation_reason: null,
    },
    {
      order_id: 104,
      user_id: 1,
      order_date: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      status: 'Collected',
      total_amount: 110.00,
      pickup_code: 'SB-1092',
      special_instructions: null,
      estimated_prep_minutes: 10,
      estimated_ready_at: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
      actual_ready_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
      cancelled_at: null,
      cancellation_reason: null,
    },
    {
      order_id: 105,
      user_id: 1,
      order_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'Cancelled',
      total_amount: 90.00,
      pickup_code: 'SB-8821',
      special_instructions: null,
      estimated_prep_minutes: null,
      estimated_ready_at: null,
      actual_ready_at: null,
      cancelled_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      cancellation_reason: 'Out of ingredients: Fresh paneer unavailable',
    },
    {
      order_id: 201,
      user_id: 2,
      order_date: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      status: 'Preparing',
      total_amount: 145.00,
      pickup_code: 'SB-5531',
      special_instructions: null,
      estimated_prep_minutes: 15,
      estimated_ready_at: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
      actual_ready_at: null,
      cancelled_at: null,
      cancellation_reason: null,
    },
  ],
  orderItems: [
    { order_item_id: 1, order_id: 101, item_id: 2, quantity: 2, unit_price: 80.00, subtotal: 160.00 },
    { order_item_id: 2, order_id: 102, item_id: 1, quantity: 1, unit_price: 70.00, subtotal: 70.00 },
    { order_item_id: 3, order_id: 102, item_id: 4, quantity: 1, unit_price: 55.00, subtotal: 55.00 },
    { order_item_id: 4, order_id: 102, item_id: 6, quantity: 1, unit_price: 10.00, subtotal: 10.00 },
    { order_item_id: 5, order_id: 103, item_id: 1, quantity: 1, unit_price: 70.00, subtotal: 70.00 },
    { order_item_id: 6, order_id: 104, item_id: 4, quantity: 2, unit_price: 55.00, subtotal: 110.00 },
    { order_item_id: 7, order_id: 105, item_id: 3, quantity: 1, unit_price: 90.00, subtotal: 90.00 },
    { order_item_id: 8, order_id: 201, item_id: 3, quantity: 1, unit_price: 90.00, subtotal: 90.00 },
    { order_item_id: 9, order_id: 201, item_id: 4, quantity: 1, unit_price: 55.00, subtotal: 55.00 },
  ],
};

async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    // Test connection with timeout
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    isConnectedToMySQL = true;
    console.log(`[SmartBite DB] Connected to MySQL database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);
  } catch (err) {
    isConnectedToMySQL = false;
    console.warn(`[SmartBite DB] Notice: Could not connect to MySQL server (${err.message}).`);
    console.warn(`[SmartBite DB] Operating with resilient fallback repository so viva demos and frontend testing work seamlessly.`);
  }
}

// Unified parameterized query runner
async function query(sql, params = []) {
  if (isConnectedToMySQL && pool) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  // Fallback in-memory handler for demonstrations without local MySQL daemon
  return executeInMemoryQuery(sql, params);
}

function executeInMemoryQuery(sql, params) {
  const normalized = sql.replace(/\s+/g, ' ').trim();

  // 1. Get single order by order_id: SELECT ... FROM Orders WHERE order_id = ?
  if (normalized.includes('FROM Orders WHERE order_id = ?')) {
    const orderId = Number(params[0]);
    const found = inMemorySeed.orders.find(o => o.order_id === orderId);
    return found ? [{ ...found }] : [];
  }

  // 2. Get order items joined with menu items:
  // SELECT oi.*, mi.item_name ... FROM Order_Items oi JOIN Menu_Items mi ... WHERE oi.order_id = ?
  if (normalized.includes('FROM Order_Items') && normalized.includes('WHERE oi.order_id = ?')) {
    const orderId = Number(params[0]);
    const items = inMemorySeed.orderItems
      .filter(oi => oi.order_id === orderId)
      .map(oi => {
        const menuItem = inMemorySeed.menuItems.find(mi => mi.item_id === oi.item_id) || {};
        return {
          order_item_id: oi.order_item_id,
          order_id: oi.order_id,
          item_id: oi.item_id,
          item_name: menuItem.item_name || 'Canteen Item',
          quantity: oi.quantity,
          unit_price: oi.unit_price,
          subtotal: oi.subtotal,
          prep_time_minutes: menuItem.prep_time_minutes || 10,
        };
      });
    return items;
  }

  // 3. Get Canteen Setting: SELECT ... FROM Canteen_Settings WHERE setting_key = ?
  if (normalized.includes('FROM Canteen_Settings')) {
    let key = params && params[0];
    if (!key && normalized.includes("'pickup_instructions'")) {
      key = 'pickup_instructions';
    }
    const val = inMemorySeed.settings[key];
    return val !== undefined ? [{ setting_value: val }] : [];
  }

  // 4. Queue count ahead:
  // SELECT COUNT(*) ... FROM Orders WHERE status IN ('Placed', 'Preparing') AND (order_date < ? OR ...)
  if (normalized.includes('status IN (\'Placed\', \'Preparing\')') && normalized.includes('order_date < ?')) {
    const targetOrderDate = new Date(params[0]).getTime();
    const targetOrderId = Number(params[2]);

    const activeAhead = inMemorySeed.orders.filter(o => {
      if (!['Placed', 'Preparing'].includes(o.status)) return false;
      const oDate = new Date(o.order_date).getTime();
      return oDate < targetOrderDate || (oDate === targetOrderDate && o.order_id < targetOrderId);
    });

    return [{ count_ahead: activeAhead.length }];
  }

  // 5. Active orders ahead for workload calculation
  if (normalized.includes('FROM Orders WHERE status IN (\'Placed\', \'Preparing\')')) {
    const active = inMemorySeed.orders
      .filter(o => ['Placed', 'Preparing'].includes(o.status))
      .map(o => ({ ...o }));
    return active;
  }

  // 6. User's active orders:
  // SELECT ... FROM Orders WHERE user_id = ? AND status IN ('Placed', 'Preparing', 'Ready')
  if (normalized.includes('WHERE user_id = ? AND status IN (\'Placed\', \'Preparing\', \'Ready\')')) {
    const userId = Number(params[0]);
    const userOrders = inMemorySeed.orders
      .filter(o => o.user_id === userId && ['Placed', 'Preparing', 'Ready'].includes(o.status))
      .sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    return userOrders.map(o => ({ ...o }));
  }

  // 7. Get user by user_id
  if (normalized.includes('FROM Users WHERE user_id = ?')) {
    const userId = Number(params[0]);
    const user = inMemorySeed.users.find(u => u.user_id === userId);
    return user ? [{ ...user }] : [];
  }

  // 8. Update order status / estimated prep
  if (normalized.startsWith('UPDATE Orders SET')) {
    if (normalized.includes('estimated_prep_minutes = ?') && normalized.includes('estimated_ready_at = ?')) {
      const prep = params[0];
      const ready = params[1];
      const id = Number(params[2]);
      const found = inMemorySeed.orders.find(o => o.order_id === id);
      if (found) {
        found.estimated_prep_minutes = prep;
        found.estimated_ready_at = ready;
      }
    }
    return { affectedRows: 1 };
  }

  // Fallback empty array
  return [];
}

// Start database check on module load
initDatabase();

module.exports = {
  query,
  initDatabase,
  isLiveMySQL: () => isConnectedToMySQL,
  getPool: () => pool,
  inMemorySeed, // exported for unit testing
};
