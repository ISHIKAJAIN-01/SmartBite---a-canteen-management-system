/**
 * SmartBite API Client
 * Centralized fetch wrapper handling auth headers, base URLs, and errors.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Retrieve the current active auth token from localStorage
 */
export function getAuthToken() {
  return localStorage.getItem('smartbite_token') || '';
}

/**
 * Save auth token and user info
 */
export function setAuthSession(token, user) {
  if (token) {
    localStorage.setItem('smartbite_token', token);
  } else {
    localStorage.removeItem('smartbite_token');
  }

  if (user) {
    localStorage.setItem('smartbite_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('smartbite_user');
  }
}

/**
 * Retrieve stored user
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('smartbite_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Core HTTP Request Function
 */
export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const storedUser = getStoredUser();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Fallback development header for viva demonstrations
    ...(storedUser?.user_id ? { 'x-auth-user-id': String(storedUser.user_id) } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `API error: ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If network failed entirely (server offline)
    if (!error.status) {
      error.isNetworkError = true;
      error.message = 'Unable to reach the SmartBite server. Please check your connection.';
    }
    throw error;
  }
}
