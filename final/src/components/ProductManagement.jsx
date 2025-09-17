import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../store/slices/productSlice';

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  
  const [formData, setFormData] = useState({
    productName: '',
    title: '',
    description: '',
    manufacturingDetails: '',
    regularPrice: '',
    salePrice: '',
    // Important: Set category fields to null instead of empty strings
    categoryId: null,
    subCategoryId: null,
    stockSizeOption: 'sizes',
    sizes: [{
      size: '',
      quantity: '',
      hsnCode: '61091000',
      platformPricing: {
        yoraa: { enabled: true, price: '', salePrice: '' },
        myntra: { enabled: true, price: '', salePrice: '' },
        amazon: { enabled: true, price: '', salePrice: '' },
        flipkart: { enabled: true, price: '', salePrice: '' },
        nykaa: { enabled: true, price: '', salePrice: '' }
      }
    }],
    variants: [{
      name: 'Variant 1',
      images: [],
      videos: [],
      colors: []
    }],
    platformPricing: {
      yoraa: { enabled: true, price: '', salePrice: '' },
      myntra: { enabled: true, price: '', salePrice: '' },
      amazon: { enabled: true, price: '', salePrice: '' },
      flipkart: { enabled: true, price: '', salePrice: '' },
      nykaa: { enabled: true, price: '', salePrice: '' }
    },
    alsoShowInOptions: {
      youMightAlsoLike: false,
      similarItems: false,
      othersAlsoBought: false,
      customOptions: []
    },
    returnable: true,
    status: 'draft'
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [showImageGallery, setShowImageGallery] = useState({});

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: value } : size
      )
    }));
  };

  const handleVariantImageChange = (variantIndex, imageFiles) => {
    // Convert files to URLs for preview (in real app, upload to S3 first)
    const imageUrls = Array.from(imageFiles).map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex 
          ? { ...variant, images: [...variant.images, ...imageUrls] }
          : variant
      )
    }));
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex 
          ? { 
              ...variant, 
              images: variant.images.filter((_, imgI) => imgI !== imageIndex) 
            }
          : variant
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clean the data before submission - ensure null categories if not selected
    const cleanFormData = {
      ...formData,
      categoryId: formData.categoryId === '' || formData.categoryId === 'undefined' ? null : formData.categoryId,
      subCategoryId: formData.subCategoryId === '' || formData.subCategoryId === 'undefined' ? null : formData.subCategoryId,
      regularPrice: parseFloat(formData.regularPrice) || 0,
      salePrice: parseFloat(formData.salePrice) || 0
    };

    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, productData: cleanFormData })).unwrap();
      } else {
        await dispatch(createProduct(cleanFormData)).unwrap();
      }
      
      // Reset form
      setFormData({
        productName: '',
        title: '',
        description: '',
        manufacturingDetails: '',
        regularPrice: '',
        salePrice: '',
        categoryId: null,
        subCategoryId: null,
        stockSizeOption: 'sizes',
        sizes: [{ size: '', quantity: '', hsnCode: '61091000' }],
        variants: [{ name: 'Variant 1', images: [], videos: [], colors: [] }],
        returnable: true,
        status: 'draft'
      });
      setEditingProduct(null);
      
      // Refresh products list
      dispatch(fetchProducts());
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const toggleImageGallery = (productId) => {
    setShowImageGallery(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const ProductImageGallery = ({ product }) => {
    const images = product.images || [];
    const isExpanded = showImageGallery[product.id];

    if (images.length === 0) {
      return <div className="text-gray-500 text-sm">No images uploaded</div>;
    }

    return (
      <div className="space-y-2">
        {/* Main image */}
        <div className="w-20 h-20 border rounded-lg overflow-hidden">
          <img 
            src={product.imageUrl || images[0]?.url} 
            alt={`${product.name} main`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>

        {/* Image count and toggle */}
        {images.length > 1 && (
          <button
            onClick={() => toggleImageGallery(product.id)}
            className="text-blue-600 text-sm hover:underline"
          >
            {isExpanded ? 'Hide' : 'Show'} all {images.length} images
          </button>
        )}

        {/* Expanded gallery */}
        {isExpanded && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {images.map((image, index) => (
              <div key={index} className="w-16 h-16 border rounded overflow-hidden">
                <img 
                  src={image.url || image}
                  alt={`${product.name} image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Videos if available */}
        {product.videos && product.videos.length > 0 && (
          <div className="text-sm text-green-600">
            + {product.videos.length} video(s)
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Product Management</h1>

      {/* Product Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">
          {editingProduct ? 'Edit Product' : 'Create New Product'}
        </h2>
        
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular Price *
              </label>
              <input
                type="number"
                name="regularPrice"
                value={formData.regularPrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Image Upload for Variants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleVariantImageChange(0, e.target.files)}
                className="mb-4"
              />
              
              {/* Image Preview */}
              {formData.variants[0]?.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {formData.variants[0].images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantImage(0, index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="live">Live</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
            </button>
            
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    productName: '',
                    title: '',
                    description: '',
                    manufacturingDetails: '',
                    regularPrice: '',
                    salePrice: '',
                    categoryId: null,
                    subCategoryId: null,
                    status: 'draft'
                  });
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Products List</h2>
        </div>
        
        {loading && <div className="p-6 text-center">Loading products...</div>}
        {error && <div className="p-6 text-center text-red-600">Error: {error}</div>}
        
        {products && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
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
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name || product.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ProductImageGallery product={product} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₹{product.salePrice || product.price}
                      </div>
                      {product.regularPrice && product.regularPrice !== (product.salePrice || product.price) && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{product.regularPrice}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.category || 'No category'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.subcategory || 'No subcategory'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'live' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setFormData({
                            ...product,
                            categoryId: product.categoryId || null,
                            subCategoryId: product.subCategoryId || null
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this product?')) {
                            dispatch(deleteProduct(product.id));
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
