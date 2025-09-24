// Central API Configuration
// This file provides a unified way to configure API base URLs for all services

/**
 * Get the base API URL from environment variables
 * @returns {string} The base API URL without any trailing path
 */
export const getBaseURL = () => {
  // Get the base URL from environment variables
  // VITE_API_BASE_URL should be just the domain (e.g., 'http://localhost:8080')
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  
  // Ensure no trailing slash
  return baseURL.replace(/\/$/, '');
};

/**
 * Get the full API URL with /api prefix
 * @returns {string} The complete API base URL with /api prefix
 */
export const getApiURL = () => {
  return `${getBaseURL()}/api`;
};

/**
 * Create endpoint URLs for different API categories
 */
export const API_ENDPOINTS = {
  // Banner endpoints
  banners: `${getApiURL()}/banners`,
  
  // JoinUs endpoints
  joinus: `${getApiURL()}/joinus`,
  
  // Analytics endpoints
  analytics: {
    base: `${getApiURL()}/analytics`,
    realtime: `${getApiURL()}/analytics/realtime`,
    audience: `${getApiURL()}/analytics/audience`,
    acquisition: `${getApiURL()}/analytics/acquisition`,
    behavior: `${getApiURL()}/analytics/behavior`,
    conversions: `${getApiURL()}/analytics/conversions`,
    demographics: `${getApiURL()}/analytics/demographics`,
    technology: `${getApiURL()}/analytics/technology`,
    events: `${getApiURL()}/analytics/events`,
  },
  
  // Settings endpoints
  settings: `${getApiURL()}/settings`,
  
  // Add more endpoint categories as needed
};

/**
 * Common axios configuration options
 */
export const AXIOS_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Export individual configurations for different use cases
export const CONFIG = {
  baseURL: getBaseURL(),
  apiURL: getApiURL(),
  endpoints: API_ENDPOINTS,
  axiosConfig: AXIOS_CONFIG,
};

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('🔧 API Config:', {
    baseURL: getBaseURL(),
    apiURL: getApiURL(),
    endpoints: API_ENDPOINTS,
  });
}
