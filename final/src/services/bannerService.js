import axios from 'axios';

// Create axios instance for banner API
const bannerApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/banners`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for banner operations
});

// Add token to all requests
bannerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || 
                  sessionStorage.getItem('token') || 
                  localStorage.getItem('authToken') ||
                  sessionStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Banner API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
bannerApi.interceptors.response.use(
  (response) => {
    return response.data; // Return only the data part
  },
  (error) => {
    console.error('Banner API Response Error:', error);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Return a structured error response
    const errorResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      details: error.response?.data?.details || null
    };
    
    return Promise.reject(errorResponse);
  }
);

export const bannerService = {
  // Banner CRUD Operations
  
  /**
   * Create a new banner
   * @param {Object} bannerData - Banner data object
   * @returns {Promise<Object>} Created banner data
   */
  createBanner: async (bannerData) => {
    try {
      const response = await bannerApi.post('/', bannerData);
      return response;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  /**
   * Get all banners with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Banners list with metadata
   */
  getAllBanners: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add query parameters
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== null) {
          params.append(key, options[key]);
        }
      });
      
      const response = await bannerApi.get(`/?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  /**
   * Get active banners for public display
   * @param {Object} options - Query options (bannerType, limit)
   * @returns {Promise<Object>} Active banners
   */
  getActiveBanners: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (options.bannerType) {
        params.append('bannerType', options.bannerType);
      }
      if (options.limit) {
        params.append('limit', options.limit);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/active?${queryString}` : '/active';
      
      const response = await bannerApi.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching active banners:', error);
      throw error;
    }
  },

  /**
   * Get banner by ID
   * @param {string} bannerId - Banner ID
   * @returns {Promise<Object>} Banner data
   */
  getBannerById: async (bannerId) => {
    try {
      if (!bannerId) {
        throw new Error('Banner ID is required');
      }
      
      const response = await bannerApi.get(`/${bannerId}`);
      return response;
    } catch (error) {
      console.error('Error fetching banner:', error);
      throw error;
    }
  },

  /**
   * Update banner
   * @param {string} bannerId - Banner ID
   * @param {Object} updateData - Updated banner data
   * @returns {Promise<Object>} Updated banner data
   */
  updateBanner: async (bannerId, updateData) => {
    try {
      if (!bannerId) {
        throw new Error('Banner ID is required');
      }
      
      const response = await bannerApi.put(`/${bannerId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  /**
   * Delete banner (soft delete)
   * @param {string} bannerId - Banner ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteBanner: async (bannerId) => {
    try {
      if (!bannerId) {
        throw new Error('Banner ID is required');
      }
      
      const response = await bannerApi.delete(`/${bannerId}`);
      return response;
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },

  /**
   * Permanently delete banner
   * @param {string} bannerId - Banner ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  permanentDeleteBanner: async (bannerId) => {
    try {
      if (!bannerId) {
        throw new Error('Banner ID is required');
      }
      
      const response = await bannerApi.delete(`/${bannerId}/permanent`);
      return response;
    } catch (error) {
      console.error('Error permanently deleting banner:', error);
      throw error;
    }
  },

  // Banner Status Management

  /**
   * Publish banner
   * @param {string} bannerId - Banner ID
   * @returns {Promise<Object>} Published banner data
   */
  publishBanner: async (bannerId) => {
    try {
      if (!bannerId) {
        throw new Error('Banner ID is required');
      }
      
      const response = await bannerApi.patch(`/${bannerId}/publish`);
      return response;
    } catch (error) {
      console.error('Error publishing banner:', error);
      throw error;
    }
  },

  /**
   * Unpublish banner
   * @param {string} bannerId - Banner ID
   * @returns {Promise<Object>} Unpublished banner data
   */
  unpublishBanner: async (bannerId) => {
    try {
      if (!bannerId) {
        throw new Error('Banner ID is required');
      }
      
      const response = await bannerApi.patch(`/${bannerId}/unpublish`);
      return response;
    } catch (error) {
      console.error('Error unpublishing banner:', error);
      throw error;
    }
  },

  /**
   * Update banner priorities in bulk
   * @param {Array} priorities - Array of {id, priority} objects
   * @returns {Promise<Object>} Updated banners
   */
  updateBannerPriorities: async (priorities) => {
    try {
      if (!Array.isArray(priorities)) {
        throw new Error('Priorities must be an array');
      }
      
      const response = await bannerApi.patch('/priorities', { priorities });
      return response;
    } catch (error) {
      console.error('Error updating banner priorities:', error);
      throw error;
    }
  },

  // Analytics and Tracking

  /**
   * Get banner analytics
   * @param {string} bannerId - Banner ID
   * @param {Object} dateRange - Optional date range filter
   * @returns {Promise<Object>} Banner analytics data
   */
  getBannerAnalytics: async (bannerId, dateRange = {}) => {
    try {
      if (!bannerId) {
        throw new Error('Banner ID is required');
      }
      
      const params = new URLSearchParams();
      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/${bannerId}/analytics?${queryString}` : `/${bannerId}/analytics`;
      
      const response = await bannerApi.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching banner analytics:', error);
      throw error;
    }
  },

  /**
   * Track banner click
   * @param {string} bannerId - Banner ID
   * @returns {Promise<Object>} Click tracking confirmation
   */
  trackBannerClick: async (bannerId) => {
    try {
      if (!bannerId) {
        throw new Error('Banner ID is required');
      }
      
      const response = await bannerApi.post(`/${bannerId}/click`);
      return response;
    } catch (error) {
      console.error('Error tracking banner click:', error);
      // Don't throw error for tracking failures to avoid disrupting user experience
      return { success: false, message: 'Failed to track click' };
    }
  },

  /**
   * Track banner conversion
   * @param {string} bannerId - Banner ID
   * @returns {Promise<Object>} Conversion tracking confirmation
   */
  trackBannerConversion: async (bannerId) => {
    try {
      if (!bannerId) {
        throw new Error('Banner ID is required');
      }
      
      const response = await bannerApi.post(`/${bannerId}/conversion`);
      return response;
    } catch (error) {
      console.error('Error tracking banner conversion:', error);
      // Don't throw error for tracking failures to avoid disrupting user experience
      return { success: false, message: 'Failed to track conversion' };
    }
  },

  // Bulk Operations

  /**
   * Bulk update banners
   * @param {Array} bannerIds - Array of banner IDs
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Bulk update result
   */
  bulkUpdateBanners: async (bannerIds, updates) => {
    try {
      if (!Array.isArray(bannerIds) || bannerIds.length === 0) {
        throw new Error('Banner IDs array is required');
      }
      
      const response = await bannerApi.patch('/bulk-update', {
        bannerIds,
        updates
      });
      return response;
    } catch (error) {
      console.error('Error bulk updating banners:', error);
      throw error;
    }
  },

  // Helper Methods

  /**
   * Upload banner image to server
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<string>} Image URL
   */
  uploadBannerImage: async (imageFile) => {
    try {
      if (!imageFile) {
        throw new Error('Image file is required');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', imageFile);

      // Use a separate endpoint for image upload or convert to base64
      // For now, we'll convert to base64 for simplicity
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      console.error('Error uploading banner image:', error);
      throw error;
    }
  },

  /**
   * Validate banner data before submission
   * @param {Object} bannerData - Banner data to validate
   * @returns {Object} Validation result
   */
  validateBannerData: (bannerData) => {
    const errors = [];
    
    if (!bannerData.title || bannerData.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (bannerData.title && bannerData.title.length > 100) {
      errors.push('Title must not exceed 100 characters');
    }
    
    if (!bannerData.detail || bannerData.detail.trim().length === 0) {
      errors.push('Detail is required');
    }
    
    if (bannerData.detail && bannerData.detail.length > 1000) {
      errors.push('Detail must not exceed 1000 characters');
    }
    
    if (!bannerData.image || (!bannerData.image.url && typeof bannerData.image !== 'string')) {
      errors.push('Image is required');
    }
    
    if (bannerData.priority && (isNaN(bannerData.priority) || bannerData.priority < 1)) {
      errors.push('Priority must be a positive number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default bannerService;
