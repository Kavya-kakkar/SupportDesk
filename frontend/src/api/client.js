import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('supportdesk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't loop redirect if already on auth page
      if (!window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('supportdesk_token');
        localStorage.removeItem('supportdesk_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
