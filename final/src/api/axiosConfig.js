import axios from 'axios';

// Debug environment variables
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  all: import.meta.env
});

// Create axios instance with base configuration
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
console.log('Using baseURL:', baseURL);

const API = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If sending FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common response scenarios
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden');
    }
    
    if (error.response?.status >= 500) {
      // Server error
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default API;
