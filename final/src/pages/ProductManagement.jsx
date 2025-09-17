import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

// Product Management Component based on the API response structure
const ProductManagement = () => {
    const dispatch = useDispatch();
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    // Form state based on the API response structure
    const [formData, setFormData] = useState({
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
    });

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    // Fetch all products
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/products`);
            if (response.data.success) {
                setProducts(response.data.data || response.data.products || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    // Fetch single product
    const fetchProduct = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/products/${id}`);
            if (response.data.success) {
                const productData = response.data.data || response.data.product;
                setCurrentProduct(productData);
                setFormData({
                    ...formData,
                    ...productData,
                    // Ensure variants structure is maintained
                    variants: productData.variants || [formData.variants[0]]
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to fetch product');
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories and subcategories
    const fetchCategories = async () => {
        try {
            const [categoriesRes, subCategoriesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/categories`),
                axios.get(`${API_BASE_URL}/subcategories`)
            ]);
            
            if (categoriesRes.data.success) {
                setCategories(categoriesRes.data.data || categoriesRes.data.categories || []);
            }
            
            if (subCategoriesRes.data.success) {
                setSubCategories(subCategoriesRes.data.data || subCategoriesRes.data.subcategories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            // Handle nested properties
            const keys = name.split('.');
            setFormData(prev => {
                const newData = { ...prev };
                let current = newData;
                
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) current[keys[i]] = {};
                    current = current[keys[i]];
                }
                
                current[keys[keys.length - 1]] = type === 'checkbox' ? checked : 
                                                type === 'number' ? parseFloat(value) || 0 : value;
                return newData;
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : 
                        type === 'number' ? parseFloat(value) || 0 : value
            }));
        }
    };

    // Handle variant changes
    const handleVariantChange = (variantIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((variant, index) => 
                index === variantIndex 
                    ? { ...variant, [field]: value }
                    : variant
            )
        }));
    };

    // Add new size
    const addSize = () => {
        setFormData(prev => ({
            ...prev,
            sizes: [...prev.sizes, {
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
            }]
        }));
    };

    // Remove size
    const removeSize = (index) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index)
        }));
    };

    // Handle size changes
    const handleSizeChange = (sizeIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, index) => 
                index === sizeIndex 
                    ? { ...size, [field]: value }
                    : size
            )
        }));
    };

    // Create or update product
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            const payload = {
                ...formData,
                // Ensure required fields
                productName: formData.productName || formData.title,
                name: formData.productName || formData.title,
                // Calculate total stock
                totalStock: formData.sizes.reduce((total, size) => total + (size.quantity || 0), 0)
            };

            let response;
            if (isEditing && currentProduct?._id) {
                response = await axios.put(`${API_BASE_URL}/products/${currentProduct._id}`, payload);
            } else {
                response = await axios.post(`${API_BASE_URL}/products`, payload);
            }

            if (response.data.success) {
                toast.success(response.data.message);
                resetForm();
                fetchProducts();
            } else {
                toast.error(response.data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    // Delete product
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            setLoading(true);
            const response = await axios.delete(`${API_BASE_URL}/products/${id}`);
            
            if (response.data.success) {
                toast.success('Product deleted successfully');
                fetchProducts();
            } else {
                toast.error(response.data.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            productName: '',
            title: '',
            description: '',
            manufacturingDetails: '',
            regularPrice: 0,
            salePrice: 0,
            price: 0,
            returnable: true,
            categoryId: '',
            subCategoryId: '',
            category: '',
            subcategory: '',
            status: 'draft',
            metaTitle: '',
            metaDescription: '',
            slugUrl: '',
            imageUrl: '',
            images: [],
            videos: [],
            platformPricing: {
                yoraa: { enabled: true, price: 0, salePrice: 0 },
                myntra: { enabled: true, price: 0, salePrice: 0 },
                amazon: { enabled: true, price: 0, salePrice: 0 },
                flipkart: { enabled: true, price: 0, salePrice: 0 },
                nykaa: { enabled: true, price: 0, salePrice: 0 }
            },
            stockSizeOption: 'sizes',
            sizes: [],
            stock: 0,
            totalStock: 0,
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
            shippingAndReturns: {
                shippingDetails: [],
                returnPolicy: [],
                additionalInfo: ''
            },
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
            alsoShowInOptions: {
                youMightAlsoLike: false,
                similarItems: false,
                othersAlsoBought: false,
                customOptions: []
            },
            filters: [],
            tags: [],
            sku: '',
            barcode: ''
        });
        setCurrentProduct(null);
        setIsEditing(false);
    };

    // Edit product
    const handleEdit = (product) => {
        setCurrentProduct(product);
        setFormData({
            ...formData,
            ...product,
            variants: product.variants || [formData.variants[0]]
        });
        setIsEditing(true);
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Product Management
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your products with complete data structure support
                    </p>
                </div>

                <div className="p-6">
                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Regular Price
                                </label>
                                <input
                                    type="number"
                                    name="regularPrice"
                                    value={formData.regularPrice}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sale Price
                                </label>
                                <input
                                    type="number"
                                    name="salePrice"
                                    value={formData.salePrice}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subcategory
                                </label>
                                <select
                                    name="subCategoryId"
                                    value={formData.subCategoryId}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Subcategory</option>
                                    {subCategories
                                        .filter(sub => !formData.categoryId || sub.categoryId === formData.categoryId)
                                        .map(subcategory => (
                                            <option key={subcategory._id} value={subcategory._id}>
                                                {subcategory.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        {/* Status and Meta */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="scheduled">Scheduled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Returnable
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="returnable"
                                        checked={formData.returnable}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-700">
                                        This product is returnable
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Sizes Management */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Sizes</h3>
                                <button
                                    type="button"
                                    onClick={addSize}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                                >
                                    Add Size
                                </button>
                            </div>

                            {formData.sizes.map((size, index) => (
                                <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-medium text-gray-700">Size {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeSize(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Size
                                            </label>
                                            <input
                                                type="text"
                                                value={size.size}
                                                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={size.quantity}
                                                onChange={(e) => handleSizeChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                HSN Code
                                            </label>
                                            <input
                                                type="text"
                                                value={size.hsnCode}
                                                onChange={(e) => handleSizeChange(index, 'hsnCode', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                SKU
                                            </label>
                                            <input
                                                type="text"
                                                value={size.sku}
                                                onChange={(e) => handleSizeChange(index, 'sku', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Variants Management */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Variants</h3>
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                                        {variant.name || `Variant ${index + 1}`}
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Variant Name
                                            </label>
                                            <input
                                                type="text"
                                                value={variant.name}
                                                onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Images Count
                                            </label>
                                            <input
                                                type="text"
                                                value={`${variant.images?.length || 0} images`}
                                                readOnly
                                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                            >
                                {isEditing ? 'Cancel' : 'Reset'}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (isEditing ? 'Update Product' : 'Create Product')}
                            </button>
                        </div>
                    </form>

                    {/* Products List */}
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Products List</h2>
                        
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-600">Loading products...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products.map((product) => (
                                            <tr key={product._id || product.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {product.imageUrl && (
                                                            <img
                                                                className="h-10 w-10 rounded-full mr-3"
                                                                src={product.imageUrl}
                                                                alt={product.productName || product.name}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {product.productName || product.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {product.description?.substring(0, 50)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.category || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{product.regularPrice || product.price || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.stock || product.totalStock || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        product.status === 'published' ? 'bg-green-100 text-green-800' :
                                                        product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id || product.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {products.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No products found. Create your first product!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;
