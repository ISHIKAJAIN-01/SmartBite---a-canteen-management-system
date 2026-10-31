/**
 * SmartBite Order Tracking Service
 * Implements client calls for tracking, queue status, active orders, and demo accounts.
 */

import { apiRequest } from './api';

export const orderTrackingService = {
  /**
   * Fetch complete tracking details for an order
   * @param {string|number} orderId
   */
  async getOrderTracking(orderId) {
    return apiRequest(`/orders/${orderId}/tracking`);
  },

  /**
   * Fetch queue status and estimated waiting time for an order
   * @param {string|number} orderId
   */
  async getOrderQueue(orderId) {
    return apiRequest(`/orders/${orderId}/queue`);
  },

  /**
   * Fetch active orders belonging to the current student
   */
  async getMyActiveOrders() {
    return apiRequest('/orders/my/active');
  },

  /**
   * Fetch available demo student accounts for viva and testing
   */
  async getDemoUsers() {
    return apiRequest('/auth/demo-users');
  },
};
