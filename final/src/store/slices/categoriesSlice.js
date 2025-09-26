import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryAPI, subCategoryAPI } from '../../api/endpoints';
import { apiCall } from '../../api/utils';
import { monitoredRequest } from '../../utils/errorMonitor.js';

// Async thunks for category operations
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue, getState }) => {
    try {
      const requestKey = 'fetchCategories';
      
      return await monitoredRequest(requestKey, async () => {
        console.log('fetchCategories: Starting API call...');
        
        // Check if we already have categories in state
        const currentState = getState();
        if (currentState.categories?.items?.length > 0) {
          console.log('🔄 Using cached categories data');
          return currentState.categories.items;
        }
        
        console.log('🔍 Making fresh API call for categories');
        const response = await categoryAPI.getAllCategories();
        console.log('fetchCategories response:', response);
        
        const result = response.data;
        console.log('fetchCategories result:', result);
        
        if (result.success || response.status === 200) {
          console.log('fetchCategories: Success, returning data:', result.data || result || []);
          return result.data || result || [];
        } else {
          console.log('fetchCategories: API returned error:', result.message);
          throw new Error(result.message || 'Failed to fetch categories');
        }
      }, {
        method: 'GET',
        url: '/categories'
      });
    } catch (error) {
      console.error('fetchCategories error:', error);
      return rejectWithValue(
        error.userMessage || error.response?.data?.message || error.message || 'Failed to fetch categories'
      );
    }
  }
);

