import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateFormField, resetFormData } from '../store/slices/productSlice';

const SingleProductUpload = () => {
    const dispatch = useDispatch();
    const { 
        formData, 
        loading, 
        error, 
        operationStatus, 
        lastUploadResponse,
        currentProduct 
    } = useSelector(state => state.products);

    const [showResponseDetails, setShowResponseDetails] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [videoFiles, setVideoFiles] = useState([]);
    const [notification, setNotification] = useState(null);

    // Handle form input changes
    const handleInputChange = (field, value) => {
        dispatch(updateFormField({ field, value }));
    };

    // Handle file uploads
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
        dispatch(updateFormField({ field: 'images', value: files }));
    };

    const handleVideoChange = (e) => {
        const files = Array.from(e.target.files);
        setVideoFiles(files);
        dispatch(updateFormField({ field: 'videos', value: files }));
    };

    // Handle variant management
    const addVariant = () => {
        const newVariant = {
            id: Date.now(),
            colorName: '',
            colorCode: '',
            colorCssName: '',
            sizeQuantities: [],
            images: [],
            videos: [],
            platformPricing: {
                amazon: { price: 0, originalPrice: 0, discount: 0 },
                flipkart: { price: 0, originalPrice: 0, discount: 0 },
                myntra: { price: 0, originalPrice: 0, discount: 0 },
                ajio: { price: 0, originalPrice: 0, discount: 0 }
            }
        };
        
        dispatch(updateFormField({ 
            field: 'variants', 
            value: [...formData.variants, newVariant] 
        }));
    };

    const updateVariant = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
        dispatch(updateFormField({ field: 'variants', value: updatedVariants }));
    };

    const removeVariant = (index) => {
        const updatedVariants = formData.variants.filter((_, i) => i !== index);
        dispatch(updateFormField({ field: 'variants', value: updatedVariants }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Create FormData for file uploads
        const submitData = new FormData();
        
        // Add basic fields
        submitData.append('productName', formData.productName || '');
        submitData.append('title', formData.title || '');
        submitData.append('description', formData.description || '');
        submitData.append('categoryId', formData.categoryId || '');
        submitData.append('subCategoryId', formData.subCategoryId || '');
        submitData.append('brand', formData.brand || '');
        submitData.append('mrp', formData.mrp || 0);
        submitData.append('tags', JSON.stringify(formData.tags || []));
        submitData.append('status', formData.status || 'active');
        
        // Add images
        imageFiles.forEach((file, index) => {
            submitData.append('images', file);
        });
        
        // Add videos
        videoFiles.forEach((file, index) => {
            submitData.append('videos', file);
        });
        
        // Add variants
        if (formData.variants && formData.variants.length > 0) {
            submitData.append('variants', JSON.stringify(formData.variants));
        }
        
        // Add sizes
        if (formData.sizes && formData.sizes.length > 0) {
            submitData.append('sizes', JSON.stringify(formData.sizes));
        }
        
        try {
            const result = await dispatch(createProduct(submitData)).unwrap();
            setNotification({ type: 'success', message: 'Product created successfully!' });
            setShowResponseDetails(true);
        } catch (error) {
            setNotification({ type: 'error', message: `Error: ${error}` });
            setShowResponseDetails(true);
        }
    };

    // Reset form
    const handleReset = () => {
        dispatch(resetFormData());
        setImageFiles([]);
        setVideoFiles([]);
        setShowResponseDetails(false);
    };

    // Show notification when operation status changes
    useEffect(() => {
        if (operationStatus === 'success' && lastUploadResponse?.success) {
            setNotification({ type: 'success', message: 'Product uploaded successfully!' });
        } else if (operationStatus === 'error' && lastUploadResponse?.error) {
            setNotification({ type: 'error', message: `Upload failed: ${lastUploadResponse.error}` });
        }
    }, [operationStatus, lastUploadResponse]);

    // Auto-hide notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            {/* Notification */}
            {notification && (
                <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                    notification.type === 'success' 
                        ? 'bg-green-50 border-green-400 text-green-700' 
                        : 'bg-red-50 border-red-400 text-red-700'
                }`}>
                    <div className="flex justify-between items-center">
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-2 text-sm opacity-70 hover:opacity-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Single Product Upload</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Reset Form
                    </button>
                    <button
                        onClick={() => setShowResponseDetails(!showResponseDetails)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        disabled={!lastUploadResponse}
                    >
                        {showResponseDetails ? 'Hide' : 'Show'} Response Details
                    </button>
                </div>
            </div>

            {/* Operation Status */}
            {operationStatus && (
                <div className={`mb-4 p-3 rounded-lg ${
                    operationStatus === 'creating' ? 'bg-yellow-100 text-yellow-800' :
                    operationStatus === 'success' ? 'bg-green-100 text-green-800' :
                    operationStatus === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    <div className="flex items-center">
                        {operationStatus === 'creating' && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                        )}
                        <span className="font-medium">
                            {operationStatus === 'creating' && 'Creating product...'}
                            {operationStatus === 'success' && 'Product created successfully!'}
                            {operationStatus === 'error' && `Error: ${error}`}
                        </span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Product Information</h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.productName || ''}
                                    onChange={(e) => handleInputChange('productName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Brand */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    value={formData.brand || ''}
                                    onChange={(e) => handleInputChange('brand', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* MRP */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    MRP (₹)
                                </label>
                                <input
                                    type="number"
                                    value={formData.mrp || ''}
                                    onChange={(e) => handleInputChange('mrp', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Images
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {imageFiles.length > 0 && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {imageFiles.length} image(s) selected
                                    </p>
                                )}
                            </div>

                            {/* Videos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Videos
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {videoFiles.length > 0 && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {videoFiles.length} video(s) selected
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !formData.productName}
                                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                                    loading || !formData.productName
                                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {loading ? 'Creating Product...' : 'Create Product'}
                            </button>
                        </form>
                    </div>

                    {/* Variants Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Product Variants</h3>
                            <button
                                onClick={addVariant}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                            >
                                Add Variant
                            </button>
                        </div>
                        
                        {formData.variants && formData.variants.map((variant, index) => (
                            <div key={variant.id || index} className="bg-white p-3 rounded border mb-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Variant {index + 1}</span>
                                    <button
                                        onClick={() => removeVariant(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Color Name"
                                        value={variant.colorName || ''}
                                        onChange={(e) => updateVariant(index, 'colorName', e.target.value)}
                                        className="px-2 py-1 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Color Code"
                                        value={variant.colorCode || ''}
                                        onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                                        className="px-2 py-1 border rounded text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Response Details Section */}
                {showResponseDetails && lastUploadResponse && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Upload Response Details</h3>
                            
                            {/* Response Summary */}
                            <div className={`p-3 rounded-lg mb-4 ${
                                lastUploadResponse.success 
                                    ? 'bg-green-100 border border-green-300' 
                                    : 'bg-red-100 border border-red-300'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <span className={`font-medium ${
                                        lastUploadResponse.success ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                        {lastUploadResponse.success ? '✅ Success' : '❌ Failed'}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {lastUploadResponse.timestamp}
                                    </span>
                                </div>
                                <p className={`mt-1 ${
                                    lastUploadResponse.success ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    {lastUploadResponse.message}
                                </p>
                                {lastUploadResponse.statusCode && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Status Code: {lastUploadResponse.statusCode}
                                    </p>
                                )}
                            </div>

                            {/* Product Data Display */}
                            {lastUploadResponse.success && lastUploadResponse.product && (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800">Product Details</h4>
                                    
                                    {/* Basic Info */}
                                    <div className="bg-white p-3 rounded border">
                                        <h5 className="font-medium mb-2">Basic Information</h5>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><strong>ID:</strong> {lastUploadResponse.product._id}</div>
                                            <div><strong>Name:</strong> {lastUploadResponse.product.productName}</div>
                                            <div><strong>Title:</strong> {lastUploadResponse.product.title}</div>
                                            <div><strong>Brand:</strong> {lastUploadResponse.product.brand}</div>
                                            <div><strong>MRP:</strong> ₹{lastUploadResponse.product.mrp}</div>
                                            <div><strong>Status:</strong> {lastUploadResponse.product.status}</div>
                                        </div>
                                    </div>

                                    {/* Images */}
                                    {lastUploadResponse.product.images && lastUploadResponse.product.images.length > 0 && (
                                        <div className="bg-white p-3 rounded border">
                                            <h5 className="font-medium mb-2">
                                                Images ({lastUploadResponse.product.images.length})
                                            </h5>
                                            <div className="grid grid-cols-3 gap-2">
                                                {lastUploadResponse.product.images.map((image, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={image}
                                                            alt={`Product ${index + 1}`}
                                                            className="w-full h-20 object-cover rounded border"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                        <div style={{display: 'none'}} className="w-full h-20 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                                                            Image {index + 1}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Videos */}
                                    {lastUploadResponse.product.videos && lastUploadResponse.product.videos.length > 0 && (
                                        <div className="bg-white p-3 rounded border">
                                            <h5 className="font-medium mb-2">
                                                Videos ({lastUploadResponse.product.videos.length})
                                            </h5>
                                            <div className="space-y-2">
                                                {lastUploadResponse.product.videos.map((video, index) => (
                                                    <div key={index} className="text-sm">
                                                        <a 
                                                            href={video} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 underline"
                                                        >
                                                            Video {index + 1}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Variants */}
                                    {lastUploadResponse.product.variants && lastUploadResponse.product.variants.length > 0 && (
                                        <div className="bg-white p-3 rounded border">
                                            <h5 className="font-medium mb-2">
                                                Variants ({lastUploadResponse.product.variants.length})
                                            </h5>
                                            <div className="space-y-2">
                                                {lastUploadResponse.product.variants.map((variant, index) => (
                                                    <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                                        <div><strong>Color:</strong> {variant.colorName || 'N/A'}</div>
                                                        {variant.images && variant.images.length > 0 && (
                                                            <div><strong>Variant Images:</strong> {variant.images.length}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Full Response JSON */}
                                    <div className="bg-white p-3 rounded border">
                                        <h5 className="font-medium mb-2">Complete Response Data</h5>
                                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                            {JSON.stringify(lastUploadResponse.fullResponse, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Error Details */}
                            {!lastUploadResponse.success && lastUploadResponse.error && (
                                <div className="bg-white p-3 rounded border">
                                    <h5 className="font-medium mb-2 text-red-800">Error Details</h5>
                                    <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-40 text-red-700">
                                        {typeof lastUploadResponse.error === 'string' 
                                            ? lastUploadResponse.error 
                                            : JSON.stringify(lastUploadResponse.error, null, 2)
                                        }
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SingleProductUpload;
