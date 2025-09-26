import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { itemAPI, productAPI, categoryAPI, subCategoryAPI } from '../../api/endpoints';
import { apiCall } from '../../api/utils';
// Remove monitoredRequest import to prevent infinite loops

const API_BASE_URL = 'http://localhost:8080/api';

// Request deduplication cache
const activeRequests = new Map();

// Async thunks for item/product operations
export const fetchItems = createAsyncThunk(
    'items/fetchItems',
    async (params = {}, { rejectWithValue }) => {
        try {
            console.log('🔍 fetchItems called with params:', params);
            const result = await apiCall(itemAPI.getAllItems, params);
            
            if (result.success) {
                return {
                    items: result.data.items || result.data || [],
                    pagination: result.data.pagination || null,
                    filters: params,
                    total: result.data.total || result.data.count || (result.data.items || result.data || []).length
                };
            } else {
                return rejectWithValue(result.message);
            }
        } catch (error) {
            console.error('🔍 fetchItems error:', error);
            return rejectWithValue(error.userMessage || error.message || 'Failed to fetch items');
        }
    }
);

export const fetchItemById = createAsyncThunk(
    'items/fetchItemById',
    async (itemId, { rejectWithValue }) => {
        try {
            console.log('� Fetching item:', itemId);
            const result = await apiCall(itemAPI.getItemById, itemId);
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            return rejectWithValue(error.userMessage || error.message || 'Failed to fetch item details');
        }
    }
);

export const fetchItemsByCategory = createAsyncThunk(
    'items/fetchItemsByCategory',
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
            return rejectWithValue(error.message || 'Failed to fetch items by category');
        }
    }
);

export const fetchItemsBySubCategory = createAsyncThunk(
    'items/fetchItemsBySubCategory',
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
            return rejectWithValue(error.message || 'Failed to fetch items by subcategory');
        }
    }
);

export const fetchItemDetails = createAsyncThunk(
    'items/fetchItemDetails',
    async (itemId, { rejectWithValue }) => {
        try {
            const result = await apiCall(itemAPI.getItemDetails, itemId);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.message);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch item details');
        }
    }
);

export const createItem = createAsyncThunk(
    'items/createItem',
    async (itemData, { rejectWithValue }) => {
        try {
            console.log('=== REDUX: Sending Item Data ===');
            console.log('Item data being sent:', JSON.stringify(itemData, null, 2));
            
            // Try using the new API endpoint first, fallback to old one
            let result;
            try {
                result = await apiCall(itemAPI.createItem, itemData);
            } catch (apiError) {
                console.log('=== REDUX: API endpoint failed, trying direct axios ===');
                const response = await axios.post(`${API_BASE_URL}/products`, itemData);
                
                console.log('=== REDUX: Full Response Received ===');
                console.log('Status:', response.status);
                console.log('Full response data:', JSON.stringify(response.data, null, 2));
                
                if (response.data.success) {
                    result = {
                        success: true,
                        data: response.data.data || response.data.product
                    };
                } else {
                    return rejectWithValue(response.data.message || 'Failed to create item');
                }
            }
            
            if (result.success) {
                console.log('=== REDUX: Item Created Successfully ===');
                console.log('Created item data:', JSON.stringify(result.data, null, 2));
                
                return {
                    item: result.data,
                    fullResponse: result,
                    statusCode: 200,
                    timestamp: new Date().toISOString()
                };
            } else {
                console.error('=== REDUX: Item Creation Failed ===');
                console.error('Error message:', result.message);
                return rejectWithValue(result.message || 'Failed to create item');
            }
        } catch (error) {
            console.error('=== REDUX: Network/Request Error ===');
            console.error('Error details:', error);
            console.error('Response data:', error.response?.data);
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateItem = createAsyncThunk(
    'items/updateItem',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const result = await apiCall(itemAPI.updateItem, id, data);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.message);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update item');
        }
    }
);

