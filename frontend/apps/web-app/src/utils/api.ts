import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin APIs
export const adminAPI = {
  // Auth
  login: (data: { email: string; password: string }) =>
    api.post('/api/admin/auth/login', data),
  logout: () => api.post('/api/admin/auth/logout'),
  forgotPassword: (data: { email: string }) =>
    api.post('/api/admin/auth/forgot-password', data),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post('/api/admin/auth/reset-password', data),

  // Dashboard
  getDashboardStats: () => api.get('/api/admin/dashboard/stats'),

  // Admins
  listAdmins: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get('/api/admin/admins', { params }),
  createAdmin: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; adminRoleCode?: string }) =>
    api.post('/api/admin/admins', data),
  updateAdmin: (id: string, data: any) =>
    api.put(`/api/admin/admins/${id}`, data),

  // Tenants
  listTenants: (params?: { page?: number; limit?: number; search?: string; type?: string; isActive?: string }) =>
    api.get('/api/admin/tenants', { params }),
  createTenant: (data: any) =>
    api.post('/api/admin/tenants', data),
  updateTenant: (id: string, data: any) =>
    api.put(`/api/admin/tenants/${id}`, data),

  // Users (from user-service)
  searchUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get('/api/users/search', { params }),

  // Analytics
  getAnalytics: (params?: { period?: string }) =>
    api.get('/api/admin/analytics', { params }),

  // Billing
  getBilling: () => api.get('/api/admin/billing'),

  // Security
  getSecurity: () => api.get('/api/admin/security'),

  // Logs
  getAuditLogs: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get('/api/admin/logs', { params }),

  // Settings
  getSettings: () => api.get('/api/admin/settings'),
  updateSettings: (data: any) => api.put('/api/admin/settings', data),
};

export default api;


