import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { itemAPI, categoryAPI, subCategoryAPI } from '../../api/endpoints';
import { apiCall } from '../../api/utils';

// Async thunks for product operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await apiCall(itemAPI.getAllItems, params);
      if (result.success) {
        return {
          items: result.data.items || result.data || [],
          pagination: result.data.pagination || null,
          filters: params
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const result = await apiCall(itemAPI.getItemById, productId);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch product details');
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ categoryId, params = {} }, { rejectWithValue }) => {
    try {
      const result = await apiCall(itemAPI.getItemsByCategory, categoryId, params);
      if (result.success) {
        return {
          items: result.data.items || result.data || [],
          categoryId,
          pagination: result.data.pagination || null
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products by category');
    }
  }
);

export const fetchProductsBySubCategory = createAsyncThunk(
  'products/fetchProductsBySubCategory',
  async ({ subCategoryId, params = {} }, { rejectWithValue }) => {
    try {
      const result = await apiCall(itemAPI.getItemsBySubCategory, subCategoryId, params);
      if (result.success) {
        return {
          items: result.data.items || result.data || [],
          subCategoryId,
          pagination: result.data.pagination || null
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products by subcategory');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (productId, { rejectWithValue }) => {
    try {
      const result = await apiCall(itemAPI.getItemDetails, productId);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch product details');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const result = await apiCall(itemAPI.createItem, productData);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const result = await apiCall(itemAPI.updateItem, productId, productData);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const result = await apiCall(itemAPI.deleteItem, productId);
      if (result.success) {
        return { productId, data: result.data };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const result = await apiCall(categoryAPI.getAllCategories);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const fetchSubCategories = createAsyncThunk(
  'products/fetchSubCategories',
  async (categoryId, { rejectWithValue }) => {
    try {
      const result = categoryId 
        ? await apiCall(subCategoryAPI.getSubCategoriesByCategory, categoryId)
        : await apiCall(subCategoryAPI.getAllSubCategories);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch subcategories');
    }
  }
);

// Initial state
const initialState = {
  // Products list
  items: [],
  totalItems: 0,
  isLoading: false,
  error: null,
  
  // Single product
  currentProduct: null,
  currentProductLoading: false,
  currentProductError: null,
  
  // Product details
  productDetails: {},
  detailsLoading: false,
  detailsError: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 0,
  pageSize: 12,
  
  // Filters and sorting
  filters: {
    category: null,
    subCategory: null,
    priceRange: { min: 0, max: 10000 },
    sizes: [],
    colors: [],
    brands: [],
    inStock: true,
  },
  sortBy: 'newest', // 'newest', 'oldest', 'price-low', 'price-high', 'name', 'rating'
  
  // Cache for categories and subcategories
  categoryProducts: {},
  subCategoryProducts: {},
  
  // Recently viewed products
  recentlyViewed: [],
  
  // Featured/recommended products
  featuredProducts: [],
  recommendedProducts: [],
  
  // Product creation/editing
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  
  // Categories and subcategories for product forms
  categories: [],
  subCategories: [],
  categoriesLoading: false,
  subCategoriesLoading: false,
  categoriesError: null,
  subCategoriesError: null,
  
  // Success messages
  successMessage: null,
  
  lastUpdated: null,
};

// Products slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.currentPage = 1; // Reset to first page when sorting changes
    },
    
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when page size changes
    },
    
    addToRecentlyViewed: (state, action) => {
      const product = action.payload;
      const existingIndex = state.recentlyViewed.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        // Move to front if already exists
        state.recentlyViewed.splice(existingIndex, 1);
      }
      
      // Add to front of array
      state.recentlyViewed.unshift(product);
      
      // Keep only last 10 items
      if (state.recentlyViewed.length > 10) {
        state.recentlyViewed = state.recentlyViewed.slice(0, 10);
      }
      
      // Save to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(state.recentlyViewed));
    },
    
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
      localStorage.removeItem('recentlyViewed');
    },
    
    restoreRecentlyViewed: (state) => {
      const saved = localStorage.getItem('recentlyViewed');
      if (saved) {
        try {
          state.recentlyViewed = JSON.parse(saved);
        } catch (error) {
          console.error('Failed to restore recently viewed:', error);
          localStorage.removeItem('recentlyViewed');
        }
      }
    },
    
    updateProductStock: (state, action) => {
      const { productId, stock } = action.payload;
      
      // Update in main products list
      const productIndex = state.items.findIndex(item => item.id === productId);
      if (productIndex >= 0) {
        state.items[productIndex].stock = stock;
        state.items[productIndex].inStock = stock > 0;
      }
      
      // Update current product if it matches
      if (state.currentProduct && state.currentProduct.id === productId) {
        state.currentProduct.stock = stock;
        state.currentProduct.inStock = stock > 0;
      }
    },
    
    updateProductRating: (state, action) => {
      const { productId, rating, reviewCount } = action.payload;
      
      // Update in main products list
      const productIndex = state.items.findIndex(item => item.id === productId);
      if (productIndex >= 0) {
        state.items[productIndex].rating = rating;
        state.items[productIndex].reviewCount = reviewCount;
      }
      
      // Update current product if it matches
      if (state.currentProduct && state.currentProduct.id === productId) {
        state.currentProduct.rating = rating;
        state.currentProduct.reviewCount = reviewCount;
      }
    },
    
    clearError: (state) => {
      state.error = null;
      state.currentProductError = null;
      state.detailsError = null;
    },
    
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductError = null;
    },
    
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    setSelectedCategory: (state, action) => {
      state.filters.category = action.payload;
    },
    
    setSelectedSubCategory: (state, action) => {
      state.filters.subCategory = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch products cases
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.pagination?.total || action.payload.items.length;
        state.totalPages = action.payload.pagination?.totalPages || 
          Math.ceil(action.payload.items.length / state.pageSize);
        state.filters = { ...state.filters, ...action.payload.filters };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch product by ID cases
      .addCase(fetchProductById.pending, (state) => {
        state.currentProductLoading = true;
        state.currentProductError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentProductLoading = false;
        state.currentProduct = action.payload;
        // Add to recently viewed
        productsSlice.caseReducers.addToRecentlyViewed(state, { payload: action.payload });
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.currentProductLoading = false;
        state.currentProductError = action.payload;
      })
      
      // Fetch products by category cases
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.pagination?.total || action.payload.items.length;
        state.totalPages = action.payload.pagination?.totalPages || 
          Math.ceil(action.payload.items.length / state.pageSize);
        
        // Cache category products
        state.categoryProducts[action.payload.categoryId] = {
          items: action.payload.items,
          lastUpdated: new Date().toISOString()
        };
        
        state.filters.category = action.payload.categoryId;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch products by subcategory cases
      .addCase(fetchProductsBySubCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsBySubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.pagination?.total || action.payload.items.length;
        state.totalPages = action.payload.pagination?.totalPages || 
          Math.ceil(action.payload.items.length / state.pageSize);
        
        // Cache subcategory products
        state.subCategoryProducts[action.payload.subCategoryId] = {
          items: action.payload.items,
          lastUpdated: new Date().toISOString()
        };
        
        state.filters.subCategory = action.payload.subCategoryId;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProductsBySubCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch product details cases
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.productDetails[action.meta.arg] = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload;
      })
      
      // Create product cases
      .addCase(createProduct.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        state.items.unshift(action.payload);
        state.totalItems += 1;
        state.successMessage = 'Product created successfully';
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      
      // Update product cases
      .addCase(updateProduct.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
        if (state.currentProduct && state.currentProduct.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.successMessage = 'Product updated successfully';
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Delete product cases
      .addCase(deleteProduct.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter(item => item.id !== action.payload.productId);
        state.totalItems -= 1;
        state.successMessage = 'Product deleted successfully';
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      
      // Fetch categories cases
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
      })
      
      // Fetch subcategories cases
      .addCase(fetchSubCategories.pending, (state) => {
        state.subCategoriesLoading = true;
        state.subCategoriesError = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.subCategoriesLoading = false;
        state.subCategories = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.subCategoriesLoading = false;
        state.subCategoriesError = action.payload;
      });
  },
});

// Export actions
export const {
  setFilters,
  clearFilters,
  setSortBy,
  setCurrentPage,
  setPageSize,
  addToRecentlyViewed,
  clearRecentlyViewed,
  restoreRecentlyViewed,
  updateProductStock,
  updateProductRating,
  clearError,
  clearCurrentProduct,
  clearSuccessMessage,
  setSelectedCategory,
  setSelectedSubCategory,
} = productsSlice.actions;

// Selectors
export const selectProducts = (state) => state.products;
export const selectProductsItems = (state) => state.products.items;
export const selectProductsLoading = (state) => state.products.isLoading;
export const selectProductsError = (state) => state.products.error;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectCurrentProductLoading = (state) => state.products.currentProductLoading;
export const selectProductsFilters = (state) => state.products.filters;
export const selectProductsSortBy = (state) => state.products.sortBy;
export const selectProductsPagination = (state) => ({
  currentPage: state.products.currentPage,
  totalPages: state.products.totalPages,
  pageSize: state.products.pageSize,
  totalItems: state.products.totalItems,
});
export const selectRecentlyViewed = (state) => state.products.recentlyViewed;
export const selectProductDetails = (state, productId) => state.products.productDetails[productId];

// New selectors for product creation/editing
export const selectCreateLoading = (state) => state.products.createLoading;
export const selectUpdateLoading = (state) => state.products.updateLoading;
export const selectDeleteLoading = (state) => state.products.deleteLoading;
export const selectSuccessMessage = (state) => state.products.successMessage;
export const selectCategories = (state) => state.products.categories;
export const selectSubCategories = (state) => state.products.subCategories;
export const selectCategoriesLoading = (state) => state.products.categoriesLoading;
export const selectSubCategoriesLoading = (state) => state.products.subCategoriesLoading;
export const selectCategoriesError = (state) => state.products.categoriesError;
export const selectSubCategoriesError = (state) => state.products.subCategoriesError;

// Export reducer
export default productsSlice.reducer;