export const deleteItem = createAsyncThunk(
    'items/deleteItem',
    async (itemId, { rejectWithValue }) => {
        try {
            const result = await apiCall(itemAPI.deleteItem, itemId);
            if (result.success) {
                return { itemId, data: result.data };
            } else {
                return rejectWithValue(result.message);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete item');
        }
    }
);

export const publishItem = createAsyncThunk(
    'items/publishItem',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/products/${id}/publish`);
            
            if (response.data.success) {
                return response.data.data || response.data.product;
            } else {
                return rejectWithValue(response.data.message || 'Failed to publish item');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchCategories = createAsyncThunk(
    'items/fetchCategories',
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
    'items/fetchSubCategories',
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

// NEW FLOW-BASED ASYNC THUNKS
export const createBasicItem = createAsyncThunk(
    'items/createBasicItem',
    async (itemData, { rejectWithValue }) => {
        try {
            const result = await apiCall(itemAPI.createBasicProduct, itemData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.message);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create basic item');
        }
    }
);

export const updateDraftConfiguration = createAsyncThunk(
    'items/updateDraftConfiguration',
    async ({ itemId, draftData }, { rejectWithValue }) => {
        try {
            const result = await apiCall(itemAPI.updateDraftConfiguration, itemId, draftData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.message);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update draft configuration');
        }
    }
);

export const updateItemStatus = createAsyncThunk(
    'items/updateItemStatus',
    async ({ itemId, statusData }, { rejectWithValue }) => {
        try {
            const result = await apiCall(itemAPI.updateProductStatus, itemId, statusData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.message);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update item status');
        }
    }
);

export const fetchItemsByStatus = createAsyncThunk(
    'items/fetchItemsByStatus',
    async ({ status, params = {} }, { rejectWithValue }) => {
        try {
            const result = await apiCall(itemAPI.getProductsByStatus, status, params);
            if (result.success) {
                return {
                    items: result.data.items || result.data || [],
                    pagination: result.data.pagination || null,
                    status,
                    filters: params
                };
            } else {
                return rejectWithValue(result.message);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch items by status');
        }
    }
);

export const addItemReview = createAsyncThunk(
    'items/addItemReview',
    async ({ itemId, reviewData }, { rejectWithValue }) => {
        try {
            const result = await apiCall(itemAPI.addReview, itemId, reviewData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.message);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to add item review');
        }
    }
);

export const updateAlsoShowInOptions = createAsyncThunk(
    'items/updateAlsoShowInOptions',
    async ({ itemId, optionsData }, { rejectWithValue }) => {
        try {
            const result = await apiCall(itemAPI.updateAlsoShowInOptions, itemId, optionsData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.message);
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update also show in options');
        }
    }
);

// Initial state
const initialState = {
    // Items list
    items: [],
    totalItems: 0,
    currentItem: null,
    loading: false,
    error: null,
    
    // Pagination
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    },
    currentPage: 1,
    totalPages: 0,
    pageSize: 12,
    
    // Filters and sorting
    filters: {
        category: null,
        subcategory: null,
        subCategory: null,
        priceRange: { min: 0, max: 10000 },
        sizes: [],
        colors: [],
        brands: [],
        status: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        inStock: true,
    },
    sortBy: 'newest', // 'newest', 'oldest', 'price-low', 'price-high', 'name', 'rating'
    
    // Single item loading states
    currentItemLoading: false,
    currentItemError: null,
    
    // Item details
    itemDetails: {},
    detailsLoading: false,
    detailsError: null,
    
    // Cache for categories and subcategories
    categoryItems: {},
    subCategoryItems: {},
    
    // Recently viewed items
    recentlyViewed: [],
    
    // Featured/recommended items
    featuredItems: [],
    recommendedItems: [],
    
    // Item creation/editing/deletion
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    operationStatus: null, // 'creating', 'updating', 'deleting', 'publishing'
    lastUploadResponse: null, // Store complete response from last upload for inspection
    
    // Categories and subcategories for item forms
    categories: [],
    subCategories: [],
    categoriesLoading: false,
    subCategoriesLoading: false,
    categoriesError: null,
    subCategoriesError: null,
    
    // Success messages
    successMessage: null,
    
    // Form state for item creation/editing
    formData: {
        // Basic item information
        productName: '',
        title: '',
        description: '',
        manufacturingDetails: '',
        
        // Pricing
        regularPrice: 0,
        salePrice: 0,
        price: 0,
        returnable: true,
        
        // Category assignment
        categoryId: '',
        subCategoryId: '',
        category: '',
        subcategory: '',
        
        // Status and metadata
        status: 'draft',
        metaTitle: '',
        metaDescription: '',
        slugUrl: '',
        
        // Media
        imageUrl: '',
        images: [],
        videos: [],
        
        // Platform pricing
        platformPricing: {
            yoraa: { enabled: true, price: 0, salePrice: 0 },
            myntra: { enabled: true, price: 0, salePrice: 0 },
            amazon: { enabled: true, price: 0, salePrice: 0 },
            flipkart: { enabled: true, price: 0, salePrice: 0 },
            nykaa: { enabled: true, price: 0, salePrice: 0 }
        },
        
        // Stock and sizes
        stockSizeOption: 'sizes',
        sizes: [],
        stock: 0,
        totalStock: 0,
        
        // Variants
        variants: [{
            name: 'Variant 1',
            images: [],
            videos: [],
            colors: [],
            additionalData: {
                productName: '',
                title: '',
                description: '',
                manufacturingDetails: '',
                regularPrice: 0,
                salePrice: 0,
                filters: {
                    color: [],
                    size: [],
                    brand: [],
                    material: [],
                    style: [],
                    gender: [],
                    season: []
                },
                stockSizes: [],
                customSizes: []
            }
        }],
        
        // Shipping and returns
        shippingAndReturns: {
            shippingDetails: [],
            returnPolicy: [],
            additionalInfo: ''
        },
        
        // Size charts
        sizeChart: {
            inchChart: '',
            cmChart: '',
            measurementImage: ''
        },
        commonSizeChart: {
            cmChart: '',
            inchChart: '',
            measurementGuide: ''
        },
        
        // Also show in options
        alsoShowInOptions: {
            youMightAlsoLike: false,
            similarItems: false,
            othersAlsoBought: false,
            customOptions: []
        },
        
        // Filters and tags
        filters: [],
        tags: [],
        
        // SKU and barcodes
        sku: '',
        barcode: ''
    },
    isEditing: false,
    
    lastUpdated: null,
};

// Items slice
const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        // Reset state
        resetItemState: (state) => {
            state.error = null;
            state.operationStatus = null;
        },
        
        // Set filters
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
        
        // Set pagination
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
            state.currentPage = 1; // Reset to first page when page size changes
        },
        
        // Form data management
        setFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        
        resetFormData: (state) => {
            state.formData = {
                ...initialState.formData,
                variants: [{
                    name: 'Variant 1',
                    images: [],
                    videos: [],
                    colors: [],
                    additionalData: {
                        productName: '',
                        title: '',
                        description: '',
                        manufacturingDetails: '',
                        regularPrice: 0,
                        salePrice: 0,
                        filters: {
                            color: [],
                            size: [],
                            brand: [],
                            material: [],
                            style: [],
                            gender: [],
                            season: []
                        },
                        stockSizes: [],
                        customSizes: []
                    }
                }]
            };
            state.isEditing = false;
            state.currentItem = null;
        },
        
        // Update form field
        updateFormField: (state, action) => {
            const { field, value } = action.payload;
            
            if (field.includes('.')) {
                // Handle nested fields
                const keys = field.split('.');
                let current = state.formData;
                
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) current[keys[i]] = {};
                    current = current[keys[i]];
                }
                
                current[keys[keys.length - 1]] = value;
            } else {
                state.formData[field] = value;
            }
        },
        
        // Variant management
        addVariant: (state) => {
            const newVariant = {
                name: `Variant ${state.formData.variants.length + 1}`,
                images: [],
                videos: [],
                colors: [],
                additionalData: {
                    productName: '',
                    title: '',
                    description: '',
                    manufacturingDetails: '',
                    regularPrice: 0,
                    salePrice: 0,
                    filters: {
                        color: [],
                        size: [],
                        brand: [],
                        material: [],
                        style: [],
                        gender: [],
                        season: []
                    },
                    stockSizes: [],
                    customSizes: []
                }
            };
            state.formData.variants.push(newVariant);
        },
        
        removeVariant: (state, action) => {
            const index = action.payload;
            if (state.formData.variants.length > 1) {
                state.formData.variants.splice(index, 1);
            }
        },
        
        updateVariant: (state, action) => {
            const { index, field, value } = action.payload;
            if (state.formData.variants[index]) {
                state.formData.variants[index][field] = value;
            }
        },
        
        // Size management
        addSize: (state) => {
            const newSize = {
                size: '',
                quantity: 0,
                hsnCode: '',
                sku: '',
                barcode: '',
                platformPricing: {
                    yoraa: { enabled: true, price: 0, salePrice: 0 },
                    myntra: { enabled: true, price: 0, salePrice: 0 },
                    amazon: { enabled: true, price: 0, salePrice: 0 },
                    flipkart: { enabled: true, price: 0, salePrice: 0 },
                    nykaa: { enabled: true, price: 0, salePrice: 0 }
                }
            };
            state.formData.sizes.push(newSize);
        },
        
        removeSize: (state, action) => {
            const index = action.payload;
            state.formData.sizes.splice(index, 1);
        },
        
        updateSize: (state, action) => {
            const { index, field, value } = action.payload;
            if (state.formData.sizes[index]) {
                state.formData.sizes[index][field] = value;
            }
        },
        
        // Set editing mode
        setEditingItem: (state, action) => {
            state.currentItem = action.payload;
            state.formData = { ...state.formData, ...action.payload };
            state.isEditing = true;
        },
        
        // Clear current item
        clearCurrentItem: (state) => {
            state.currentItem = null;
            state.currentItemError = null;
            state.isEditing = false;
        },
        
        // Recently viewed management
        addToRecentlyViewed: (state, action) => {
            const item = action.payload;
            const existingIndex = state.recentlyViewed.findIndex(recentItem => recentItem.id === item.id);
            
            if (existingIndex >= 0) {
                // Move to front if already exists
                state.recentlyViewed.splice(existingIndex, 1);
            }
            
            // Add to front of array
            state.recentlyViewed.unshift(item);
            
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
        
        // Item stock and rating updates
        updateItemStock: (state, action) => {
            const { itemId, stock } = action.payload;
            
            // Update in main items list
            const itemIndex = state.items.findIndex(item => item.id === itemId);
            if (itemIndex >= 0) {
                state.items[itemIndex].stock = stock;
                state.items[itemIndex].inStock = stock > 0;
            }
            
            // Update current item if it matches
            if (state.currentItem && state.currentItem.id === itemId) {
                state.currentItem.stock = stock;
                state.currentItem.inStock = stock > 0;
            }
        },
        
        updateItemRating: (state, action) => {
            const { itemId, rating, reviewCount } = action.payload;
            
            // Update in main items list
            const itemIndex = state.items.findIndex(item => item.id === itemId);
            if (itemIndex >= 0) {
                state.items[itemIndex].rating = rating;
                state.items[itemIndex].reviewCount = reviewCount;
            }
            
            // Update current item if it matches
            if (state.currentItem && state.currentItem.id === itemId) {
                state.currentItem.rating = rating;
                state.currentItem.reviewCount = reviewCount;
            }
        },
        
        // Error and success management
        clearError: (state) => {
            state.error = null;
            state.currentItemError = null;
            state.detailsError = null;
            state.categoriesError = null;
            state.subCategoriesError = null;
        },
        
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        
        // Category selection
        setSelectedCategory: (state, action) => {
            state.filters.category = action.payload;
        },
        
        setSelectedSubCategory: (state, action) => {
            state.filters.subcategory = action.payload;
            state.filters.subCategory = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch items
            .addCase(fetchItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchItems.fulfilled, (state, action) => {
                console.log('🏪 fetchItems.fulfilled called with payload:', action.payload);
                state.loading = false;
                state.items = action.payload.items;
                state.totalItems = action.payload.total;
                state.pagination = {
                    ...state.pagination,
                    ...action.payload.pagination,
                    total: action.payload.total
                };
                state.totalPages = action.payload.pagination?.totalPages || 
                    Math.ceil(action.payload.items.length / state.pageSize);
                state.filters = { ...state.filters, ...action.payload.filters };
                state.lastUpdated = new Date().toISOString();
                console.log('🏪 State after update - items count:', state.items.length);
            })
            .addCase(fetchItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch item by ID
            .addCase(fetchItemById.pending, (state) => {
                state.currentItemLoading = true;
                state.currentItemError = null;
            })
            .addCase(fetchItemById.fulfilled, (state, action) => {
                state.currentItemLoading = false;
                state.currentItem = action.payload;
                // Add to recently viewed
                itemsSlice.caseReducers.addToRecentlyViewed(state, { payload: action.payload });
            })
            .addCase(fetchItemById.rejected, (state, action) => {
                state.currentItemLoading = false;
                state.currentItemError = action.payload;
            })
            
            // Fetch items by category
            .addCase(fetchItemsByCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchItemsByCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalItems = action.payload.pagination?.total || action.payload.items.length;
                state.totalPages = action.payload.pagination?.totalPages || 
                    Math.ceil(action.payload.items.length / state.pageSize);
                
                // Cache category items
                state.categoryItems[action.payload.categoryId] = {
                    items: action.payload.items,
                    lastUpdated: new Date().toISOString()
                };
                
                state.filters.category = action.payload.categoryId;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchItemsByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch items by subcategory
            .addCase(fetchItemsBySubCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchItemsBySubCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalItems = action.payload.pagination?.total || action.payload.items.length;
                state.totalPages = action.payload.pagination?.totalPages || 
                    Math.ceil(action.payload.items.length / state.pageSize);
                
                // Cache subcategory items
                state.subCategoryItems[action.payload.subCategoryId] = {
                    items: action.payload.items,
                    lastUpdated: new Date().toISOString()
                };
                
                state.filters.subcategory = action.payload.subCategoryId;
                state.filters.subCategory = action.payload.subCategoryId;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchItemsBySubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch item details
            .addCase(fetchItemDetails.pending, (state) => {
                state.detailsLoading = true;
                state.detailsError = null;
            })
            .addCase(fetchItemDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.itemDetails[action.meta.arg] = action.payload;
            })
            .addCase(fetchItemDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.detailsError = action.payload;
            })
            
            // Create item
            .addCase(createItem.pending, (state) => {
                state.loading = true;
                state.createLoading = true;
                state.error = null;
                state.operationStatus = 'creating';
                state.lastUploadResponse = null;
                state.successMessage = null;
            })
            .addCase(createItem.fulfilled, (state, action) => {
                state.loading = false;
                state.createLoading = false;
                state.operationStatus = 'success';
                
                // Store the complete response for inspection
                state.lastUploadResponse = {
                    success: true,
                    item: action.payload.item,
                    fullResponse: action.payload.fullResponse,
                    statusCode: action.payload.statusCode,
                    timestamp: action.payload.timestamp,
                    message: 'Item created successfully'
                };
                
                // Add to items list
                state.items.unshift(action.payload.item);
                state.totalItems += 1;
                
                // Set as current item for inspection
                state.currentItem = action.payload.item;
                
                // Reset form after successful creation
                state.formData = {
                    ...initialState.formData,
                    // Keep some fields for convenience
                    categoryId: state.formData.categoryId,
                    subCategoryId: state.formData.subCategoryId
                };
                state.isEditing = false;
                state.successMessage = 'Item created successfully';
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(createItem.rejected, (state, action) => {
                state.loading = false;
                state.createLoading = false;
                state.operationStatus = 'error';
                state.error = action.payload;
                
                // Store error response for inspection
                state.lastUploadResponse = {
                    success: false,
                    error: action.payload,
                    timestamp: new Date().toISOString(),
                    message: 'Item creation failed'
                };
            })
            
            // Update item
            .addCase(updateItem.pending, (state) => {
                state.loading = true;
                state.updateLoading = true;
                state.error = null;
                state.operationStatus = 'updating';
                state.successMessage = null;
            })
            .addCase(updateItem.fulfilled, (state, action) => {
                state.loading = false;
                state.updateLoading = false;
                state.operationStatus = null;
                const index = state.items.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentItem && (state.currentItem._id === action.payload._id || state.currentItem.id === action.payload.id)) {
                    state.currentItem = action.payload;
                }
                state.successMessage = 'Item updated successfully';
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(updateItem.rejected, (state, action) => {
                state.loading = false;
                state.updateLoading = false;
                state.operationStatus = null;
                state.error = action.payload;
            })
            
            // Delete item
            .addCase(deleteItem.pending, (state) => {
                state.loading = true;
                state.deleteLoading = true;
                state.error = null;
                state.operationStatus = 'deleting';
                state.successMessage = null;
            })
            .addCase(deleteItem.fulfilled, (state, action) => {
                state.loading = false;
                state.deleteLoading = false;
                state.operationStatus = null;
                state.items = state.items.filter(item => item._id !== action.payload.itemId && item.id !== action.payload.itemId);
                state.totalItems -= 1;
                if (state.currentItem && (state.currentItem._id === action.payload.itemId || state.currentItem.id === action.payload.itemId)) {
                    state.currentItem = null;
                    state.isEditing = false;
                }
                state.successMessage = 'Item deleted successfully';
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(deleteItem.rejected, (state, action) => {
                state.loading = false;
                state.deleteLoading = false;
                state.operationStatus = null;
                state.error = action.payload;
            })
            
            // Publish item
            .addCase(publishItem.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.operationStatus = 'publishing';
            })
            .addCase(publishItem.fulfilled, (state, action) => {
                state.loading = false;
                state.operationStatus = null;
                const index = state.items.findIndex(item => item._id === action.payload._id || item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentItem && (state.currentItem._id === action.payload._id || state.currentItem.id === action.payload.id)) {
                    state.currentItem = action.payload;
                }
                state.successMessage = 'Item published successfully';
            })
            .addCase(publishItem.rejected, (state, action) => {
                state.loading = false;
                state.operationStatus = null;
                state.error = action.payload;
            })
            
            // Fetch categories
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
            
            // Fetch subcategories
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
            })
            
            // NEW FLOW-BASED CASES
            
            // Create basic item
            .addCase(createBasicItem.pending, (state) => {
                state.createLoading = true;
                state.error = null;
            })
            .addCase(createBasicItem.fulfilled, (state, action) => {
                state.createLoading = false;
                state.successMessage = 'Basic item created successfully';
                // Add the new item to the items list if it's in the current view
                if (state.items) {
                    state.items.unshift(action.payload);
                    state.totalItems += 1;
                }
            })
            .addCase(createBasicItem.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload;
            })
            
            // Update draft configuration
            .addCase(updateDraftConfiguration.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateDraftConfiguration.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.successMessage = 'Draft configuration updated successfully';
                // Update the item in items list
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                // Update current item if viewing
                if (state.currentItem && state.currentItem._id === action.payload._id) {
                    state.currentItem = action.payload;
                }
            })
            .addCase(updateDraftConfiguration.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })
            
            // Update item status
            .addCase(updateItemStatus.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateItemStatus.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.successMessage = 'Item status updated successfully';
                // Update the item in items list
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                // Update current item if viewing
                if (state.currentItem && state.currentItem._id === action.payload._id) {
                    state.currentItem = action.payload;
                }
            })
            .addCase(updateItemStatus.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })
            
            // Fetch items by status
            .addCase(fetchItemsByStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchItemsByStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalItems = action.payload.pagination?.total || action.payload.items.length;
                state.totalPages = action.payload.pagination?.totalPages || 
                    Math.ceil(action.payload.items.length / state.pageSize);
                state.filters = { ...state.filters, ...action.payload.filters, status: action.payload.status };
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchItemsByStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Add item review
            .addCase(addItemReview.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(addItemReview.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.successMessage = 'Review added successfully';
                // Update the item in items list
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                // Update current item if viewing
                if (state.currentItem && state.currentItem._id === action.payload._id) {
                    state.currentItem = action.payload;
                }
            })
            .addCase(addItemReview.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })
            
            // Update also show in options
            .addCase(updateAlsoShowInOptions.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateAlsoShowInOptions.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.successMessage = 'Also show in options updated successfully';
                // Update the item in items list
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                // Update current item if viewing
                if (state.currentItem && state.currentItem._id === action.payload._id) {
                    state.currentItem = action.payload;
                }
            })
            .addCase(updateAlsoShowInOptions.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            });
    }
});

// Export actions
export const {
    resetItemState,
    setFilters,
    clearFilters,
    setSortBy,
    setPagination,
    setCurrentPage,
    setPageSize,
    setFormData,
    resetFormData,
    updateFormField,
    addVariant,
    removeVariant,
    updateVariant,
    addSize,
    removeSize,
    updateSize,
    setEditingItem,
    clearCurrentItem,
    addToRecentlyViewed,
    clearRecentlyViewed,
    restoreRecentlyViewed,
    updateItemStock,
    updateItemRating,
    clearError,
    clearSuccessMessage,
    setSelectedCategory,
    setSelectedSubCategory,
} = itemsSlice.actions;

// Backward compatibility exports (for existing components using old names)
export const createProduct = createItem;
export const fetchProducts = fetchItems;
export const fetchProductById = fetchItemById;
export const updateProduct = updateItem;
export const deleteProduct = deleteItem;
export const publishProduct = publishItem;
export const resetProductState = resetItemState;
export const clearCurrentProduct = clearCurrentItem;
export const setEditingProduct = setEditingItem;

// Selectors
export const selectItems = (state) => state.items || state.products;
export const selectItemsItems = (state) => state.items?.items || state.products?.items || [];
export const selectItemsLoading = (state) => state.items?.loading || state.products?.isLoading || false;
export const selectItemsError = (state) => state.items?.error || state.products?.error;
export const selectCurrentItem = (state) => state.items?.currentItem || state.products?.currentProduct;
export const selectCurrentItemLoading = (state) => state.items?.currentItemLoading || state.products?.currentProductLoading || false;
export const selectItemsFilters = (state) => state.items?.filters || state.products?.filters || {};
export const selectItemsSortBy = (state) => state.items?.sortBy || state.products?.sortBy || 'newest';
export const selectItemsPagination = (state) => {
    const itemsState = state.items || state.products;
    return {
        currentPage: itemsState?.currentPage || itemsState?.pagination?.page || 1,
        totalPages: itemsState?.totalPages || itemsState?.pagination?.totalPages || 0,
        pageSize: itemsState?.pageSize || itemsState?.pagination?.limit || 12,
        totalItems: itemsState?.totalItems || itemsState?.pagination?.total || 0,
    };
};
export const selectRecentlyViewed = (state) => state.items?.recentlyViewed || state.products?.recentlyViewed || [];
export const selectItemDetails = (state, itemId) => state.items?.itemDetails?.[itemId] || state.products?.productDetails?.[itemId];
export const selectCreateLoading = (state) => state.items?.createLoading || state.products?.createLoading || false;
export const selectUpdateLoading = (state) => state.items?.updateLoading || state.products?.updateLoading || false;
export const selectDeleteLoading = (state) => state.items?.deleteLoading || state.products?.deleteLoading || false;
export const selectSuccessMessage = (state) => state.items?.successMessage || state.products?.successMessage;
export const selectCategories = (state) => state.items?.categories || state.products?.categories || [];
export const selectSubCategories = (state) => state.items?.subCategories || state.products?.subCategories || [];
export const selectCategoriesLoading = (state) => state.items?.categoriesLoading || state.products?.categoriesLoading || false;
export const selectSubCategoriesLoading = (state) => state.items?.subCategoriesLoading || state.products?.subCategoriesLoading || false;
export const selectCategoriesError = (state) => state.items?.categoriesError || state.products?.categoriesError;
export const selectSubCategoriesError = (state) => state.items?.subCategoriesError || state.products?.subCategoriesError;
export const selectItemFormData = (state) => state.items?.formData || state.products?.formData || {};
export const selectIsEditingItem = (state) => state.items?.isEditing || state.products?.isEditing || false;
export const selectOperationStatus = (state) => state.items?.operationStatus || state.products?.operationStatus;

// Backward compatibility selectors (for existing components using old names)
export const selectProducts = selectItems;
export const selectProductsItems = selectItemsItems;
export const selectProductsLoading = selectItemsLoading;
export const selectProductsError = selectItemsError;
export const selectCurrentProduct = selectCurrentItem;
export const selectCurrentProductLoading = selectCurrentItemLoading;
export const selectProductsFilters = selectItemsFilters;
export const selectProductsSortBy = selectItemsSortBy;
export const selectProductsPagination = selectItemsPagination;
export const selectProductDetails = selectItemDetails;
export const selectProductFormData = selectItemFormData;
export const selectIsEditingProduct = selectIsEditingItem;

export default itemsSlice.reducer;
