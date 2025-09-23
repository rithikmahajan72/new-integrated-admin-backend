import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { itemAPI } from '../api/endpoints';

const ItemManagementSingleProductUpload = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing products
  const isEditMode = Boolean(id);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    productName: '',
    title: '',
    description: '',
    manufacturingDetails: '',
    shippingReturns: '',

    
    // Size data arrays
    sizes: [
      {
        id: 1,
        sizeName: '',
        quantity: '',
        hsn: '',
        regularPrice: '',
        salePrice: '',
        sku: '',
        barcodeNo: '',
        // Measurements in cm
        waistCm: '',
        inseamCm: '',
        chestCm: '',
        frontLengthCm: '',
        acrossShoulderCm: '',
        frontLengthCm2: '', // second front length field
        // Measurements in inches
        waistIn: '',
        inseamIn: '',
        chestIn: '',
        frontLengthIn: '',
        acrossShoulderIn: '',
        // Meta fields for this variant
        metaTitle: '',
        metaDescription: '',
        slugUrl: '',
      },
      {
        id: 2,
        sizeName: '',
        quantity: '',
        hsn: '',
        regularPrice: '',
        salePrice: '',
        sku: '',
        barcodeNo: '',
        // Measurements in cm
        waistCm: '',
        inseamCm: '',
        chestCm: '',
        frontLengthCm: '',
        acrossShoulderCm: '',
        frontLengthCm2: '',
        // Measurements in inches
        waistIn: '',
        inseamIn: '',
        chestIn: '',
        frontLengthIn: '',
        acrossShoulderIn: '',
        // Meta fields for this variant
        metaTitle: '',
        metaDescription: '',
        slugUrl: '',
      }
    ]
  });

  const [stockSizeOption, setStockSizeOption] = useState('noSize'); // 'noSize' or 'addSize'

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadProductData();
    }
  }, [id, isEditMode]);

  // API Functions
  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await itemAPI.getProductById(id);
      const productData = response.data;
      
      // Populate form with existing data
      setFormData({
        productName: productData.productName || '',
        title: productData.title || '',
        description: productData.description || '',
        manufacturingDetails: productData.manufacturingDetails || '',
        shippingReturns: productData.shippingReturns || '',
        sizes: productData.sizes && productData.sizes.length > 0 ? productData.sizes : [
          {
            id: 1,
            sizeName: '',
            quantity: '',
            hsn: '',
            regularPrice: '',
            salePrice: '',
            sku: '',
            barcodeNo: '',
            waistCm: '',
            inseamCm: '',
            chestCm: '',
            frontLengthCm: '',
            acrossShoulderCm: '',
            frontLengthCm2: '',
            waistIn: '',
            inseamIn: '',
            chestIn: '',
            frontLengthIn: '',
            acrossShoulderIn: '',
            metaTitle: '',
            metaDescription: '',
            slugUrl: '',
          },
          {
            id: 2,
            sizeName: '',
            quantity: '',
            hsn: '',
            regularPrice: '',
            salePrice: '',
            sku: '',
            barcodeNo: '',
            waistCm: '',
            inseamCm: '',
            chestCm: '',
            frontLengthCm: '',
            acrossShoulderCm: '',
            frontLengthCm2: '',
            waistIn: '',
            inseamIn: '',
            chestIn: '',
            frontLengthIn: '',
            acrossShoulderIn: '',
            metaTitle: '',
            metaDescription: '',
            slugUrl: '',
          }
        ]
      });
      
      // Set size option based on whether sizes exist
      setStockSizeOption(productData.sizes && productData.sizes.length > 0 ? 'addSize' : 'noSize');
      
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Failed to load product data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Basic validation
      if (!formData.productName.trim()) {
        setError('Product name is required');
        return;
      }
      
      if (!formData.description.trim()) {
        setError('Product description is required');
        return;
      }

      // Add timestamp to product name to avoid duplicates during testing
      const uniqueProductName = isEditMode ? formData.productName : `${formData.productName} ${Date.now()}`;

      // Check authentication
      const token = localStorage.getItem('authToken');
      if (!token || token === 'null' || token === 'undefined') {
        setError('Please log in to continue');
        return;
      }

      console.log('Saving product with data:', {
        productName: formData.productName,
        hasDescription: !!formData.description,
        sizesCount: formData.sizes.length,
        stockSizeOption,
        authToken: !!localStorage.getItem('authToken')
      });

      // Prepare data for API - fix field name mismatch
      const productData = {
        productName: uniqueProductName,
        title: formData.title,
        description: formData.description,
        manufacturingDetails: formData.manufacturingDetails,
        shippingAndReturns: formData.shippingReturns, // Backend expects 'shippingAndReturns'
        returnable: true,
        sizes: stockSizeOption === 'addSize' ? formData.sizes.map(size => ({
          size: size.sizeName, // Map sizeName to size
          quantity: parseInt(size.quantity) || 0,
          stock: parseInt(size.quantity) || 0, // Backend expects stock field
          hsnCode: size.hsn, // Map hsn to hsnCode
          sku: size.sku,
          barcode: size.barcodeNo, // Map barcodeNo to barcode
          regularPrice: parseFloat(size.regularPrice) || 0,
          salePrice: parseFloat(size.salePrice) || 0,
          // Measurements in cm - map to correct backend fields
          fitWaistCm: parseFloat(size.waistCm) || 0, // Map waistCm to fitWaistCm
          inseamLengthCm: parseFloat(size.inseamCm) || 0, // Map inseamCm to inseamLengthCm
          chestCm: parseFloat(size.chestCm) || 0,
          frontLengthCm: parseFloat(size.frontLengthCm) || 0,
          acrossShoulderCm: parseFloat(size.acrossShoulderCm) || 0,
          // Measurements in inches - map to correct backend fields
          toFitWaistIn: parseFloat(size.waistIn) || 0, // Map waistIn to toFitWaistIn
          inseamLengthIn: parseFloat(size.inseamIn) || 0, // Map inseamIn to inseamLengthIn
          chestIn: parseFloat(size.chestIn) || 0,
          frontLengthIn: parseFloat(size.frontLengthIn) || 0,
          acrossShoulderIn: parseFloat(size.acrossShoulderIn) || 0,
          // Meta fields
          metaTitle: size.metaTitle || '',
          metaDescription: size.metaDescription || '',
          slugUrl: size.slugUrl || '',
        })) : []
      };

      let response;
      if (isEditMode) {
        // Update existing product
        response = await itemAPI.updateItem(id, productData);
        setSuccess('Product updated successfully!');
      } else {
        // Create new product using the createItem endpoint (more flexible)
        response = await itemAPI.createItem(productData);
        setSuccess('Product created successfully!');
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        navigate('/item-management');
      }, 3000);

    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Enhanced error message handling
      let errorMessage = 'Failed to save product. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid product data. Please check all fields.';
        if (errorMessage.includes('already exists')) {
          errorMessage = 'A product with this name already exists. Please use a different name.';
        }
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again or contact support.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async () => {
    if (!isEditMode || !id) return;
    
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await itemAPI.deleteItem(id);
      setSuccess('Product deleted successfully!');
      
      setTimeout(() => {
        navigate('/item-management');
      }, 2000);

    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || 'Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSizeChange = (sizeIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, index) => 
        index === sizeIndex ? { ...size, [field]: value } : size
      )
    }));
  };

  const addNewSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [
        ...prev.sizes,
        {
          id: prev.sizes.length + 1,
          sizeName: '',
          quantity: '',
          hsn: '',
          regularPrice: '',
          salePrice: '',
          sku: '',
          barcodeNo: '',
          waistCm: '',
          inseamCm: '',
          chestCm: '',
          frontLengthCm: '',
          acrossShoulderCm: '',
          frontLengthCm2: '',
          waistIn: '',
          inseamIn: '',
          chestIn: '',
          frontLengthIn: '',
          acrossShoulderIn: '',
          // Meta fields for this variant
          metaTitle: '',
          metaDescription: '',
          slugUrl: '',
        }
      ]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProduct();
  };

  const handleBackClick = () => {
    navigate('/item-management');
  };

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="relative w-full h-full p-8">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute left-[24px] top-[24px] flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors z-10"
          disabled={loading}
        >
          <ArrowLeft size={20} />
          <span className="font-['Montserrat'] text-[16px]">Back to Item Management</span>
        </button>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="font-['Montserrat'] text-[16px]">
                  {isEditMode ? 'Saving changes...' : 'Creating product...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute left-[24px] top-[80px] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10 max-w-md">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="absolute left-[24px] top-[80px] bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-10 max-w-md">
            <strong className="font-bold">Success: </strong>
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="absolute left-[144px] top-[319px]">
            <h1 className="font-['Montserrat'] font-bold text-[48px] text-[#111111] leading-[24px]">
              {isEditMode ? 'edit product details' : 'enter product details'}
            </h1>
          </div>

          {/* Delete Button (only in edit mode) */}
          {isEditMode && (
            <div className="absolute right-[144px] top-[319px]">
              <button
                type="button"
                onClick={deleteProduct}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-[8px] font-['Montserrat'] font-medium text-[16px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Delete Product
              </button>
            </div>
          )}

          {/* Basic Product Details */}
          <div className="absolute left-[137px] top-[399px]">
            {/* Product Name */}
            <div className="absolute left-[5px] top-[11px]">
              <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                product name
              </label>
            </div>
            <div className="absolute left-[6px] top-[31px]">
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-[400px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
              />
            </div>

            {/* Title */}
            <div className="absolute left-[11px] top-[101px]">
              <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                Title
              </label>
            </div>
            <div className="absolute left-[7px] top-[121px]">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-[400px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
              />
            </div>

            {/* Description */}
            <div className="absolute left-[9px] top-[202px]">
              <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                Description
              </label>
            </div>
            <div className="absolute left-[4px] top-[218px]">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-[500px] h-[154px] border-2 border-black rounded-[12px] p-4 font-['Montserrat'] resize-none"
              />
            </div>

            {/* Manufacturing Details */}
            <div className="absolute left-[4px] top-[400px]">
              <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                Manufacturing details
              </label>
            </div>
            <div className="absolute left-[0px] top-[429px]">
              <textarea
                value={formData.manufacturingDetails}
                onChange={(e) => handleInputChange('manufacturingDetails', e.target.value)}
                className="w-[500px] h-[154px] border-2 border-black rounded-[12px] p-4 font-['Montserrat'] resize-none"
              />
            </div>

            {/* Shipping Returns and Exchange */}
            <div className="absolute left-[5px] top-[603px]">
              <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                Shipping returns and exchange
              </label>
            </div>
            <div className="absolute left-[5px] top-[623px]">
              <textarea
                value={formData.shippingReturns}
                onChange={(e) => handleInputChange('shippingReturns', e.target.value)}
                className="w-[500px] h-[154px] border-2 border-black rounded-[12px] p-4 font-['Montserrat'] resize-none"
              />
            </div>
          </div>

          {/* Stock Size Section */}
          <div className="absolute left-[65px] top-[1326px]">
            <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
              Stock size
            </label>
          </div>

          {/* No Size Button */}
          <div className="absolute left-[66px] top-[1353px]">
            <button
              type="button"
              onClick={() => setStockSizeOption('noSize')}
              className={`px-4 py-2 rounded-[8px] font-['Montserrat'] text-[14px] font-normal leading-[20px] ${
                stockSizeOption === 'noSize'
                  ? 'bg-[#000aff] text-white border border-[#7280ff]'
                  : 'bg-white text-black border border-[#d0d5dd]'
              } shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]`}
            >
              No size
            </button>
          </div>

          {/* Add Size Button */}
          <div className="absolute left-[172px] top-[1353px]">
            <button
              type="button"
              onClick={() => setStockSizeOption('addSize')}
              className={`w-[81px] px-4 py-2 rounded-[8px] font-['Montserrat'] text-[14px] font-normal leading-[20px] ${
                stockSizeOption === 'addSize'
                  ? 'bg-[#000aff] text-white border border-[#7280ff]'
                  : 'bg-white text-black border border-[#d0d5dd]'
              } shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]`}
            >
              Add size
            </button>
          </div>

          {/* Size Input Fields */}
          {stockSizeOption === 'addSize' && (
            <>
              {/* Size 1 */}
              <div className="absolute left-[50px] top-[1417px]">
                <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                  size 1
                </label>
              </div>

              {/* Size 1 - Top Row Fields */}
              <div className="absolute left-[53px] top-[1458px]">
                <div className="flex space-x-4">
                  {/* Size */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">Size</p>
                    <input
                      type="text"
                      value={formData.sizes[0]?.sizeName || ''}
                      onChange={(e) => handleSizeChange(0, 'sizeName', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>
                  
                  {/* Quantity */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">Quantity</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.quantity || ''}
                      onChange={(e) => handleSizeChange(0, 'quantity', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* Hsn */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">Hsn</p>
                    <input
                      type="text"
                      value={formData.sizes[0]?.hsn || ''}
                      onChange={(e) => handleSizeChange(0, 'hsn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* Regular price */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">Regular price</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.regularPrice || ''}
                      onChange={(e) => handleSizeChange(0, 'regularPrice', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* Sale price */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">Sale price</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.salePrice || ''}
                      onChange={(e) => handleSizeChange(0, 'salePrice', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">SKU</p>
                    <input
                      type="text"
                      value={formData.sizes[0]?.sku || ''}
                      onChange={(e) => handleSizeChange(0, 'sku', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* Barcode no */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">barcode no.</p>
                    <input
                      type="text"
                      value={formData.sizes[0]?.barcodeNo || ''}
                      onChange={(e) => handleSizeChange(0, 'barcodeNo', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>
                </div>
              </div>

              {/* Size 1 - Measurements CM Row */}
              <div className="absolute left-[58px] top-[1552px]">
                <div className="flex space-x-4">
                  {/* to fit waist (cm) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">to fit waist (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.waistCm || ''}
                      onChange={(e) => handleSizeChange(0, 'waistCm', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* inseam length (cm) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">inseam length (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.inseamCm || ''}
                      onChange={(e) => handleSizeChange(0, 'inseamCm', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* chest (cm) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">chest (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.chestCm || ''}
                      onChange={(e) => handleSizeChange(0, 'chestCm', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* front length (cm) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">front length (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.frontLengthCm || ''}
                      onChange={(e) => handleSizeChange(0, 'frontLengthCm', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* across shoulder (cm) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">across shoulder (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.acrossShoulderCm || ''}
                      onChange={(e) => handleSizeChange(0, 'acrossShoulderCm', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* front length (cm) - second one */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">front length (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.frontLengthCm2 || ''}
                      onChange={(e) => handleSizeChange(0, 'frontLengthCm2', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* to fit waist (in) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">to fit waist (in)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.waistIn || ''}
                      onChange={(e) => handleSizeChange(0, 'waistIn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* inseam length (in) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">inseam length (in)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.inseamIn || ''}
                      onChange={(e) => handleSizeChange(0, 'inseamIn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* chest (in) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">chest (in)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.chestIn || ''}
                      onChange={(e) => handleSizeChange(0, 'chestIn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* front length (in) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">front length (in)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.frontLengthIn || ''}
                      onChange={(e) => handleSizeChange(0, 'frontLengthIn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* across shoulder (in) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">across shoulder (in)</p>
                    <input
                      type="number"
                      value={formData.sizes[0]?.acrossShoulderIn || ''}
                      onChange={(e) => handleSizeChange(0, 'acrossShoulderIn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>
                </div>
              </div>

              {/* Size 1 - Meta Fields */}
              <div className="absolute left-[58px] top-[1660px]">
                <div className="flex space-x-4">
                  {/* Meta Title */}
                  <div>
                    <p className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px] mb-2">meta title</p>
                    <input
                      type="text"
                      value={formData.sizes[0]?.metaTitle || ''}
                      onChange={(e) => handleSizeChange(0, 'metaTitle', e.target.value)}
                      className="w-[300px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <p className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px] mb-2">meta description</p>
                    <input
                      type="text"
                      value={formData.sizes[0]?.metaDescription || ''}
                      onChange={(e) => handleSizeChange(0, 'metaDescription', e.target.value)}
                      className="w-[300px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                    />
                  </div>

                  {/* Slug URL */}
                  <div>
                    <p className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px] mb-2">slug URL</p>
                    <input
                      type="text"
                      value={formData.sizes[0]?.slugUrl || ''}
                      onChange={(e) => handleSizeChange(0, 'slugUrl', e.target.value)}
                      className="w-[300px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                    />
                  </div>
                </div>
              </div>

              {/* Size 2 */}
              <div className="absolute left-[56px] top-[1947px]">
                <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                  size 2
                </label>
              </div>

              {/* Size 2 - Top Row Fields */}
              <div className="absolute left-[69px] top-[1988px]">
                <div className="flex space-x-4">
                  {/* Size */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">Size</p>
                    <input
                      type="text"
                      value={formData.sizes[1]?.sizeName || ''}
                      onChange={(e) => handleSizeChange(1, 'sizeName', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>
                  
                  {/* Quantity */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">Quantity</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.quantity || ''}
                      onChange={(e) => handleSizeChange(1, 'quantity', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* Hsn */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">Hsn</p>
                    <input
                      type="text"
                      value={formData.sizes[1]?.hsn || ''}
                      onChange={(e) => handleSizeChange(1, 'hsn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* Regular price */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">Regular price</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.regularPrice || ''}
                      onChange={(e) => handleSizeChange(1, 'regularPrice', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* Sale price */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">Sale price</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.salePrice || ''}
                      onChange={(e) => handleSizeChange(1, 'salePrice', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">SKU</p>
                    <input
                      type="text"
                      value={formData.sizes[1]?.sku || ''}
                      onChange={(e) => handleSizeChange(1, 'sku', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* Barcode no */}
                  <div>
                    <p className="font-['Montserrat'] text-[14px] text-black mb-1">barcode no.</p>
                    <input
                      type="text"
                      value={formData.sizes[1]?.barcodeNo || ''}
                      onChange={(e) => handleSizeChange(1, 'barcodeNo', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>
                </div>
              </div>

              {/* Size 2 - Measurements CM Row */}
              <div className="absolute left-[69px] top-[2093px]">
                <div className="flex space-x-4">
                  {/* to fit waist (cm) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">to fit waist (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.waistCm || ''}
                      onChange={(e) => handleSizeChange(1, 'waistCm', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* inseam length (cm) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">inseam length (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.inseamCm || ''}
                      onChange={(e) => handleSizeChange(1, 'inseamCm', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* chest (cm) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">chest (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.chestCm || ''}
                      onChange={(e) => handleSizeChange(1, 'chestCm', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* front length (cm) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">front length (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.frontLengthCm || ''}
                      onChange={(e) => handleSizeChange(1, 'frontLengthCm', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* across shoulder (cm) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">across shoulder (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.acrossShoulderCm || ''}
                      onChange={(e) => handleSizeChange(1, 'acrossShoulderCm', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* front length (cm) - second one */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">front length (cm)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.frontLengthCm2 || ''}
                      onChange={(e) => handleSizeChange(1, 'frontLengthCm2', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* to fit waist (in) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">to fit waist (in)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.waistIn || ''}
                      onChange={(e) => handleSizeChange(1, 'waistIn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* inseam length (in) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">inseam length (in)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.inseamIn || ''}
                      onChange={(e) => handleSizeChange(1, 'inseamIn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* chest (in) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">chest (in)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.chestIn || ''}
                      onChange={(e) => handleSizeChange(1, 'chestIn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* front length (in) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">front length (in)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.frontLengthIn || ''}
                      onChange={(e) => handleSizeChange(1, 'frontLengthIn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>

                  {/* across shoulder (in) */}
                  <div>
                    <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">across shoulder (in)</p>
                    <input
                      type="number"
                      value={formData.sizes[1]?.acrossShoulderIn || ''}
                      onChange={(e) => handleSizeChange(1, 'acrossShoulderIn', e.target.value)}
                      className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                    />
                  </div>
                </div>
              </div>

              {/* Size 2 - Meta Fields */}
              <div className="absolute left-[69px] top-[2201px]">
                <div className="flex space-x-4">
                  {/* Meta Title */}
                  <div>
                    <p className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px] mb-2">meta title</p>
                    <input
                      type="text"
                      value={formData.sizes[1]?.metaTitle || ''}
                      onChange={(e) => handleSizeChange(1, 'metaTitle', e.target.value)}
                      className="w-[300px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <p className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px] mb-2">meta description</p>
                    <input
                      type="text"
                      value={formData.sizes[1]?.metaDescription || ''}
                      onChange={(e) => handleSizeChange(1, 'metaDescription', e.target.value)}
                      className="w-[300px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                    />
                  </div>

                  {/* Slug URL */}
                  <div>
                    <p className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px] mb-2">slug URL</p>
                    <input
                      type="text"
                      value={formData.sizes[1]?.slugUrl || ''}
                      onChange={(e) => handleSizeChange(1, 'slugUrl', e.target.value)}
                      className="w-[300px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Additional Sizes */}
              {formData.sizes.slice(2).map((size, index) => {
                const sizeIndex = index + 2;
                const baseTop = 2320 + (index * 600); // Start after Size 2 and add 600px spacing for each additional size
                return (
                  <div key={size.id || sizeIndex}>
                    {/* Size Header */}
                    <div className="absolute left-[56px]" style={{ top: `${baseTop}px` }}>
                      <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                        size {sizeIndex + 1}
                      </label>
                    </div>

                    {/* Top Row Fields */}
                    <div className="absolute left-[69px]" style={{ top: `${baseTop + 41}px` }}>
                      <div className="flex space-x-4">
                        {/* Size */}
                        <div>
                          <p className="font-['Montserrat'] text-[14px] text-black mb-1">Size</p>
                          <input
                            type="text"
                            value={size.sizeName || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'sizeName', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>
                        
                        {/* Quantity */}
                        <div>
                          <p className="font-['Montserrat'] text-[14px] text-black mb-1">Quantity</p>
                          <input
                            type="number"
                            value={size.quantity || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'quantity', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* HSN */}
                        <div>
                          <p className="font-['Montserrat'] text-[14px] text-black mb-1">Hsn</p>
                          <input
                            type="text"
                            value={size.hsn || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'hsn', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* Regular Price */}
                        <div>
                          <p className="font-['Montserrat'] text-[14px] text-black mb-1">Regular price</p>
                          <input
                            type="number"
                            value={size.regularPrice || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'regularPrice', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* Sale Price */}
                        <div>
                          <p className="font-['Montserrat'] text-[14px] text-black mb-1">Sale price</p>
                          <input
                            type="number"
                            value={size.salePrice || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'salePrice', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* SKU */}
                        <div>
                          <p className="font-['Montserrat'] text-[14px] text-black mb-1">SKU</p>
                          <input
                            type="text"
                            value={size.sku || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'sku', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* Barcode No */}
                        <div>
                          <p className="font-['Montserrat'] text-[14px] text-black mb-1">barcode no.</p>
                          <input
                            type="text"
                            value={size.barcodeNo || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'barcodeNo', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Measurements Row */}
                    <div className="absolute left-[69px]" style={{ top: `${baseTop + 146}px` }}>
                      <div className="flex space-x-4">
                        {/* to fit waist (cm) */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">to fit waist (cm)</p>
                          <input
                            type="number"
                            value={size.waistCm || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'waistCm', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* inseam length (cm) */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">inseam length (cm)</p>
                          <input
                            type="number"
                            value={size.inseamCm || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'inseamCm', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* chest (cm) */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">chest (cm)</p>
                          <input
                            type="number"
                            value={size.chestCm || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'chestCm', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* front length (cm) */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">front length (cm)</p>
                          <input
                            type="number"
                            value={size.frontLengthCm || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'frontLengthCm', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* across shoulder (cm) */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">across shoulder (cm)</p>
                          <input
                            type="number"
                            value={size.acrossShoulderCm || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'acrossShoulderCm', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* front length (cm) - second one */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">front length (cm)</p>
                          <input
                            type="number"
                            value={size.frontLengthCm2 || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'frontLengthCm2', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* to fit waist (in) */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">to fit waist (in)</p>
                          <input
                            type="number"
                            value={size.waistIn || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'waistIn', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* inseam length (in) */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">inseam length (in)</p>
                          <input
                            type="number"
                            value={size.inseamIn || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'inseamIn', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* chest (in) */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">chest (in)</p>
                          <input
                            type="number"
                            value={size.chestIn || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'chestIn', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* front length (in) */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">front length (in)</p>
                          <input
                            type="number"
                            value={size.frontLengthIn || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'frontLengthIn', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* across shoulder (in) */}
                        <div>
                          <p className="font-['Montserrat'] text-[15px] text-black mb-1 leading-[16.9px]">across shoulder (in)</p>
                          <input
                            type="number"
                            value={size.acrossShoulderIn || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'acrossShoulderIn', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meta Fields */}
                    <div className="absolute left-[69px]" style={{ top: `${baseTop + 254}px` }}>
                      <div className="flex space-x-4">
                        {/* Meta Title */}
                        <div>
                          <p className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px] mb-2">meta title</p>
                          <input
                            type="text"
                            value={size.metaTitle || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'metaTitle', e.target.value)}
                            className="w-[300px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                          />
                        </div>

                        {/* Meta Description */}
                        <div>
                          <p className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px] mb-2">meta description</p>
                          <input
                            type="text"
                            value={size.metaDescription || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'metaDescription', e.target.value)}
                            className="w-[300px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                          />
                        </div>

                        {/* Slug URL */}
                        <div>
                          <p className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px] mb-2">slug URL</p>
                          <input
                            type="text"
                            value={size.slugUrl || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'slugUrl', e.target.value)}
                            className="w-[300px] h-[47px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Size Button */}
              <div className="absolute left-[69px]" style={{ top: `${2320 + (Math.max(0, formData.sizes.length - 2) * 600)}px` }}>
                <button
                  type="button"
                  onClick={addNewSize}
                  className="px-6 py-3 bg-[#28a745] text-white rounded-[8px] font-['Montserrat'] font-medium text-[16px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#218838] transition-colors"
                >
                  + Add New Size
                </button>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="absolute left-[144px]" style={{ top: `${2400 + (Math.max(0, formData.sizes.length - 2) * 600)}px` }}>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#000aff] text-white rounded-[8px] font-['Montserrat'] font-medium text-[16px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#0008e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : (isEditMode ? 'Update Product' : 'Create Product')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemManagementSingleProductUpload;
