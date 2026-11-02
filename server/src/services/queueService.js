/**
 * SmartBite Queue & Waiting-Time Calculation Service
 *
 * Implements canteen queue workload and position calculations based on:
 * - Real active orders (status in 'Pending', 'Placed', 'Preparing')
 * - Item preparation durations and quantities
 * - Preceding queue workload
 * - Status exclusions: Ready, Collected, Cancelled, Completed are excluded from active queue
 */

const db = require('../config/db');

/**
 * mysql2/promise pool.query() returns [rows, fields].
 * Always unwrap to a plain rows array.
 */
function rowsFrom(queryResult) {
  if (Array.isArray(queryResult) && Array.isArray(queryResult[0])) {
    return queryResult[0];
  }
  if (Array.isArray(queryResult)) {
    return queryResult;
  }
  return [];
}

/**
 * Calculates the inherent preparation time for a specific order's items.
 * Formula (unchanged):
 * - Base time = Maximum prep time among the ordered items
 * - Incremental time = Additional 2 minutes per extra item beyond quantity 1
 * - Ceiling = 45 minutes
 * - Empty / missing items → default 10 minutes
 * - NULL / invalid prep_time_minutes treated as 0
 *
 * @param {Array} items - List of items in the order with quantity and prep_time_minutes
 * @returns {number} Estimated base prep minutes for this order
 */
function calculateOrderBasePrepMinutes(items) {
  if (!items || items.length === 0) return 10; // Canteen default baseline

  let maxItemPrep = 0;
  let extraItemsCount = 0;

  for (const item of items) {
    const rawPrep = Number(item.prep_time_minutes);
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

  // All items missing/zero/invalid prep → same 10-minute default as empty order
  if (maxItemPrep === 0) {
    return 10;
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

    // 1. Terminal / Non-queue statuses (never occupy an active queue position)
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
        message: 'This order has been cancelled.',
      };
    }

    if (status === 'Collected' || status === 'Completed') {
      return {
        order_id,
        status,
        queue_position: null,
        estimated_prep_minutes: null,
        estimated_ready_at: null,
        remaining_minutes: 0,
        estimate_available: false,
        estimate_is_guaranteed: false,
        message: 'Your order has been collected.',
      };
    }

    if (status === 'Ready') {
      return {
        order_id,
        status,
        queue_position: null,
        estimated_prep_minutes: 0,
        estimated_ready_at: estimated_ready_at || order.actual_ready_at || new Date().toISOString(),
        remaining_minutes: 0,
        estimate_available: true,
        estimate_is_guaranteed: false,
        message: 'Your order is ready. Please collect it from the counter.',
      };
    }

    // 2. Active queue statuses: include real creation status 'Pending'
    //    plus 'Placed' / 'Preparing' used by admin workflow.
    //    Do NOT rename Pending → Placed; just treat Pending as active.
    const ELIGIBLE_QUEUE_STATUSES = ['Pending', 'Placed', 'Preparing'];

    let aheadOrders;
    if (Array.isArray(order.ahead_orders)) {
      aheadOrders = order.ahead_orders.filter(o => {
        if (!ELIGIBLE_QUEUE_STATUSES.includes(o.status)) return false;
        if (Number(o.order_id) === Number(order_id)) return false;
        const oDate = new Date(o.order_date).getTime();
        const targetDate = new Date(order_date).getTime();
        return oDate < targetDate || (oDate === targetDate && Number(o.order_id) < Number(order_id));
      });
    } else {
      const activeResult = await db.query(
        `SELECT order_id, order_date, status
         FROM Orders
         WHERE status IN ('Pending', 'Placed', 'Preparing')`
      );
      const activeOrders = rowsFrom(activeResult);

      const targetOrderDate = new Date(order_date).getTime();
      const targetOrderId = Number(order_id);

      aheadOrders = activeOrders.filter(o => {
        if (Number(o.order_id) === targetOrderId) return false;
        const oDate = new Date(o.order_date).getTime();
        return oDate < targetOrderDate || (oDate === targetOrderDate && Number(o.order_id) < targetOrderId);
      });
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

    // Check if the order already has a valid saved estimate
    const hasValidPrep =
      typeof estimated_prep_minutes === 'number' &&
      !isNaN(estimated_prep_minutes) &&
      estimated_prep_minutes >= 0;
    const parsedReadyAt = estimated_ready_at ? new Date(estimated_ready_at) : null;
    const hasValidReadyAt = parsedReadyAt instanceof Date && !isNaN(parsedReadyAt.getTime());

    let prepMinutes = hasValidPrep ? estimated_prep_minutes : null;
    let readyAt = hasValidReadyAt ? parsedReadyAt : null;

    const needsCalculation = !hasValidPrep || !hasValidReadyAt || order.recalculate === true;

    if (needsCalculation) {
      // Retrieve items to compute current order's base prep time
      let items = order.items;
      if (!items) {
        const itemResult = await db.query(
          `SELECT oi.quantity, mi.prep_time_minutes
           FROM Order_Items oi
           JOIN Menu_Items mi ON oi.item_id = mi.item_id
           WHERE oi.order_id = ?`,
          [order_id]
        );
        items = rowsFrom(itemResult);
      }

      const basePrep = calculateOrderBasePrepMinutes(items);

      // Queue impact: sum base prep of all eligible orders ahead (FIFO)
      let aheadPrepMinutes = 0;
      for (const aheadOrder of aheadOrders) {
        if (!ELIGIBLE_QUEUE_STATUSES.includes(aheadOrder.status)) {
          continue;
        }

        if (typeof aheadOrder.remaining_minutes === 'number' && !isNaN(aheadOrder.remaining_minutes)) {
          aheadPrepMinutes += Math.max(0, aheadOrder.remaining_minutes);
        } else {
          let aheadItems = aheadOrder.items;
          if (!aheadItems) {
            const aheadItemResult = await db.query(
              `SELECT oi.quantity, mi.prep_time_minutes
               FROM Order_Items oi
               JOIN Menu_Items mi ON oi.item_id = mi.item_id
               WHERE oi.order_id = ?`,
              [aheadOrder.order_id]
            );
            aheadItems = rowsFrom(aheadItemResult);
          }
          aheadPrepMinutes += calculateOrderBasePrepMinutes(aheadItems);
        }
      }

      prepMinutes = basePrep + aheadPrepMinutes;

      const orderPlacementTime = order_date ? new Date(order_date).getTime() : Date.now();
      const safePlacementTime = isNaN(orderPlacementTime) ? Date.now() : orderPlacementTime;
      readyAt = new Date(safePlacementTime + prepMinutes * 60 * 1000);

      // Persist calculated estimate on the order row
      try {
        await db.query(
          `UPDATE Orders
           SET estimated_prep_minutes = ?, estimated_ready_at = ?
           WHERE order_id = ?`,
          [prepMinutes, readyAt.toISOString().slice(0, 19).replace('T', ' '), order_id]
        );
        order.estimated_prep_minutes = prepMinutes;
        order.estimated_ready_at = readyAt.toISOString();
      } catch (saveErr) {
        console.warn(`[QueueService] Failed to persist estimate update: ${saveErr.message}`);
      }
    }

    // Remaining minutes from estimated_ready_at vs now
    const now = Date.now();
    const diffMs = readyAt.getTime() - now;
    const remainingMinutes = Math.max(0, Math.round(diffMs / (60 * 1000)));

    const message =
      status === 'Preparing'
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
};
