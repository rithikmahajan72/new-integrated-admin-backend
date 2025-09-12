// Re-export all API functions and utilities
export { default as API } from './axiosConfig';
export * from './endpoints';
export * from './utils';

// Main API object for easy importing
export const api = {
  // Import all endpoint functions
  auth: require('./endpoints').authAPI,
  user: require('./endpoints').userAPI,
  item: require('./endpoints').itemAPI,
  category: require('./endpoints').categoryAPI,
  subCategory: require('./endpoints').subCategoryAPI,
  cart: require('./endpoints').cartAPI,
  wishlist: require('./endpoints').wishlistAPI,
  order: require('./endpoints').orderAPI,
  address: require('./endpoints').addressAPI,
  payment: require('./endpoints').paymentAPI,
  review: require('./endpoints').reviewAPI,
  promoCode: require('./endpoints').promoCodeAPI,
  filter: require('./endpoints').filterAPI,
  notification: require('./endpoints').notificationAPI,
  bulkUpload: require('./endpoints').bulkUploadAPI,
  image: require('./endpoints').imageAPI,
  privacy: require('./endpoints').privacyAPI,
};
