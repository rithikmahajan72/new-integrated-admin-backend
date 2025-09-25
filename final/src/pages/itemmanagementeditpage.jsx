import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, Plus, Upload, Trash2, Save, ArrowLeft, ChevronDown, RefreshCw } from 'lucide-react';
import { itemAPI, categoryAPI, subCategoryAPI, filterAPI } from '../api/endpoints';
import FilterTest from '../components/FilterTest';
import { 
  fetchItemById, 
  selectCurrentItem, 
  selectCurrentItemLoading, 
  selectItemsError,
  selectUpdateLoading 
} from '../store/slices/itemSlice';
import { 
  fetchFilters,
  selectAvailableFilters,
  selectFilterLoading 
} from '../store/slices/filtersSlice';

const ItemManagementEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux selectors
  const item = useSelector(selectCurrentItem);
  const loading = useSelector(selectCurrentItemLoading);
  const updateLoading = useSelector(selectUpdateLoading);
  const error = useSelector((state) => state.items?.currentItemError || state.products?.currentItemError);
  const filters = useSelector(selectAvailableFilters);
  const filtersLoading = useSelector(selectFilterLoading);
  
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // File refs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  
  // Media states
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [uploadingVideos, setUploadingVideos] = useState([]);
  
  // Form data state
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

  // Size management state
  const [stockSizeOption, setStockSizeOption] = useState('addSize');
  
  // Filter management state
  const [sizeFilterDropdowns, setSizeFilterDropdowns] = useState({}); // Track which dropdown is open for each size
  const [selectedFilterValues, setSelectedFilterValues] = useState({}); // Track selected filter values for each size {sizeId: [valueId1, valueId2, ...]}
  const [filterSearchTerm, setFilterSearchTerm] = useState(''); // Search term for filters
  
  // Category and subcategory states
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  // Modal states removed - using dropdowns instead
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);
  const [currentSize, setCurrentSize] = useState({
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
  });

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      console.log('Loading item data:', item);
      setFormData({
        productName: item.productName || '',
        title: item.title || '',
        description: item.description || '',
        manufacturingDetails: item.manufacturingDetails || '',
        shippingAndReturns: item.shippingAndReturns || '',
        returnable: item.returnable !== undefined ? item.returnable : true,
        sizes: item.sizes || [],
        categoryId: item.categoryId || item.category?._id || null,
        subCategoryId: item.subCategoryId || item.subCategory?._id || null
      });

      // Set selected category and subcategory for display
      if (item.category) {
        setSelectedCategory({
          id: item.category._id || item.categoryId,
          name: item.category.name || 'Unknown Category'
        });
      }
      if (item.subCategory) {
        setSelectedSubCategory({
          id: item.subCategory._id || item.subCategoryId,
          name: item.subCategory.name || 'Unknown Subcategory'
        });
      }
      
      // Load existing images and videos
      if (item.images) {
        setImages(item.images.map((url, index) => ({ 
          id: Date.now() + index, 
          url, 
          filename: `image_${index}`,
          isExisting: true 
        })));
      }
      if (item.videos) {
        setVideos(item.videos.map((url, index) => ({ 
          id: Date.now() + index, 
          url, 
          filename: `video_${index}`,
          isExisting: true 
        })));
      }

      // Set size option and map size fields
      if (item.sizes && item.sizes.length > 0) {
        setStockSizeOption('addSize');
        // Map API fields to component fields
        const mappedSizes = item.sizes.map((size, index) => ({
          id: size._id || Date.now() + index,
          sizeName: size.size || size.sizeName || '',
          quantity: size.quantity || 0,
          hsn: size.hsnCode || size.hsn || '',
          sku: size.sku || '',
          barcodeNo: size.barcode || size.barcodeNo || '',
          regularPrice: size.regularPrice || 0,
          salePrice: size.salePrice || 0,
          waistCm: size.fitWaistCm || size.waistCm || '',
          inseamCm: size.inseamLengthCm || size.inseamCm || '',
          chestCm: size.chestCm || '',
          frontLengthCm: size.frontLengthCm || '',
          acrossShoulderCm: size.acrossShoulderCm || '',
          waistIn: size.toFitWaistIn || size.waistIn || '',
          inseamIn: size.inseamLengthIn || size.inseamIn || '',
          chestIn: size.chestIn || '',
          frontLengthIn: size.frontLengthIn || '',
          acrossShoulderIn: size.acrossShoulderIn || '',
          metaTitle: size.metaTitle || '',
          metaDescription: size.metaDescription || '',
          slugUrl: size.slugUrl || '',
          assignedFilters: size.assignedFilters || []
        }));
        
        setFormData(prev => ({
          ...prev,
          sizes: mappedSizes
        }));
      }
    }
  }, [item]);

  // Fetch item data when component mounts
  useEffect(() => {
    if (id) {
      console.log('🔍 Fetching item with ID:', id);
      console.log('🔍 Dispatch function:', dispatch);
      dispatch(fetchItemById(id))
        .unwrap()
        .then((data) => {
          console.log('✅ Successfully fetched item:', data);
        })
        .catch((error) => {
          console.error('❌ Failed to fetch item:', error);
          if (error.includes('Item not found') || error.includes('404')) {
            setLocalError(`Item not found. Please check the item ID: ${id}. You can try with a valid ID like: 68d0c83a05170a99e8952a45`);
          } else {
            setLocalError(`Failed to load item: ${error}`);
          }
        });
      
      // Fetch filters for the dropdown
      console.log('🔍 About to fetch filters...');
      dispatch(fetchFilters())
        .unwrap()
        .then((data) => {
          console.log('✅ Successfully fetched filters:', data);
          console.log('✅ Filters length:', data?.length);
          console.log('✅ First filter sample:', data?.[0]);
        })
        .catch((error) => {
          console.error('❌ Failed to fetch filters:', error);
        });
    }
  }, [id, dispatch]);

  // Debug effect for filters state
  useEffect(() => {
    console.log('🔍 Filters state changed:', {
      filters,
      filtersLoading,
      filtersLength: filters?.length,
      firstFilter: filters?.[0]
    });
  }, [filters, filtersLoading]);

  // Debug filter state
  useEffect(() => {
    console.log('🔍 Filters state updated:', {
      filters,
      filtersLength: filters?.length,
      filtersLoading,
      filterState: filters
    });
  }, [filters, filtersLoading]);

  // Test direct API call
  useEffect(() => {
    const testDirectFetch = async () => {
      try {
        console.log('🧪 Testing direct filter API call...');
        const response = await filterAPI.getAllFilters();
        console.log('🧪 Direct API response:', response.data);
      } catch (error) {
        console.error('🧪 Direct API error:', error);
      }
    };
    
    if (id) {
      testDirectFetch();
    }
  }, [id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown-container')) {
        setSizeFilterDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize selected filter values when item loads
  useEffect(() => {
    if (item && item.sizes) {
      const initialSelectedFilterValues = {};
      item.sizes.forEach(size => {
        if (size.assignedFilters && size.assignedFilters.length > 0) {
          initialSelectedFilterValues[size.id] = size.assignedFilters.map(f => f.valueId).filter(Boolean);
        } else {
          initialSelectedFilterValues[size.id] = [];
        }
      });
      setSelectedFilterValues(initialSelectedFilterValues);
    }
  }, [item]);

  // Debug log when item data changes
  useEffect(() => {
    console.log('🎯 Item data updated:', item);
    console.log('🚨 Current error:', error);
    console.log('⏳ Loading state:', loading);
  }, [item, error, loading]);

  // Load categories on component mount
  useEffect(() => {
    console.log('🚀 Component mounted, loading categories...');
    console.log('🔑 Auth token available:', !!localStorage.getItem('authToken'));
    console.log('👤 User data available:', !!localStorage.getItem('userData'));
    loadCategories();
  }, []);

  // Load subcategories when category is selected
  useEffect(() => {
    if (selectedCategory) {
      loadSubCategories(selectedCategory.id);
    } else {
      setSubCategories([]);
      setSelectedSubCategory(null);
    }
  }, [selectedCategory]);

  // Load categories function
  const loadCategories = async () => {
    try {
      setCategoryLoading(true);
      console.log('🏷️ Loading categories...');
      const response = await categoryAPI.getAllCategories();
      console.log('🏷️ Categories response:', response.data);
      
      // Backend response structure: {success: true, data: [...], message: "..."}
      const categoriesData = response.data.data || [];
      console.log('🏷️ Extracted categories:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      setLocalError('Failed to load categories');
      setCategories([]); // Ensure categories is always an array
    } finally {
      setCategoryLoading(false);
    }
  };

  // Load subcategories function
  const loadSubCategories = async (categoryId) => {
    try {
      setSubCategoryLoading(true);
      console.log('🏷️ Loading subcategories for category:', categoryId);
      const response = await subCategoryAPI.getSubCategoriesByCategory(categoryId);
      console.log('🏷️ Subcategories response:', response.data);
      
      // Handle both response formats: {success: true, data: [...]} or [...] or {data: [...]}
      let subCategoriesData = [];
      if (Array.isArray(response.data)) {
        subCategoriesData = response.data;
      } else if (response.data.data) {
        subCategoriesData = response.data.data;
      } else if (response.data.success && response.data.data) {
        subCategoriesData = response.data.data;
      }
      
      console.log('🏷️ Extracted subcategories:', subCategoriesData);
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error('❌ Failed to load subcategories:', error);
      console.error('Error details:', error.response?.data);
      setLocalError('Failed to load subcategories');
      setSubCategories([]); // Ensure subCategories is always an array
    } finally {
      setSubCategoryLoading(false);
    }
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSizeInputChange = (field, value) => {
    setCurrentSize(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Size management
  const addSize = () => {
    if (!currentSize.sizeName.trim()) {
      setLocalError('Size name is required');
      return;
    }

    const newSizeId = Date.now().toString();
    const selectedValuesForNewSize = selectedFilterValues['new'] || [];
    
    // Group values by filter and create assigned filters
    const assignedFilters = [];
    const valuesByFilter = {};
    
    selectedValuesForNewSize.forEach(valueId => {
      // Find which filter this value belongs to
      const parentFilter = filters?.find(filter => 
        filter.values?.some(value => value._id === valueId)
      );
      if (parentFilter) {
        if (!valuesByFilter[parentFilter._id]) {
          valuesByFilter[parentFilter._id] = [];
        }
        valuesByFilter[parentFilter._id].push(valueId);
      }
    });
    
    // Create assigned filters array
    Object.entries(valuesByFilter).forEach(([filterId, valueIds]) => {
      valueIds.forEach(valueId => {
        assignedFilters.push({ filterId, valueId });
      });
    });

    const newSize = {
      id: newSizeId,
      ...currentSize,
      quantity: parseInt(currentSize.quantity) || 0,
      regularPrice: parseFloat(currentSize.regularPrice) || 0,
      salePrice: parseFloat(currentSize.salePrice) || 0,
      assignedFilters,
    };

    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, newSize]
    }));

    // Update selected filter values state to include the new size
    setSelectedFilterValues(prev => ({
      ...prev,
      [newSizeId]: selectedValuesForNewSize,
      'new': [] // Clear the 'new' filters for next size
    }));

    // Reset current size form
    setCurrentSize({
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
    });
  };

  const removeSize = (sizeId) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size.id !== sizeId)
    }));
  };

  // Update existing size
  const updateExistingSize = (sizeId, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(size => 
        size.id === sizeId 
          ? { 
              ...size, 
              [field]: field === 'quantity' || field === 'regularPrice' || field === 'salePrice' 
                ? (value === '' ? '' : Number(value))
                : value
            }
          : size
      )
    }));
  };

  // Filter management functions
  const toggleFilterDropdown = (sizeId, filterId) => {
    setSizeFilterDropdowns(prev => ({
      ...prev,
      [`${sizeId}_${filterId}`]: !prev[`${sizeId}_${filterId}`]
    }));
  };

  const assignFilterToSize = (sizeId, filterId, variantId) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(size => {
        if (size.id === sizeId) {
          const currentFilters = size.assignedFilters || [];
          const filterExists = currentFilters.find(f => f.filterId === filterId);
          
          if (filterExists) {
            // Update existing filter assignment
            return {
              ...size,
              assignedFilters: currentFilters.map(f => 
                f.filterId === filterId 
                  ? { ...f, variantId }
                  : f
              )
            };
          } else {
            // Add new filter assignment
            return {
              ...size,
              assignedFilters: [
                ...currentFilters,
                { filterId, variantId }
              ]
            };
          }
        }
        return size;
      })
    }));

    // Close the dropdown
    setSizeFilterDropdowns(prev => ({
      ...prev,
      [`${sizeId}_${filterId}`]: false
    }));
  };

  const removeFilterFromSize = (sizeId, filterId) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(size => {
        if (size.id === sizeId) {
          return {
            ...size,
            assignedFilters: (size.assignedFilters || []).filter(f => f.filterId !== filterId)
          };
        }
        return size;
      })
    }));
  };

  // New filter management functions for real-time functionality
  const toggleFilterValueForSize = (sizeId, filterId, valueId) => {
    setSelectedFilterValues(prev => {
      const currentValues = prev[sizeId] || [];
      const newValues = currentValues.includes(valueId)
        ? currentValues.filter(id => id !== valueId)
        : [...currentValues, valueId];
      
      // Update form data as well for consistency (skip for 'new' size as it's not in formData yet)
      if (sizeId !== 'new') {
        setFormData(prevForm => ({
          ...prevForm,
          sizes: prevForm.sizes.map(size => {
            if (size.id === sizeId || size.id === parseInt(sizeId)) {
              // Group values by filter and create assigned filters
              const assignedFilters = [];
              const valuesByFilter = {};
              
              newValues.forEach(vId => {
                // Find which filter this value belongs to
                const parentFilter = filters?.find(filter => 
                  filter.values?.some(value => value._id === vId)
                );
                if (parentFilter) {
                  if (!valuesByFilter[parentFilter._id]) {
                    valuesByFilter[parentFilter._id] = [];
                  }
                  valuesByFilter[parentFilter._id].push(vId);
                }
              });
              
              // Create assigned filters array
              Object.entries(valuesByFilter).forEach(([fId, vIds]) => {
                vIds.forEach(vId => {
                  assignedFilters.push({ filterId: fId, valueId: vId });
                });
              });
              
              return {
                ...size,
                assignedFilters
              };
            }
            return size;
          })
        }));
      }
      
      return {
        ...prev,
        [sizeId]: newValues
      };
    });
  };

  const clearAllFiltersForSize = (sizeId) => {
    setSelectedFilterValues(prev => ({
      ...prev,
      [sizeId]: []
    }));
    
    // Update form data as well for consistency (skip for 'new' size as it's not in formData yet)
    if (sizeId !== 'new') {
      setFormData(prev => ({
        ...prev,
        sizes: prev.sizes.map(size => {
          if (size.id === sizeId || size.id === parseInt(sizeId)) {
            return {
              ...size,
              assignedFilters: []
            };
          }
          return size;
        })
      }));
    }
  };

  const getFilteredFilters = () => {
    if (!filters || filters.length === 0) {
      console.log('🔍 getFilteredFilters: No filters available', { filters, filtersLength: filters?.length });
      return [];
    }
    
    const filteredResults = filters.filter(filter => 
      filter.key.toLowerCase().includes(filterSearchTerm.toLowerCase()) ||
      filter.values.some(value => 
        value.name.toLowerCase().includes(filterSearchTerm.toLowerCase())
      )
    );
    
    console.log('🔍 getFilteredFilters:', {
      originalCount: filters.length,
      filteredCount: filteredResults.length,
      searchTerm: filterSearchTerm,
      firstFilter: filteredResults[0]
    });
    
    return filteredResults;
  };

  // Image upload handlers
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(async (file) => {
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        return null;
      }

      const tempId = Date.now() + Math.random();
      
      // Add to uploading state
      setUploadingImages(prev => [...prev, { id: tempId, filename: file.name }]);

      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await itemAPI.uploadImage(formData);
        
        if (response.data?.success) {
          const imageData = {
            id: tempId,
            url: response.data.data.url || response.data.data.imageUrl,
            filename: file.name,
            isExisting: false
          };

          setImages(prev => [...prev, imageData]);
          return imageData;
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setLocalError(`Failed to upload ${file.name}: ${error.message}`);
        return null;
      } finally {
        // Remove from uploading state
        setUploadingImages(prev => prev.filter(img => img.id !== tempId));
      }
    });

    await Promise.all(uploadPromises);
  };

  // Video upload handlers
  const handleVideoUpload = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(async (file) => {
      if (!file.type.startsWith('video/')) {
        console.error('Invalid file type:', file.type);
        return null;
      }

      const tempId = Date.now() + Math.random();
      
      // Add to uploading state
      setUploadingVideos(prev => [...prev, { id: tempId, filename: file.name }]);

      try {
        const formData = new FormData();
        formData.append('video', file);

        const response = await itemAPI.uploadVideo(formData);
        
        if (response.data?.success) {
          const videoData = {
            id: tempId,
            url: response.data.data.url || response.data.data.videoUrl,
            filename: file.name,
            isExisting: false
          };

          setVideos(prev => [...prev, videoData]);
          return videoData;
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        setLocalError(`Failed to upload ${file.name}: ${error.message}`);
        return null;
      } finally {
        // Remove from uploading state
        setUploadingVideos(prev => prev.filter(vid => vid.id !== tempId));
      }
    });

    await Promise.all(uploadPromises);
  };

  // Remove media handlers
  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const removeVideo = (videoId) => {
    setVideos(prev => prev.filter(vid => vid.id !== videoId));
  };

  // Category and subcategory assignment handlers
  const handleCategoryAssignment = (category) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      categoryId: category.id
    }));
    // Load subcategories for the selected category
    if (category.id) {
      loadSubCategories(category.id);
    } else {
      setSubCategories([]);
      setSelectedSubCategory(null);
    }
  };

  const handleSubCategoryAssignment = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setFormData(prev => ({
      ...prev,
      subCategoryId: subCategory.id
    }));
  };

  // Modal functions removed - using dropdowns instead

  // Save product
  const handleSave = async () => {
    // Check authentication first
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    // Debug: Log what's actually in localStorage
    console.log('🔍 Auth Debug:');
    console.log('- Raw token:', token);
    console.log('- Raw userData:', userData);
    
    let parsedUserData = null;
    try {
      parsedUserData = userData ? JSON.parse(userData) : null;
      console.log('- Parsed userData:', parsedUserData);
      console.log('- User isAdmin:', parsedUserData?.isAdmin);
    } catch (e) {
      console.warn('Failed to parse userData from localStorage:', e);
    }

    try {
      setLocalError(null);

      if (!token || token === 'null' || token === 'undefined') {
        setLocalError('Please login to update products');
        return;
      }

      // Check if user has admin privileges (isAdmin boolean field)
      if (!parsedUserData) {
        setLocalError('User information not found. Please login again.');
        return;
      }
      
      // Check for both role-based and isAdmin boolean access
      const hasAdminAccess = parsedUserData.role === 'admin' || parsedUserData.isAdmin === true;
      
      if (!hasAdminAccess) {
        setLocalError(`Admin access required. Current status: role=${parsedUserData.role}, isAdmin=${parsedUserData.isAdmin}`);
        return;
      }
      
      console.log('✅ Admin access confirmed, proceeding with API call...');

      // Basic validation
      if (!formData.productName.trim()) {
        setLocalError('Product name is required');
        return;
      }

      // Validate category and subcategory for draft configuration
      if (!formData.categoryId || !formData.subCategoryId) {
        setLocalError('⚠️ Category and subcategory selection required! Please use the "Category & Subcategory Assignment" section below to select both before saving.');
        // Scroll to category section
        const categorySection = document.querySelector('[data-section="category-assignment"]');
        if (categorySection) {
          categorySection.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      console.log('🏷️ Category validation:');
      console.log('- Selected Category ID:', formData.categoryId);
      console.log('- Selected Subcategory ID:', formData.subCategoryId);
      console.log('- Category Object:', selectedCategory);
      console.log('- Subcategory Object:', selectedSubCategory);

      const updateData = {
        ...formData,
        images: images.map(img => img.url),
        videos: videos.map(vid => vid.url),
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        sizes: stockSizeOption === 'addSize' ? formData.sizes.map(size => ({
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
          toFitWaistIn: parseFloat(size.waistIn) || 0,
          inseamLengthIn: parseFloat(size.inseamIn) || 0,
          chestIn: parseFloat(size.chestIn) || 0,
          frontLengthIn: parseFloat(size.frontLengthIn) || 0,
          acrossShoulderIn: parseFloat(size.acrossShoulderIn) || 0,
          metaTitle: size.metaTitle,
          metaDescription: size.metaDescription,
          slugUrl: size.slugUrl,
          assignedFilters: size.assignedFilters || []
        })) : []
      };

      console.log('📝 Attempting to update item with data:', updateData);
      console.log('🔑 Current auth token:', localStorage.getItem('authToken'));
      console.log('👤 Current user data:', localStorage.getItem('userData'));
      
      // Validate we have the productId for the draft configuration
      if (!item?.productId) {
        setLocalError('❌ Product ID not found. Please reload the page and try again.');
        return;
      }

      console.log('🆔 Using Product ID for update:', item.productId);
      
      // First try the standard update endpoint with MongoDB _id
      let response;
      try {
        response = await itemAPI.updateItem(id, updateData);
      } catch (updateError) {
        console.log('🔄 Standard update failed, trying draft-configuration endpoint...');
        console.log('🆔 Switching to productId for draft-configuration:', item.productId);
        // If standard update fails, try the draft configuration endpoint with productId
        response = await itemAPI.updateDraftConfiguration(item.productId, updateData);
      }
      
      if (response.data?.success) {
        setSuccess('Product updated successfully!');
        setTimeout(() => {
          navigate('/item-management');
        }, 1500);
      } else {
        setLocalError('Failed to update product');
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setLocalError('Authentication required. Please login to update products.');
      } else if (error.response?.status === 404) {
        setLocalError(`Product not found (ID: ${id}). The item may have been deleted or you may not have access to it.`);
      } else if (error.response?.status === 403) {
        setLocalError('You do not have permission to update this product. Admin access required.');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update product';
        setLocalError(`Update failed: ${errorMessage}`);
      }
      
      // Add debugging information for troubleshooting
      console.log('🔍 Debug Info:');
      console.log('- Item ID:', id);
      console.log('- Has Auth Token:', !!localStorage.getItem('authToken'));
      console.log('- User Role:', parsedUserData?.role);
      console.log('- Error Status:', error.response?.status);
      console.log('- Error Message:', error.response?.data?.message);
    }
  };

  // Debug function to check auth status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    console.log('🔍 Authentication Status Check:');
    console.log('Token exists:', !!token);
    console.log('Token value:', token);
    console.log('UserData raw:', userData);
    
    try {
      const parsed = userData ? JSON.parse(userData) : null;
      console.log('UserData parsed:', parsed);
      console.log('User role:', parsed?.role);
      console.log('User isAdmin:', parsed?.isAdmin);
      console.log('Is admin?', parsed?.role === 'admin' || parsed?.isAdmin === true);
      
      alert(`Auth Status:\nToken: ${!!token}\nRole: ${parsed?.role || 'none'}\nIsAdmin: ${parsed?.isAdmin || 'false'}\nHas Admin Access: ${parsed?.role === 'admin' || parsed?.isAdmin === true}`);
    } catch (e) {
      console.error('Error parsing userData:', e);
      alert('Error parsing user data from localStorage');
    }
  };

  // Function to promote current user to admin
  const makeUserAdmin = async () => {
    try {
      const userData = localStorage.getItem('userData');
      const parsed = userData ? JSON.parse(userData) : null;
      
      if (!parsed?._id) {
        alert('User ID not found');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/users/make-admin/${parsed._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert('Success! User promoted to admin. Please refresh the page.');
        
        // Update localStorage with new admin status
        const updatedUserData = { ...parsed, isAdmin: true };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        console.log('✅ User promoted to admin:', result);
      } else {
        const error = await response.json();
        alert(`Failed to promote user: ${error.message}`);
      }
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      alert('Error promoting user to admin');
    }
  };

  if (loading && !item) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading product data...</p>
        <p className="text-sm text-gray-500">Product ID: {id}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/item-management')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-medium text-black">Edit Item</h1>
            </div>
            <button
              onClick={() => navigate('/item-management')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        {(error || localError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error || localError}
            {(error || localError)?.includes('Authentication required') && (
              <div className="mt-2">
                <button
                  onClick={() => {
                    // Set a dummy token for testing
                    localStorage.setItem('authToken', 'dummy-test-token');
                    setLocalError(null);
                    setSuccess('Test token set. Try saving again.');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Set Test Token
                </button>
              </div>
            )}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Filter Test Component - Temporary for debugging */}
        <FilterTest />

        <div className="space-y-8">
          {/* Images Section */}
          <div>
            <h2 className="text-2xl font-medium text-black mb-6">Images</h2>
            
            {/* Image Grid */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {images.map((image) => (
                <div key={image.id} className="relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/150/150';
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-sm text-red-600 mt-2 text-center">remove image</p>
                </div>
              ))}
              
              {/* Upload Image Buttons */}
              {Array.from({ length: Math.max(0, 5 - images.length) }, (_, index) => (
                <div key={`upload-${index}`} className="aspect-square">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full h-full bg-blue-600 text-white rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Upload Image</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Uploading Images */}
            {uploadingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Uploading images...</p>
                {uploadingImages.map((img) => (
                  <div key={img.id} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    {img.filename}
                  </div>
                ))}
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Videos Section */}
          <div>
            <h2 className="text-2xl font-medium text-black mb-6">Videos</h2>
            
            {/* Video Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {videos.map((video) => (
                <div key={video.id} className="relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                  <button
                    onClick={() => removeVideo(video.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-sm text-red-600 mt-2 text-center">remove video</p>
                </div>
              ))}
              
              {/* Upload Video Buttons */}
              {Array.from({ length: Math.max(0, 3 - videos.length) }, (_, index) => (
                <div key={`upload-video-${index}`} className="aspect-square">
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-full bg-blue-600 text-white rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Upload Video</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Uploading Videos */}
            {uploadingVideos.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Uploading videos...</p>
                {uploadingVideos.map((vid) => (
                  <div key={vid.id} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    {vid.filename}
                  </div>
                ))}
              </div>
            )}

            <input
              ref={videoInputRef}
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => handleVideoUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Returnable Toggle */}
          <div className="flex items-center gap-4">
            <label className="text-xl font-medium text-black">Returnable</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleInputChange('returnable', true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.returnable
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-black border border-gray-300'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleInputChange('returnable', false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  !formData.returnable
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-black border border-gray-300'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-xl font-medium text-black mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xl font-medium text-black mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xl font-medium text-black mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
              />
            </div>

            {/* Manufacturing Details */}
            <div>
              <label className="block text-xl font-medium text-black mb-2">
                Manufacturing Details
              </label>
              <textarea
                value={formData.manufacturingDetails}
                onChange={(e) => handleInputChange('manufacturingDetails', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter manufacturing details"
              />
            </div>

            {/* Shipping Returns and Exchange */}
            <div>
              <label className="block text-xl font-medium text-black mb-2">
                Shipping Returns and Exchange
              </label>
              <textarea
                value={formData.shippingAndReturns}
                onChange={(e) => handleInputChange('shippingAndReturns', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shipping and returns policy"
              />
            </div>
          </div>

          {/* Stock Size Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-xl font-medium text-black">Stock Size</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStockSizeOption('addSize')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      stockSizeOption === 'addSize'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-black border border-gray-300'
                    }`}
                  >
                    Add Size
                  </button>
                </div>
              </div>
              
              {/* Filter Summary */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    {Object.values(selectedFilterValues).reduce((total, values) => total + (values || []).length, 0)}
                  </span>
                  <span> filter values assigned across </span>
                  <span className="font-medium">{formData.sizes.length}</span>
                  <span> sizes</span>
                </div>
                {Object.values(selectedFilterValues).some(values => values && values.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFilterValues({});
                      setFormData(prev => ({
                        ...prev,
                        sizes: prev.sizes.map(size => ({ ...size, assignedFilters: [] }))
                      }));
                    }}
                    className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Size Management */}
            {stockSizeOption === 'addSize' && (
              <div className="space-y-6">
                {/* Existing Sizes */}
                {formData.sizes.map((size, index) => (
                  <div key={size.id} className="border border-gray-300 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium">Size {index + 1}</h3>
                        {selectedFilterValues[size.id] && selectedFilterValues[size.id].length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {selectedFilterValues[size.id].length} value{selectedFilterValues[size.id].length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex gap-1">
                              {selectedFilterValues[size.id].slice(0, 3).map(valueId => {
                                // Find the value and its parent filter
                                let valueName = '';
                                let filterKey = '';
                                filters?.forEach(filter => {
                                  const value = filter.values?.find(v => v._id === valueId);
                                  if (value) {
                                    valueName = value.name;
                                    filterKey = filter.key;
                                  }
                                });
                                return valueName ? (
                                  <span key={valueId} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                    {filterKey}: {valueName}
                                  </span>
                                ) : null;
                              })}
                              {selectedFilterValues[size.id].length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  +{selectedFilterValues[size.id].length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeSize(size.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Basic Size Info */}
                    <div className="grid grid-cols-5 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-black mb-1">Size</label>
                        <input
                          type="text"
                          value={size.sizeName || ''}
                          onChange={(e) => updateExistingSize(size.id, 'sizeName', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., S, M, L"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Quantity</label>
                        <input
                          type="number"
                          value={size.quantity || ''}
                          onChange={(e) => updateExistingSize(size.id, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">HSN</label>
                        <input
                          type="text"
                          value={size.hsn || ''}
                          onChange={(e) => updateExistingSize(size.id, 'hsn', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="HSN Code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Regular Price</label>
                        <input
                          type="number"
                          value={size.regularPrice || ''}
                          onChange={(e) => updateExistingSize(size.id, 'regularPrice', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Sale Price</label>
                        <input
                          type="number"
                          value={size.salePrice || ''}
                          onChange={(e) => updateExistingSize(size.id, 'salePrice', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Additional Fields */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-black mb-1">SKU</label>
                        <input
                          type="text"
                          value={size.sku || ''}
                          onChange={(e) => updateExistingSize(size.id, 'sku', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="SKU Code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Barcode No.</label>
                        <input
                          type="text"
                          value={size.barcodeNo || ''}
                          onChange={(e) => updateExistingSize(size.id, 'barcodeNo', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Barcode"
                        />
                      </div>
                    </div>

                    {/* Measurements in CM */}
                    <div className="grid grid-cols-5 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-black mb-1">Waist (cm)</label>
                        <input
                          type="number"
                          value={size.waistCm || ''}
                          onChange={(e) => updateExistingSize(size.id, 'waistCm', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Inseam (cm)</label>
                        <input
                          type="number"
                          value={size.inseamCm || ''}
                          onChange={(e) => updateExistingSize(size.id, 'inseamCm', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Chest (cm)</label>
                        <input
                          type="number"
                          value={size.chestCm || ''}
                          onChange={(e) => updateExistingSize(size.id, 'chestCm', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Front Length (cm)</label>
                        <input
                          type="number"
                          value={size.frontLengthCm || ''}
                          onChange={(e) => updateExistingSize(size.id, 'frontLengthCm', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Across Shoulder (cm)</label>
                        <input
                          type="number"
                          value={size.acrossShoulderCm || ''}
                          onChange={(e) => updateExistingSize(size.id, 'acrossShoulderCm', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Measurements in Inches */}
                    <div className="grid grid-cols-5 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-black mb-1">Waist (in)</label>
                        <input
                          type="number"
                          value={size.waistIn || ''}
                          onChange={(e) => updateExistingSize(size.id, 'waistIn', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Inseam (in)</label>
                        <input
                          type="number"
                          value={size.inseamIn || ''}
                          onChange={(e) => updateExistingSize(size.id, 'inseamIn', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Chest (in)</label>
                        <input
                          type="number"
                          value={size.chestIn || ''}
                          onChange={(e) => updateExistingSize(size.id, 'chestIn', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Front Length (in)</label>
                        <input
                          type="number"
                          value={size.frontLengthIn || ''}
                          onChange={(e) => updateExistingSize(size.id, 'frontLengthIn', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Across Shoulder (in)</label>
                        <input
                          type="number"
                          value={size.acrossShoulderIn || ''}
                          onChange={(e) => updateExistingSize(size.id, 'acrossShoulderIn', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Meta Fields */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-black mb-1">Meta Title</label>
                        <input
                          type="text"
                          value={size.metaTitle || ''}
                          onChange={(e) => updateExistingSize(size.id, 'metaTitle', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Meta title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Meta Description</label>
                        <input
                          type="text"
                          value={size.metaDescription || ''}
                          onChange={(e) => updateExistingSize(size.id, 'metaDescription', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Meta description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-black mb-1">Slug URL</label>
                        <input
                          type="text"
                          value={size.slugUrl || ''}
                          onChange={(e) => updateExistingSize(size.id, 'slugUrl', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="slug-url"
                        />
                      </div>
                    </div>

                    {/* Filter Assignment */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Filter Assignment</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {selectedFilterValues[size.id]?.length || 0} filter values selected
                          </span>
                          {selectedFilterValues[size.id]?.length > 0 && (
                            <button
                              type="button"
                              onClick={() => clearAllFiltersForSize(size.id)}
                              className="text-xs text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filter Search */}
                      <div className="mb-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Search filters..."
                          value={filterSearchTerm}
                          onChange={(e) => setFilterSearchTerm(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => dispatch(fetchFilters())}
                          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors flex items-center gap-1"
                          title="Refresh filters"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Filters Loading State */}
                      {filtersLoading && (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-sm text-gray-600">Loading filters...</span>
                        </div>
                      )}

                      {/* Filters Display */}
                      {!filtersLoading && filters && filters.length > 0 && (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {getFilteredFilters().map((filter) => (
                            <div key={filter._id} className="border border-gray-200 rounded-lg p-3 bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-medium text-gray-800 capitalize">
                                  {filter.key}
                                </h5>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {filter.values?.length || 0} values
                                </span>
                              </div>
                              
                              {/* Filter Values */}
                              {filter.values && filter.values.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                  {filter.values.map((value) => {
                                    const isSelected = selectedFilterValues[size.id]?.includes(value._id);
                                    return (
                                      <button
                                        key={value._id}
                                        type="button"
                                        onClick={() => toggleFilterValueForSize(size.id, filter._id, value._id)}
                                        className={`flex items-center justify-between p-2 text-xs rounded-lg transition-all ${
                                          isSelected
                                            ? 'bg-blue-100 border-2 border-blue-300 text-blue-800'
                                            : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          {/* Color preview for color filters */}
                                          {filter.key === 'color' && value.code && (
                                            <div
                                              className="w-3 h-3 rounded-full border border-gray-300"
                                              style={{ backgroundColor: value.code }}
                                            ></div>
                                          )}
                                          <span className="font-medium">{value.name}</span>
                                        </div>
                                        {isSelected && (
                                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* No Filters Available */}
                      {!filtersLoading && (!filters || filters.length === 0) && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No filters available</p>
                          <p className="text-xs text-gray-400">Create filters in the Filters management section</p>
                        </div>
                      )}

                      {/* Filtered Results Empty */}
                      {!filtersLoading && filters && filters.length > 0 && getFilteredFilters().length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No filters match your search</p>
                          <button
                            type="button"
                            onClick={() => setFilterSearchTerm('')}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                          >
                            Clear search
                          </button>
                        </div>
                      )}

                      {/* Applied Filters Summary */}
                      {selectedFilterValues[size.id] && selectedFilterValues[size.id].length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <h6 className="text-xs font-medium text-gray-600 mb-2">Applied Filter Values:</h6>
                          <div className="flex flex-wrap gap-1">
                            {selectedFilterValues[size.id].map(valueId => {
                              // Find the value and its parent filter
                              let valueName = '';
                              let filterKey = '';
                              let filterId = '';
                              let valueCode = '';
                              
                              filters?.forEach(filter => {
                                const value = filter.values?.find(v => v._id === valueId);
                                if (value) {
                                  valueName = value.name;
                                  filterKey = filter.key;
                                  filterId = filter._id;
                                  valueCode = value.code;
                                }
                              });
                              
                              return valueName ? (
                                <span
                                  key={valueId}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                                >
                                  {filterKey === 'color' && valueCode && (
                                    <div
                                      className="w-2 h-2 rounded-full border border-gray-300 mr-1"
                                      style={{ backgroundColor: valueCode }}
                                    ></div>
                                  )}
                                  {filterKey}: {valueName}
                                  <button
                                    type="button"
                                    onClick={() => toggleFilterValueForSize(size.id, filterId, valueId)}
                                    className="ml-1 text-blue-500 hover:text-blue-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add New Size Form */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-black mb-4">Add New Size</h3>
                  
                  {/* Basic Size Info */}
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-black mb-1">Size</label>
                      <input
                        type="text"
                        value={currentSize.sizeName}
                        onChange={(e) => handleSizeInputChange('sizeName', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., S, M, L"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Quantity</label>
                      <input
                        type="number"
                        value={currentSize.quantity}
                        onChange={(e) => handleSizeInputChange('quantity', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">HSN</label>
                      <input
                        type="text"
                        value={currentSize.hsn}
                        onChange={(e) => handleSizeInputChange('hsn', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="HSN Code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Regular Price</label>
                      <input
                        type="number"
                        value={currentSize.regularPrice}
                        onChange={(e) => handleSizeInputChange('regularPrice', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Sale Price</label>
                      <input
                        type="number"
                        value={currentSize.salePrice}
                        onChange={(e) => handleSizeInputChange('salePrice', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-black mb-1">SKU</label>
                      <input
                        type="text"
                        value={currentSize.sku}
                        onChange={(e) => handleSizeInputChange('sku', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SKU Code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Barcode No.</label>
                      <input
                        type="text"
                        value={currentSize.barcodeNo}
                        onChange={(e) => handleSizeInputChange('barcodeNo', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Barcode"
                      />
                    </div>
                  </div>

                  {/* Measurements */}
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-black mb-1">Waist (cm)</label>
                      <input
                        type="number"
                        value={currentSize.waistCm}
                        onChange={(e) => handleSizeInputChange('waistCm', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Inseam (cm)</label>
                      <input
                        type="number"
                        value={currentSize.inseamCm}
                        onChange={(e) => handleSizeInputChange('inseamCm', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Chest (cm)</label>
                      <input
                        type="number"
                        value={currentSize.chestCm}
                        onChange={(e) => handleSizeInputChange('chestCm', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Front Length (cm)</label>
                      <input
                        type="number"
                        value={currentSize.frontLengthCm}
                        onChange={(e) => handleSizeInputChange('frontLengthCm', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Across Shoulder (cm)</label>
                      <input
                        type="number"
                        value={currentSize.acrossShoulderCm}
                        onChange={(e) => handleSizeInputChange('acrossShoulderCm', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Measurements in Inches */}
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-black mb-1">Waist (in)</label>
                      <input
                        type="number"
                        value={currentSize.waistIn}
                        onChange={(e) => handleSizeInputChange('waistIn', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Inseam (in)</label>
                      <input
                        type="number"
                        value={currentSize.inseamIn}
                        onChange={(e) => handleSizeInputChange('inseamIn', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Chest (in)</label>
                      <input
                        type="number"
                        value={currentSize.chestIn}
                        onChange={(e) => handleSizeInputChange('chestIn', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Front Length (in)</label>
                      <input
                        type="number"
                        value={currentSize.frontLengthIn}
                        onChange={(e) => handleSizeInputChange('frontLengthIn', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Across Shoulder (in)</label>
                      <input
                        type="number"
                        value={currentSize.acrossShoulderIn}
                        onChange={(e) => handleSizeInputChange('acrossShoulderIn', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Meta Fields */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-black mb-1">Meta Title</label>
                      <input
                        type="text"
                        value={currentSize.metaTitle}
                        onChange={(e) => handleSizeInputChange('metaTitle', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Meta title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Meta Description</label>
                      <input
                        type="text"
                        value={currentSize.metaDescription}
                        onChange={(e) => handleSizeInputChange('metaDescription', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Meta description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-black mb-1">Slug URL</label>
                      <input
                        type="text"
                        value={currentSize.slugUrl}
                        onChange={(e) => handleSizeInputChange('slugUrl', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="slug-url"
                      />
                    </div>
                  </div>

                  {/* Filter Assignment for New Size */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Filter Assignment (New Size)</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {selectedFilterValues['new']?.length || 0} filter values selected
                        </span>
                        {selectedFilterValues['new']?.length > 0 && (
                          <button
                            type="button"
                            onClick={() => clearAllFiltersForSize('new')}
                            className="text-xs text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Search */}
                    <div className="mb-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Search filters..."
                        value={filterSearchTerm}
                        onChange={(e) => setFilterSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => dispatch(fetchFilters())}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors flex items-center gap-1"
                        title="Refresh filters"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Filters Loading State */}
                    {filtersLoading && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-sm text-gray-600">Loading filters...</span>
                      </div>
                    )}

                    {/* Filters Display */}
                    {!filtersLoading && filters && filters.length > 0 && (
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {getFilteredFilters().map((filter) => (
                          <div key={filter._id} className="border border-gray-200 rounded-lg p-3 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-medium text-gray-800 capitalize">
                                {filter.key}
                              </h5>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {filter.values?.length || 0} values
                              </span>
                            </div>
                            
                            {/* Filter Values */}
                            {filter.values && filter.values.length > 0 && (
                              <div className="grid grid-cols-2 gap-2">
                                {filter.values.map((value) => {
                                  const isSelected = selectedFilterValues['new']?.includes(value._id);
                                  return (
                                    <button
                                      key={value._id}
                                      type="button"
                                      onClick={() => toggleFilterValueForSize('new', filter._id, value._id)}
                                      className={`flex items-center justify-between p-2 text-xs rounded-lg transition-all ${
                                        isSelected
                                          ? 'bg-green-100 border-2 border-green-300 text-green-800'
                                          : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {/* Color preview for color filters */}
                                        {filter.key === 'color' && value.code && (
                                          <div
                                            className="w-3 h-3 rounded-full border border-gray-300"
                                            style={{ backgroundColor: value.code }}
                                          ></div>
                                        )}
                                        <span className="font-medium">{value.name}</span>
                                      </div>
                                      {isSelected && (
                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No Filters Available */}
                    {!filtersLoading && (!filters || filters.length === 0) && (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No filters available</p>
                        <p className="text-xs text-gray-400">Create filters in the Filters management section</p>
                      </div>
                    )}

                      {/* Filtered Results Empty */}
                      {!filtersLoading && filters && filters.length > 0 && getFilteredFilters().length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No filters match your search</p>
                          <button
                            type="button"
                            onClick={() => setFilterSearchTerm('')}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                          >
                            Clear search
                          </button>
                        </div>
                      )}

                      {/* Applied Filters Summary for New Size */}
                      {selectedFilterValues['new'] && selectedFilterValues['new'].length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <h6 className="text-xs font-medium text-gray-600 mb-2">Applied Filter Values (New Size):</h6>
                          <div className="flex flex-wrap gap-1">
                            {selectedFilterValues['new'].map(valueId => {
                              // Find the value and its parent filter
                              let valueName = '';
                              let filterKey = '';
                              let filterId = '';
                              let valueCode = '';
                              
                              filters?.forEach(filter => {
                                const value = filter.values?.find(v => v._id === valueId);
                                if (value) {
                                  valueName = value.name;
                                  filterKey = filter.key;
                                  filterId = filter._id;
                                  valueCode = value.code;
                                }
                              });
                              
                              return valueName ? (
                                <span
                                  key={valueId}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                                >
                                  {filterKey === 'color' && valueCode && (
                                    <div
                                      className="w-2 h-2 rounded-full border border-gray-300 mr-1"
                                      style={{ backgroundColor: valueCode }}
                                    ></div>
                                  )}
                                  {filterKey}: {valueName}
                                  <button
                                    type="button"
                                    onClick={() => toggleFilterValueForSize('new', filterId, valueId)}
                                    className="ml-1 text-green-500 hover:text-green-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                  </div>                  <button
                    onClick={addSize}
                    className="bg-white text-black border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Add Size
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Category Assignment Section */}
          <div className="space-y-6 pt-8 border-t border-gray-200" data-section="category-assignment">
            <h2 className="text-2xl font-semibold text-black">Category & Subcategory Assignment</h2>
            <p className="text-sm text-gray-600">⚠️ Both category and subcategory must be selected before saving the item.</p>
            
            {/* Debug Info */}
            <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
              <strong>Debug Info:</strong> Categories loaded: {Array.isArray(categories) ? categories.length : 'not array'} | 
              Loading: {categoryLoading ? 'yes' : 'no'} | 
              Auth: {localStorage.getItem('authToken') ? '✅' : '❌'}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Category *
                </label>
                <select
                  value={selectedCategory?.id || ''}
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    if (categoryId) {
                      const category = categories.find(cat => cat._id === categoryId);
                      if (category) {
                        handleCategoryAssignment({
                          id: category._id,
                          name: category.name
                        });
                      }
                    } else {
                      setSelectedCategory(null);
                      setFormData(prev => ({ ...prev, categoryId: null }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category...</option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoryLoading && (
                  <div className="text-xs text-gray-500">Loading categories...</div>
                )}
              </div>

              {/* Subcategory Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Subcategory *
                </label>
                <select
                  value={selectedSubCategory?.id || ''}
                  onChange={(e) => {
                    const subCategoryId = e.target.value;
                    if (subCategoryId) {
                      const subCategory = subCategories.find(sub => sub._id === subCategoryId);
                      if (subCategory) {
                        handleSubCategoryAssignment({
                          id: subCategory._id,
                          name: subCategory.name
                        });
                      }
                    } else {
                      setSelectedSubCategory(null);
                      setFormData(prev => ({ ...prev, subCategoryId: null }));
                    }
                  }}
                  disabled={!selectedCategory}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedCategory ? 'Select category first...' : 'Select a subcategory...'}
                  </option>
                  {Array.isArray(subCategories) && subCategories.map((subCategory) => (
                    <option key={subCategory._id} value={subCategory._id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
                {subCategoryLoading && (
                  <div className="text-xs text-gray-500">Loading subcategories...</div>
                )}
                {selectedCategory && subCategories.length === 0 && !subCategoryLoading && (
                  <div className="text-xs text-orange-600">No subcategories available for this category</div>
                )}
              </div>
            </div>

            {/* Category Assignment Status */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Category:</span>
                {selectedCategory ? (
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                    ✓ {selectedCategory.name}
                  </span>
                ) : (
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                    ❌ Not Selected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Sub Category:</span>
                {selectedSubCategory ? (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                    ✓ {selectedSubCategory.name}
                  </span>
                ) : (
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                    ❌ Not Selected
                  </span>
                )}
              </div>
              {selectedCategory && selectedSubCategory && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <span className="text-sm text-green-700">✅ Ready to save! Both category and subcategory are selected.</span>
                </div>
              )}
              {(!selectedCategory || !selectedSubCategory) && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <span className="text-sm text-yellow-700">⚠️ Please select both category and subcategory before saving.</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-8">
            <button
              onClick={() => navigate('/item-management')}
              className="px-8 py-4 border border-gray-300 rounded-full text-black font-medium hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={checkAuthStatus}
              className="px-4 py-4 border border-blue-300 rounded-full text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              Check Auth
            </button>
            <button
              onClick={makeUserAdmin}
              className="px-4 py-4 border border-green-300 rounded-full text-green-600 font-medium hover:bg-green-50 transition-colors"
            >
              Make Admin
            </button>
            <button
              onClick={() => navigate('/bulk-upload')}
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
            <button
              onClick={handleSave}
              disabled={loading || updateLoading}
              className="px-12 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || updateLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Modals removed - using dropdowns instead */}
    </div>
  );
};

export default ItemManagementEditPage;