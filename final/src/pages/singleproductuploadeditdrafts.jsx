import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  X, 
  Plus, 
  Save, 
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

// Import Redux slices
import {
  fetchItemById,
  updateItem,
  selectItems,
  selectSelectedItem,
  selectItemsLoading,
  selectItemsError
} from '../store/slices/itemManagementSlice';

import {
  fetchCategories,
  selectCategories,
  selectCategoriesLoading
} from '../store/slices/categoriesSlice';

import {
  fetchSubCategories,
  selectSubCategories,
  selectSubCategoriesLoading
} from '../store/slices/subCategoriesSlice';

import {
  fetchFilters,
  selectAvailableFilters,
  selectFilterLoading
} from '../store/slices/filtersSlice';

const SingleProductUploadEditDrafts = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const loading = useSelector(selectItemsLoading);
  const error = useSelector(selectItemsError);
  const items = useSelector(selectItems);
  const selectedItem = useSelector(selectSelectedItem);
  
  const categories = useSelector(selectCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const subCategories = useSelector(selectSubCategories);
  const subCategoriesLoading = useSelector(selectSubCategoriesLoading);
  
  const availableFilters = useSelector(selectAvailableFilters);
  const filtersLoading = useSelector(selectFilterLoading);

  // File input refs
  const imageInputRefs = useRef([]);
  const videoInputRefs = useRef([]);

  // Local state for form data
  const [formData, setFormData] = useState({
    productName: '',
    title: '',
    description: '',
    manufacturingDetails: '',
    shippingReturnsExchange: '',
    returnable: true,
    
    // Images and videos
    images: [],
    videos: [],
    
    // Size and measurements
    sizes: [],
    
    // Pricing
    price: '',
    salePrice: '',
    
    // Product details
    sku: '',
    hsn: '',
    barcodeNo: '',
    
    // Measurements (cm)
    toFitWaistCm: '',
    inseamLengthCm: '',
    chestCm: '',
    frontLengthCm: '',
    acrossShoulderCm: '',
    
    // Measurements (in)
    toFitWaistIn: '',
    inseamLengthIn: '',
    chestIn: '',
    frontLengthIn: '',
    acrossShoulderIn: '',
    
    // SEO
    metaTitle: '',
    metaDescription: '',
    slugUrl: '',
    filters: []
  });

  // Stock size option state
  const [stockSizeOption, setStockSizeOption] = useState('noSize');
  const [customSizes, setCustomSizes] = useState([]);

  // How to measure image state
  const [howToMeasureImage, setHowToMeasureImage] = useState(null);
  const [howToMeasureUploadStatus, setHowToMeasureUploadStatus] = useState(null);

  const [productData, setProductData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Helper functions for generating codes
  const generateSlugUrl = useCallback((text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }, []);

  const generateSKU = useCallback((category, subCategory, productName, size = '') => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomId = Math.random().toString().slice(2, 10); // 8-digit random number
    
    const categoryFormatted = (category || 'general').toLowerCase();
    const subCategoryFormatted = (subCategory || 'product').toLowerCase();
    const productNameFormatted = (productName || 'item').toLowerCase();
    const sizeFormatted = size ? `/${size.toLowerCase()}` : '';
    
    return `${categoryFormatted}/${subCategoryFormatted}/${productNameFormatted}${sizeFormatted}/${year}/${month}/${day}/${randomId}`;
  }, []);

  const generateBarcode = useCallback(() => {
    const prefix = '8904567890';
    const suffix = Math.random().toString().slice(2, 6); // 4-digit random number
    return prefix + suffix;
  }, []);

  const generateHSNCode = useCallback((category) => {
    // HSN Code mapping based on category
    const hsnCodes = {
      'clothing': '61091000',
      'textiles': '61091000',
      'electronics': '85171200',
      'footwear': '64039900',
      'bags': '42023200',
      'accessories': '71179000',
      'home': '94036000',
      'sports': '95069900'
    };
    
    const categoryLower = (category || 'clothing').toLowerCase();
    return hsnCodes[categoryLower] || '61091000'; // Default to textile HSN
  }, []);

  // Fetch product data on component mount
  useEffect(() => {
    if (productId) {
      dispatch(fetchItemById(productId));
    }
    dispatch(fetchCategories());
    dispatch(fetchSubCategories());
    dispatch(fetchFilters());
  }, [dispatch, productId]);

  // Update form data when product data is fetched
  useEffect(() => {
    // Use selectedItem from Redux instead of searching in items array
    const product = selectedItem;
    console.log('=== COMPREHENSIVE PRODUCT DATA DEBUG ===');
    console.log('selectedItem:', selectedItem);
    console.log('productId from URL:', productId);
    
    if (product) {
      console.log('Product found:', product); // Debug log
      console.log('Product fields:', Object.keys(product));
      console.log('productName:', product.productName);
      console.log('title:', product.title);
      console.log('description:', product.description);
      console.log('variants:', product.variants);
      console.log('sizes property:', product.sizes);
      console.log('=== FULL PRODUCT OBJECT ===');
      try {
        console.log(JSON.stringify(product, null, 2));
      } catch (e) {
        console.log('Cannot stringify product:', e);
        console.log('Product object:', product);
      }
      
      if (product.variants && product.variants.length > 0) {
        console.log('First variant:', product.variants[0]);
        console.log('First variant additionalData:', product.variants[0].additionalData);
        if (product.variants[0].additionalData) {
          console.log('customSizes:', product.variants[0].additionalData.customSizes);
          console.log('stockSizes:', product.variants[0].additionalData.stockSizes);
          console.log('=== FULL VARIANT ADDITIONAL DATA ===');
          try {
            console.log(JSON.stringify(product.variants[0].additionalData, null, 2));
          } catch (e) {
            console.log('Cannot stringify additionalData:', e);
            console.log('AdditionalData object:', product.variants[0].additionalData);
          }
        }
      }
      
      // Also check all possible size-related properties
      console.log('=== ALL POSSIBLE SIZE PROPERTIES ===');
      const sizeRelatedProps = [
        'sizes', 'sizeData', 'stockSizes', 'customSizes', 'productSizes', 
        'availableSizes', 'sizeOptions', 'measurements', 'dimensions',
        'variants', 'variantData', 'stockData'
      ];
      
      sizeRelatedProps.forEach(prop => {
        if (product[prop]) {
          console.log(`Found ${prop}:`, product[prop]);
        }
      });
      
      // Check nested properties in variants
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant, index) => {
          console.log(`=== VARIANT ${index} ANALYSIS ===`);
          sizeRelatedProps.forEach(prop => {
            if (variant[prop]) {
              console.log(`Variant ${index} ${prop}:`, variant[prop]);
            }
          });
          
          if (variant.additionalData) {
            console.log(`Variant ${index} additionalData keys:`, Object.keys(variant.additionalData));
            Object.keys(variant.additionalData).forEach(key => {
              if (key.toLowerCase().includes('size') || key.toLowerCase().includes('stock')) {
                console.log(`Variant ${index} additionalData.${key}:`, variant.additionalData[key]);
              }
            });
          }
        });
      }
      
      setProductData(product);
      
      // Extract size data from variants and additional data
      let extractedSizes = [];
      
      // Try multiple possible locations for size data
      if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];
        console.log('=== SIZE EXTRACTION DEBUG ===');
        console.log('Attempting to extract sizes from variant...');
        console.log('First variant structure:', firstVariant);
        
        // Try customSizes first
        if (firstVariant.additionalData && firstVariant.additionalData.customSizes) {
          console.log('Found customSizes:', firstVariant.additionalData.customSizes);
          console.log('customSizes length:', firstVariant.additionalData.customSizes.length);
          console.log('customSizes type:', typeof firstVariant.additionalData.customSizes);
          
          if (Array.isArray(firstVariant.additionalData.customSizes)) {
            extractedSizes = firstVariant.additionalData.customSizes
              .filter(sizeData => {
                console.log('Checking sizeData:', sizeData);
                // More inclusive filter - accept if it's an object or has any meaningful data
                return sizeData && (
                  typeof sizeData === 'object' ||
                  sizeData.size || 
                  sizeData.quantity || 
                  sizeData.regularPrice || 
                  sizeData.salePrice ||
                  sizeData.price ||
                  Object.keys(sizeData || {}).length > 0
                );
              })
              .map(sizeData => {
                console.log('Mapping sizeData:', sizeData);
                return {
                  size: sizeData.size || sizeData.sizeName || sizeData.name || '',
                  quantity: sizeData.quantity || sizeData.stock || sizeData.stockQuantity || '',
                  hsnCode: sizeData.hsnCode || sizeData.hsn || '',
                  regularPrice: sizeData.regularPrice || sizeData.price || sizeData.basePrice || firstVariant.additionalData.regularPrice || '',
                  salePrice: sizeData.salePrice || sizeData.discountPrice || sizeData.offerPrice || firstVariant.additionalData.salePrice || '',
                  waistCm: sizeData.waistCm || sizeData.waist || '',
                  inseamCm: sizeData.inseamCm || sizeData.inseam || '',
                  chestCm: sizeData.chestCm || sizeData.chest || '',
                  frontLengthCm: sizeData.frontLengthCm || sizeData.frontLength || '',
                  acrossShoulderCm: sizeData.acrossShoulderCm || sizeData.shoulder || '',
                  waistIn: sizeData.waistIn || '',
                  inseamIn: sizeData.inseamIn || '',
                  chestIn: sizeData.chestIn || '',
                  frontLengthIn: sizeData.frontLengthIn || '',
                  acrossShoulderIn: sizeData.acrossShoulderIn || '',
                  sku: sizeData.sku || sizeData.skuCode || product.sku || '',
                  barcode: sizeData.barcode || sizeData.barcodeNumber || product.barcode || '',
                  metaTitle: product.metaTitle || '',
                  metaDescription: product.metaDescription || '',
                  slugUrl: product.slugUrl || '',
                  filters: sizeData.filters || {},
                  prices: sizeData.prices || {}
                };
              });
            console.log('After mapping, extractedSizes length:', extractedSizes.length);
          }
        }
        
        // Try stockSizes if customSizes is empty
        if (extractedSizes.length === 0 && firstVariant.additionalData && firstVariant.additionalData.stockSizes) {
          console.log('Found stockSizes:', firstVariant.additionalData.stockSizes);
          console.log('stockSizes length:', firstVariant.additionalData.stockSizes.length);
          console.log('stockSizes type:', typeof firstVariant.additionalData.stockSizes);
          
          if (Array.isArray(firstVariant.additionalData.stockSizes)) {
            extractedSizes = firstVariant.additionalData.stockSizes
              .filter(sizeData => {
                console.log('Checking stockSize:', sizeData);
                return sizeData && (sizeData.size || sizeData.quantity || typeof sizeData === 'string');
              })
              .map(sizeData => {
                console.log('Mapping stockSize:', sizeData);
                return {
                  size: sizeData.size || sizeData,
                  quantity: sizeData.quantity || '',
                  hsnCode: sizeData.hsnCode || '',
                  regularPrice: sizeData.regularPrice || firstVariant.additionalData.regularPrice || '',
                  salePrice: sizeData.salePrice || firstVariant.additionalData.salePrice || '',
                  waistCm: sizeData.waistCm || '',
                  inseamCm: sizeData.inseamCm || '',
                  chestCm: sizeData.chestCm || '',
                  frontLengthCm: sizeData.frontLengthCm || '',
                  acrossShoulderCm: sizeData.acrossShoulderCm || '',
                  waistIn: sizeData.waistIn || '',
                  inseamIn: sizeData.inseamIn || '',
                  chestIn: sizeData.chestIn || '',
                  frontLengthIn: sizeData.frontLengthIn || '',
                  acrossShoulderIn: sizeData.acrossShoulderIn || '',
                  sku: product.sku || '',
                  barcode: product.barcode || '',
                  metaTitle: product.metaTitle || '',
                  metaDescription: product.metaDescription || '',
                  slugUrl: product.slugUrl || '',
                  filters: {},
                  prices: {}
                };
              });
          }
        }
        
        // Try other potential size locations
        if (extractedSizes.length === 0) {
          console.log('Checking other potential size locations...');
          console.log('firstVariant.sizes:', firstVariant.sizes);
          console.log('firstVariant.stockSizes:', firstVariant.stockSizes);
          console.log('firstVariant.sizeData:', firstVariant.sizeData);
          
          // If we found customSizes but they were filtered out, let's see what they contain
          if (firstVariant.additionalData && firstVariant.additionalData.customSizes && firstVariant.additionalData.customSizes.length > 0) {
            console.log('=== RAW CUSTOM SIZES ANALYSIS ===');
            firstVariant.additionalData.customSizes.forEach((sizeItem, index) => {
              console.log(`CustomSize ${index}:`, sizeItem);
              console.log(`CustomSize ${index} keys:`, Object.keys(sizeItem || {}));
              console.log(`CustomSize ${index} type:`, typeof sizeItem);
            });
            
            // Try to extract regardless of filter for debugging
            console.log('Attempting to extract all customSizes without filtering...');
            const allCustomSizes = firstVariant.additionalData.customSizes.map((sizeData, index) => {
              console.log(`Processing customSize ${index}:`, sizeData);
              return {
                size: sizeData?.size || sizeData?.sizeName || sizeData?.name || `Size-${index}`,
                quantity: sizeData?.quantity || sizeData?.stock || sizeData?.stockQuantity || '',
                hsnCode: sizeData?.hsnCode || sizeData?.hsn || '',
                regularPrice: sizeData?.regularPrice || sizeData?.price || sizeData?.basePrice || firstVariant.additionalData?.regularPrice || '',
                salePrice: sizeData?.salePrice || sizeData?.discountPrice || sizeData?.offerPrice || firstVariant.additionalData?.salePrice || '',
                waistCm: sizeData?.waistCm || sizeData?.waist || '',
                inseamCm: sizeData?.inseamCm || sizeData?.inseam || '',
                chestCm: sizeData?.chestCm || sizeData?.chest || '',
                frontLengthCm: sizeData?.frontLengthCm || sizeData?.frontLength || '',
                acrossShoulderCm: sizeData?.acrossShoulderCm || sizeData?.shoulder || '',
                waistIn: sizeData?.waistIn || '',
                inseamIn: sizeData?.inseamIn || '',
                chestIn: sizeData?.chestIn || '',
                frontLengthIn: sizeData?.frontLengthIn || '',
                acrossShoulderIn: sizeData?.acrossShoulderIn || '',
                sku: sizeData?.sku || sizeData?.skuCode || product.sku || '',
                barcode: sizeData?.barcode || sizeData?.barcodeNumber || product.barcode || '',
                metaTitle: product.metaTitle || '',
                metaDescription: product.metaDescription || '',
                slugUrl: product.slugUrl || '',
                filters: sizeData?.filters || {},
                prices: sizeData?.prices || {},
                // Include all original properties for debugging
                originalData: sizeData
              };
            });
            
            if (allCustomSizes.length > 0) {
              console.log('Force extracted sizes:', allCustomSizes);
              extractedSizes = allCustomSizes;
            }
          }
        }
      }
      
      // Fallback: check if product has direct sizes property
      if (extractedSizes.length === 0 && product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
        console.log('Using fallback: product.sizes:', product.sizes);
        extractedSizes = product.sizes.map(size => ({
          size: typeof size === 'string' ? size : size.size || size.name || '',
          quantity: size.quantity || '',
          hsnCode: size.hsnCode || '',
          regularPrice: size.regularPrice || size.price || '',
          salePrice: size.salePrice || '',
          waistCm: size.waistCm || '',
          inseamCm: size.inseamCm || '',
          chestCm: size.chestCm || '',
          frontLengthCm: size.frontLengthCm || '',
          acrossShoulderCm: size.acrossShoulderCm || '',
          waistIn: size.waistIn || '',
          inseamIn: size.inseamIn || '',
          chestIn: size.chestIn || '',
          frontLengthIn: size.frontLengthIn || '',
          acrossShoulderIn: size.acrossShoulderIn || '',
          sku: size.sku || product.sku || '',
          barcode: size.barcode || product.barcode || '',
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          slugUrl: product.slugUrl || '',
          filters: {},
          prices: {}
        }));
      }
      
      console.log('Extracted sizes count:', extractedSizes.length);
      console.log('Extracted sizes:', extractedSizes);
      
      // If no sizes found, create one default entry to show the form structure
      if (extractedSizes.length === 0) {
        console.log('No sizes found, creating default entry for product:', product.productName);
        extractedSizes = [{
          size: '',
          quantity: '',
          hsnCode: '',
          regularPrice: product.variants?.[0]?.additionalData?.regularPrice || '',
          salePrice: product.variants?.[0]?.additionalData?.salePrice || '',
          waistCm: '', inseamCm: '', chestCm: '', frontLengthCm: '', acrossShoulderCm: '',
          waistIn: '', inseamIn: '', chestIn: '', frontLengthIn: '', acrossShoulderIn: '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          slugUrl: product.slugUrl || '',
          filters: {},
          prices: {}
        }];
      }
      
      // Update formData with sizes and set customSizes state
      setFormData(prev => ({
        ...prev,
        sizes: extractedSizes.map(size => size.size).filter(Boolean)
      }));
      
      // Set stock size option based on existing data
      if (extractedSizes.length > 0) {
        setStockSizeOption('sizes');
        setCustomSizes(extractedSizes);
      } else if (product.sizes && product.sizes.length > 0) {
        setStockSizeOption('sizes');
        const fallbackSizes = product.sizes.map(size => ({
          size: size,
          quantity: '',
          hsnCode: '',
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
          sku: '',
          barcode: '',
          metaTitle: '',
          metaDescription: '',
          slugUrl: '',
          filters: {},
          prices: {}
        }));
        setCustomSizes(fallbackSizes);
        setFormData(prev => ({
          ...prev,
          sizes: product.sizes
        }));
      } else {
        setStockSizeOption('noSize');
        setCustomSizes([]);
        setFormData(prev => ({
          ...prev,
          sizes: []
        }));
      }
      
      console.log('Extracted sizes:', extractedSizes); // Debug log
      
      setFormData({
        productName: product.productName || product.name || '',
        title: product.title || '',
        description: product.description || '',
        manufacturingDetails: product.manufacturingDetails || '',
        shippingReturnsExchange: product.shippingAndReturns?.additionalInfo || product.shippingReturnsExchange || '',
        returnable: product.returnable !== undefined ? product.returnable : true,
        
        images: product.images || [],
        videos: product.videos || [],
        
        sizes: product.sizes || [],
        
        price: product.price || product.regularPrice || '',
        salePrice: product.salePrice || '',
        
        sku: product.sku || '',
        hsn: product.hsn || '',
        barcodeNo: product.barcode || product.barcodeNo || '',
        
        toFitWaistCm: product.measurements?.toFitWaistCm || '',
        inseamLengthCm: product.measurements?.inseamLengthCm || '',
        chestCm: product.measurements?.chestCm || '',
        frontLengthCm: product.measurements?.frontLengthCm || '',
        acrossShoulderCm: product.measurements?.acrossShoulderCm || '',
        
        toFitWaistIn: product.measurements?.toFitWaistIn || '',
        inseamLengthIn: product.measurements?.inseamLengthIn || '',
        chestIn: product.measurements?.chestIn || '',
        frontLengthIn: product.measurements?.frontLengthIn || '',
        acrossShoulderIn: product.measurements?.acrossShoulderIn || '',
        
        metaTitle: product.metaTitle || product.seo?.metaTitle || '',
        metaDescription: product.metaDescription || product.seo?.metaDescription || '',
        slugUrl: product.slugUrl || product.seo?.slugUrl || '',
        filters: product.filters || []
      });
      
      console.log('=== FORM DATA SET ===');
      console.log('Form data updated with product:', {
        productName: product.productName || product.name || '',
        title: product.title || '',
        description: product.description || '',
        manufacturingDetails: product.manufacturingDetails || '',
        price: product.price || product.regularPrice || '',
        salePrice: product.salePrice || ''
      });
    } else {
      console.log('No product found to populate form');
    }
  }, [selectedItem, productId]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = async (files, index) => {
    if (!files.length) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [`image-${index}`]: 0 }));
      
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      
      // Update this URL to match your backend endpoint
      const response = await axios.post('/api/upload/image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [`image-${index}`]: progress }));
        }
      });

      if (response.data.success) {
        const newImages = [...formData.images];
        newImages[index] = response.data.imageUrl;
        handleInputChange('images', newImages);
        showNotification('Image uploaded successfully', 'success');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      showNotification('Failed to upload image', 'error');
    } finally {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[`image-${index}`];
        return newProgress;
      });
    }
  };

  // Handle video upload
  const handleVideoUpload = async (files, index) => {
    if (!files.length) return;

    const file = files[0];
    if (!file.type.startsWith('video/')) {
      showNotification('Please select a valid video file', 'error');
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [`video-${index}`]: 0 }));
      
      const formDataUpload = new FormData();
      formDataUpload.append('video', file);
      
      // Update this URL to match your backend endpoint
      const response = await axios.post('/api/upload/video', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [`video-${index}`]: progress }));
        }
      });

      if (response.data.success) {
        const newVideos = [...formData.videos];
        newVideos[index] = response.data.videoUrl;
        handleInputChange('videos', newVideos);
        showNotification('Video uploaded successfully', 'success');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      showNotification('Failed to upload video', 'error');
    } finally {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[`video-${index}`];
        return newProgress;
      });
    }
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  };

  // Remove video
  const removeVideo = (index) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    handleInputChange('videos', newVideos);
  };

  // Add size
  const addSize = () => {
    const newSize = {
      size: '',
      quantity: '',
      hsnCode: generateHSNCode('clothing'),
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
      sku: '',
      barcode: generateBarcode(),
      metaTitle: '',
      metaDescription: '',
      slugUrl: '',
      filters: {}
    };
    setCustomSizes(prev => [...prev, newSize]);
  };

  // Update size
  const updateSize = (index, field, value) => {
    setCustomSizes(prev => 
      prev.map((size, i) => {
        if (i === index) {
          const updatedSize = { ...size, [field]: value };
          
          // Auto-generate SKU when size is entered
          if (field === 'size' && value && !size.sku) {
            updatedSize.sku = generateSKU(
              'clothing',
              'general',
              formData.productName,
              value
            );
          }
          
          return updatedSize;
        }
        return size;
      })
    );
  };

  // Remove size
  const removeSize = (index) => {
    setCustomSizes(prev => prev.filter((_, i) => i !== index));
  };

  // Handle stock size option change
  const handleStockSizeOptionChange = (option) => {
    setStockSizeOption(option);
    if (option === 'noSize') {
      setCustomSizes([]);
      handleInputChange('sizes', []);
    }
  };

  // Handle how to measure image upload
  const handleHowToMeasureUpload = async (files) => {
    if (!files.length) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    try {
      setHowToMeasureUploadStatus({ progress: 0, status: 'uploading' });
      
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      
      // Create preview
      const fileData = {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading',
      };
      
      setHowToMeasureImage(fileData);
      
      // Update this URL to match your backend endpoint
      const response = await axios.post('/api/upload/how-to-measure', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setHowToMeasureUploadStatus({ progress, status: progress >= 100 ? 'success' : 'uploading' });
          setHowToMeasureImage(prev => ({ ...prev, progress, status: progress >= 100 ? 'success' : 'uploading' }));
        }
      });

      if (response.data.success) {
        setHowToMeasureImage(prev => ({
          ...prev,
          url: response.data.imageUrl,
          status: 'success',
          progress: 100,
        }));
        setHowToMeasureUploadStatus({ progress: 100, status: 'success' });
        showNotification('How to measure image uploaded successfully!', 'success');
      }
    } catch (error) {
      console.error('How to measure image upload error:', error);
      setHowToMeasureImage(prev => ({ ...prev, status: 'failed', progress: 0 }));
      setHowToMeasureUploadStatus({ progress: 0, status: 'failed' });
      showNotification('Failed to upload how to measure image', 'error');
    }
  };

  // Remove how to measure image
  const removeHowToMeasureImage = () => {
    if (howToMeasureImage?.preview) {
      URL.revokeObjectURL(howToMeasureImage.preview);
    }
    setHowToMeasureImage(null);
    setHowToMeasureUploadStatus(null);
  };

  // Add filter
  const addFilter = () => {
    const newFilters = [...formData.filters, ''];
    handleInputChange('filters', newFilters);
  };

  // Update filter
  const updateFilter = (index, value) => {
    const newFilters = [...formData.filters];
    newFilters[index] = value;
    handleInputChange('filters', newFilters);
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const updateData = {
        ...formData,
        sizes: stockSizeOption === 'sizes' ? customSizes.filter(s => s.size && s.size.trim()).map(s => ({
          size: s.size,
          quantity: parseInt(s.quantity) || 0,
          regularPrice: parseFloat(s.regularPrice) || formData.regularPrice || 0,
          salePrice: parseFloat(s.salePrice) || formData.salePrice || 0,
          hsnCode: s.hsnCode || '',
          sku: s.sku || '',
          barcode: s.barcode || '',
          waistCm: s.waistCm || '',
          inseamCm: s.inseamCm || '',
          waistIn: s.waistIn || '',
          inseamIn: s.inseamIn || ''
        })) : [],
        measurements: {
          toFitWaistCm: formData.toFitWaistCm,
          inseamLengthCm: formData.inseamLengthCm,
          chestCm: formData.chestCm,
          frontLengthCm: formData.frontLengthCm,
          acrossShoulderCm: formData.acrossShoulderCm,
          toFitWaistIn: formData.toFitWaistIn,
          inseamLengthIn: formData.inseamLengthIn,
          chestIn: formData.chestIn,
          frontLengthIn: formData.frontLengthIn,
          acrossShoulderIn: formData.acrossShoulderIn
        },
        seo: {
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          slugUrl: formData.slugUrl
        }
      };

      const result = await dispatch(updateItem({ 
        itemId: productId, 
        itemData: updateData 
      }));

      if (updateItem.fulfilled.match(result)) {
        showNotification('Product updated successfully!', 'success');
        setTimeout(() => {
          navigate('/manage-items');
        }, 2000);
      } else {
        showNotification(result.payload || 'Failed to update product', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showNotification('Failed to update product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/manage-items')}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-['Montserrat'] font-medium text-black">Edit Item</h1>
          </div>
          <button
            onClick={() => navigate('/manage-items')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Images Section */}
          <div className="mb-8">
            <h2 className="text-xl font-['Montserrat'] font-medium text-black mb-4">Images</h2>
            <div className="grid grid-cols-5 gap-4 mb-4">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="relative">
                  {formData.images[index] ? (
                    <div className="relative w-32 h-28 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={formData.images[index]}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                        <span className="text-red-500 text-xs font-['Montserrat']">remove image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files, index)}
                        className="hidden"
                        ref={(el) => (imageInputRefs.current[index] = el)}
                      />
                      <button
                        onClick={() => imageInputRefs.current[index]?.click()}
                        className="p-2 bg-blue-500 text-white rounded-lg text-xs font-['Montserrat'] hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Upload Image
                      </button>
                      {uploadProgress[`image-${index}`] !== undefined && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${uploadProgress[`image-${index}`]}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Videos Section */}
          <div className="mb-8">
            <h2 className="text-xl font-['Montserrat'] font-medium text-black mb-4">Videos</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={index} className="relative">
                  {formData.videos[index] ? (
                    <div className="relative w-32 h-28 rounded-lg overflow-hidden border-2 border-gray-200">
                      <video
                        src={formData.videos[index]}
                        className="w-full h-full object-cover"
                        controls
                      />
                      <button
                        onClick={() => removeVideo(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                        <span className="text-red-500 text-xs font-['Montserrat']">remove video</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoUpload(e.target.files, index)}
                        className="hidden"
                        ref={(el) => (videoInputRefs.current[index] = el)}
                      />
                      <button
                        onClick={() => videoInputRefs.current[index]?.click()}
                        className="p-2 bg-blue-500 text-white rounded-lg text-xs font-['Montserrat'] hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Upload Video
                      </button>
                      {uploadProgress[`video-${index}`] !== undefined && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${uploadProgress[`video-${index}`]}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* How to Measure Image Section */}
          <div className="mb-8">
            <h2 className="text-xl font-['Montserrat'] font-medium text-black mb-4">How to Measure</h2>
            <div className="space-y-4">
              {!howToMeasureImage ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleHowToMeasureUpload(e.target.files)}
                    id="howToMeasureUpload"
                  />
                  <label 
                    htmlFor="howToMeasureUpload"
                    className="cursor-pointer block w-full max-w-md p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700 font-['Montserrat'] text-center">
                        {howToMeasureUploadStatus?.status === 'uploading'
                          ? "Uploading..."
                          : "Click to upload measurement guide image"
                        }
                      </p>
                      <p className="text-xs text-gray-500 font-['Montserrat'] text-center mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                      {howToMeasureUploadStatus?.status === 'uploading' && (
                        <div className="w-full max-w-xs mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${howToMeasureUploadStatus.progress || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 text-center">
                            {Math.round(howToMeasureUploadStatus.progress || 0)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Image Preview */}
                  {howToMeasureImage.preview && (
                    <div className="relative w-full max-w-md">
                      <img
                        src={howToMeasureImage.preview}
                        alt="How to measure"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <button
                        onClick={removeHowToMeasureImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Upload Status */}
                  {howToMeasureImage.status === 'success' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-700 font-['Montserrat']">
                          How to measure image uploaded successfully
                        </span>
                      </div>
                      <button
                        onClick={removeHowToMeasureImage}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {howToMeasureImage.status === 'failed' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-sm text-red-700 font-['Montserrat']">
                          Failed to upload how to measure image
                        </span>
                      </div>
                      <button
                        onClick={removeHowToMeasureImage}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Returnable Section */}
          <div className="mb-8">
            <h3 className="text-lg font-['Montserrat'] font-medium text-black mb-4">Returnable</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleInputChange('returnable', true)}
                className={`px-6 py-2 rounded-full text-sm font-['Montserrat'] font-medium transition-colors ${
                  formData.returnable
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-black border border-gray-300'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleInputChange('returnable', false)}
                className={`px-6 py-2 rounded-full text-sm font-['Montserrat'] font-medium transition-colors ${
                  !formData.returnable
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-black border border-gray-300'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-lg font-['Montserrat'] font-medium text-black mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full p-3 border-2 border-black rounded-xl font-['Montserrat']"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="block text-lg font-['Montserrat'] font-medium text-black mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-3 border-2 border-black rounded-xl font-['Montserrat']"
                placeholder="Enter title"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-lg font-['Montserrat'] font-medium text-black mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full p-3 border-2 border-black rounded-xl font-['Montserrat']"
              placeholder="Enter description"
            />
          </div>

          {/* Manufacturing Details */}
          <div className="mb-8">
            <label className="block text-lg font-['Montserrat'] font-medium text-black mb-2">
              Manufacturing Details
            </label>
            <textarea
              value={formData.manufacturingDetails}
              onChange={(e) => handleInputChange('manufacturingDetails', e.target.value)}
              rows={4}
              className="w-full p-3 border-2 border-black rounded-xl font-['Montserrat']"
              placeholder="Enter manufacturing details"
            />
          </div>

          {/* Shipping Returns and Exchange */}
          <div className="mb-8">
            <label className="block text-lg font-['Montserrat'] font-medium text-black mb-2">
              Shipping Returns and Exchange
            </label>
            <textarea
              value={formData.shippingReturnsExchange}
              onChange={(e) => handleInputChange('shippingReturnsExchange', e.target.value)}
              rows={4}
              className="w-full p-3 border-2 border-black rounded-xl font-['Montserrat']"
              placeholder="Enter shipping, returns and exchange policy"
            />
          </div>

          {/* Sizes Section */}
          <div className="mb-8">
            <div className="space-y-4">
              <label className="block text-lg font-['Montserrat'] font-medium text-black">
                Stock Size
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleStockSizeOptionChange('noSize')}
                  className={`px-4 py-2 rounded-md text-sm font-['Montserrat'] font-medium transition-colors ${
                    stockSizeOption === 'noSize'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  No Size
                </button>
                <button
                  type="button"
                  onClick={() => handleStockSizeOptionChange('sizes')}
                  className={`px-4 py-2 rounded-md text-sm font-['Montserrat'] font-medium transition-colors ${
                    stockSizeOption === 'sizes'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  Add Size
                </button>
              </div>

              {/* Size Table - only show when sizes option is selected */}
              {stockSizeOption === 'sizes' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                        <tr>
                          {[
                            "Size",
                            "Quantity",
                            "HSN",
                            "Regular Price",
                            "Sale Price",
                            "To fit waist(cm)",
                            "Inseam Length(cm)",
                            "Chest(cm)",
                            "Front Length(cm)",
                            "Across Shoulder(cm)",
                            "To fit waist(in)",
                            "Inseam Length(in)",
                            "Chest(in)",
                            "Front Length(in)",
                            "Across Shoulder(in)",
                            "SKU",
                            "Barcode",
                            "Meta Title",
                            "Meta Description",
                            "Slug URL",
                            "Actions"
                          ].map((header) => (
                            <th
                              key={header}
                              className="px-3 py-2 text-left font-['Montserrat']"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {customSizes.map((sizeData, index) => (
                          <tr key={index}>
                            {/* Size */}
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={sizeData.size}
                                onChange={(e) => updateSize(index, "size", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded font-['Montserrat']"
                                placeholder="Size"
                              />
                            </td>
                            
                            {/* Quantity */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={sizeData.quantity}
                                onChange={(e) => updateSize(index, "quantity", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded font-['Montserrat']"
                                placeholder="Quantity"
                              />
                            </td>
                            
                            {/* HSN Code with Generate button */}
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={sizeData.hsnCode}
                                  onChange={(e) => updateSize(index, "hsnCode", e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                  placeholder="HSN Code"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateSize(index, "hsnCode", generateHSNCode('clothing'))}
                                  className="px-1 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                  title="Generate HSN Code"
                                >
                                  Gen
                                </button>
                              </div>
                            </td>
                            
                            {/* Regular Price */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={sizeData.regularPrice || ""}
                                onChange={(e) => updateSize(index, "regularPrice", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            
                            {/* Sale Price */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={sizeData.salePrice || ""}
                                onChange={(e) => updateSize(index, "salePrice", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            
                            {/* To fit waist(cm) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={sizeData.waistCm || ""}
                                onChange={(e) => updateSize(index, "waistCm", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Waist cm"
                              />
                            </td>
                            
                            {/* Inseam Length(cm) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={sizeData.inseamCm || ""}
                                onChange={(e) => updateSize(index, "inseamCm", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Inseam cm"
                              />
                            </td>
                            
                            {/* Chest(cm) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={sizeData.chestCm || ""}
                                onChange={(e) => updateSize(index, "chestCm", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Chest cm"
                              />
                            </td>
                            
                            {/* Front Length(cm) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={sizeData.frontLengthCm || ""}
                                onChange={(e) => updateSize(index, "frontLengthCm", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Front Length cm"
                              />
                            </td>
                            
                            {/* Across Shoulder(cm) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={sizeData.acrossShoulderCm || ""}
                                onChange={(e) => updateSize(index, "acrossShoulderCm", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Across Shoulder cm"
                              />
                            </td>
                            
                            {/* To fit waist(in) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={sizeData.waistIn || ""}
                                onChange={(e) => updateSize(index, "waistIn", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Waist in"
                              />
                            </td>
                            
                            {/* Inseam Length(in) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={sizeData.inseamIn || ""}
                                onChange={(e) => updateSize(index, "inseamIn", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Inseam in"
                              />
                            </td>
                            
                            {/* Chest(in) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={sizeData.chestIn || ""}
                                onChange={(e) => updateSize(index, "chestIn", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Chest in"
                              />
                            </td>
                            
                            {/* Front Length(in) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={sizeData.frontLengthIn || ""}
                                onChange={(e) => updateSize(index, "frontLengthIn", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Front Length in"
                              />
                            </td>
                            
                            {/* Across Shoulder(in) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={sizeData.acrossShoulderIn || ""}
                                onChange={(e) => updateSize(index, "acrossShoulderIn", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Across Shoulder in"
                              />
                            </td>
                            
                            {/* SKU with Generate button */}
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={sizeData.sku}
                                  onChange={(e) => updateSize(index, "sku", e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                  placeholder="SKU"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateSize(
                                    index, 
                                    "sku", 
                                    generateSKU('clothing', 'general', formData.productName, sizeData.size)
                                  )}
                                  className="px-1 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                  title="Generate SKU"
                                >
                                  Gen
                                </button>
                              </div>
                            </td>
                            
                            {/* Barcode with Generate button */}
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={sizeData.barcode}
                                  onChange={(e) => updateSize(index, "barcode", e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                  placeholder="Barcode"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateSize(index, "barcode", generateBarcode())}
                                  className="px-1 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                  title="Generate Barcode"
                                >
                                  Gen
                                </button>
                              </div>
                            </td>
                            
                            {/* Meta Title */}
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={sizeData.metaTitle || ""}
                                onChange={(e) => updateSize(index, "metaTitle", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Meta Title"
                              />
                            </td>
                            
                            {/* Meta Description */}
                            <td className="px-3 py-2">
                              <textarea
                                value={sizeData.metaDescription || ""}
                                onChange={(e) => updateSize(index, "metaDescription", e.target.value)}
                                rows={2}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                placeholder="Meta Description"
                              />
                            </td>
                            
                            {/* Slug URL */}
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={sizeData.slugUrl || ""}
                                  onChange={(e) => updateSize(index, "slugUrl", e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-['Montserrat']"
                                  placeholder="slug-url"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const sourceText = `${formData.productName || formData.title}-${sizeData.size}`;
                                    if (sourceText) {
                                      updateSize(index, "slugUrl", generateSlugUrl(sourceText));
                                    }
                                  }}
                                  className="px-1 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                  title="Generate Slug URL"
                                >
                                  Gen
                                </button>
                              </div>
                            </td>
                            
                            {/* Actions */}
                            <td className="px-3 py-2">
                              <button
                                onClick={() => removeSize(index)}
                                className="p-1 text-red-500 hover:text-red-700"
                                title="Remove Size"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-['Montserrat'] font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Size
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-8">
            <button
              onClick={() => navigate('/manage-items')}
              className="px-12 py-3 border border-gray-300 rounded-full text-black font-['Montserrat'] font-medium hover:bg-gray-50"
            >
              go back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-12 py-3 bg-black text-white rounded-full font-['Montserrat'] font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300'
            : notification.type === 'error'
            ? 'bg-red-100 text-red-800 border border-red-300'
            : 'bg-blue-100 text-blue-800 border border-blue-300'
        }`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <XCircle className="w-5 h-5" />}
          {notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span className="font-['Montserrat']">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 p-1 hover:bg-gray-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SingleProductUploadEditDrafts;
