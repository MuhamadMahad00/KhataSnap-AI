// ============================================
// KhataSnap AI — API Service Layer
// ============================================
// Centralized Axios instance with JWT interceptor.
// All API calls go through this module.

import axios from 'axios';

// Create axios instance with production environment URL fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const API = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30s timeout (AI calls can be slow)
  headers: { 'Content-Type': 'application/json' }
});

// ============================================
// JWT Interceptor — Attach token to every request
// ============================================
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('khatasnap_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Response interceptor — handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('khatasnap_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// Auth API
// ============================================
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile')
};

// ============================================
// Receipt API
// ============================================
export const receiptAPI = {
  // Upload and scan receipt with AI
  scan: (formData) => API.post('/receipts/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000 // 60s for AI processing
  }),
  // Save receipt to database
  save: (data) => API.post('/receipts', data),
  // Get all receipts with filters
  getAll: (params) => API.get('/receipts', { params }),
  // Get dashboard stats
  getStats: () => API.get('/receipts/stats'),
  // Get heatmap data
  getHeatmap: () => API.get('/receipts/heatmap'),
  // Get single receipt
  getById: (id) => API.get(`/receipts/${id}`),
  // Update receipt
  update: (id, data) => API.put(`/receipts/${id}`, data),
  // Delete receipt
  delete: (id) => API.delete(`/receipts/${id}`)
};

// ============================================
// Budget API
// ============================================
export const budgetAPI = {
  set: (data) => API.post('/budgets', data),
  getCurrent: () => API.get('/budgets/current'),
  getHistory: () => API.get('/budgets/history')
};

// ============================================
// Challenge API
// ============================================
export const challengeAPI = {
  create: (data) => API.post('/challenges', data),
  getAll: () => API.get('/challenges'),
  delete: (id) => API.delete(`/challenges/${id}`),
  getMotivation: (id) => API.get(`/challenges/${id}/motivation`)
};

// ============================================
// AI API
// ============================================
export const aiAPI = {
  chat: (message) => API.post('/ai/chat', { message }),
  smartSearch: (query) => API.post('/ai/smart-search', { query }),
  getInsights: () => API.get('/ai/insights'),
  getFinancialScore: () => API.get('/ai/financial-score'),
  getMonthlyComparison: () => API.get('/ai/monthly-comparison')
};

export default API;
