/**
 * api.js — Central Axios instance for all DiagnoSync API calls
 *
 * Features:
 *  - Automatically attaches JWT token to every request
 *  - Redirects to /signin on 401 Unauthorized (token expired / invalid)
 *  - Single place to change base URL (reads from VITE_API_URL env var)
 */

import axios from 'axios';

// ── Create instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// ── Request interceptor: attach token ─────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle errors globally ──────────────────────────
api.interceptors.response.use(
  // Pass through successful responses as-is
  (response) => response,

  // Handle errors
  (error) => {
    const status = error.response?.status;

    // 401 — Token expired or invalid: force logout only if user was logged in
    if (status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAuthenticated');
      // Only redirect to /signin if the user was actually authenticated
      if (hadToken) {
        window.location.href = '/signin';
      }
      return Promise.reject(error);
    }

    // 403 — Forbidden: user doesn't have permission
    if (status === 403) {
      console.warn('Access denied:', error.response?.data?.error);
    }

    // 500 — Server error
    if (status >= 500) {
      console.error('Server error:', error.response?.data?.error || 'Unknown server error');
    }

    return Promise.reject(error);
  }
);

export default api;
