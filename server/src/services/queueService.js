/**
 * SmartBite Queue & Waiting-Time Calculation Service
 *
 * Implements canteen queue workload and position calculations based on:
 * - Real active orders (status in 'Placed', 'Pending', 'Preparing')
 * - Same-day filter: only current day orders count towards queue metrics
 * - Zero-prep rule: orders with 0 total prep time across current items are excluded from queue
 * - Decision from current items: never trusts old stored estimated_ready_at or queue values for zero-prep
 * - Workload exclusion: zero-prep orders never inflate another order's queue position or wait time
 * - Status exclusions: Ready, Collected, Cancelled are excluded from preparation workload
 * - Timezone safety: formats local MySQL DATETIME without UTC shifts
 */

const db = require('../config/db');

/**
 * Formats a Date object into local MySQL DATETIME format (YYYY-MM-DD HH:mm:ss)
 * using local components to match the local timezone of the Node server and MySQL.
 */
function formatMySQLDateTime(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Checks if two dates are on the same calendar day in local time.
 */
function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  const dateObj1 = d1 instanceof Date ? d1 : new Date(d1);
  const dateObj2 = d2 instanceof Date ? d2 : new Date(d2);
  if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) return false;
  return (
    dateObj1.getFullYear() === dateObj2.getFullYear() &&
    dateObj1.getMonth() === dateObj2.getMonth() &&
    dateObj1.getDate() === dateObj2.getDate()
  );
}

/**
 * Calculates the inherent preparation time for a specific order's items.
 * Formula:
 * - Base time = Maximum prep time among the ordered items
 * - Incremental time = Additional 2 minutes per extra item beyond quantity 1 (only for items with prep time > 0)
 *
 * Zero-prep condition:
 * - Returns 0 if items is empty, null, or all items have 0 prep time (e.g. drinks / snacks).
 * - For mixed orders, returns the calculated prep time of the items requiring cooking.
 *
 * @param {Array} items - List of items in the order with quantity and prep_time_minutes
 * @returns {number} Estimated base prep minutes for this order (0 to 45)
 */
function calculateOrderBasePrepMinutes(items) {
  if (!items || !Array.isArray(items) || items.length === 0) return 0;

  let maxItemPrep = 0;
  let extraItemsCount = 0;

  for (const item of items) {
    const rawPrep = Number(item.prep_time_minutes ?? item.preparation_time);
    const itemPrep = (!isNaN(rawPrep) && rawPrep > 0) ? rawPrep : 0;
    if (itemPrep > maxItemPrep) {
      maxItemPrep = itemPrep;
    }
    const rawQty = Number(item.quantity);
    const qty = (!isNaN(rawQty) && rawQty > 1) ? rawQty : 1;
    if (itemPrep > 0 && qty > 1) {
      extraItemsCount += (qty - 1);
    }
  }

  if (maxItemPrep === 0) {
    return 0;
  }

  // Each additional quantity adds 2 minutes for cooking / packing
  const totalBasePrep = maxItemPrep + (extraItemsCount * 2);
  return Math.min(totalBasePrep, 45); // Sensible ceiling for canteen food
}

/**
 * Calculates the queue position and estimated ready time for an order.
 *
 * @param {Object} order - Order row from Orders table
 * @returns {Promise<Object>} Queue estimate information
 */
