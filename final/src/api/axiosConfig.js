import axios from 'axios';
import { getApiURL, AXIOS_CONFIG } from '../config/apiConfig.js';

console.log('🔧 AXIOS CONFIG FILE LOADING...');

// Debug environment variables
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
});

// Create axios instance with base configuration using centralized config
const baseURL = getApiURL();
console.log('🚀 AXIOS CONFIG: Using baseURL:', baseURL);

const API = axios.create({
  baseURL: baseURL,
  ...AXIOS_CONFIG,
});

// Request interceptor to add auth token to requests
API.interceptors.request.use(
  (config) => {
    console.log('📡 Making API request:', config.method?.toUpperCase(), config.url, 'baseURL:', config.baseURL, 'Full URL:', config.baseURL + config.url, config.params);
    
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
    console.error('📡 Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common response scenarios
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
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
