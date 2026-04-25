import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 and 403 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname || '';

      // Allow guests to browse room discovery flow without being forced to login.
      const publicBrowsePaths = ['/rooms', '/floor/'];
      const isPublicBrowsePath = publicBrowsePaths.some((prefix) => path.startsWith(prefix));

      if (!isPublicBrowsePath && !path.startsWith('/login') && !path.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    if (error.response?.status === 403) {
      // Role-based access denied — redirect to appropriate dashboard
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'student') {
        window.location.href = '/student/dashboard';
      } else if (user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
