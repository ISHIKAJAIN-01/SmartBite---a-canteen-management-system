/**
 * Automated Test Suite for SmartBite Queue Service & Business Logic
 * Uses Node.js native test runner (node:test)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const queueService = require('../services/queueService');

describe('Queue Service: Base Prep Time Calculation', () => {
  it('should return 0 minutes when items array is empty or null (indeterminate)', () => {
    assert.strictEqual(queueService.calculateOrderBasePrepMinutes([]), 0);
    assert.strictEqual(queueService.calculateOrderBasePrepMinutes(null), 0);
  });

  it('should calculate base prep time from the maximum item prep time for quantity 1', () => {
    const items = [
      { item_name: 'Chai', prep_time_minutes: 3, quantity: 1 },
      { item_name: 'Paneer Sandwich', prep_time_minutes: 10, quantity: 1 },
      { item_name: 'Cold Coffee', prep_time_minutes: 5, quantity: 1 },
    ];
    // Max is 10
    assert.strictEqual(queueService.calculateOrderBasePrepMinutes(items), 10);
  });

  it('should add 2 minutes for each extra item beyond quantity 1', () => {
    const items = [
      { item_name: 'Paneer Sandwich', prep_time_minutes: 10, quantity: 3 }, // 10 + 2*2 = 14
    ];
    assert.strictEqual(queueService.calculateOrderBasePrepMinutes(items), 14);
  });

  it('should cap prep time at 45 minutes', () => {
    const items = [
      { item_name: 'Hakka Noodles', prep_time_minutes: 15, quantity: 25 },
    ];
    assert.strictEqual(queueService.calculateOrderBasePrepMinutes(items), 45);
  });

  it('should return 0 for multiple drinks with zero prep time', () => {
    const items = [
      { item_name: 'Cold Drink', prep_time_minutes: 0, quantity: 3 },
    ];

    assert.strictEqual(queueService.calculateOrderBasePrepMinutes(items), 0);
  });

  it('should not add extra-item time when prep time is 0', () => {
    const items = [
      { item_name: 'Cold Drink', prep_time_minutes: 0, quantity: 5 },
    ];

    assert.strictEqual(queueService.calculateOrderBasePrepMinutes(items), 0);
  });

  it('should calculate base prep time for mixed orders containing zero-prep and positive-prep items', () => {
    const items = [
      { item_name: 'Cold Drink Can', prep_time_minutes: 0, quantity: 2 },
      { item_name: 'Paneer Sandwich', prep_time_minutes: 10, quantity: 1 },
    ];
    // Base prep is 10, drink adds 0 extra cooking time
    assert.strictEqual(queueService.calculateOrderBasePrepMinutes(items), 10);
  });
});

describe('Queue Service: Order Status Handling & Estimates', () => {
  it('should return null queue position and false estimate_available for Cancelled orders', async () => {
    const cancelledOrder = {
      order_id: 999,
      status: 'Cancelled',
      order_date: new Date().toISOString(),
      cancelled_at: new Date().toISOString(),
      cancellation_reason: 'Item out of stock',
    };

    const res = await queueService.calculateQueueEstimate(cancelledOrder);
    assert.strictEqual(res.queue_position, null);
    assert.strictEqual(res.estimated_prep_minutes, null);
    assert.strictEqual(res.estimate_available, false);
    assert.strictEqual(res.status, 'Cancelled');
  });

  it('should return null queue position, 0 remaining minutes, and ready message for Ready orders', async () => {
    const readyOrder = {
      order_id: 102,
      status: 'Ready',
      order_date: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      actual_ready_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    };

    const res = await queueService.calculateQueueEstimate(readyOrder);
    assert.strictEqual(res.queue_position, null);
    assert.strictEqual(res.remaining_minutes, 0);
    assert.strictEqual(res.estimate_available, true);
    assert.strictEqual(res.status, 'Ready');
    assert.ok(res.message.includes('ready'));
  });

  it('should return null queue position for Collected orders', async () => {
    const collectedOrder = {
      order_id: 104,
      status: 'Collected',
      order_date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      actual_ready_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    };

    const res = await queueService.calculateQueueEstimate(collectedOrder);
    assert.strictEqual(res.queue_position, null);
    assert.strictEqual(res.estimate_available, false);
    assert.strictEqual(res.status, 'Collected');
  });

  it('should calculate positive queue position for Placed or Preparing orders with positive prep time', async () => {
    const activeOrder = {
      order_id: 101,
      status: 'Preparing',
      order_date: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      estimated_prep_minutes: 15,
      estimated_ready_at: new Date(Date.now() + 7 * 60 * 1000).toISOString(),
      ahead_orders: [],
    };

    const res = await queueService.calculateQueueEstimate(activeOrder);
    assert.ok(typeof res.queue_position === 'number');
    assert.ok(res.queue_position >= 1);
    assert.strictEqual(res.estimate_available, true);
    assert.strictEqual(res.estimate_is_guaranteed, false);
  });

  it('should return positive remaining time when estimated ready time is in the future', async () => {
    const order = {
      order_id: 105,
      status: 'Preparing',
      order_date: new Date().toISOString(),
      estimated_prep_minutes: 10,
      estimated_ready_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      ahead_orders: [],
    };

    const res = await queueService.calculateQueueEstimate(order);

    assert.ok(res.remaining_minutes > 0);
    assert.ok(res.remaining_minutes <= 5);
  });

  it('should return 0 remaining time when estimated ready time has passed', async () => {
    const order = {
      order_id: 106,
      status: 'Preparing',
      order_date: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      estimated_prep_minutes: 10,
      estimated_ready_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      ahead_orders: [],
    };

    const res = await queueService.calculateQueueEstimate(order);

    assert.strictEqual(res.remaining_minutes, 0);
  });

  it('should return queue_position: null and estimate_available: false when database query fails without fabricating estimates', async () => {
    const orderWithoutMock = {
      order_id: 9999,
      status: 'Placed',
      order_date: new Date().toISOString(),
    };

    const res = await queueService.calculateQueueEstimate(orderWithoutMock);
    assert.strictEqual(res.queue_position, null);
    assert.strictEqual(res.estimate_available, false);
    assert.strictEqual(res.message, 'Queue estimation is temporarily unavailable.');
  });
});

describe('Queue Service: Actual Preparation Time for Ahead Orders', () => {
  it('should contribute 8 minutes for an ahead order with 8 minutes prep time', async () => {
    const aheadOrder = {
      order_id: 501,
      status: 'Placed',
      order_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Chole Bhature portion', prep_time_minutes: 8, quantity: 1 }],
    };
    const currentOrder = {
      order_id: 502,
      status: 'Placed',
      order_date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Paneer Sandwich', prep_time_minutes: 10, quantity: 1 }],
      ahead_orders: [aheadOrder],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    assert.strictEqual(res.queue_position, 2);
    assert.strictEqual(res.orders_ahead, 1);
    // Base prep = 10, ahead prep = 8 -> 18 total
    assert.strictEqual(res.estimated_prep_minutes, 18);
  });

  it('should contribute 20 minutes for two ahead orders with 8 and 12 minutes prep time', async () => {
    const aheadOrder1 = {
      order_id: 511,
      status: 'Preparing',
      order_date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      remaining_minutes: 8,
      items: [{ item_name: 'Roll', prep_time_minutes: 8, quantity: 1 }],
    };
    const aheadOrder2 = {
      order_id: 512,
      status: 'Placed',
      order_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Masala Dosa', prep_time_minutes: 12, quantity: 1 }],
    };
    const currentOrder = {
      order_id: 513,
      status: 'Placed',
      order_date: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Paneer Sandwich', prep_time_minutes: 10, quantity: 1 }],
      ahead_orders: [aheadOrder1, aheadOrder2],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    assert.strictEqual(res.queue_position, 3);
    assert.strictEqual(res.orders_ahead, 2);
    // Base prep = 10, ahead prep = 8 + 12 = 20 -> 30 total
    assert.strictEqual(res.estimated_prep_minutes, 30);
  });

  it('should exclude ahead orders containing only zero-prep-time drinks from queue position and wait time', async () => {
    const aheadOrder = {
      order_id: 521,
      status: 'Placed',
      order_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Cold Drink Can', prep_time_minutes: 0, quantity: 4 }],
    };
    const currentOrder = {
      order_id: 522,
      status: 'Placed',
      order_date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Cold Coffee', prep_time_minutes: 5, quantity: 1 }],
      ahead_orders: [aheadOrder],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    // Ahead order is 0-prep, so it has 0 workload and is not in line ahead of currentOrder
    assert.strictEqual(res.queue_position, 1);
    assert.strictEqual(res.orders_ahead, 0);
    // Current order base prep is 5 -> 5 total
    assert.strictEqual(res.estimated_prep_minutes, 5);
  });

  it('should count ahead orders in queue position when they contain mixed positive-prep items', async () => {
    const mixedAhead = {
      order_id: 523,
      status: 'Placed',
      order_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      items: [
        { item_name: 'Cold Drink Can', prep_time_minutes: 0, quantity: 2 },
        { item_name: 'Veg Puff', prep_time_minutes: 6, quantity: 1 },
      ],
    };
    const currentOrder = {
      order_id: 524,
      status: 'Placed',
      order_date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Cold Coffee', prep_time_minutes: 5, quantity: 1 }],
      ahead_orders: [mixedAhead],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    assert.strictEqual(res.queue_position, 2);
    assert.strictEqual(res.orders_ahead, 1);
    // Base prep = 5, ahead prep = 6 -> 11 total
    assert.strictEqual(res.estimated_prep_minutes, 11);
  });

  it('should ignore active orders from previous days (stale orders) and only count current day orders', async () => {
    const yesterdayOrder = {
      order_id: 525,
      status: 'Placed',
      // Order placed yesterday
      order_date: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Thali', prep_time_minutes: 20, quantity: 1 }],
    };
    const todayAhead = {
      order_id: 526,
      status: 'Placed',
      // Order placed 15 mins ago today
      order_date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Sandwich', prep_time_minutes: 10, quantity: 1 }],
    };
    const currentOrder = {
      order_id: 527,
      status: 'Placed',
      order_date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Chai', prep_time_minutes: 3, quantity: 1 }],
      ahead_orders: [yesterdayOrder, todayAhead],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    // Yesterday's stale order is excluded; only todayAhead is counted
    assert.strictEqual(res.queue_position, 2);
    assert.strictEqual(res.orders_ahead, 1);
    // Base prep = 3, ahead prep = 10 -> 13 total
    assert.strictEqual(res.estimated_prep_minutes, 13);
  });

  it('should ignore Ready, Collected, and Cancelled orders and not add pending preparation time', async () => {
    const readyOrder = {
      order_id: 531,
      status: 'Ready',
      order_date: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Pizza', prep_time_minutes: 20, quantity: 1 }],
    };
    const collectedOrder = {
      order_id: 532,
      status: 'Collected',
      order_date: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Burger', prep_time_minutes: 15, quantity: 1 }],
    };
    const cancelledOrder = {
      order_id: 533,
      status: 'Cancelled',
      order_date: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Pasta', prep_time_minutes: 15, quantity: 1 }],
    };
    const activeAhead = {
      order_id: 534,
      status: 'Placed',
      order_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Chai', prep_time_minutes: 3, quantity: 1 }],
    };
    const currentOrder = {
      order_id: 535,
      status: 'Placed',
      order_date: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Samosa', prep_time_minutes: 4, quantity: 1 }],
      ahead_orders: [readyOrder, collectedOrder, cancelledOrder, activeAhead],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    // Only activeAhead (534) is counted in the queue
    assert.strictEqual(res.queue_position, 2);
    assert.strictEqual(res.orders_ahead, 1);
    // Base prep = 4, ahead prep = 3 -> 7 total
    assert.strictEqual(res.estimated_prep_minutes, 7);
  });

  it('should respect FIFO ordering and not count orders placed after the current order', async () => {
    const earlierOrder = {
      order_id: 541,
      status: 'Placed',
      order_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Sandwich', prep_time_minutes: 10, quantity: 1 }],
    };
    const laterOrder = {
      order_id: 543,
      status: 'Placed',
      order_date: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Pizza', prep_time_minutes: 25, quantity: 1 }],
    };
    const currentOrder = {
      order_id: 542,
      status: 'Placed',
      order_date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Noodles', prep_time_minutes: 15, quantity: 1 }],
      ahead_orders: [earlierOrder, laterOrder],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    // Only earlierOrder is ahead of currentOrder
    assert.strictEqual(res.queue_position, 2);
    assert.strictEqual(res.orders_ahead, 1);
    // Base prep = 15, earlier order prep = 10 -> 25 total (laterOrder's 25 is not included)
    assert.strictEqual(res.estimated_prep_minutes, 25);
  });

  it('should use remaining preparation time for orders in progress so elapsed time is not counted twice', async () => {
    const inProgressOrder = {
      order_id: 551,
      status: 'Preparing',
      order_date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      // Base prep was 12, but only 4 minutes remain
      remaining_minutes: 4,
      items: [{ item_name: 'Dosa', prep_time_minutes: 12, quantity: 1 }],
    };
    const currentOrder = {
      order_id: 552,
      status: 'Placed',
      order_date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Coffee', prep_time_minutes: 5, quantity: 1 }],
      ahead_orders: [inProgressOrder],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    assert.strictEqual(res.queue_position, 2);
    assert.strictEqual(res.orders_ahead, 1);
    // Base prep = 5, ahead order remaining = 4 (instead of full 12) -> 9 total
    assert.strictEqual(res.estimated_prep_minutes, 9);
  });

  it('should calculate remaining time for a Preparing ahead order from its saved estimated_ready_at without pre-set remaining_minutes', async () => {
    const preparingAhead = {
      order_id: 561,
      status: 'Preparing',
      order_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      estimated_prep_minutes: 15,
      estimated_ready_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes remaining
      items: [{ item_name: 'Biryani', prep_time_minutes: 15, quantity: 1 }],
    };
    const currentOrder = {
      order_id: 562,
      status: 'Placed',
      order_date: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Tea', prep_time_minutes: 3, quantity: 1 }],
      ahead_orders: [preparingAhead],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    assert.strictEqual(res.queue_position, 2);
    assert.strictEqual(res.orders_ahead, 1);
    // Base prep = 3, ahead remaining from estimated_ready_at = 5 (instead of full 15) -> 8 total
    assert.strictEqual(res.estimated_prep_minutes, 8);
  });

  it('should mark estimate unavailable when a Preparing ahead order has invalid estimated_ready_at timestamp', async () => {
    const preparingAheadInvalid = {
      order_id: 571,
      status: 'Preparing',
      order_date: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      estimated_prep_minutes: 14,
      estimated_ready_at: 'NOT-A-VALID-DATE',
      items: [{ item_name: 'Noodles', prep_time_minutes: 14, quantity: 1 }],
    };
    const currentOrder = {
      order_id: 572,
      status: 'Placed',
      order_date: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Tea', prep_time_minutes: 3, quantity: 1 }],
      ahead_orders: [preparingAheadInvalid],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    assert.strictEqual(res.queue_position, 2);
    assert.strictEqual(res.orders_ahead, 1);
    assert.strictEqual(res.estimate_available, false);
    assert.strictEqual(res.estimated_prep_minutes, null);
    assert.strictEqual(res.remaining_minutes, null);
    assert.ok(res.message.includes('unavailable'));
  });

  it('should mark estimate unavailable when a Preparing ahead order has missing (null) estimated_ready_at timestamp', async () => {
    const preparingAheadNull = {
      order_id: 581,
      status: 'Preparing',
      order_date: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      estimated_prep_minutes: 10,
      estimated_ready_at: null,
      items: [{ item_name: 'Sandwich', prep_time_minutes: 10, quantity: 1 }],
    };
    const currentOrder = {
      order_id: 582,
      status: 'Placed',
      order_date: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Tea', prep_time_minutes: 3, quantity: 1 }],
      ahead_orders: [preparingAheadNull],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    assert.strictEqual(res.queue_position, 2);
    assert.strictEqual(res.orders_ahead, 1);
    assert.strictEqual(res.estimate_available, false);
    assert.strictEqual(res.estimated_prep_minutes, null);
    assert.strictEqual(res.remaining_minutes, null);
    assert.ok(res.message.includes('unavailable'));
  });
});

describe('Queue Service: Zero-Preparation-Time Rule', () => {
  it('should return null queue position, null ready time, and is_zero_prep true for 0-prep orders', async () => {
    const zeroPrepOrder = {
      order_id: 528,
      status: 'Placed',
      order_date: new Date().toISOString(),
      items: [
        { item_name: 'Cold Drink Can', prep_time_minutes: 0, quantity: 2 },
        { item_name: 'Water Bottle', prep_time_minutes: 0, quantity: 1 },
      ],
      ahead_orders: [],
    };

    const res = await queueService.calculateQueueEstimate(zeroPrepOrder);
    assert.strictEqual(res.queue_position, null);
    assert.strictEqual(res.estimated_prep_minutes, null);
    assert.strictEqual(res.estimated_ready_at, null);
    assert.strictEqual(res.remaining_minutes, null);
    assert.strictEqual(res.estimate_available, false);
    assert.strictEqual(res.is_zero_prep, true);
    assert.strictEqual(res.orders_ahead, 0);
    assert.strictEqual(res.message, 'No preparation time needed for this order.');
  });

  it('should apply zero-prep rule when saved estimate is 0 minutes', async () => {
    const orderWithZeroPrepEstimate = {
      order_id: 606,
      status: 'Placed',
      order_date: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      estimated_prep_minutes: 0,
      estimated_ready_at: null,
      items: [{ item_name: 'Cold Drink', prep_time_minutes: 0, quantity: 1 }],
      ahead_orders: [],
    };

    const res = await queueService.calculateQueueEstimate(orderWithZeroPrepEstimate);
    assert.strictEqual(res.queue_position, null);
    assert.strictEqual(res.estimated_prep_minutes, null);
    assert.strictEqual(res.estimated_ready_at, null);
    assert.strictEqual(res.is_zero_prep, true);
    assert.strictEqual(res.estimate_available, false);
    assert.strictEqual(res.message, 'No preparation time needed for this order.');
  });

  it('should queue mixed orders (0-prep item + positive-prep item) normally', async () => {
    const mixedOrder = {
      order_id: 529,
      status: 'Placed',
      order_date: new Date().toISOString(),
      items: [
        { item_name: 'Cold Drink Can', prep_time_minutes: 0, quantity: 2 },
        { item_name: 'Paneer Sandwich', prep_time_minutes: 10, quantity: 1 },
      ],
      ahead_orders: [],
    };

    const res = await queueService.calculateQueueEstimate(mixedOrder);
    assert.strictEqual(res.queue_position, 1);
    assert.strictEqual(res.estimated_prep_minutes, 10);
    assert.strictEqual(res.is_zero_prep, false);
    assert.strictEqual(res.estimate_available, true);
  });

  it('should strictly treat order as zero-prep even if old stored estimates exist in the Orders row', async () => {
    // Simulating Order #22: has old stored 12:37:00 estimate and positive prep in DB, but current items take 0 min
    const orderWithOldStoredEstimate = {
      order_id: 22,
      status: 'Placed',
      order_date: '2026-10-31T12:37:00.000Z',
      estimated_prep_minutes: 15,
      estimated_ready_at: '2026-10-31T07:07:00.000Z', // Old 12:37 pm mismatch
      items: [
        { item_name: 'Coke (250 ml)', prep_time_minutes: 0, quantity: 1 },
      ],
      ahead_orders: [],
    };

    const res = await queueService.calculateQueueEstimate(orderWithOldStoredEstimate);
    assert.strictEqual(res.queue_position, null);
    assert.strictEqual(res.estimated_prep_minutes, null);
    assert.strictEqual(res.estimated_ready_at, null);
    assert.strictEqual(res.remaining_minutes, null);
    assert.strictEqual(res.estimate_available, false);
    assert.strictEqual(res.is_zero_prep, true);
    assert.strictEqual(res.orders_ahead, 0);
    assert.strictEqual(res.message, 'No preparation time needed for this order.');
  });

  it('should reject stored estimated_ready_at when earlier than placement time and recalculate fresh from items', async () => {
    const placedTime = new Date(Date.now() - 5 * 60 * 1000);
    // Stored ready time is 5 hours earlier than placement time (the historical timezone bug)
    const bogusStoredReadyAt = new Date(placedTime.getTime() - 5 * 60 * 60 * 1000).toISOString();

    const orderWithBogusReadyAt = {
      order_id: 701,
      status: 'Placed',
      order_date: placedTime.toISOString(),
      estimated_prep_minutes: 10,
      estimated_ready_at: bogusStoredReadyAt,
      items: [{ item_name: 'Paneer Sandwich', prep_time_minutes: 10, quantity: 1 }],
      ahead_orders: [],
    };

    const res = await queueService.calculateQueueEstimate(orderWithBogusReadyAt);
    assert.strictEqual(res.queue_position, 1);
    assert.strictEqual(res.estimated_prep_minutes, 10);
    assert.strictEqual(res.estimate_available, true);
    // Freshly calculated ready time must be placement time + 10 min, NOT the bogus past time
    const expectedReady = new Date(placedTime.getTime() + 10 * 60 * 1000).toISOString();
    assert.strictEqual(res.estimated_ready_at, expectedReady);
    assert.strictEqual(res.remaining_minutes, 5);
  });

  it('should exclude ahead order with old stored estimate if its items take zero prep time', async () => {
    const aheadWithOldStoredEstimate = {
      order_id: 801,
      status: 'Placed',
      order_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      estimated_prep_minutes: 15, // Old stored positive prep
      estimated_ready_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Water Bottle', prep_time_minutes: 0, quantity: 2 }],
    };
    const currentOrder = {
      order_id: 802,
      status: 'Placed',
      order_date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      items: [{ item_name: 'Maggi', prep_time_minutes: 6, quantity: 1 }],
      ahead_orders: [aheadWithOldStoredEstimate],
    };

    const res = await queueService.calculateQueueEstimate(currentOrder);
    // Ahead order takes 0 min prep in reality, so current order is #1 in line with only its 6 min prep
    assert.strictEqual(res.queue_position, 1);
    assert.strictEqual(res.orders_ahead, 0);
    assert.strictEqual(res.estimated_prep_minutes, 6);
  });
});

describe('Queue Service: Timezone Safety & Formatting', () => {
  it('should format MySQL datetime in local time without UTC offset shift', () => {
    const testDate = new Date(2026, 9, 31, 18, 7, 30); // 31 Oct 2026, 18:07:30 local
    const formatted = queueService.formatMySQLDateTime(testDate);
    assert.strictEqual(formatted, '2026-10-31 18:07:30');
  });

  it('should verify isSameDay correctly distinguishes dates across midnight', () => {
    const today = new Date(2026, 9, 31, 23, 50, 0);
    const sameDayEarlier = new Date(2026, 9, 31, 10, 0, 0);
    const yesterday = new Date(2026, 9, 30, 23, 50, 0);

    assert.strictEqual(queueService.isSameDay(today, sameDayEarlier), true);
    assert.strictEqual(queueService.isSameDay(today, yesterday), false);
  });
});

describe('Queue Service: Initial Placement & Remaining Time Lifecycle', () => {
  it('should calculate initial estimated ready time at order placement from placement time and queue workload', async () => {
    const placementTime = new Date(Date.now() - 3 * 60 * 1000);
    const aheadOrder = {
      order_id: 601,
      status: 'Preparing',
      order_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      remaining_minutes: 12,
      items: [{ item_name: 'Dosa', prep_time_minutes: 12, quantity: 1 }],
    };
    const newOrder = {
      order_id: 602,
      status: 'Placed',
      order_date: placementTime.toISOString(),
      items: [{ item_name: 'Sandwich', prep_time_minutes: 10, quantity: 1 }],
      ahead_orders: [aheadOrder],
    };

    const res = await queueService.calculateInitialOrderEstimate(newOrder);
    assert.strictEqual(res.queue_position, 2);
    assert.strictEqual(res.orders_ahead, 1);
    // Base 10 + ahead 12 = 22 minutes
    assert.strictEqual(res.estimated_prep_minutes, 22);

    const expectedReadyTime = new Date(placementTime.getTime() + 22 * 60 * 1000).toISOString();
    assert.strictEqual(res.estimated_ready_at, expectedReadyTime);
    assert.ok(res.remaining_minutes <= 19 && res.remaining_minutes >= 18);
  });

  it('should decrease remaining_minutes on subsequent tracking requests without restarting duration', async () => {
    // Placed 10 minutes ago with total 25 min prep duration -> 15 min remaining
    const placementTime = new Date(Date.now() - 10 * 60 * 1000);
    const readyAtTime = new Date(Date.now() + 15 * 60 * 1000);

    const order = {
      order_id: 603,
      status: 'Placed',
      order_date: placementTime.toISOString(),
      estimated_prep_minutes: 25,
      estimated_ready_at: readyAtTime.toISOString(),
      ahead_orders: [],
    };

    const res1 = await queueService.calculateQueueEstimate(order);
    assert.strictEqual(res1.estimated_prep_minutes, 25);
    assert.strictEqual(res1.estimated_ready_at, readyAtTime.toISOString());
    // Remaining time must reflect elapsed 10 mins -> ~15 mins remaining, NOT the full 25 mins
    assert.strictEqual(res1.remaining_minutes, 15);
  });

  it('should reuse valid saved estimate rather than recalculating on every refresh', async () => {
    const fixedReadyAt = new Date(Date.now() + 12 * 60 * 1000).toISOString();
    const orderWithSavedEstimate = {
      order_id: 604,
      status: 'Preparing',
      order_date: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      estimated_prep_minutes: 18,
      estimated_ready_at: fixedReadyAt,
      // If recalculated from items, would give 45, but saved estimate must take precedence
      items: [{ item_name: 'Feast', prep_time_minutes: 45, quantity: 1 }],
      ahead_orders: [],
    };

    const res = await queueService.calculateQueueEstimate(orderWithSavedEstimate);
    assert.strictEqual(res.estimated_prep_minutes, 18);
    assert.strictEqual(res.estimated_ready_at, fixedReadyAt);
    assert.strictEqual(res.remaining_minutes, 12);
  });

  it('should safely generate a valid estimate when saved estimate is missing or invalid', async () => {
    const placementTime = new Date(Date.now() - 4 * 60 * 1000);
    const orderWithInvalidEstimate = {
      order_id: 605,
      status: 'Placed',
      order_date: placementTime.toISOString(),
      estimated_prep_minutes: 'invalid_prep',
      estimated_ready_at: 'not-a-valid-date',
      items: [{ item_name: 'Samosa', prep_time_minutes: 4, quantity: 2 }], // 4 + 2 = 6 min
      ahead_orders: [],
    };

    const res = await queueService.calculateQueueEstimate(orderWithInvalidEstimate);
    assert.strictEqual(res.estimated_prep_minutes, 6);
    assert.strictEqual(typeof res.estimated_ready_at, 'string');
    const parsedReady = new Date(res.estimated_ready_at);
    assert.ok(!isNaN(parsedReady.getTime()));
    assert.strictEqual(res.estimate_available, true);
    // 6 min prep from 4 min ago -> 2 min remaining
    assert.strictEqual(res.remaining_minutes, 2);
  });

  it('should treat missing or null prep_time_minutes as zero', () => {
    const itemsWithNullPrep = [
      { item_name: 'Water Bottle', prep_time_minutes: null, quantity: 3 },
      { item_name: 'Napkin Pack', prep_time_minutes: undefined, quantity: 2 },
    ];
    assert.strictEqual(queueService.calculateOrderBasePrepMinutes(itemsWithNullPrep), 0);
  });
});
