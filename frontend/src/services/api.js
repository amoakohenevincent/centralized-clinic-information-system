import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ccis_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const errorData = error.response.data?.error || {
        message: error.response.data?.message || 'Server responded with an error.',
      };

      if (error.response.status === 401) {
        console.warn('[CCIS-Auth] Session expired or invalid.');
      }

      return Promise.reject(errorData);
    }
    return Promise.reject({
      message: error.message || 'Network connection failed. Please check your backend connection.',
    });
  }
);

export default api;

