import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Async thunks for product operations
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await axios.get(`${API_BASE_URL}/products?${queryParams}`);
            
            if (response.data.success) {
                return {
                    products: response.data.data || response.data.products || [],
                    pagination: response.data.pagination || {},
                    total: response.data.total || response.data.count || 0
                };
            } else {
                return rejectWithValue(response.data.message || 'Failed to fetch products');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products/${id}`);
            
            if (response.data.success) {
                return response.data.data || response.data.product;
            } else {
                return rejectWithValue(response.data.message || 'Failed to fetch product');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createProduct = createAsyncThunk(
    'products/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            console.log('=== REDUX: Sending Product Data ===');
            console.log('Product data being sent:', JSON.stringify(productData, null, 2));
            
            const response = await axios.post(`${API_BASE_URL}/products`, productData);
            
            console.log('=== REDUX: Full Response Received ===');
            console.log('Status:', response.status);
            console.log('Headers:', response.headers);
            console.log('Full response data:', JSON.stringify(response.data, null, 2));
            
            if (response.data.success) {
                console.log('=== REDUX: Product Created Successfully ===');
                console.log('Created product data:', JSON.stringify(response.data.data, null, 2));
                
                // Return the complete response for inspection
                return {
                    product: response.data.data || response.data.product,
                    fullResponse: response.data,
                    statusCode: response.status,
                    timestamp: new Date().toISOString()
                };
            } else {
                console.error('=== REDUX: Product Creation Failed ===');
                console.error('Error message:', response.data.message);
                return rejectWithValue(response.data.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('=== REDUX: Network/Request Error ===');
            console.error('Error details:', error);
            console.error('Response data:', error.response?.data);
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/updateProduct',
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/products/${id}`, productData);
            
            if (response.data.success) {
                return response.data.data || response.data.product;
            } else {
                return rejectWithValue(response.data.message || 'Failed to update product');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'products/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/products/${id}`);
            
            if (response.data.success) {
                return id;
            } else {
                return rejectWithValue(response.data.message || 'Failed to delete product');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const publishProduct = createAsyncThunk(
    'products/publishProduct',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/products/${id}/publish`);
            
            if (response.data.success) {
                return response.data.data || response.data.product;
            } else {
                return rejectWithValue(response.data.message || 'Failed to publish product');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Initial state
const initialState = {
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    },
    filters: {
        category: '',
        subcategory: '',
        status: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    },
    // Form state for product creation/editing
    formData: {
        // Basic product information
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
    operationStatus: null, // 'creating', 'updating', 'deleting', 'publishing'
    lastUploadResponse: null // Store complete response from last upload for inspection
};

// Product slice
const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        // Reset state
        resetProductState: (state) => {
            state.error = null;
            state.operationStatus = null;
        },
        
        // Set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Set pagination
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        
        // Form data management
        setFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        
        resetFormData: (state) => {
            state.formData = initialState.formData;
            state.isEditing = false;
            state.currentProduct = null;
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
        setEditingProduct: (state, action) => {
            state.currentProduct = action.payload;
            state.formData = { ...state.formData, ...action.payload };
            state.isEditing = true;
        },
        
        // Clear current product
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
            state.isEditing = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products;
                state.pagination = {
                    ...state.pagination,
                    ...action.payload.pagination,
                    total: action.payload.total
                };
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch product by ID
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Create product
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.operationStatus = 'creating';
                state.lastUploadResponse = null; // Clear previous response
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.operationStatus = 'success';
                
                // Store the complete response for inspection
                state.lastUploadResponse = {
                    success: true,
                    product: action.payload.product,
                    fullResponse: action.payload.fullResponse,
                    statusCode: action.payload.statusCode,
                    timestamp: action.payload.timestamp,
                    message: 'Product created successfully'
                };
                
                // Add to products list (using the actual product data)
                state.products.unshift(action.payload.product);
                
                // Set as current product for inspection
                state.currentProduct = action.payload.product;
                
                // Reset form after successful creation
                state.formData = {
                    ...initialState.formData,
                    // Keep some fields for convenience
                    categoryId: state.formData.categoryId,
                    subCategoryId: state.formData.subCategoryId
                };
                state.isEditing = false;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.operationStatus = 'error';
                state.error = action.payload;
                
                // Store error response for inspection
                state.lastUploadResponse = {
                    success: false,
                    error: action.payload,
                    timestamp: new Date().toISOString(),
                    message: 'Product creation failed'
                };
            })
            
            // Update product
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.operationStatus = 'updating';
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.operationStatus = null;
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.currentProduct = action.payload;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.operationStatus = null;
                state.error = action.payload;
            })
            
            // Delete product
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.operationStatus = 'deleting';
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.operationStatus = null;
                state.products = state.products.filter(p => p._id !== action.payload);
                if (state.currentProduct?._id === action.payload) {
                    state.currentProduct = null;
                    state.isEditing = false;
                }
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.operationStatus = null;
                state.error = action.payload;
            })
            
            // Publish product
            .addCase(publishProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.operationStatus = 'publishing';
            })
            .addCase(publishProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.operationStatus = null;
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                if (state.currentProduct?._id === action.payload._id) {
                    state.currentProduct = action.payload;
                }
            })
            .addCase(publishProduct.rejected, (state, action) => {
                state.loading = false;
                state.operationStatus = null;
                state.error = action.payload;
            });
    }
});

// Export actions
export const {
    resetProductState,
    setFilters,
    setPagination,
    setFormData,
    resetFormData,
    updateFormField,
    addVariant,
    removeVariant,
    updateVariant,
    addSize,
    removeSize,
    updateSize,
    setEditingProduct,
    clearCurrentProduct
} = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectProductsPagination = (state) => state.products.pagination;
export const selectProductsFilters = (state) => state.products.filters;
export const selectProductFormData = (state) => state.products.formData;
export const selectIsEditingProduct = (state) => state.products.isEditing;
export const selectOperationStatus = (state) => state.products.operationStatus;

export default productSlice.reducer;
