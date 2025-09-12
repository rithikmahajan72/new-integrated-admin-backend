/**
 * Application Constants
 * 
 * Centralized configuration for reusable data, options, and settings.
 * This improves maintainability and prevents code duplication.
 */

// Design System Variables
export * from './designVariables';
export * from './styleUtils';

// Product Management Constants
export const CATEGORY_OPTIONS = [
  'All categories',
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys'
];

export const SUBCATEGORY_OPTIONS = [
  'All subcategories',
  'Smartphones',
  'Laptops',
  'Cameras',
  'Accessories'
];

export const PRODUCT_STATUSES = {
  LIVE: 'live',
  SCHEDULED: 'Scheduled',
  DRAFT: 'draft'
};

export const STATUS_STYLES = {
  [PRODUCT_STATUSES.LIVE]: 'bg-green-100 text-green-800',
  [PRODUCT_STATUSES.SCHEDULED]: 'bg-yellow-100 text-yellow-800',
  [PRODUCT_STATUSES.DRAFT]: 'bg-gray-100 text-gray-800'
};

// UI Constants
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Form Validation Constants
export const VALIDATION_RULES = {
  PRODUCT_NAME: {
    minLength: 3,
    maxLength: 100,
    required: true
  },
  PRICE: {
    min: 0,
    required: true,
    pattern: /^\d+(\.\d{1,2})?$/
  },
  SKU: {
    minLength: 3,
    maxLength: 50,
    required: true,
    pattern: /^[A-Za-z0-9-_]+$/
  }
};

// File Upload Constants
export const FILE_UPLOAD = {
  IMAGES: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 10
  },
  SIZE_CHARTS: {
    maxSize: 2 * 1024 * 1024, // 2MB
    acceptedTypes: ['image/jpeg', 'image/png', 'application/pdf']
  }
};

// API Endpoints (for future implementation)
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  UPLOADS: '/api/uploads',
  USERS: '/api/users'
};

// Performance Constants
export const PERFORMANCE = {
  DEBOUNCE_DELAY: 300, // milliseconds
  PAGINATION_SIZE: 20,
  LAZY_LOAD_THRESHOLD: 0.1 // 10% of viewport
};

// Default Values
export const DEFAULT_VARIANT = {
  name: '',
  sameAsFirst: false,
  productName: '',
  title: '',
  description: '',
  manufacturingDetails: '',
  shippingReturns: '',
  regularPrice: '',
  salePrice: '',
  images: [],
  stockSizes: [],
  sizes: [],
  stockSizeOption: 'sizes', // 'noSize', 'sizes'
  customSizes: [],
  alsoShowIn: {
    youMightAlsoLike: false,
    similarItems: false,
    otherAlsoBought: false
  },
  filters: {
    color: false
  }
};

export const DEFAULT_PRODUCT_DATA = {
  productName: '',
  title: '',
  description: '',
  manufacturingDetails: '',
  shippingReturns: '',
  regularPrice: '',
  salePrice: '',
  returnable: 'yes',
  metaTitle: '',
  metaDescription: '',
  slugUrl: ''
};

// Utility Functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price);
};

export const generateSKU = (productName) => {
  const timestamp = Date.now().toString().slice(-6);
  const nameSlug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  return `${nameSlug}${timestamp}`;
};

export const validateImageFile = (file) => {
  const { maxSize, acceptedTypes } = FILE_UPLOAD.IMAGES;
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }
  
  if (!acceptedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' };
  }
  
  return { valid: true };
};

export const getTailwindClasses = (componentName, variant = 'default') => {
  // Utility function to generate consistent Tailwind classes
  const classMap = {
    button: {
      default: 'px-4 py-2 rounded-md font-medium transition-colors',
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    },
    input: {
      default: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500',
      error: 'border-red-500 focus:ring-red-500'
    }
  };
  
  return classMap[componentName]?.[variant] || '';
};
