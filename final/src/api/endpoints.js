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

// Items/Products API endpoints
export const itemAPI = {
  // Get items
  getAllItems: (params = {}) => API.get('/api/items', { params }),
  getItemById: (itemId) => API.get(`/api/items/${itemId}`),
  getItemsByCategory: (categoryId) => API.get(`/api/items/category/${categoryId}`),
  getItemsBySubCategory: (subCategoryId) => API.get(`/api/items/subcategory/${subCategoryId}`),
  
  // Item management (admin)
  createItem: (itemData) => API.post('/api/products', itemData), // Updated to use products endpoint
  updateItem: (itemId, itemData) => API.put(`/api/products/${itemId}`, itemData), // Updated to use products endpoint
  deleteItem: (itemId) => API.delete(`/api/products/${itemId}`), // Updated to use products endpoint
  
  // Item details
  getItemDetails: (itemId) => API.get(`/api/item-details/${itemId}`),
  updateItemDetails: (itemId, detailsData) => API.put(`/api/item-details/${itemId}`, detailsData),
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

// Promo Code API endpoints
export const promoCodeAPI = {
  validatePromoCode: (code) => API.post('/api/promo/validate', { code }),
  applyPromoCode: (code, orderData) => API.post('/api/promo/apply', { code, ...orderData }),
  getUserPromoCodes: () => API.get('/api/promo/user'),
};

// Filter API endpoints
export const filterAPI = {
  getFilters: () => API.get('/api/filters'),
  applyFilters: (filterData) => API.post('/api/filters/apply', filterData),
};

// Notification API endpoints
export const notificationAPI = {
  getAllNotifications: () => API.get('/api/notifications'),
  markAsRead: (notificationId) => API.put(`/api/notifications/${notificationId}/read`),
  markAllAsRead: () => API.put('/api/notifications/read-all'),
  deleteNotification: (notificationId) => API.delete(`/api/notifications/${notificationId}`),
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
  uploadImage: (formData) => API.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (imageId) => API.delete(`/api/images/${imageId}`),
  getSignedUrl: (fileName) => API.post('/api/images/signed-url', { fileName }),
};

// Privacy Policy API endpoints
export const privacyAPI = {
  getPrivacyPolicy: () => API.get('/api/privacy-policy'),
  updatePrivacyPolicy: (policyData) => API.put('/api/privacy-policy', policyData),
};

export default API;
