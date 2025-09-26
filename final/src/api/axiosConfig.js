import axios from 'axios';
import { errorMonitor } from '../utils/errorMonitor.js';

console.log('🔧 AXIOS CONFIG FILE LOADING...');

// Debug environment variables
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  all: import.meta.env
});

// Create axios instance with base configuration
// Ensure we always use the backend URL, not the frontend URL
let baseURL = import.meta.env.VITE_API_BASE_URL;

// If environment variable is not set or is incorrect, force the correct backend URL
if (!baseURL || baseURL.includes('3000') || baseURL.includes('3001')) {
  baseURL = 'http://localhost:8080/api';
  console.warn('⚠️ VITE_API_BASE_URL not set correctly, using fallback:', baseURL);
}

console.log('🚀 AXIOS CONFIG: Using baseURL:', baseURL);
console.log('🔍 Environment check - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

const API = axios.create({
  baseURL: baseURL,
  timeout: 60000, // Increased to 60 seconds for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
  maxContentLength: 50 * 1024 * 1024, // 50MB max content length
  maxBodyLength: 50 * 1024 * 1024, // 50MB max body length
});

// Request interceptor to add auth token to requests
API.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL + config.url;
    console.log('📡 Making API request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: fullUrl,
      params: config.params,
      data: config.data
    });
    
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
    // Only log successful responses that aren't cached (304)
    if (response.status !== 304) {
      console.log('✅ API Response SUCCESS:', {
        url: response.config.url,
        status: response.status,
        method: response.config.method?.toUpperCase(),
        dataSize: response.data ? JSON.stringify(response.data).length : 0
      });
    }
    return response;
  },
  (error) => {
    const errorContext = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      baseURL: error.config?.baseURL,
      data: error.response?.data
    };

    // Use enhanced error monitoring
    errorMonitor.logError(error, errorContext);
    
    // Handle common error scenarios with better user messages
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Request timed out. Please try again.';
    } else if (error.code === 'ERR_CANCELED') {
      error.userMessage = 'Request was cancelled.';
    } else if (!error.response) {
      error.userMessage = 'Network error. Please check your connection.';
    } else if (error.response.status === 401) {
      error.userMessage = 'Authentication failed. Please login again.';
      localStorage.removeItem('authToken');
      // Don't redirect automatically, let components handle it
    } else if (error.response.status === 403) {
      error.userMessage = 'Permission denied. You do not have access to this resource.';
    } else if (error.response.status === 404) {
      error.userMessage = 'Resource not found.';
    } else if (error.response.status >= 500) {
      error.userMessage = 'Server error. Please try again later.';
    } else if (error.response.status >= 400) {
      error.userMessage = error.response.data?.message || 'Request failed.';
    }
    
    return Promise.reject(error);
  }
);

export default API;
