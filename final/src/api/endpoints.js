import API from './axiosConfig';

// Auth API endpoints
export const authAPI = {
  // User authentication
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  logout: () => API.post('/auth/logout'),
  refreshToken: () => API.post('/auth/refresh'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post('/auth/reset-password', { token, password }),
  verifyOTP: (otpData) => API.post('/auth/verify-otp', otpData),
  resendOTP: (phoneNumber) => API.post('/auth/resend-otp', { phoneNumber }),
};

// User profile API endpoints
export const userAPI = {
  getProfile: () => API.get('/user/profile'),
  updateProfile: (userData) => API.put('/user/profile', userData),
  deleteAccount: () => API.delete('/user/profile'),
  getUserById: (userId) => API.get(`/api/user/${userId}`),
};

// Firebase Admin API endpoints
export const firebaseAPI = {
  getAllUsers: () => API.get('/firebase/users'),
  getUserById: (uid) => API.get(`/api/firebase/users/${uid}`),
  blockUser: (uid, reason) => API.post(`/api/firebase/users/${uid}/block`, { reason }),
  unblockUser: (uid) => API.post(`/api/firebase/users/${uid}/unblock`),
  deleteUser: (uid) => API.delete(`/api/firebase/users/${uid}`),
};

// Items/Products API endpoints
export const itemAPI = {
  // Get items
  getAllItems: (params = {}) => API.get('/items', { params }),
  getItemById: (itemId) => API.get(`/api/items/${itemId}`),
  getItemsByCategory: (categoryId) => API.get(`/api/items/category/${categoryId}`),
  getItemsBySubCategory: (subCategoryId) => API.get(`/api/items/subcategory/${subCategoryId}`),
  getItemStatistics: () => API.get('/items/statistics'),
  
  // NEW SIMPLIFIED FLOW - No authentication required initially
  createItem: (itemData) => API.post('/items/create-draft', itemData), // New simplified endpoint
  updateItem: (itemId, itemData) => API.put(`/api/items/${itemId}`, itemData),
  deleteItem: (itemId) => API.delete(`/api/items/${itemId}`),
  
  // Media upload endpoints
  uploadImage: (formData) => API.post('/items/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadVideo: (formData) => API.post('/items/upload-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Legacy endpoints (kept for compatibility)
  createItemWithAuth: (itemData) => API.post('/items/text-only', itemData), // Use text-only endpoint for authenticated workflow
  
  // NEW FLOW-BASED API ENDPOINTS
  // Phase 1: Create basic product information with sizes
  createBasicProduct: (productData) => API.post('/items/basic-product', productData),
  
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
  getCategoriesForArrangement: () => API.get('/items/categories-arrangement'),
  getItemsForArrangement: (params = {}) => API.get('/items/items-arrangement', { params }),
  updateItemsDisplayOrder: (items) => API.put('/items/items-display-order', { items }),
  updateCategoriesDisplayOrder: (categories) => API.put('/items/categories-display-order', { categories }),
  updateSubCategoriesDisplayOrder: (subcategories) => API.put('/items/subcategories-display-order', { subcategories }),
};

// Category API endpoints
export const categoryAPI = {
  getAllCategories: () => API.get('/categories'),
  getCategoryById: (categoryId) => API.get(`/api/categories/${categoryId}`),
  createCategory: (categoryData) => API.post('/categories', categoryData),
  updateCategory: (categoryId, categoryData) => API.put(`/api/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => API.delete(`/api/categories/${categoryId}`),
};

// SubCategory API endpoints
export const subCategoryAPI = {
  getAllSubCategories: () => API.get('/subcategories'),
  getSubCategoryById: (subCategoryId) => API.get(`/api/subcategories/${subCategoryId}`),
  getSubCategoriesByCategory: (categoryId) => API.get(`/api/subcategories/category/${categoryId}`),
  createSubCategory: (subCategoryData) => API.post('/subcategories', subCategoryData),
  updateSubCategory: (subCategoryId, subCategoryData) => API.put(`/api/subcategories/${subCategoryId}`, subCategoryData),
  deleteSubCategory: (subCategoryId) => API.delete(`/api/subcategories/${subCategoryId}`),
};

// Cart API endpoints
export const cartAPI = {
  getCart: () => API.get('/cart'),
  addToCart: (itemData) => API.post('/cart/add', itemData),
  updateCartItem: (itemId, quantity) => API.put(`/api/cart/update/${itemId}`, { quantity }),
  removeFromCart: (itemId) => API.delete(`/api/cart/remove/${itemId}`),
  clearCart: () => API.delete('/cart/clear'),
};

// Wishlist API endpoints
export const wishlistAPI = {
  getWishlist: () => API.get('/wishlist'),
  addToWishlist: (itemId) => API.post('/wishlist/add', { itemId }),
  removeFromWishlist: (itemId) => API.delete(`/api/wishlist/remove/${itemId}`),
  clearWishlist: () => API.delete('/wishlist/clear'),
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
  getAllPromoCodes: (params = {}) => API.get('/promoCode/admin/promo-codes', { params }),
  
  // Get promo code by ID
  getPromoCodeById: (id) => API.get(`/api/promoCode/admin/promo-codes/${id}`),
  
  // Create new promo code
  createPromoCode: (promoCodeData) => API.post('/promoCode/admin/promo-codes', promoCodeData),
  
  // Update promo code
  updatePromoCode: (id, promoCodeData) => API.put(`/api/promoCode/admin/promo-codes/${id}`, promoCodeData),
  
  // Delete promo code
  deletePromoCode: (id) => API.delete(`/api/promoCode/admin/promo-codes/${id}`),
  
  // Validate promo code (public endpoint)
  validatePromoCode: (data) => API.post('/promoCode/promo-codes/validate', data),
  
  // Bulk operations
  bulkToggleStatus: (data) => API.post('/promoCode/admin/promo-codes/bulk/toggle-status', data),
  bulkDelete: (data) => API.post('/promoCode/admin/promo-codes/bulk/delete', data),
  
  // Get statistics
  getPromoCodeStats: () => API.get('/promoCode/admin/promo-codes/stats'),
  
  // Search promo codes
  searchPromoCodes: (query) => API.get(`/api/promoCode/admin/promo-codes/search?q=${encodeURIComponent(query)}`),
  
  // Get promo codes by status
  getPromoCodesByStatus: (isActive) => API.get(`/api/promoCode/admin/promo-codes/status/${isActive}`),
  
  // Get expired promo codes
  getExpiredPromoCodes: () => API.get('/promoCode/admin/promo-codes/expired'),
  
  // Clone promo code
  clonePromoCode: (id) => API.post(`/api/promoCode/admin/promo-codes/${id}/clone`),
};

// Order API endpoints
export const orderAPI = {
  getAllOrders: (params = {}) => API.get('/orders', { params }),
  getOrderById: (orderId) => API.get(`/api/orders/${orderId}`),
  createOrder: (orderData) => API.post('/orders', orderData),
  updateOrderStatus: (orderId, status) => API.put(`/api/orders/${orderId}/status`, { status }),
  cancelOrder: (orderId) => API.put(`/api/orders/${orderId}/cancel`),
  getUserOrders: () => API.get('/orders/user'),
};

// Admin Order Management API endpoints
export const adminOrderAPI = {
  // Order management
  getAllOrders: (params = {}) => API.get('/admin/orders', { params }),
  getOrderById: (orderId) => API.get(`/admin/orders/${orderId}`),
  getOrderStatistics: () => API.get('/admin/orders/statistics'),
  
  // Order status management
  updateOrderStatus: (orderId, data) => API.put(`/admin/orders/${orderId}/status`, data),
  acceptOrder: (orderId, data) => API.put(`/admin/orders/${orderId}/accept`, data),
  rejectOrder: (orderId, data) => API.put(`/admin/orders/${orderId}/reject`, data),
  
  // Vendor management
  allotVendor: (orderId, data) => API.put(`/admin/orders/${orderId}/vendor`, data),
  getAvailableVendors: () => API.get('/admin/vendors'),
  
  // Courier management
  updateCourierStatus: (orderId, data) => API.put(`/admin/orders/${orderId}/courier`, data),
  
  // Return management
  getReturnRequests: (params = {}) => API.get('/admin/returns', { params }),
  processReturnRequest: (orderId, returnId, data) => API.put(`/admin/orders/${orderId}/returns/${returnId}`, data),
  
  // Exchange management
  getExchangeRequests: (params = {}) => API.get('/admin/exchanges', { params }),
  processExchangeRequest: (orderId, exchangeId, data) => API.put(`/admin/orders/${orderId}/exchanges/${exchangeId}`, data),
  
  // Bulk operations
  bulkUpdateOrders: (data) => API.put('/admin/orders/bulk', data),
  
  // Shiprocket integration
  createShipment: (orderId, data) => API.post(`/admin/orders/${orderId}/shipment`, data),
  trackShipment: (orderId) => API.get(`/admin/orders/${orderId}/tracking`),
  cancelShipment: (orderId) => API.delete(`/admin/orders/${orderId}/shipment`),
};

// Address API endpoints
export const addressAPI = {
  getAllAddresses: () => API.get('/addresses'),
  getAddressById: (addressId) => API.get(`/api/addresses/${addressId}`),
  createAddress: (addressData) => API.post('/addresses', addressData),
  updateAddress: (addressId, addressData) => API.put(`/api/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => API.delete(`/api/addresses/${addressId}`),
  setDefaultAddress: (addressId) => API.put(`/api/addresses/${addressId}/default`),
};

// Payment API endpoints
export const paymentAPI = {
  createPaymentIntent: (orderData) => API.post('/payment/create-intent', orderData),
  verifyPayment: (paymentData) => API.post('/payment/verify', paymentData),
  getPaymentHistory: () => API.get('/payment/history'),
};

// Review API endpoints
export const reviewAPI = {
  // User review endpoints
  createReview: (itemId, reviewData) => API.post(`/reviews/user/${itemId}/reviews`, reviewData),
  getReviews: (itemId) => API.get(`/reviews/user/${itemId}/reviews`),
  updateReview: (itemId, reviewId, reviewData) => API.put(`/reviews/user/${itemId}/reviews/${reviewId}`, reviewData),
  deleteReview: (itemId, reviewId) => API.delete(`/reviews/user/${itemId}/reviews/${reviewId}`),
  getAverageRating: (itemId) => API.get(`/reviews/user/${itemId}/average-rating`),
  
  // Public review endpoints
  getPublicReviews: (itemId) => API.get(`/reviews/public/${itemId}/reviews`),
  getPublicAverageRating: (itemId) => API.get(`/reviews/public/${itemId}/average-rating`),
  
  // Admin review endpoints
  getAdminReviews: (itemId) => API.get(`/reviews/admin/${itemId}/reviews`),
  createFakeReview: (itemId, reviewData) => API.post(`/reviews/admin/${itemId}/reviews`, reviewData),
  updateReviewSettings: (itemId, settings) => API.put(`/reviews/admin/${itemId}/review-settings`, settings),
  
  // Legacy endpoints (kept for backward compatibility)
  getItemReviews: (itemId) => API.get(`/api/reviews/item/${itemId}`),
  createReviewLegacy: (reviewData) => API.post('/reviews', reviewData),
  updateReviewLegacy: (reviewId, reviewData) => API.put(`/api/reviews/${reviewId}`, reviewData),
  deleteReviewLegacy: (reviewId) => API.delete(`/api/reviews/${reviewId}`),
  getUserReviews: () => API.get('/reviews/user'),
};

// Legacy Promo Code endpoints (kept for backward compatibility)
export const legacyPromoAPI = {
  validatePromoCode: (code) => API.post('/promo/validate', { code }),
  applyPromoCode: (code, orderData) => API.post('/promo/apply', { code, ...orderData }),
  getUserPromoCodes: () => API.get('/promo/user'),
};

// Filter API endpoints
export const filterAPI = {
  // Get all available filters
  getAllFilters: () => API.get('/filters'),
  getFilterById: (filterId) => API.get(`/api/filters/${filterId}`),
  getFiltersByKey: (key) => API.get(`/api/filters/key/${key}`),
  
  // Filter CRUD operations (admin)
  createFilter: (filterData) => API.post('/filters', filterData),
  updateFilter: (filterId, filterData) => API.put(`/api/filters/${filterId}`, filterData),
  deleteFilter: (filterId) => API.delete(`/api/filters/${filterId}`),
  updateFilterPriority: (filterId, priority) => API.patch(`/api/filters/${filterId}/priority`, { priority }),
  
  // Filter application and search
  applyFilters: (filterCriteria) => API.post('/filters/apply', filterCriteria),
  searchWithFilters: (searchParams) => API.post('/filters/search', searchParams),
  
  // Filter analytics and suggestions
  getFilterAnalytics: () => API.get('/filters/analytics'),
  getPopularFilters: () => API.get('/filters/popular'),
  getSuggestedFilters: (productId) => API.get(`/api/filters/suggestions/${productId}`),
  
  // Filter presets and management
  saveFilterPreset: (presetData) => API.post('/filters/presets', presetData),
  getFilterPresets: () => API.get('/filters/presets'),
  deleteFilterPreset: (presetId) => API.delete(`/api/filters/presets/${presetId}`),
  
  // Price range and dynamic filters
  getPriceRange: (categoryId) => API.get(`/api/filters/price-range/${categoryId || 'all'}`),
  getAvailableSizes: (categoryId) => API.get(`/api/filters/sizes/${categoryId || 'all'}`),
  getAvailableColors: (categoryId) => API.get(`/api/filters/colors/${categoryId || 'all'}`),
  getBrands: (categoryId) => API.get(`/api/filters/brands/${categoryId || 'all'}`),
  
  // Filter validation and compatibility
  validateFilters: (filterData) => API.post('/filters/validate', filterData),
  getCompatibleFilters: (selectedFilters) => API.post('/filters/compatible', selectedFilters),
  
  // Legacy compatibility
  getFilters: () => API.get('/filters'), // Backward compatibility
};

// Notification API endpoints
export const notificationAPI = {
  getAllNotifications: () => API.get('/notifications/notifications'),
  markAsRead: (notificationId) => API.put(`/api/notifications/${notificationId}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  deleteNotification: (notificationId) => API.delete(`/api/notifications/${notificationId}`),
};

// Push Notification API endpoints
export const pushNotificationAPI = {
  sendNotification: (notificationData) => API.post('/notifications/send-notification', notificationData),
  uploadNotificationImage: (formData) => API.post('/notifications/upload-notification-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getNotificationHistory: () => API.get('/notifications/notifications'),
  scheduleNotification: (notificationData) => API.post('/notifications/schedule-notification', notificationData),
  cancelScheduledNotification: (notificationId) => API.delete(`/api/notifications/schedule/${notificationId}`),
};

// Bulk Upload API endpoints (admin)
export const bulkUploadAPI = {
  uploadItems: (formData) => API.post('/bulk-upload/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUploadHistory: () => API.get('/bulk-upload/history'),
  downloadTemplate: () => API.get('/bulk-upload/template', { responseType: 'blob' }),
};

// Image Upload API endpoints
export const imageAPI = {
  uploadImage: (formData, config = {}) => API.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  uploadSingleImage: (formData, config = {}) => API.post('/items/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  uploadSingleVideo: (formData, config = {}) => API.post('/items/upload-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  deleteImage: (imageId) => API.delete(`/api/images/${imageId}`),
  getSignedUrl: (fileName) => API.post('/images/signed-url', { fileName }),
};

// Product API endpoints (for managing products saved from SingleProductUpload)
export const productAPI = {
  getAllProducts: (params = {}) => API.get('/items', { params }),
  getProductById: (productId) => API.get(`/api/items/${productId}`),
  createProduct: (productData) => API.post('/items', productData),
  updateProduct: (productId, productData) => API.patch(`/api/items/${productId}`, productData),
  deleteProduct: (productId) => API.delete(`/api/items/${productId}`),
  // Additional methods for lifecycle management
  publishProduct: (productId) => API.patch(`/api/items/publish/${productId}`),
  scheduleProduct: (productId, scheduleData) => API.patch(`/api/items/schedule/${productId}`, scheduleData),
  cancelSchedule: (productId) => API.patch(`/api/items/cancel-schedule/${productId}`),
};// Privacy Policy API endpoints
export const privacyAPI = {
  getPrivacyPolicy: () => API.get('/privacy-policy'),
  updatePrivacyPolicy: (policyData) => API.put('/privacy-policy', policyData),
};

// Partner Management API endpoints
export const partnerAPI = {
  // Admin endpoints for partner management
  createPartner: (partnerData) => API.post('/partners', partnerData),
  getAllPartners: (params = {}) => API.get('/partners', { params }),
  getPartnerById: (partnerId) => API.get(`/api/partners/${partnerId}`),
  updatePartner: (partnerId, updates) => API.put(`/api/partners/${partnerId}`, updates),
  updatePartnerPassword: (partnerId, passwordData) => API.put(`/api/partners/${partnerId}/password`, passwordData),
  togglePartnerStatus: (partnerId, statusData) => API.patch(`/api/partners/${partnerId}/toggle-status`, statusData),
  deletePartner: (partnerId) => API.delete(`/api/partners/${partnerId}`),
  getPartnerStatistics: () => API.get('/partners/statistics'),
  
  // Partner authentication endpoints
  partnerLogin: (credentials) => API.post('/partners/auth/login', credentials),
};

// Points System API endpoints
export const pointsAPI = {
  // System configuration
  getSystemConfig: () => API.get('/points/config'),
  updateSystemConfig: (configData) => API.put('/points/config', configData),
  
  // Users with points
  getAllUsersWithPoints: (params = {}) => API.get('/points/users', { params }),
  getUserPoints: (userId) => API.get(`/api/points/user/${userId}`),
  getUserPointsHistory: (userId, params = {}) => API.get(`/api/points/user/${userId}/history`, { params }),
  
  // Points operations
  allocatePoints: (userId, pointsData) => API.post(`/api/points/user/${userId}/allocate`, pointsData),
  redeemPoints: (userId, pointsData) => API.post(`/api/points/user/${userId}/redeem`, pointsData),
  updateUserPoints: (userId, pointsData) => API.put(`/api/points/user/${userId}`, pointsData),
  deleteUserPoints: (userId) => API.delete(`/api/points/user/${userId}`),
  
  // Summary and statistics
  getPointsSummary: () => API.get('/points/summary'),
};

// Invite Friend API endpoints
export const inviteFriendAPI = {
  // Admin endpoints
  getAllInviteCodes: (params = {}) => API.get('/invite-friend/admin/all', { params }),
  getInviteCodeById: (id) => API.get(`/invite-friend/admin/${id}`),
  createInviteCode: (inviteCodeData) => API.post('/invite-friend/admin/create', inviteCodeData),
  updateInviteCode: (id, inviteCodeData) => API.put(`/invite-friend/admin/${id}`, inviteCodeData),
  deleteInviteCode: (id) => API.delete(`/invite-friend/admin/${id}`),
  toggleStatus: (id) => API.patch(`/invite-friend/admin/${id}/toggle-status`),
  generateCode: (options = {}) => API.post('/invite-friend/admin/generate-code', options),
  getDetailedStats: () => API.get('/invite-friend/admin/detailed-stats'),
  bulkDelete: (data) => API.delete('/invite-friend/admin/bulk-delete', { data }),
  bulkUpdateStatus: (data) => API.patch('/invite-friend/admin/bulk-status', data),
  exportCodes: () => API.get('/invite-friend/admin/export'),
  getRedemptionAnalytics: (params = {}) => API.get('/invite-friend/admin/analytics/redemptions', { params }),
  getPerformanceAnalytics: () => API.get('/invite-friend/admin/analytics/performance'),
  
  // Public endpoints
  validateCode: (code) => API.get(`/invite-friend/validate/${code}`),
  getStats: () => API.get('/invite-friend/stats'),
  
  // User endpoints
  redeemCode: (codeData) => API.post('/invite-friend/redeem', codeData),
  getUserRedeemed: () => API.get('/invite-friend/my-redeemed')
};

// Inbox/Messaging API endpoints
export const inboxAPI = {
  // User endpoints
  getFolderCounts: () => API.get('/inbox/user/counts'),
  getMessages: (folder) => API.get(`/inbox/user/${folder}`),
  getMessage: (messageId) => API.get(`/inbox/user/message/${messageId}`),
  sendMessage: (messageData) => API.post('/inbox/user/send', messageData),
  replyToMessage: (messageId) => API.post(`/inbox/user/reply/${messageId}`),
  updateMessageStatus: (messageId) => API.patch(`/inbox/user/message/${messageId}`),
  bulkUpdateMessages: (data) => API.patch('/inbox/user/bulk-update', data),
  deleteMessage: (messageId) => API.delete(`/inbox/user/message/${messageId}`),
  getThreadMessages: (threadId) => API.get(`/inbox/user/thread/${threadId}`),
  
  // External endpoints
  createExternalMessage: (data) => API.post('/inbox/external/create', data),
  
  // Admin endpoints
  getAllMessages: (params) => API.get('/inbox/admin/all', { params }),
  getUserMessages: (userId, folder) => API.get(`/inbox/admin/user/${userId}/${folder}`),
  adminReply: (messageId, data) => API.post(`/inbox/admin/reply/${messageId}`, data),
  adminUpdateMessage: (messageId, data) => API.patch(`/inbox/admin/message/${messageId}`, data),
  adminDeleteMessage: (messageId) => API.delete(`/inbox/admin/message/${messageId}`),
  getAdminStats: () => API.get('/inbox/admin/stats'),
};

// Create endpoints object for easier access
export const endpoints = {
  inviteFriend: {
    // Admin endpoints
    getAllInviteCodes: '/invite-friend/admin/all',
    getInviteCodeById: (id) => `/invite-friend/admin/${id}`,
    createInviteCode: '/invite-friend/admin/create',
    updateInviteCode: (id) => `/invite-friend/admin/${id}`,
    deleteInviteCode: (id) => `/invite-friend/admin/${id}`,
    toggleStatus: (id) => `/invite-friend/admin/${id}/toggle-status`,
    generateCode: '/invite-friend/admin/generate-code',
    getDetailedStats: '/invite-friend/admin/detailed-stats',
    bulkDelete: '/invite-friend/admin/bulk-delete',
    bulkUpdateStatus: '/invite-friend/admin/bulk-status',
    exportCodes: '/invite-friend/admin/export',
    getRedemptionAnalytics: '/invite-friend/admin/analytics/redemptions',
    getPerformanceAnalytics: '/invite-friend/admin/analytics/performance',
    
    // Public endpoints
    validateCode: (code) => `/invite-friend/validate/${code}`,
    getStats: '/invite-friend/stats',
    
    // User endpoints
    redeemCode: '/invite-friend/redeem',
    getUserRedeemed: '/invite-friend/my-redeemed'
  }
};

export default API;
