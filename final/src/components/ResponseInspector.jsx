import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const ResponseInspector = ({ title = "API Response Inspector" }) => {
    const { lastUploadResponse } = useSelector(state => state.products);
    const [showRawJson, setShowRawJson] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        images: true,
        videos: true,
        variants: false,
        fullResponse: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    if (!lastUploadResponse) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📡</div>
                    <p>No response data available</p>
                    <p className="text-sm mt-1">Upload a product to see the response details</p>
                </div>
            </div>
        );
    }

    const { success, product, fullResponse, statusCode, timestamp, message, error } = lastUploadResponse;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowRawJson(!showRawJson)}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                        {showRawJson ? 'Formatted View' : 'Raw JSON'}
                    </button>
                </div>
            </div>

            {/* Response Status */}
            <div className={`p-4 rounded-lg mb-6 ${
                success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`text-xl ${success ? 'text-green-600' : 'text-red-600'}`}>
                            {success ? '✅' : '❌'}
                        </span>
                        <span className={`font-semibold ${success ? 'text-green-800' : 'text-red-800'}`}>
                            {success ? 'Success' : 'Failed'}
                        </span>
                        {statusCode && (
                            <span className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                                {statusCode}
                            </span>
                        )}
                    </div>
                    <span className="text-sm text-gray-600">
                        {new Date(timestamp).toLocaleString()}
                    </span>
                </div>
                <p className={`mt-2 ${success ? 'text-green-700' : 'text-red-700'}`}>
                    {message}
                </p>
            </div>

            {showRawJson ? (
                /* Raw JSON View */
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Complete Response Object</h4>
                        <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96 font-mono">
                            {JSON.stringify(lastUploadResponse, null, 2)}
                        </pre>
                    </div>
                </div>
            ) : (
                /* Formatted View */
                <div className="space-y-4">
                    {/* Basic Information */}
                    {success && product && (
                        <div className="border rounded-lg">
                            <button
                                onClick={() => toggleSection('basic')}
                                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                            >
                                <h4 className="font-medium">Basic Information</h4>
                                <span className="text-gray-500">
                                    {expandedSections.basic ? '▼' : '▶'}
                                </span>
                            </button>
                            {expandedSections.basic && (
                                <div className="px-4 pb-4 border-t bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="space-y-2">
                                            <div><strong>Product ID:</strong> <code className="bg-gray-200 px-1 rounded text-sm">{product._id}</code></div>
                                            <div><strong>Product Name:</strong> {product.productName || 'N/A'}</div>
                                            <div><strong>Title:</strong> {product.title || 'N/A'}</div>
                                            <div><strong>Brand:</strong> {product.brand || 'N/A'}</div>
                                            <div><strong>Status:</strong> 
                                                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                                    product.status === 'active' ? 'bg-green-100 text-green-800' : 
                                                    product.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {product.status || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div><strong>MRP:</strong> ₹{product.mrp || 0}</div>
                                            <div><strong>Category ID:</strong> {product.categoryId || 'N/A'}</div>
                                            <div><strong>Subcategory ID:</strong> {product.subCategoryId || 'N/A'}</div>
                                            <div><strong>Created:</strong> {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}</div>
                                            <div><strong>Updated:</strong> {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}</div>
                                        </div>
                                    </div>
                                    {product.description && (
                                        <div className="mt-4">
                                            <strong>Description:</strong>
                                            <p className="mt-1 text-gray-700 bg-white p-2 rounded border">{product.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Images Section */}
                    {success && product?.images && product.images.length > 0 && (
                        <div className="border rounded-lg">
                            <button
                                onClick={() => toggleSection('images')}
                                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                            >
                                <h4 className="font-medium">Images ({product.images.length})</h4>
                                <span className="text-gray-500">
                                    {expandedSections.images ? '▼' : '▶'}
                                </span>
                            </button>
                            {expandedSections.images && (
                                <div className="px-4 pb-4 border-t bg-gray-50">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        {product.images.map((image, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="relative group">
                                                    <img
                                                        src={image}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded border hover:opacity-80 transition-opacity cursor-pointer"
                                                        onClick={() => window.open(image, '_blank')}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div style={{display: 'none'}} className="w-full h-24 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                                                        Image {index + 1}
                                                        <br />Loading Error
                                                    </div>
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                                                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm">Click to open</span>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-600 break-all">
                                                    <strong>URL {index + 1}:</strong>
                                                    <br />
                                                    <code className="bg-white p-1 rounded text-xs">{image}</code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Videos Section */}
                    {success && product?.videos && product.videos.length > 0 && (
                        <div className="border rounded-lg">
                            <button
                                onClick={() => toggleSection('videos')}
                                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                            >
                                <h4 className="font-medium">Videos ({product.videos.length})</h4>
                                <span className="text-gray-500">
                                    {expandedSections.videos ? '▼' : '▶'}
                                </span>
                            </button>
                            {expandedSections.videos && (
                                <div className="px-4 pb-4 border-t bg-gray-50">
                                    <div className="space-y-4 mt-4">
                                        {product.videos.map((video, index) => (
                                            <div key={index} className="bg-white p-4 rounded border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <strong className="text-sm">Video {index + 1}</strong>
                                                    <a 
                                                        href={video} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                                    >
                                                        Open Video
                                                    </a>
                                                </div>
                                                <div className="text-xs text-gray-600 break-all">
                                                    <code className="bg-gray-100 p-1 rounded">{video}</code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Variants Section */}
                    {success && product?.variants && product.variants.length > 0 && (
                        <div className="border rounded-lg">
                            <button
                                onClick={() => toggleSection('variants')}
                                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                            >
                                <h4 className="font-medium">Variants ({product.variants.length})</h4>
                                <span className="text-gray-500">
                                    {expandedSections.variants ? '▼' : '▶'}
                                </span>
                            </button>
                            {expandedSections.variants && (
                                <div className="px-4 pb-4 border-t bg-gray-50">
                                    <div className="space-y-4 mt-4">
                                        {product.variants.map((variant, index) => (
                                            <div key={index} className="bg-white p-4 rounded border">
                                                <h5 className="font-medium mb-2">Variant {index + 1}</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <div><strong>Color:</strong> {variant.colorName || 'N/A'}</div>
                                                        <div><strong>Code:</strong> {variant.colorCode || 'N/A'}</div>
                                                        <div><strong>CSS Name:</strong> {variant.colorCssName || 'N/A'}</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div><strong>Images:</strong> {variant.images?.length || 0}</div>
                                                        <div><strong>Videos:</strong> {variant.videos?.length || 0}</div>
                                                        <div><strong>Sizes:</strong> {variant.sizeQuantities?.length || 0}</div>
                                                    </div>
                                                </div>
                                                {variant.images && variant.images.length > 0 && (
                                                    <div className="mt-3">
                                                        <strong className="text-sm">Variant Images:</strong>
                                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                                            {variant.images.map((img, imgIndex) => (
                                                                <img
                                                                    key={imgIndex}
                                                                    src={img}
                                                                    alt={`Variant ${index + 1} Image ${imgIndex + 1}`}
                                                                    className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                                                                    onClick={() => window.open(img, '_blank')}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Full Response Section */}
                    <div className="border rounded-lg">
                        <button
                            onClick={() => toggleSection('fullResponse')}
                            className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                        >
                            <h4 className="font-medium">Complete Response Data</h4>
                            <span className="text-gray-500">
                                {expandedSections.fullResponse ? '▼' : '▶'}
                            </span>
                        </button>
                        {expandedSections.fullResponse && (
                            <div className="px-4 pb-4 border-t bg-gray-50">
                                <div className="mt-4">
                                    <div className="mb-4 text-sm text-gray-600">
                                        <p><strong>Total Fields:</strong> {fullResponse ? Object.keys(fullResponse.data || fullResponse).length : 'N/A'}</p>
                                        <p><strong>Response Size:</strong> {JSON.stringify(fullResponse).length} characters</p>
                                    </div>
                                    <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96 font-mono">
                                        {JSON.stringify(fullResponse, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Section */}
                    {!success && error && (
                        <div className="border border-red-200 rounded-lg">
                            <div className="p-4 bg-red-50">
                                <h4 className="font-medium text-red-800 mb-2">Error Details</h4>
                                <div className="text-sm text-red-700">
                                    {typeof error === 'string' ? (
                                        <p>{error}</p>
                                    ) : (
                                        <pre className="bg-red-100 p-2 rounded overflow-auto max-h-40">
                                            {JSON.stringify(error, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResponseInspector;