export const fetchSubCategories = createAsyncThunk(
  'categories/fetchSubCategories',
  async (categoryId = null, { rejectWithValue }) => {
    try {
      let result;
      if (categoryId) {
        result = await apiCall(subCategoryAPI.getSubCategoriesByCategory, categoryId);
      } else {
        result = await apiCall(subCategoryAPI.getAllSubCategories);
      }
      
      if (result.success) {
        return {
          subCategories: result.data || [],
          categoryId
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch subcategories');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (categoryId, { rejectWithValue }) => {
    try {
      const result = await apiCall(categoryAPI.getCategoryById, categoryId);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch category');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      console.log('createCategory called with:', categoryData);
      
      // Direct API call without using apiCall wrapper for better debugging
      const response = await categoryAPI.createCategory(categoryData);
      console.log('createCategory response:', response);
      
      // Handle response data structure
      const result = response.data;
      console.log('createCategory result:', result);
      
      if (result.success || response.status === 200 || response.status === 201) {
        return result.data || result;
      } else {
        return rejectWithValue(result.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('createCategory error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      console.log('updateCategory called with:', { categoryId, categoryData });
      
      // Direct API call for better debugging
      const response = await categoryAPI.updateCategory(categoryId, categoryData);
      console.log('updateCategory response:', response);
      
      const result = response.data;
      console.log('updateCategory result:', result);
      
      if (result.success || response.status === 200) {
        return result.data || result;
      } else {
        return rejectWithValue(result.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('updateCategory error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      console.log('deleteCategory called with:', categoryId);
      
      // Direct API call for better debugging
      const response = await categoryAPI.deleteCategory(categoryId);
      console.log('deleteCategory response:', response);
      
      const result = response.data;
      console.log('deleteCategory result:', result);
      
      if (result.success || response.status === 200) {
        return categoryId;
      } else {
        return rejectWithValue(result.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('deleteCategory error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete category';
      return rejectWithValue(errorMessage);
    }
  }
);

// Initial state
const initialState = {
  // Categories
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  
  // SubCategories
  subCategories: [],
  subCategoriesLoading: false,
  subCategoriesError: null,
  
  // Current category
  currentCategory: null,
  currentCategoryLoading: false,
  currentCategoryError: null,
  
  // CRUD operations
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  
  // Messages
  successMessage: null,
  error: null,
  
  // Cache subcategories by category
  subCategoriesByCategory: {},
  
  // Navigation breadcrumbs
  breadcrumbs: [],
  
  lastUpdated: null,
};

// Categories slice
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCurrentCategory: (state, action) => {
      const category = action.payload;
      state.currentCategory = category;
      
      // Update breadcrumbs
      if (category) {
        state.breadcrumbs = [
          { name: 'Home', path: '/' },
          { name: category.name, path: `/category/${category.id}` }
        ];
      } else {
        state.breadcrumbs = [{ name: 'Home', path: '/' }];
      }
    },
    
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    
    addToBreadcrumbs: (state, action) => {
      const breadcrumb = action.payload;
      state.breadcrumbs.push(breadcrumb);
    },
    
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [{ name: 'Home', path: '/' }];
    },
    
    clearErrors: (state) => {
      state.categoriesError = null;
      state.subCategoriesError = null;
      state.currentCategoryError = null;
      state.error = null;
    },
    
    clearMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
    
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
      state.currentCategoryError = null;
    },
    
    // Helper to organize categories with their subcategories
    organizeCategoriesWithSubCategories: (state) => {
      state.categoriesWithSubCategories = state.categories.map(category => ({
        ...category,
        subCategories: state.subCategoriesByCategory[category.id] || []
      }));
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch categories cases
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
        state.lastUpdated = new Date().toISOString();
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
        const { subCategories, categoryId } = action.payload;
        
        if (categoryId) {
          // Store subcategories for specific category
          state.subCategoriesByCategory[categoryId] = subCategories;
        } else {
          // Store all subcategories
          state.subCategories = subCategories;
          
          // Also organize by category
          subCategories.forEach(subCategory => {
            if (subCategory.categoryId) {
              if (!state.subCategoriesByCategory[subCategory.categoryId]) {
                state.subCategoriesByCategory[subCategory.categoryId] = [];
              }
              const existing = state.subCategoriesByCategory[subCategory.categoryId]
                .find(sub => sub.id === subCategory.id);
              if (!existing) {
                state.subCategoriesByCategory[subCategory.categoryId].push(subCategory);
              }
            }
          });
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.subCategoriesLoading = false;
        state.subCategoriesError = action.payload;
      })
      
      // Fetch category by ID cases
      .addCase(fetchCategoryById.pending, (state) => {
        state.currentCategoryLoading = true;
        state.currentCategoryError = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.currentCategoryLoading = false;
        state.currentCategory = action.payload;
        
        // Update breadcrumbs
        state.breadcrumbs = [
          { name: 'Home', path: '/' },
          { name: action.payload.name, path: `/category/${action.payload.id}` }
        ];
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.currentCategoryLoading = false;
        state.currentCategoryError = action.payload;
      })
      
      // Create category cases
      .addCase(createCategory.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.createLoading = false;
        state.categories.push(action.payload);
        state.successMessage = 'Category created successfully';
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      
      // Update category cases
      .addCase(updateCategory.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.categories.findIndex(cat => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.successMessage = 'Category updated successfully';
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Delete category cases
      .addCase(deleteCategory.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.categories = state.categories.filter(cat => cat._id !== action.payload);
        state.successMessage = 'Category deleted successfully';
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setCurrentCategory,
  setBreadcrumbs,
  addToBreadcrumbs,
  clearBreadcrumbs,
  clearErrors,
  clearMessages,
  clearCurrentCategory,
  organizeCategoriesWithSubCategories,
} = categoriesSlice.actions;

// Selectors
export const selectCategories = (state) => state.categories.categories;
export const selectCategoriesLoading = (state) => state.categories.categoriesLoading;
export const selectCategoriesError = (state) => state.categories.categoriesError;

export const selectSubCategories = (state) => state.categories.subCategories;
export const selectSubCategoriesLoading = (state) => state.categories.subCategoriesLoading;
export const selectSubCategoriesError = (state) => state.categories.subCategoriesError;

export const selectCurrentCategory = (state) => state.categories.currentCategory;
export const selectCurrentCategoryLoading = (state) => state.categories.currentCategoryLoading;

export const selectSubCategoriesByCategory = (state, categoryId) => 
  state.categories.subCategoriesByCategory[categoryId] || [];

export const selectBreadcrumbs = (state) => state.categories.breadcrumbs;

export const selectCategoriesWithSubCategories = (state) => 
  state.categories.categories.map(category => ({
    ...category,
    subCategories: state.categories.subCategoriesByCategory[category.id] || []
  }));

// Helper selector to get category by ID
export const selectCategoryById = (state, categoryId) =>
  state.categories.categories.find(cat => cat.id === categoryId);

// Helper selector to get subcategory by ID
export const selectSubCategoryById = (state, subCategoryId) =>
  state.categories.subCategories.find(sub => sub.id === subCategoryId);

// Export reducer
export default categoriesSlice.reducer;
