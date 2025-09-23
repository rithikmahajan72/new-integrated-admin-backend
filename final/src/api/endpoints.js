import API from './axiosConfig';

// Auth API endpoints
export const authAPI = {
  // User authentication
  login: (credentials) => API.post('/api/auth/login', credentials),
  register: (userData) => API.post('/api/auth/register', userData),
  logout: () => API.post('/api/auth/logout'),
  refreshToken: () => API.post('/api/auth/refresh'),
  forgotPassword: (email) => API.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post('/api/auth/reset-password', { token, password }),
  verifyOTP: (otpData) => API.post('/api/auth/verify-otp', otpData),
  resendOTP: (phoneNumber) => API.post('/api/auth/resend-otp', { phoneNumber }),
};

// User profile API endpoints
export const userAPI = {
  getProfile: () => API.get('/api/user/profile'),
  updateProfile: (userData) => API.put('/api/user/profile', userData),
  deleteAccount: () => API.delete('/api/user/profile'),
  getUserById: (userId) => API.get(`/api/user/${userId}`),
};

// Firebase Admin API endpoints
export const firebaseAPI = {
  getAllUsers: () => API.get('/api/firebase/users'),
  getUserById: (uid) => API.get(`/api/firebase/users/${uid}`),
  blockUser: (uid, reason) => API.post(`/api/firebase/users/${uid}/block`, { reason }),
  unblockUser: (uid) => API.post(`/api/firebase/users/${uid}/unblock`),
  deleteUser: (uid) => API.delete(`/api/firebase/users/${uid}`),
};

