import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API methods - ADD /api PREFIX TO ALL ROUTES
export const authAPI = {
  login: (credentials) => api.post('/api/admin/login', credentials),
  register: (adminData) => api.post('/api/admin/register', adminData),
  getProfile: () => api.get('/api/admin/profile'),
  updateProfile: (profileData) => api.put('/api/admin/profile', profileData),
  changePassword: (passwordData) => api.put('/api/admin/change-password', passwordData),
};

// Export the main api instance for other requests
export default api;