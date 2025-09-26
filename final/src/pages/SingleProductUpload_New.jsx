import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import { itemAPI } from '../api/endpoints';

const ItemManagementSingleProductUpload = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for form data with ALL FIELDS
  const [formData, setFormData] = useState({
    productName: '',
    title: '',
    description: '',
    manufacturingDetails: '',
    shippingReturns: '',
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

  const [stockSizeOption, setStockSizeOption] = useState('noSize');

  // Load product data if in edit mode - STABLE useEffect
  useEffect(() => {
    if (isEditMode && id) {
      loadProductData();
    }
  }, []); // Empty dependency array - only run once

  // API Functions - STABLE callbacks
  const loadProductData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await itemAPI.getItemById(id);
      const productData = response.data?.success ? response.data.data : response.data;
      
      // Populate form with existing data including ALL FIELDS
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
  }, [id]); // Stable dependency

  const saveProduct = useCallback(async () => {
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
        // Create new product using the createBasicProduct endpoint for Phase 1
        response = await itemAPI.createBasicProduct(productData);
        setSuccess('Product created successfully!');
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        navigate('/item-management');
      }, 3000);

    } catch (error) {
      console.error('Error saving product:', error);
      
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
  }, [formData, stockSizeOption, isEditMode, id, navigate]);

  const deleteProduct = useCallback(async () => {
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
      setError('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode, navigate]);

  // Handle form changes - STABLE handlers
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSizeChange = useCallback((sizeIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, index) => 
        index === sizeIndex ? { ...size, [field]: value } : size
      )
    }));
  }, []);

  const addNewSize = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, {
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
        metaTitle: '',
        metaDescription: '',
        slugUrl: '',
      }]
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    saveProduct();
  }, [saveProduct]);

  return (
    <div className="relative w-full bg-white overflow-auto" style={{ height: `${2500 + (Math.max(0, formData.sizes.length - 2) * 600)}px` }}>
      {/* Header */}
      <div className="absolute left-[65px] top-[65px]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/item-management')}
            className="flex items-center justify-center w-[44px] h-[44px] bg-white border border-[#d0d5dd] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
          >
            <ArrowLeft className="w-5 h-5 text-[#667085]" />
          </button>
          
          <h1 className="font-['Montserrat'] font-semibold text-[30px] text-[#101828] leading-[38px]">
            {isEditMode ? 'Edit Product' : 'Add Product'}
          </h1>

          {isEditMode && (
            <button
              type="button"
              onClick={deleteProduct}
              disabled={loading}
              className="flex items-center justify-center w-[44px] h-[44px] bg-red-500 border border-red-600 rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute left-[65px] top-[120px] right-[65px] bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="absolute left-[65px] top-[120px] right-[65px] bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Main Form */}
      <div className="absolute left-[5px] top-[160px]">
        <form onSubmit={handleSubmit}>
          {/* Left Column - Basic Info */}
          <div className="relative">
            {/* Product Name */}
            <div className="absolute left-[64px] top-[54px]">
              <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                Product Name
              </label>
            </div>
            <div className="absolute left-[64px] top-[74px]">
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-[500px] h-[48px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                placeholder="Enter product name"
              />
            </div>

            {/* Title */}
            <div className="absolute left-[5px] top-[153px]">
              <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                Title
              </label>
            </div>
            <div className="absolute left-[5px] top-[173px]">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-[500px] h-[48px] border-2 border-black rounded-[12px] px-4 font-['Montserrat']"
                placeholder="Enter product title"
              />
            </div>

            {/* Description */}
            <div className="absolute left-[5px] top-[252px]">
              <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                Description
              </label>
            </div>
            <div className="absolute left-[5px] top-[272px]">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-[500px] h-[154px] border-2 border-black rounded-[12px] p-4 font-['Montserrat'] resize-none"
                placeholder="Enter product description"
              />
            </div>

            {/* Manufacturing Details */}
            <div className="absolute left-[5px] top-[453px]">
              <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                Manufacturing Details
              </label>
            </div>
            <div className="absolute left-[5px] top-[473px]">
              <textarea
                value={formData.manufacturingDetails}
                onChange={(e) => handleInputChange('manufacturingDetails', e.target.value)}
                className="w-[500px] h-[154px] border-2 border-black rounded-[12px] p-4 font-['Montserrat'] resize-none"
                placeholder="Enter manufacturing details"
              />
            </div>

            {/* Shipping Returns and Exchange */}
            <div className="absolute left-[5px] top-[653px]">
              <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                Shipping returns and exchange
              </label>
            </div>
            <div className="absolute left-[5px] top-[673px]">
              <textarea
                value={formData.shippingReturns}
                onChange={(e) => handleInputChange('shippingReturns', e.target.value)}
                className="w-[500px] h-[154px] border-2 border-black rounded-[12px] p-4 font-['Montserrat'] resize-none"
                placeholder="Enter shipping and return policy"
              />
            </div>
          </div>

          {/* Stock Size Section */}
          <div className="absolute left-[65px] top-[876px]">
            <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
              Stock size
            </label>
          </div>

          {/* No Size Button */}
          <div className="absolute left-[66px] top-[903px]">
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
          <div className="absolute left-[172px] top-[903px]">
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
              {formData.sizes.map((size, sizeIndex) => {
                const baseTop = 967 + (sizeIndex * 600);
                
                return (
                  <div key={size.id || sizeIndex}>
                    {/* Size Header */}
                    <div className="absolute left-[50px]" style={{ top: `${baseTop}px` }}>
                      <label className="font-['Montserrat'] font-medium text-[21px] text-[#111111] leading-[24px]">
                        size {sizeIndex + 1}
                      </label>
                    </div>

                    {/* Size Top Row Fields */}
                    <div className="absolute left-[53px]" style={{ top: `${baseTop + 41}px` }}>
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

                        {/* Hsn */}
                        <div>
                          <p className="font-['Montserrat'] text-[14px] text-black mb-1">Hsn</p>
                          <input
                            type="text"
                            value={size.hsn || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'hsn', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* Regular price */}
                        <div>
                          <p className="font-['Montserrat'] text-[14px] text-black mb-1">Regular price</p>
                          <input
                            type="number"
                            value={size.regularPrice || ''}
                            onChange={(e) => handleSizeChange(sizeIndex, 'regularPrice', e.target.value)}
                            className="w-[118px] h-[47px] border-2 border-black rounded-[12px] px-2"
                          />
                        </div>

                        {/* Sale price */}
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

                        {/* Barcode no */}
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

                    {/* Size Measurements Row */}
                    <div className="absolute left-[53px]" style={{ top: `${baseTop + 120}px` }}>
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

                    {/* Size Meta Fields */}
                    <div className="absolute left-[58px]" style={{ top: `${baseTop + 243}px` }}>
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
              <div className="absolute left-[69px]" style={{ top: `${1870 + (Math.max(0, formData.sizes.length - 2) * 600)}px` }}>
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
          <div className="absolute left-[144px]" style={{ top: `${1950 + (Math.max(0, formData.sizes.length - 2) * 600)}px` }}>
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
