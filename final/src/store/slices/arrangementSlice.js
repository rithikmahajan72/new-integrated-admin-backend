import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiCall } from '../../api/utils';
import API from '../../api/axiosConfig';

// ========================================
// ASYNC THUNKS FOR ARRANGEMENT CONTROL
// ========================================

// Fetch categories with subcategories for arrangement
export const fetchCategoriesForArrangement = createAsyncThunk(
  'arrangement/fetchCategoriesForArrangement',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/items/categories-arrangement');
      if (response.data?.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || 'Failed to fetch categories');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch categories');
    }
  }
);

// Fetch items for arrangement by category/subcategory
export const fetchItemsForArrangement = createAsyncThunk(
  'arrangement/fetchItemsForArrangement',
  async ({ categoryId, subCategoryId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);
      if (subCategoryId && subCategoryId !== 'all') params.append('subCategoryId', subCategoryId);
      
      const response = await API.get(`/api/items/items-arrangement?${params.toString()}`);
      if (response.data?.success) {
        return {
          items: response.data.data,
          categoryId,
          subCategoryId
        };
      } else {
        return rejectWithValue(response.data?.message || 'Failed to fetch items');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch items');
    }
  }
);

// Update items display order
export const updateItemsDisplayOrder = createAsyncThunk(
  'arrangement/updateItemsDisplayOrder',
  async (items, { rejectWithValue }) => {
    try {
      const response = await API.put('/items/items-display-order', { items });
      if (response.data?.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || 'Failed to update items order');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update items order');
    }
  }
);

// Update categories display order
export const updateCategoriesDisplayOrder = createAsyncThunk(
  'arrangement/updateCategoriesDisplayOrder',
  async (categories, { rejectWithValue }) => {
    try {
      const response = await API.put('/items/categories-display-order', { categories });
      if (response.data?.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || 'Failed to update categories order');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update categories order');
    }
  }
);

// Update subcategories display order
export const updateSubCategoriesDisplayOrder = createAsyncThunk(
  'arrangement/updateSubCategoriesDisplayOrder',
  async (subcategories, { rejectWithValue }) => {
    try {
      const response = await API.put('/items/subcategories-display-order', { subcategories });
      if (response.data?.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || 'Failed to update subcategories order');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update subcategories order');
    }
  }
);

// ========================================
// ARRANGEMENT SLICE
// ========================================

const initialState = {
  // Categories data
  categories: [],
  selectedCategory: null,
  selectedSubCategory: null,
  
  // Items data
  items: [],
  originalItems: [], // Store original order for reset functionality
  
  // UI state
  currentArrangementType: 'items', // 'items', 'categories', 'subcategories'
  viewMode: 'grid', // 'grid', 'list', 'tile'
  
  // Loading states
  loading: {
    categories: false,
    items: false,
    updating: false
  },
  
  // Error states
  error: {
    categories: null,
    items: null,
    updating: null
  },
  
  // Success states
  success: {
    updating: false
  }
};

