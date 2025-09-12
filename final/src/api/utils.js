// API response handler utility
export const handleApiResponse = (response) => {
  if (response.data) {
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Success',
    };
  }
  return {
    success: false,
    data: null,
    message: 'No data received',
  };
};

// API error handler utility
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return {
      success: false,
      data: null,
      message: error.response.data?.message || `Error: ${error.response.status}`,
      status: error.response.status,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      success: false,
      data: null,
      message: 'Network error - please check your connection',
      status: null,
    };
  } else {
    // Something else happened
    return {
      success: false,
      data: null,
      message: error.message || 'An unexpected error occurred',
      status: null,
    };
  }
};

// Generic API call wrapper
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

// Helper to format form data for file uploads
export const createFormData = (data, fileField = null, fileData = null) => {
  const formData = new FormData();
  
  // Add regular fields
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  // Add file if provided
  if (fileField && fileData) {
    formData.append(fileField, fileData);
  }
  
  return formData;
};

// Helper to build query parameters
export const buildQueryParams = (params) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });
  
  return queryParams.toString();
};

// Token management utilities
export const tokenUtils = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken'),
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },
};

// User data utilities
export const userUtils = {
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },
  setUserData: (userData) => localStorage.setItem('userData', JSON.stringify(userData)),
  removeUserData: () => localStorage.removeItem('userData'),
  clearAllUserData: () => {
    tokenUtils.removeToken();
    userUtils.removeUserData();
    localStorage.removeItem('cartData');
    localStorage.removeItem('wishlistData');
  },
};

// Request retry utility
export const retryRequest = async (apiFunction, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await apiFunction();
      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// Debounce utility for search/filtering
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