// Items/Products API endpoints
export const itemAPI = {
  // Get items
  getAllItems: (params = {}) => API.get('/api/items', { params }),
  getItemById: (itemId) => API.get(`/api/items/${itemId}`),
  getItemsByCategory: (categoryId) => API.get(`/api/items/category/${categoryId}`),
  getItemsBySubCategory: (subCategoryId) => API.get(`/api/items/subcategory/${subCategoryId}`),
  getItemStatistics: () => API.get('/api/items/statistics'),
  
  // NEW SIMPLIFIED FLOW - No authentication required initially
  createItem: (itemData) => API.post('/api/items/create-draft', itemData), // New simplified endpoint
  updateItem: (itemId, itemData) => API.put(`/api/items/${itemId}`, itemData),
  deleteItem: (itemId) => API.delete(`/api/items/${itemId}`),
  
  // Media upload endpoints
  uploadImage: (formData) => API.post('/api/items/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadVideo: (formData) => API.post('/api/items/upload-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Legacy endpoints (kept for compatibility)
  createItemWithAuth: (itemData) => API.post('/api/items/text-only', itemData), // Use text-only endpoint for authenticated workflow
  
  // NEW FLOW-BASED API ENDPOINTS
  // Phase 1: Create basic product information with sizes
  createBasicProduct: (productData) => API.post('/api/items/basic-product', productData),
  
  // Phase 2: Update product with draft configuration (images, filters, categories)
  updateDraftConfiguration: (productId, draftData) => API.put(`/api/items/${productId}/draft-configuration`, draftData),
  
  // Phase 3: Add review to product (consumer/admin side)
  addReview: (productId, reviewData) => API.post(`/api/items/${productId}/reviews`, reviewData),
  
  // Phase 4: Update also show in options (draft management)
  updateAlsoShowInOptions: (productId, optionsData) => API.put(`/api/items/${productId}/also-show-options`, optionsData),
  
  // Phase 5: Update product status (draft → schedule → live)
  updateProductStatus: (productId, statusData) => API.put(`/api/items/${productId}/status`, statusData),
  
  // Utility endpoints for the new flow
  getProductById: (productId) => API.get(`/api/items/product/${productId}`), // Supports both ObjectId and productId
  getProductsByStatus: (status, params = {}) => API.get(`/api/items/status/${status}`, { params }),
  updateProductSizes: (productId, sizesData) => API.put(`/api/items/${productId}/sizes`, sizesData),
  updateReviewSettings: (productId, settingsData) => API.put(`/api/items/${productId}/review-settings`, settingsData),
  
  // Item details
  getItemDetails: (itemId) => API.get(`/api/item-details/${itemId}`),
  updateItemDetails: (itemId, detailsData) => API.put(`/api/item-details/${itemId}`, detailsData),
  
  // Arrangement control endpoints
  getCategoriesForArrangement: () => API.get('/api/items/categories-arrangement'),
  getItemsForArrangement: (params = {}) => API.get('/api/items/items-arrangement', { params }),
  updateItemsDisplayOrder: (items) => API.put('/api/items/items-display-order', { items }),
  updateCategoriesDisplayOrder: (categories) => API.put('/api/items/categories-display-order', { categories }),
  updateSubCategoriesDisplayOrder: (subcategories) => API.put('/api/items/subcategories-display-order', { subcategories }),
};

// Category API endpoints
export const categoryAPI = {
  getAllCategories: () => API.get('/api/categories'),
  getCategoryById: (categoryId) => API.get(`/api/categories/${categoryId}`),
  createCategory: (categoryData) => API.post('/api/categories', categoryData),
  updateCategory: (categoryId, categoryData) => API.put(`/api/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => API.delete(`/api/categories/${categoryId}`),
};

// SubCategory API endpoints
export const subCategoryAPI = {
  getAllSubCategories: () => API.get('/api/subcategories'),
  getSubCategoryById: (subCategoryId) => API.get(`/api/subcategories/${subCategoryId}`),
  getSubCategoriesByCategory: (categoryId) => API.get(`/api/subcategories/category/${categoryId}`),
  createSubCategory: (subCategoryData) => API.post('/api/subcategories', subCategoryData),
  updateSubCategory: (subCategoryId, subCategoryData) => API.put(`/api/subcategories/${subCategoryId}`, subCategoryData),
  deleteSubCategory: (subCategoryId) => API.delete(`/api/subcategories/${subCategoryId}`),
};

// Cart API endpoints
export const cartAPI = {
  getCart: () => API.get('/api/cart'),
  addToCart: (itemData) => API.post('/api/cart/add', itemData),
  updateCartItem: (itemId, quantity) => API.put(`/api/cart/update/${itemId}`, { quantity }),
  removeFromCart: (itemId) => API.delete(`/api/cart/remove/${itemId}`),
  clearCart: () => API.delete('/api/cart/clear'),
};

// Wishlist API endpoints
export const wishlistAPI = {
  getWishlist: () => API.get('/api/wishlist'),
  addToWishlist: (itemId) => API.post('/api/wishlist/add', { itemId }),
  removeFromWishlist: (itemId) => API.delete(`/api/wishlist/remove/${itemId}`),
  clearWishlist: () => API.delete('/api/wishlist/clear'),
};

// Save For Later API endpoints
export const saveForLaterAPI = {
  getSaveForLater: () => API.get('/save-for-later'),
  addToSaveForLater: (data) => API.post('/save-for-later/add', data),
  removeFromSaveForLater: (itemId) => API.delete(`/save-for-later/remove/${itemId}`),
  clearSaveForLater: () => API.delete('/save-for-later/clear'),
  moveToCart: (data) => API.post('/save-for-later/move-to-cart', data),
  moveToWishlist: (data) => API.post('/save-for-later/move-to-wishlist', data),
  updateNote: (itemId, data) => API.put(`/save-for-later/update-note/${itemId}`, data)
};

// Promo Code API endpoints
export const promoCodeAPI = {
  // Get all promo codes with filtering and pagination
  getAllPromoCodes: (params = {}) => API.get('/api/promoCode/admin/promo-codes', { params }),
  
  // Get promo code by ID
  getPromoCodeById: (id) => API.get(`/api/promoCode/admin/promo-codes/${id}`),
  
  // Create new promo code
  createPromoCode: (promoCodeData) => API.post('/api/promoCode/admin/promo-codes', promoCodeData),
  
  // Update promo code
  updatePromoCode: (id, promoCodeData) => API.put(`/api/promoCode/admin/promo-codes/${id}`, promoCodeData),
  
  // Delete promo code
  deletePromoCode: (id) => API.delete(`/api/promoCode/admin/promo-codes/${id}`),
  
  // Validate promo code (public endpoint)
  validatePromoCode: (data) => API.post('/api/promoCode/promo-codes/validate', data),
  
  // Bulk operations
  bulkToggleStatus: (data) => API.post('/api/promoCode/admin/promo-codes/bulk/toggle-status', data),
  bulkDelete: (data) => API.post('/api/promoCode/admin/promo-codes/bulk/delete', data),
  
  // Get statistics
  getPromoCodeStats: () => API.get('/api/promoCode/admin/promo-codes/stats'),
  
  // Search promo codes
  searchPromoCodes: (query) => API.get(`/api/promoCode/admin/promo-codes/search?q=${encodeURIComponent(query)}`),
  
  // Get promo codes by status
  getPromoCodesByStatus: (isActive) => API.get(`/api/promoCode/admin/promo-codes/status/${isActive}`),
  
  // Get expired promo codes
  getExpiredPromoCodes: () => API.get('/api/promoCode/admin/promo-codes/expired'),
  
  // Clone promo code
  clonePromoCode: (id) => API.post(`/api/promoCode/admin/promo-codes/${id}/clone`),
};

// Order API endpoints
export const orderAPI = {
  getAllOrders: (params = {}) => API.get('/api/orders', { params }),
  getOrderById: (orderId) => API.get(`/api/orders/${orderId}`),
  createOrder: (orderData) => API.post('/api/orders', orderData),
  updateOrderStatus: (orderId, status) => API.put(`/api/orders/${orderId}/status`, { status }),
  cancelOrder: (orderId) => API.put(`/api/orders/${orderId}/cancel`),
  getUserOrders: () => API.get('/api/orders/user'),
};

// Address API endpoints
export const addressAPI = {
  getAllAddresses: () => API.get('/api/addresses'),
  getAddressById: (addressId) => API.get(`/api/addresses/${addressId}`),
  createAddress: (addressData) => API.post('/api/addresses', addressData),
  updateAddress: (addressId, addressData) => API.put(`/api/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => API.delete(`/api/addresses/${addressId}`),
  setDefaultAddress: (addressId) => API.put(`/api/addresses/${addressId}/default`),
};

// Payment API endpoints
export const paymentAPI = {
  createPaymentIntent: (orderData) => API.post('/api/payment/create-intent', orderData),
  verifyPayment: (paymentData) => API.post('/api/payment/verify', paymentData),
  getPaymentHistory: () => API.get('/api/payment/history'),
};

// Review API endpoints
export const reviewAPI = {
  getItemReviews: (itemId) => API.get(`/api/reviews/item/${itemId}`),
  createReview: (reviewData) => API.post('/api/reviews', reviewData),
  updateReview: (reviewId, reviewData) => API.put(`/api/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => API.delete(`/api/reviews/${reviewId}`),
  getUserReviews: () => API.get('/api/reviews/user'),
};

// Legacy Promo Code endpoints (kept for backward compatibility)
export const legacyPromoAPI = {
  validatePromoCode: (code) => API.post('/api/promo/validate', { code }),
  applyPromoCode: (code, orderData) => API.post('/api/promo/apply', { code, ...orderData }),
  getUserPromoCodes: () => API.get('/api/promo/user'),
};

// Filter API endpoints
export const filterAPI = {
  // Get all available filters
  getAllFilters: () => API.get('/api/filters'),
  getFilterById: (filterId) => API.get(`/api/filters/${filterId}`),
  getFiltersByKey: (key) => API.get(`/api/filters/key/${key}`),
  
  // Filter CRUD operations (admin)
  createFilter: (filterData) => API.post('/api/filters', filterData),
  updateFilter: (filterId, filterData) => API.put(`/api/filters/${filterId}`, filterData),
  deleteFilter: (filterId) => API.delete(`/api/filters/${filterId}`),
  updateFilterPriority: (filterId, priority) => API.patch(`/api/filters/${filterId}/priority`, { priority }),
  
  // Filter application and search
  applyFilters: (filterCriteria) => API.post('/api/filters/apply', filterCriteria),
  searchWithFilters: (searchParams) => API.post('/api/filters/search', searchParams),
  
  // Filter analytics and suggestions
  getFilterAnalytics: () => API.get('/api/filters/analytics'),
  getPopularFilters: () => API.get('/api/filters/popular'),
  getSuggestedFilters: (productId) => API.get(`/api/filters/suggestions/${productId}`),
  
  // Filter presets and management
  saveFilterPreset: (presetData) => API.post('/api/filters/presets', presetData),
  getFilterPresets: () => API.get('/api/filters/presets'),
  deleteFilterPreset: (presetId) => API.delete(`/api/filters/presets/${presetId}`),
  
  // Price range and dynamic filters
  getPriceRange: (categoryId) => API.get(`/api/filters/price-range/${categoryId || 'all'}`),
  getAvailableSizes: (categoryId) => API.get(`/api/filters/sizes/${categoryId || 'all'}`),
  getAvailableColors: (categoryId) => API.get(`/api/filters/colors/${categoryId || 'all'}`),
  getBrands: (categoryId) => API.get(`/api/filters/brands/${categoryId || 'all'}`),
  
  // Filter validation and compatibility
  validateFilters: (filterData) => API.post('/api/filters/validate', filterData),
  getCompatibleFilters: (selectedFilters) => API.post('/api/filters/compatible', selectedFilters),
  
  // Legacy compatibility
  getFilters: () => API.get('/api/filters'), // Backward compatibility
};

// Notification API endpoints
export const notificationAPI = {
  getAllNotifications: () => API.get('/api/notifications/notifications'),
  markAsRead: (notificationId) => API.put(`/api/notifications/${notificationId}/read`),
  markAllAsRead: () => API.put('/api/notifications/read-all'),
  deleteNotification: (notificationId) => API.delete(`/api/notifications/${notificationId}`),
};

// Push Notification API endpoints
export const pushNotificationAPI = {
  sendNotification: (notificationData) => API.post('/api/notifications/send-notification', notificationData),
  uploadNotificationImage: (formData) => API.post('/api/notifications/upload-notification-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getNotificationHistory: () => API.get('/api/notifications/notifications'),
  scheduleNotification: (notificationData) => API.post('/api/notifications/schedule-notification', notificationData),
  cancelScheduledNotification: (notificationId) => API.delete(`/api/notifications/schedule/${notificationId}`),
};

// Bulk Upload API endpoints (admin)
export const bulkUploadAPI = {
  uploadItems: (formData) => API.post('/api/bulk-upload/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUploadHistory: () => API.get('/api/bulk-upload/history'),
  downloadTemplate: () => API.get('/api/bulk-upload/template', { responseType: 'blob' }),
};

// Image Upload API endpoints
export const imageAPI = {
  uploadImage: (formData, config = {}) => API.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  uploadSingleImage: (formData, config = {}) => API.post('/api/items/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  uploadSingleVideo: (formData, config = {}) => API.post('/api/items/upload-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  deleteImage: (imageId) => API.delete(`/api/images/${imageId}`),
  getSignedUrl: (fileName) => API.post('/api/images/signed-url', { fileName }),
};

// Product API endpoints (for managing products saved from SingleProductUpload)
export const productAPI = {
  getAllProducts: (params = {}) => API.get('/api/items', { params }),
  getProductById: (productId) => API.get(`/api/items/${productId}`),
  createProduct: (productData) => API.post('/api/items', productData),
  updateProduct: (productId, productData) => API.patch(`/api/items/${productId}`, productData),
  deleteProduct: (productId) => API.delete(`/api/items/${productId}`),
  // Additional methods for lifecycle management
  publishProduct: (productId) => API.patch(`/api/items/publish/${productId}`),
  scheduleProduct: (productId, scheduleData) => API.patch(`/api/items/schedule/${productId}`, scheduleData),
  cancelSchedule: (productId) => API.patch(`/api/items/cancel-schedule/${productId}`),
};// Privacy Policy API endpoints
export const privacyAPI = {
  getPrivacyPolicy: () => API.get('/api/privacy-policy'),
  updatePrivacyPolicy: (policyData) => API.put('/api/privacy-policy', policyData),
};

// Partner Management API endpoints
export const partnerAPI = {
  // Admin endpoints for partner management
  createPartner: (partnerData) => API.post('/api/partners', partnerData),
  getAllPartners: (params = {}) => API.get('/api/partners', { params }),
  getPartnerById: (partnerId) => API.get(`/api/partners/${partnerId}`),
  updatePartner: (partnerId, updates) => API.put(`/api/partners/${partnerId}`, updates),
  updatePartnerPassword: (partnerId, passwordData) => API.put(`/api/partners/${partnerId}/password`, passwordData),
  togglePartnerStatus: (partnerId, statusData) => API.patch(`/api/partners/${partnerId}/toggle-status`, statusData),
  deletePartner: (partnerId) => API.delete(`/api/partners/${partnerId}`),
  getPartnerStatistics: () => API.get('/api/partners/statistics'),
  
  // Partner authentication endpoints
  partnerLogin: (credentials) => API.post('/api/partners/auth/login', credentials),
};

// Points System API endpoints
export const pointsAPI = {
  // System configuration
  getSystemConfig: () => API.get('/api/points/config'),
  updateSystemConfig: (configData) => API.put('/api/points/config', configData),
  
  // Users with points
  getAllUsersWithPoints: (params = {}) => API.get('/api/points/users', { params }),
  getUserPoints: (userId) => API.get(`/api/points/user/${userId}`),
  getUserPointsHistory: (userId, params = {}) => API.get(`/api/points/user/${userId}/history`, { params }),
  
  // Points operations
  allocatePoints: (userId, pointsData) => API.post(`/api/points/user/${userId}/allocate`, pointsData),
  redeemPoints: (userId, pointsData) => API.post(`/api/points/user/${userId}/redeem`, pointsData),
  updateUserPoints: (userId, pointsData) => API.put(`/api/points/user/${userId}`, pointsData),
  deleteUserPoints: (userId) => API.delete(`/api/points/user/${userId}`),
  
  // Summary and statistics
  getPointsSummary: () => API.get('/api/points/summary'),
};

// Invite Friend API endpoints
export const inviteFriendAPI = {
  // Admin endpoints
  getAllInviteCodes: (params = {}) => API.get('/api/invite-friend/admin/all', { params }),
  getInviteCodeById: (id) => API.get(`/api/invite-friend/admin/${id}`),
  createInviteCode: (inviteCodeData) => API.post('/api/invite-friend/admin/create', inviteCodeData),
  updateInviteCode: (id, inviteCodeData) => API.put(`/api/invite-friend/admin/${id}`, inviteCodeData),
  deleteInviteCode: (id) => API.delete(`/api/invite-friend/admin/${id}`),
  toggleStatus: (id) => API.patch(`/api/invite-friend/admin/${id}/toggle-status`),
  generateCode: (options = {}) => API.post('/api/invite-friend/admin/generate-code', options),
  getDetailedStats: () => API.get('/api/invite-friend/admin/detailed-stats'),
  bulkDelete: (data) => API.delete('/api/invite-friend/admin/bulk-delete', { data }),
  bulkUpdateStatus: (data) => API.patch('/api/invite-friend/admin/bulk-status', data),
  exportCodes: () => API.get('/api/invite-friend/admin/export'),
  getRedemptionAnalytics: (params = {}) => API.get('/api/invite-friend/admin/analytics/redemptions', { params }),
  getPerformanceAnalytics: () => API.get('/api/invite-friend/admin/analytics/performance'),
  
  // Public endpoints
  validateCode: (code) => API.get(`/api/invite-friend/validate/${code}`),
  getStats: () => API.get('/api/invite-friend/stats'),
  
  // User endpoints
  redeemCode: (codeData) => API.post('/api/invite-friend/redeem', codeData),
  getUserRedeemed: () => API.get('/api/invite-friend/my-redeemed')
};

// Create endpoints object for easier access
export const endpoints = {
  inviteFriend: {
    // Admin endpoints
    getAllInviteCodes: '/api/invite-friend/admin/all',
    getInviteCodeById: (id) => `/api/invite-friend/admin/${id}`,
    createInviteCode: '/api/invite-friend/admin/create',
    updateInviteCode: (id) => `/api/invite-friend/admin/${id}`,
    deleteInviteCode: (id) => `/api/invite-friend/admin/${id}`,
    toggleStatus: (id) => `/api/invite-friend/admin/${id}/toggle-status`,
    generateCode: '/api/invite-friend/admin/generate-code',
    getDetailedStats: '/api/invite-friend/admin/detailed-stats',
    bulkDelete: '/api/invite-friend/admin/bulk-delete',
    bulkUpdateStatus: '/api/invite-friend/admin/bulk-status',
    exportCodes: '/api/invite-friend/admin/export',
    getRedemptionAnalytics: '/api/invite-friend/admin/analytics/redemptions',
    getPerformanceAnalytics: '/api/invite-friend/admin/analytics/performance',
    
    // Public endpoints
    validateCode: (code) => `/api/invite-friend/validate/${code}`,
    getStats: '/api/invite-friend/stats',
    
    // User endpoints
    redeemCode: '/api/invite-friend/redeem',
    getUserRedeemed: '/api/invite-friend/my-redeemed'
  }
};

export default API;