const arrangementSlice = createSlice({
  name: 'arrangement',
  initialState,
  reducers: {
    // Set selected category and subcategory
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.selectedSubCategory = null; // Reset subcategory when category changes
      state.items = []; // Clear items when category changes
    },
    
    setSelectedSubCategory: (state, action) => {
      state.selectedSubCategory = action.payload;
      state.items = []; // Clear items when subcategory changes
    },
    
    // Set arrangement type (items, categories, subcategories)
    setArrangementType: (state, action) => {
      state.currentArrangementType = action.payload;
    },
    
    // Set view mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    // Update items order locally (for drag and drop preview)
    updateItemsOrderLocally: (state, action) => {
      state.items = action.payload;
    },
    
    // Update categories order locally
    updateCategoriesOrderLocally: (state, action) => {
      state.categories = action.payload;
    },
    
    // Update subcategories order locally for a specific category
    updateSubCategoriesOrderLocally: (state, action) => {
      const { categoryId, subcategories } = action.payload;
      const category = state.categories.find(cat => cat._id === categoryId);
      if (category) {
        category.subcategories = subcategories;
      }
    },
    
    // Reset items to original order
    resetItemsOrder: (state) => {
      state.items = [...state.originalItems];
    },
    
    // Clear errors
    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType) {
        state.error[errorType] = null;
      } else {
        state.error = {
          categories: null,
          items: null,
          updating: null
        };
      }
    },
    
    // Clear success states
    clearSuccess: (state) => {
      state.success = {
        updating: false
      };
    }
  },
  
  extraReducers: (builder) => {
    // Fetch categories for arrangement
    builder
      .addCase(fetchCategoriesForArrangement.pending, (state) => {
        state.loading.categories = true;
        state.error.categories = null;
      })
      .addCase(fetchCategoriesForArrangement.fulfilled, (state, action) => {
        state.loading.categories = false;
        state.categories = action.payload;
        state.error.categories = null;
      })
      .addCase(fetchCategoriesForArrangement.rejected, (state, action) => {
        state.loading.categories = false;
        state.error.categories = action.payload;
      });
    
    // Fetch items for arrangement
    builder
      .addCase(fetchItemsForArrangement.pending, (state) => {
        state.loading.items = true;
        state.error.items = null;
      })
      .addCase(fetchItemsForArrangement.fulfilled, (state, action) => {
        state.loading.items = false;
        state.items = action.payload.items;
        state.originalItems = [...action.payload.items]; // Store original order
        state.selectedCategory = action.payload.categoryId;
        state.selectedSubCategory = action.payload.subCategoryId;
        state.error.items = null;
      })
      .addCase(fetchItemsForArrangement.rejected, (state, action) => {
        state.loading.items = false;
        state.error.items = action.payload;
      });
    
    // Update items display order
    builder
      .addCase(updateItemsDisplayOrder.pending, (state) => {
        state.loading.updating = true;
        state.error.updating = null;
        state.success.updating = false;
      })
      .addCase(updateItemsDisplayOrder.fulfilled, (state, action) => {
        state.loading.updating = false;
        state.originalItems = [...state.items]; // Update original items with new order
        state.success.updating = true;
        state.error.updating = null;
      })
      .addCase(updateItemsDisplayOrder.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.updating = action.payload;
        state.success.updating = false;
      });
    
    // Update categories display order
    builder
      .addCase(updateCategoriesDisplayOrder.pending, (state) => {
        state.loading.updating = true;
        state.error.updating = null;
        state.success.updating = false;
      })
      .addCase(updateCategoriesDisplayOrder.fulfilled, (state, action) => {
        state.loading.updating = false;
        state.categories = action.payload;
        state.success.updating = true;
        state.error.updating = null;
      })
      .addCase(updateCategoriesDisplayOrder.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.updating = action.payload;
        state.success.updating = false;
      });
    
    // Update subcategories display order
    builder
      .addCase(updateSubCategoriesDisplayOrder.pending, (state) => {
        state.loading.updating = true;
        state.error.updating = null;
        state.success.updating = false;
      })
      .addCase(updateSubCategoriesDisplayOrder.fulfilled, (state, action) => {
        state.loading.updating = false;
        
        // Update subcategories in their respective categories
        action.payload.forEach(updatedSubCategory => {
          const category = state.categories.find(cat => 
            cat._id === updatedSubCategory.categoryId._id || 
            cat._id === updatedSubCategory.categoryId
          );
          if (category) {
            const subCatIndex = category.subcategories.findIndex(sub => 
              sub._id === updatedSubCategory._id
            );
            if (subCatIndex !== -1) {
              category.subcategories[subCatIndex] = updatedSubCategory;
            }
          }
        });
        
        state.success.updating = true;
        state.error.updating = null;
      })
      .addCase(updateSubCategoriesDisplayOrder.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.updating = action.payload;
        state.success.updating = false;
      });
  }
});

// Export actions
export const {
  setSelectedCategory,
  setSelectedSubCategory,
  setArrangementType,
  setViewMode,
  updateItemsOrderLocally,
  updateCategoriesOrderLocally,
  updateSubCategoriesOrderLocally,
  resetItemsOrder,
  clearError,
  clearSuccess
} = arrangementSlice.actions;

// Export selectors
export const selectArrangementState = (state) => state.arrangement;
export const selectCategories = (state) => state.arrangement.categories;
export const selectItems = (state) => state.arrangement.items;
export const selectOriginalItems = (state) => state.arrangement.originalItems;
export const selectSelectedCategory = (state) => state.arrangement.selectedCategory;
export const selectSelectedSubCategory = (state) => state.arrangement.selectedSubCategory;
export const selectArrangementType = (state) => state.arrangement.currentArrangementType;
export const selectViewMode = (state) => state.arrangement.viewMode;
export const selectArrangementLoading = (state) => state.arrangement.loading;
export const selectArrangementError = (state) => state.arrangement.error;
export const selectArrangementSuccess = (state) => state.arrangement.success;

export default arrangementSlice.reducer;
