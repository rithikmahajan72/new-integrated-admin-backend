import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Save, Trash2, Plus, X, Upload, ChevronDown } from 'lucide-react';
import { itemAPI, categoryAPI, subCategoryAPI } from '../api/endpoints';
import { 
  fetchItemById, 
  updateItem,
  selectCurrentItem,
  selectItemsLoading,
  selectItemsError 
} from '../store/slices/itemSlice';

const ItemManagementEditPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  // Redux state
  const item = useSelector(selectCurrentItem);
  const loading = useSelector(selectItemsLoading);
  const error = useSelector(selectItemsError);

  // Local state - CLEAN AND SIMPLE
  const [formData, setFormData] = useState({
    productName: '',
    title: '',
    description: '',
    manufacturingDetails: '',
    shippingAndReturns: '',
    returnable: true,
    sizes: [],
    categoryId: null,
    subCategoryId: null
  });

  // Media state
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [uploadingVideos, setUploadingVideos] = useState([]);

  // Category state
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);

  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Initialize - ONLY RUN ONCE
  useEffect(() => {
    if (id) {
      dispatch(fetchItemById(id));
    }
  }, []); // Only run once with empty dependency array

  // Update form data when item loads
  useEffect(() => {
    if (item && item._id === id) {
      setFormData({
        productName: item.productName || '',
        title: item.title || '',
        description: item.description || '',
        manufacturingDetails: item.manufacturingDetails || '',
        shippingAndReturns: item.shippingAndReturns || '',
        returnable: item.returnable !== undefined ? item.returnable : true,
        categoryId: item.categoryId || null,
        subCategoryId: item.subCategoryId || null,
        sizes: item.sizes?.map((size, index) => ({
          id: index + 1,
          sizeName: size.size || size.sizeName || '',
          quantity: size.quantity || '',
          hsn: size.hsnCode || size.hsn || '',
          sku: size.sku || '',
          barcodeNo: size.barcode || size.barcodeNo || '',
          regularPrice: size.regularPrice || '',
          salePrice: size.salePrice || '',
          waistCm: size.fitWaistCm || size.waistCm || '',
          inseamCm: size.inseamLengthCm || size.inseamCm || '',
          chestCm: size.chestCm || '',
          frontLengthCm: size.frontLengthCm || '',
          acrossShoulderCm: size.acrossShoulderCm || '',
          waistIn: size.waistIn || '',
          inseamIn: size.inseamIn || '',
          chestIn: size.chestIn || '',
          frontLengthIn: size.frontLengthIn || '',
          acrossShoulderIn: size.acrossShoulderIn || '',
          metaTitle: size.metaTitle || '',
          metaDescription: size.metaDescription || '',
          slugUrl: size.slugUrl || ''
        })) || []
      });

      // Set media states
      setImages(item.images || []);
      setVideos(item.videos || []);

      // Set category states if they exist
      if (item.categoryId) {
        setSelectedCategory({ _id: item.categoryId, name: item.categoryName });
      }
      if (item.subCategoryId) {
        setSelectedSubCategory({ _id: item.subCategoryId, name: item.subCategoryName });
      }
    }
  }, [item, id]);

  // Handle input changes - SIMPLE HANDLERS
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSizeChange = useCallback((sizeId, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(size => 
        size.id === sizeId ? { ...size, [field]: value } : size
      )
    }));
  }, []);

  const addNewSize = useCallback(() => {
    const newId = Math.max(...formData.sizes.map(s => s.id), 0) + 1;
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, {
        id: newId,
        sizeName: '',
        quantity: '',
        hsn: '',
        sku: '',
        barcodeNo: '',
        regularPrice: '',
        salePrice: '',
        waistCm: '',
        inseamCm: '',
        chestCm: '',
        frontLengthCm: '',
        acrossShoulderCm: '',
        waistIn: '',
        inseamIn: '',
        chestIn: '',
        frontLengthIn: '',
        acrossShoulderIn: '',
        metaTitle: '',
        metaDescription: '',
        slugUrl: ''
      }]
    }));
  }, [formData.sizes]);

  const removeSize = useCallback((sizeId) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size.id !== sizeId)
    }));
  }, []);

  // Category management functions
  const loadCategories = useCallback(async () => {
    try {
      setCategoryLoading(true);
      const response = await categoryAPI.getAllCategories();
      const categoriesData = response.data.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      setLocalError('Failed to load categories');
      setCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  const loadSubCategories = useCallback(async (categoryId) => {
    try {
      setSubCategoryLoading(true);
      const response = await subCategoryAPI.getSubCategoriesByCategory(categoryId);
      
      let subCategoriesData = [];
      if (Array.isArray(response.data)) {
        subCategoriesData = response.data;
      } else if (response.data.data) {
        subCategoriesData = response.data.data;
      } else if (response.data.success && response.data.data) {
        subCategoriesData = response.data.data;
      }
      
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error('❌ Failed to load subcategories:', error);
      setLocalError('Failed to load subcategories');
      setSubCategories([]);
    } finally {
      setSubCategoryLoading(false);
    }
  }, []);

  const handleCategoryAssignment = useCallback((category) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      categoryId: category._id
    }));
    
    if (category._id) {
      loadSubCategories(category._id);
    } else {
      setSubCategories([]);
      setSelectedSubCategory(null);
    }
  }, [loadSubCategories]);

  const handleSubCategoryAssignment = useCallback((subCategory) => {
    setSelectedSubCategory(subCategory);
    setFormData(prev => ({
      ...prev,
      subCategoryId: subCategory._id
    }));
  }, []);

  // Media upload handlers
  const handleImageUpload = useCallback(async (files) => {
    // Basic implementation - can be expanded later
    console.log('Image upload:', files);
  }, []);

  const handleVideoUpload = useCallback(async (files) => {
    // Basic implementation - can be expanded later
    console.log('Video upload:', files);
  }, []);

  const removeImage = useCallback((imageUrl) => {
    setImages(prev => prev.filter(img => img !== imageUrl));
  }, []);

  const removeVideo = useCallback((videoUrl) => {
    setVideos(prev => prev.filter(vid => vid !== videoUrl));
  }, []);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Save product - CLEAN FUNCTION
  const handleSave = useCallback(async () => {
    try {
      setUpdateLoading(true);
      setLocalError(null);

      // Prepare update data
      const updateData = {
        productName: formData.productName.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        manufacturingDetails: formData.manufacturingDetails.trim(),
        shippingAndReturns: formData.shippingAndReturns.trim(),
        returnable: formData.returnable,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        images: images,
        videos: videos,
        sizes: formData.sizes.map(size => ({
          size: size.sizeName,
          quantity: parseInt(size.quantity) || 0,
          hsnCode: size.hsn,
          sku: size.sku,
          barcode: size.barcodeNo,
          regularPrice: parseFloat(size.regularPrice) || 0,
          salePrice: parseFloat(size.salePrice) || 0,
          fitWaistCm: parseFloat(size.waistCm) || 0,
          inseamLengthCm: parseFloat(size.inseamCm) || 0,
          chestCm: parseFloat(size.chestCm) || 0,
          frontLengthCm: parseFloat(size.frontLengthCm) || 0,
          acrossShoulderCm: parseFloat(size.acrossShoulderCm) || 0,
          waistIn: parseFloat(size.waistIn) || 0,
          inseamIn: parseFloat(size.inseamIn) || 0,
          chestIn: parseFloat(size.chestIn) || 0,
          frontLengthIn: parseFloat(size.frontLengthIn) || 0,
          acrossShoulderIn: parseFloat(size.acrossShoulderIn) || 0,
          metaTitle: size.metaTitle,
          metaDescription: size.metaDescription,
          slugUrl: size.slugUrl
        }))
      };

      await dispatch(updateItem({ id, updateData })).unwrap();
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/item-management');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating product:', error);
      setLocalError(error.message || 'Failed to update product');
    } finally {
      setUpdateLoading(false);
    }
  }, [formData, id, dispatch, navigate]);

  if (loading && !item) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading product data...</p>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold mb-2">Error Loading Product</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => navigate('/item-management')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/item-management')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600 mt-1">Update product information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {(localError || error) && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">Error: </div>
              <div className="text-red-800 ml-2">{localError || error}</div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-600 font-medium">Success: </div>
              <div className="text-green-800 ml-2">Product updated successfully!</div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturing Details
                </label>
                <textarea
                  value={formData.manufacturingDetails}
                  onChange={(e) => handleInputChange('manufacturingDetails', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter manufacturing details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping & Returns
                </label>
                <textarea
                  value={formData.shippingAndReturns}
                  onChange={(e) => handleInputChange('shippingAndReturns', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter shipping and return policy"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.returnable}
                    onChange={(e) => handleInputChange('returnable', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Product is returnable
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Size Variants */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Size Variants</h2>
              <button
                type="button"
                onClick={addNewSize}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Size
              </button>
            </div>

            <div className="space-y-6">
              {formData.sizes.map((size, index) => (
                <div key={size.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Size {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeSize(size.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size Name *
                      </label>
                      <input
                        type="text"
                        value={size.sizeName}
                        onChange={(e) => handleSizeChange(size.id, 'sizeName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., S, M, L"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={size.quantity}
                        onChange={(e) => handleSizeChange(size.id, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Regular Price
                      </label>
                      <input
                        type="number"
                        value={size.regularPrice}
                        onChange={(e) => handleSizeChange(size.id, 'regularPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price
                      </label>
                      <input
                        type="number"
                        value={size.salePrice}
                        onChange={(e) => handleSizeChange(size.id, 'salePrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={size.sku}
                        onChange={(e) => handleSizeChange(size.id, 'sku', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="SKU code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HSN Code
                      </label>
                      <input
                        type="text"
                        value={size.hsn}
                        onChange={(e) => handleSizeChange(size.id, 'hsn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="HSN code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Barcode
                      </label>
                      <input
                        type="text"
                        value={size.barcodeNo}
                        onChange={(e) => handleSizeChange(size.id, 'barcodeNo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Barcode"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.sizes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No sizes added yet</p>
                  <button
                    type="button"
                    onClick={addNewSize}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Size
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-black">Media Upload</h2>
              <p className="text-gray-600 mt-1">Add product images and videos</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Images Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Product Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">Drop images here or click to upload</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Images
                  </label>
                </div>
                
                {/* Display existing images */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(image)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Product Videos</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">Drop videos here or click to upload</p>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => handleVideoUpload(e.target.files)}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Videos
                  </label>
                </div>
                
                {/* Display existing videos */}
                {videos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {videos.map((video, index) => (
                      <div key={index} className="relative">
                        <video
                          src={video}
                          className="w-full h-32 object-cover rounded-lg"
                          controls
                        />
                        <button
                          onClick={() => removeVideo(video)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Assignment Section */}
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-black">Category & Subcategory Assignment</h2>
              <p className="text-gray-600 mt-1">Select product category and subcategory</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory?._id || ''}
                    onChange={(e) => {
                      const category = categories.find(cat => cat._id === e.target.value);
                      if (category) {
                        handleCategoryAssignment(category);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                    disabled={categoryLoading}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {categoryLoading && <p className="text-sm text-blue-600 mt-2">Loading categories...</p>}
              </div>

              {/* Subcategory Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Subcategory</label>
                <div className="relative">
                  <select
                    value={selectedSubCategory?._id || ''}
                    onChange={(e) => {
                      const subCategory = subCategories.find(sub => sub._id === e.target.value);
                      if (subCategory) {
                        handleSubCategoryAssignment(subCategory);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                    disabled={subCategoryLoading || !selectedCategory}
                  >
                    <option value="">Select a subcategory...</option>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory._id} value={subCategory._id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {subCategoryLoading && <p className="text-sm text-blue-600 mt-2">Loading subcategories...</p>}
                {!selectedCategory && <p className="text-sm text-gray-500 mt-2">Please select a category first</p>}
              </div>

              {/* Selection Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedCategory ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium">Category: {selectedCategory?.name || 'Not selected'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedSubCategory ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium">Subcategory: {selectedSubCategory?.name || 'Not selected'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/item-management')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Save className="w-4 h-4" />
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemManagementEditPage;