async function calculateQueueEstimate(order) {
  try {
    const { order_id, status, order_date, estimated_prep_minutes, estimated_ready_at } = order;

    // 1. Terminal / Non-queue statuses
    if (status === 'Cancelled') {
      return {
        order_id,
        status,
        queue_position: null,
        estimated_prep_minutes: null,
        estimated_ready_at: null,
        remaining_minutes: null,
        estimate_available: false,
        estimate_is_guaranteed: false,
        orders_ahead: 0,
        is_zero_prep: false,
        message: 'This order has been cancelled.',
      };
    }

    if (status === 'Collected') {
      return {
        order_id,
        status,
        queue_position: null,
        estimated_prep_minutes: null,
        estimated_ready_at: null,
        remaining_minutes: 0,
        estimate_available: false,
        estimate_is_guaranteed: false,
        orders_ahead: 0,
        is_zero_prep: false,
        message: 'Your order has been collected.',
      };
    }

    if (status === 'Ready') {
      return {
        order_id,
        status,
        queue_position: null,
        estimated_prep_minutes: 0,
        estimated_ready_at: (estimated_ready_at instanceof Date ? estimated_ready_at.toISOString() : estimated_ready_at) || order.actual_ready_at || new Date().toISOString(),
        remaining_minutes: 0,
        estimate_available: true,
        estimate_is_guaranteed: false,
        orders_ahead: 0,
        is_zero_prep: false,
        message: 'Your order is ready. Please collect it from the counter.',
      };
    }

    // 2. Determine base prep time directly from current items (never from stored values)
    let items = order.items;
    if (!items && !Array.isArray(items)) {
      if (!Array.isArray(order.ahead_orders) && db) {
        const [rows] = await db.query(
          `SELECT oi.quantity, mi.preparation_time AS prep_time_minutes
           FROM Order_Items oi
           JOIN Menu_Items mi ON oi.item_id = mi.item_id
           WHERE oi.order_id = ?`,
          [order_id]
        );
        items = rows;
      }
    }

    let basePrep = 0;
    if (items && Array.isArray(items)) {
      basePrep = calculateOrderBasePrepMinutes(items);
    } else if (typeof estimated_prep_minutes === 'number' && !isNaN(estimated_prep_minutes) && estimated_prep_minutes > 0) {
      basePrep = estimated_prep_minutes;
    }

    // ZERO-PREP RULE:
    // If an order's total prep time across all items is 0 or cannot be determined:
    // It is NOT placed in the queue, has no queue position, no wait time, and no ready time.
    // Decided strictly from current items, ignoring any old stored values.
    if (basePrep === 0) {
      return {
        order_id,
        status,
        queue_position: null,
        estimated_prep_minutes: null,
        estimated_ready_at: null,
        remaining_minutes: null,
        estimate_available: false,
        estimate_is_guaranteed: false,
        orders_ahead: 0,
        is_zero_prep: true,
        message: 'No preparation time needed for this order.',
      };
    }

    // 3. Active orders in queue: 'Placed', 'Pending', or 'Preparing'
    const ELIGIBLE_QUEUE_STATUSES = ['Placed', 'Pending', 'Preparing'];
    const targetOrderDate = order_date ? new Date(order_date) : new Date();
    const targetTime = targetOrderDate.getTime();
    const targetOrderId = Number(order_id);

    let rawAheadOrders;
    if (Array.isArray(order.ahead_orders)) {
      rawAheadOrders = order.ahead_orders;
    } else {
      const [activeOrders] = await db.query(
        `SELECT order_id, order_date, status, estimated_prep_minutes, estimated_ready_at
         FROM Orders
         WHERE status IN ('Placed', 'Pending', 'Preparing')
           AND DATE(order_date) = CURDATE()`
      );
      rawAheadOrders = activeOrders || [];
    }

    // Filter ahead orders:
    // 1. Eligible status
    // 2. Same day only
    // 3. FIFO earlier placement (or earlier ID if placed at same millisecond)
    // 4. Exclude current order
    // 5. Exclude zero-prep ahead orders (decided from current items, not stored values)
    const aheadOrders = [];
    for (const o of rawAheadOrders) {
      if (!ELIGIBLE_QUEUE_STATUSES.includes(o.status)) continue;
      if (Number(o.order_id) === targetOrderId) continue;

      // Same calendar day check
      if (!isSameDay(o.order_date, targetOrderDate)) continue;

      const oTime = new Date(o.order_date).getTime();
      const isAhead = oTime < targetTime || (oTime === targetTime && Number(o.order_id) < targetOrderId);
      if (!isAhead) continue;

      // Determine ahead order prep time from current items, not stored values
      let aheadItems = o.items;
      if (!aheadItems && !Array.isArray(aheadItems)) {
        if (!Array.isArray(order.ahead_orders) && db) {
          try {
            const [rows] = await db.query(
              `SELECT oi.quantity, mi.preparation_time AS prep_time_minutes
               FROM Order_Items oi
               JOIN Menu_Items mi ON oi.item_id = mi.item_id
               WHERE oi.order_id = ?`,
              [o.order_id]
            );
            aheadItems = rows;
            o.items = rows;
          } catch {
            aheadItems = null;
          }
        }
      }

      let aheadBasePrep = 0;
      if (aheadItems && Array.isArray(aheadItems)) {
        aheadBasePrep = calculateOrderBasePrepMinutes(aheadItems);
      } else if (typeof o.estimated_prep_minutes === 'number' && !isNaN(o.estimated_prep_minutes) && o.estimated_prep_minutes > 0) {
        aheadBasePrep = o.estimated_prep_minutes;
      }

      // If ahead order's total prep time across items is 0, exclude it from queue counting
      if (aheadBasePrep === 0) continue;

      o.calculatedBasePrep = aheadBasePrep;
      aheadOrders.push(o);
    }

    // Sort strictly by FIFO: order_date ASC, then order_id ASC
    aheadOrders.sort((a, b) => {
      const timeA = new Date(a.order_date).getTime();
      const timeB = new Date(b.order_date).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return Number(a.order_id) - Number(b.order_id);
    });

    const countAhead = aheadOrders.length;
    const queuePosition = countAhead + 1; // 1-indexed queue position

    const orderPlacementTime = order_date ? new Date(order_date).getTime() : Date.now();
    const safePlacementTime = isNaN(orderPlacementTime) ? Date.now() : orderPlacementTime;

    // Validate stored estimate:
    // Stop trusting stored estimated_ready_at / estimated_prep_minutes if clearly wrong
    // (e.g. earlier than placement time, or non-positive prep duration)
    const parsedReadyAt = estimated_ready_at ? new Date(estimated_ready_at) : null;
    const isReadyAtValid = parsedReadyAt instanceof Date &&
      !isNaN(parsedReadyAt.getTime()) &&
      parsedReadyAt.getTime() >= safePlacementTime;

    const isPrepValid = typeof estimated_prep_minutes === 'number' &&
      !isNaN(estimated_prep_minutes) &&
      estimated_prep_minutes > 0;

    const hasValidStoredEstimate = isReadyAtValid && isPrepValid && order.recalculate !== true;

    let prepMinutes = hasValidStoredEstimate ? estimated_prep_minutes : null;
    let readyAt = hasValidStoredEstimate ? parsedReadyAt : null;

    if (!hasValidStoredEstimate) {
      let aheadPrepMinutes = 0;
      for (const aheadOrder of aheadOrders) {
        if (!ELIGIBLE_QUEUE_STATUSES.includes(aheadOrder.status)) {
          continue;
        }

        // 1. Prioritize explicit valid numeric remaining_minutes if provided
        if (typeof aheadOrder.remaining_minutes === 'number' && !isNaN(aheadOrder.remaining_minutes) && aheadOrder.remaining_minutes >= 0) {
          aheadPrepMinutes += aheadOrder.remaining_minutes;
        } else if (aheadOrder.status === 'Preparing') {
          // 2. An order in progress contributes only its remaining time based on its valid estimated_ready_at
          let calculatedRemaining = null;
          if (aheadOrder.estimated_ready_at) {
            const pReady = new Date(aheadOrder.estimated_ready_at);
            const aheadPlacementTime = aheadOrder.order_date ? new Date(aheadOrder.order_date).getTime() : 0;
            if (pReady instanceof Date && !isNaN(pReady.getTime()) && pReady.getTime() >= aheadPlacementTime) {
              const diffMs = pReady.getTime() - Date.now();
              calculatedRemaining = Math.max(0, Math.round(diffMs / (60 * 1000)));
            }
          }

          if (calculatedRemaining !== null) {
            aheadPrepMinutes += calculatedRemaining;
          } else {
            // Missing/invalid timestamp on Preparing order: mark unavailable
            return {
              order_id,
              status,
              queue_position: queuePosition,
              estimated_prep_minutes: null,
              estimated_ready_at: null,
              remaining_minutes: null,
              estimate_available: false,
              estimate_is_guaranteed: false,
              orders_ahead: countAhead,
              is_zero_prep: false,
              message: 'Pickup estimate unavailable. An order ahead is currently being prepared without an estimated completion time.',
            };
          }
        } else {
          // 3. Pending or Placed orders contribute their full preparation time computed from items
          aheadPrepMinutes += (aheadOrder.calculatedBasePrep !== undefined
            ? aheadOrder.calculatedBasePrep
            : calculateOrderBasePrepMinutes(aheadOrder.items));
        }
      }

      prepMinutes = basePrep + aheadPrepMinutes;
      readyAt = new Date(safePlacementTime + prepMinutes * 60 * 1000);
    }

    // Calculate remaining waiting minutes from estimated_ready_at and current time
    const now = Date.now();
    const diffMs = readyAt.getTime() - now;
    const remainingMinutes = Math.max(0, Math.round(diffMs / (60 * 1000)));

    const message = status === 'Preparing'
      ? 'The canteen is preparing your order.'
      : 'Your order is in the queue.';

    return {
      order_id,
      status,
      queue_position: queuePosition,
      estimated_prep_minutes: prepMinutes,
      estimated_ready_at: readyAt.toISOString(),
      remaining_minutes: remainingMinutes,
      estimate_available: true,
      estimate_is_guaranteed: false,
      orders_ahead: countAhead,
      is_zero_prep: false,
      message,
    };
  } catch (error) {
    console.error('[QueueService] Error calculating queue estimate:', error.message);
    return {
      order_id: order?.order_id,
      status: order?.status || 'Unknown',
      queue_position: null,
      estimated_prep_minutes: null,
      estimated_ready_at: null,
      remaining_minutes: null,
      estimate_available: false,
      estimate_is_guaranteed: false,
      orders_ahead: 0,
      is_zero_prep: false,
      message: 'Queue estimation is temporarily unavailable.',
    };
  }
}

/**
 * Calculates and persists the initial queue estimate for a newly placed order.
 * Reuses the core queue estimation logic without duplicating calculation mechanisms.
 *
 * @param {Object} order - Newly placed order object or order row
 * @returns {Promise<Object>} Calculated initial queue estimate
 */
async function calculateInitialOrderEstimate(order) {
  const freshOrder = {
    ...order,
    estimated_prep_minutes: null,
    estimated_ready_at: null,
    recalculate: true,
  };
  return calculateQueueEstimate(freshOrder);
}

module.exports = {
  calculateQueueEstimate,
  calculateOrderBasePrepMinutes,
  calculateInitialOrderEstimate,
  formatMySQLDateTime,
  isSameDay,
};