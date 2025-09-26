import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorMonitorWidget from '../components/ErrorMonitorWidget';
import NetworkCallMonitor from '../components/NetworkCallMonitor';
import { useDebounce } from '../hooks/useDebounce';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  Star,
  Heart,
  ShoppingCart,
  TrendingUp,
  Calendar,
  MapPin,
  Layers,
  Copy,
  Tag,
  Target,
  Users,
  ExternalLink,
  Move
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  fetchItems as fetchProducts,
  deleteItem as deleteProduct,
  updateItem as updateProduct,
  updateItemStatus as updateProductStatus,
  fetchItemsByStatus as fetchProductsByStatus,
  selectItemsItems as selectProductsItems,
  selectItemsLoading as selectProductsLoading,
  selectItemsError as selectProductsError,
  clearError,
  clearSuccessMessage
} from '../store/slices/itemSlice';
import {
  fetchCategories,
  selectCategories
} from '../store/slices/categoriesSlice';
import {
  fetchSubCategories,
  selectSubCategories
} from '../store/slices/subCategoriesSlice';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';

// Status color mapping
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'published':
    case 'active':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'inactive':
    case 'disabled':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Stock status component
const StockStatus = ({ sizes, variants, stockSizeOption }) => {
  const totalStock = useMemo(() => {
    if (stockSizeOption === 'sizes' && sizes?.length) {
      return sizes.reduce((total, size) => total + (size.quantity || size.stock || 0), 0);
    } else if (stockSizeOption === 'variants' && variants?.length) {
      return variants.reduce((total, variant) => {
        if (variant.sizes?.length) {
          return total + variant.sizes.reduce((vTotal, size) => vTotal + (size.quantity || size.stock || 0), 0);
        }
        return total;
      }, 0);
    }
    return 0;
  }, [sizes, variants, stockSizeOption]);

  const stockStatus = useMemo(() => {
    if (totalStock === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' };
    if (totalStock <= 5) return { label: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-50' };
  }, [totalStock]);

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
      <Package className="w-3 h-3 mr-1" />
      {stockStatus.label} ({totalStock})
    </div>
  );
};

const ItemManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const items = useSelector(selectProductsItems);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const categories = useSelector(selectCategories);
  const subCategories = useSelector(selectSubCategories);

  // Local state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subCategory: '',
    status: '',
    priceRange: { min: '', max: '' },
    stockStatus: '',
    returnable: ''
  });

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [bulkAction, setBulkAction] = useState('');

  // Dropdown states for new management sections
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showRecommendationSettings, setShowRecommendationSettings] = useState(false);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [showStatusManagement, setShowStatusManagement] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);

  // Recommendation settings
  const [recommendationType, setRecommendationType] = useState('');

  // Status loading state
  const [statusLoading, setStatusLoading] = useState({});

  // Debounced search term
  const debouncedSearchTerm = useDebounce(filters.search, 300);

  // Initialize data - CLEAN EFFECT WITH NO PROBLEMATIC DEPENDENCIES
  useEffect(() => {
    console.log('🔄 ItemManagement: Initial data load');
    
    const initializeData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProducts({ page: 1, limit: itemsPerPage })).unwrap(),
          dispatch(fetchCategories()).unwrap(),
          dispatch(fetchSubCategories()).unwrap()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []); // Only run once on mount

  // Handle search changes - SEPARATE EFFECT FOR SEARCH
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      console.log('🔍 Search term changed:', debouncedSearchTerm);
      handleSearch();
    }
  }, [debouncedSearchTerm]);

  // Handle pagination changes - SEPARATE EFFECT FOR PAGINATION
  useEffect(() => {
    console.log('📄 Page changed:', currentPage);
    fetchItemsForCurrentPage();
  }, [currentPage, itemsPerPage]);

  // Fetch items for current page
  const fetchItemsForCurrentPage = useCallback(async () => {
    try {
      await dispatch(fetchProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        category: filters.category,
        subCategory: filters.subCategory,
        status: filters.status
      })).unwrap();
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, filters.category, filters.subCategory, filters.status]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      return; // Let the pagination effect handle the fetch
    }
    
    try {
      await dispatch(fetchProducts({
        page: 1,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        category: filters.category,
        subCategory: filters.subCategory,
        status: filters.status
      })).unwrap();
    } catch (error) {
      console.error('Error searching items:', error);
    }
  }, [debouncedSearchTerm, filters.category, filters.subCategory, filters.status, itemsPerPage, currentPage]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      subCategory: '',
      status: '',
      priceRange: { min: '', max: '' },
      stockStatus: '',
      returnable: ''
    });
    setCurrentPage(1);
  }, []);

  // Handle item selection
  const handleItemSelect = useCallback((itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
  }, [selectedItems.length, items]);

  // Handle delete item
  const handleDeleteItem = useCallback(async (itemId) => {
    try {
      await dispatch(deleteProduct(itemId)).unwrap();
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      // Refresh the current page
      await fetchItemsForCurrentPage();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }, [fetchItemsForCurrentPage]);

  // Select product for editing in dropdown sections
  const selectProductForEdit = useCallback((product) => {
    setSelectedProductForEdit(product);
    
    // Auto-open the relevant sections
    setShowStatusManagement(true);
    setShowRecommendations(true);
    setShowRecommendationSettings(true);
    setShowProductManagement(true);
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback(async (itemId, newStatus) => {
    try {
      await dispatch(updateProductStatus({ id: itemId, status: newStatus })).unwrap();
      // Refresh the current page
      await fetchItemsForCurrentPage();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }, [fetchItemsForCurrentPage]);

  // Handle bulk actions
  const handleBulkAction = useCallback(async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    try {
      switch (bulkAction) {
        case 'delete':
          await Promise.all(selectedItems.map(id => dispatch(deleteProduct(id)).unwrap()));
          break;
        case 'activate':
          await Promise.all(selectedItems.map(id => dispatch(updateProductStatus({ id, status: 'active' })).unwrap()));
          break;
        case 'deactivate':
          await Promise.all(selectedItems.map(id => dispatch(updateProductStatus({ id, status: 'inactive' })).unwrap()));
          break;
      }
      
      setSelectedItems([]);
      setBulkAction('');
      await fetchItemsForCurrentPage();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  }, [bulkAction, selectedItems, fetchItemsForCurrentPage]);

  // Handle sort
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  // Status options configuration
  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'published', label: 'Live/Published', color: 'bg-green-100 text-green-800' }
  ];

  // New handler functions for the dropdown options
  const handleStatusChange = useCallback(async (item, newStatus) => {
    if (!selectedProductForEdit) {
      alert('Please select a product first');
      return;
    }

    let statusData = { status: newStatus };
    
    try {
      if (newStatus === 'scheduled') {
        // Improved date/time input with validation
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        
        const scheduledDate = prompt(`Enter scheduled date (YYYY-MM-DD).\nMinimum date: ${today}`, today);
        if (!scheduledDate) {
          return; // User cancelled
        }
        
        // Validate date format and ensure it's not in the past
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(scheduledDate)) {
          alert('Invalid date format. Please use YYYY-MM-DD format.');
          return;
        }
        
        const selectedDate = new Date(scheduledDate);
        const todayDate = new Date(today);
        
        if (selectedDate < todayDate) {
          alert('Scheduled date cannot be in the past.');
          return;
        }
        
        let defaultTime = currentTime;
        // If scheduling for today, suggest a time at least 5 minutes from now
        if (scheduledDate === today) {
          const futureTime = new Date(now.getTime() + 5 * 60 * 1000);
          defaultTime = futureTime.toTimeString().slice(0, 5);
        }
        
        const scheduledTime = prompt(`Enter scheduled time (HH:MM).\n${scheduledDate === today ? `Minimum time: ${defaultTime}` : 'Format: 24-hour format (e.g., 14:30)'}`, defaultTime);
        if (!scheduledTime) {
          return; // User cancelled
        }
        
        // Validate time format
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(scheduledTime)) {
          alert('Invalid time format. Please use HH:MM format (24-hour).');
          return;
        }
        
        // Validate that scheduled time is in the future if scheduling for today
        if (scheduledDate === today) {
          const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
          if (scheduledDateTime <= now) {
            alert('Scheduled time must be at least 5 minutes in the future.');
            return;
          }
        }
        
        statusData.scheduledDate = scheduledDate;
        statusData.scheduledTime = scheduledTime;
        statusData.publishAt = new Date(`${scheduledDate}T${scheduledTime}:00.000Z`).toISOString();
      } else if (newStatus === 'published') {
        statusData.publishedAt = new Date().toISOString();
      }

      // Use itemId as the primary identifier
      const itemId = selectedProductForEdit.itemId || selectedProductForEdit._id;
      if (!itemId) {
        throw new Error('Item ID not found');
      }

      // Show loading state
      setStatusLoading(prev => ({ ...prev, [itemId]: true }));

      const result = await dispatch(updateProductStatus({ 
        itemId: itemId, 
        statusData 
      })).unwrap();
      
      // Success feedback
      const statusMessages = {
        draft: 'Product moved to draft successfully!',
        scheduled: `Product scheduled for ${statusData.scheduledDate} at ${statusData.scheduledTime} successfully!`,
        published: 'Product published successfully!'
      };
      
      alert(statusMessages[newStatus]);
      
      // Refresh the items list
      await fetchItemsForCurrentPage();
      
    } catch (error) {
      console.error('Failed to update status:', error);
      const errorMessage = error.message || 'Failed to update product status. Please try again.';
      alert(`Failed to update status: ${errorMessage}`);
    } finally {
      // Clear loading state
      const itemId = selectedProductForEdit.itemId || selectedProductForEdit._id;
      setStatusLoading(prev => ({ ...prev, [itemId]: false }));
    }
  }, [dispatch, selectedProductForEdit, fetchItemsForCurrentPage]);

  const handleAddToRecommendations = useCallback((item, type) => {
    if (!selectedProductForEdit) {
      alert('Please select a product first');
      return;
    }
    console.log(`Adding ${selectedProductForEdit.productName || selectedProductForEdit.name} to ${type}`);
    // TODO: Implement API call to add item to recommendation lists
    alert(`Adding "${selectedProductForEdit.productName || selectedProductForEdit.name}" to ${type === 'youMayAlsoLike' ? 'You may also like' : 'Others also bought'} list`);
  }, [selectedProductForEdit]);

  const handleMoveToSale = useCallback((item) => {
    if (!selectedProductForEdit) {
      alert('Please select a product first');
      return;
    }
    console.log(`Moving ${selectedProductForEdit.productName || selectedProductForEdit.name} to sale`);
    // TODO: Implement API call to move item to sale category
    alert(`Moving "${selectedProductForEdit.productName || selectedProductForEdit.name}" to sale section`);
  }, [selectedProductForEdit]);

  const handleKeepCopyAndMove = useCallback((item) => {
    if (!selectedProductForEdit) {
      alert('Please select a product first');
      return;
    }
    console.log(`Keep copy and move ${selectedProductForEdit.productName || selectedProductForEdit.name}`);
    // TODO: Implement API call to duplicate item and move original
    alert(`Creating a copy of "${selectedProductForEdit.productName || selectedProductForEdit.name}" and moving original`);
  }, [selectedProductForEdit]);

  const handleMoveToEyx = useCallback((item) => {
    if (!selectedProductForEdit) {
      alert('Please select a product first');
      return;
    }
    console.log(`Moving ${selectedProductForEdit.productName || selectedProductForEdit.name} to EYX`);
    // TODO: Implement API call to move item to EYX platform
    alert(`Moving "${selectedProductForEdit.productName || selectedProductForEdit.name}" to EYX platform`);
  }, [selectedProductForEdit]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters.subCategory) {
      filtered = filtered.filter(item => item.subCategory === filters.subCategory);
    }
    
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.returnable) {
      if (filters.returnable === 'returnable') {
        filtered = filtered.filter(item => item.returnable === true);
      } else if (filters.returnable === 'non-returnable') {
        filtered = filtered.filter(item => item.returnable === false);
      }
    }

    if (filters.priceRange.min) {
      filtered = filtered.filter(item => item.price >= parseFloat(filters.priceRange.min));
    }
    
    if (filters.priceRange.max) {
      filtered = filtered.filter(item => item.price <= parseFloat(filters.priceRange.max));
    }

    // Sort items
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'price') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [items, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <NetworkCallMonitor />
      <ErrorMonitorWidget />
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Item Management</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/admin/items/bulk-upload')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={() => navigate('/admin/items/create')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>

          {/* Returnable Filter */}
          <select
            value={filters.returnable}
            onChange={(e) => handleFilterChange('returnable', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Items</option>
            <option value="returnable">Returnable</option>
            <option value="non-returnable">Non-returnable</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedItems.length} items selected
            </span>
            <div className="flex space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded"
              >
                <option value="">Select Action</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Media
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Returnable
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
              {paginatedItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleItemSelect(item._id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.images && item.images[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{item.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{item.categoryName || 'No category'}</div>
                      <div className="text-gray-500">{item.subCategoryName || 'No subcategory'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        {item.images?.length || 0}
                      </div>
                      {item.videos && (
                        <div className="flex items-center">
                          <Upload className="w-4 h-4 mr-1" />
                          {item.videos.length}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      item.returnable 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {item.returnable ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Returnable
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Non-returnable
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StockStatus 
                      sizes={item.sizes}
                      variants={item.variants}
                      stockSizeOption={item.stockSizeOption}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/item-management-new/edit/${item._id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => selectProductForEdit(item)}
                        className={`${
                          selectedProductForEdit?._id === item._id
                            ? 'text-green-600 hover:text-green-900'
                            : 'text-blue-600 hover:text-blue-900'
                        }`}
                        title="Select for Media/Category Edit"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete(item);
                          setDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Management Dropdown Section - Removed */}

      {/* Recommendation Settings Dropdown Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div 
          className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowRecommendations(!showRecommendations)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-black">Recommendation Settings</h2>
              <p className="text-gray-600 text-sm mt-1">
                {selectedProductForEdit 
                  ? `Managing recommendations for: ${selectedProductForEdit.name || selectedProductForEdit.productName}`
                  : 'Select a product from the table above to manage its recommendations'
                }
              </p>
              {selectedProductForEdit && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    <Target className="w-3 h-3 mr-1" />
                    Selected Product
                  </span>
                </div>
              )}
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showRecommendations ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </div>
        
        {showRecommendations && (
          <div className="p-6 space-y-6">
            {!selectedProductForEdit ? (
              <div className="text-center py-8">
                <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Selected</h3>
                <p className="text-gray-500 mb-4">
                  Please select a product from the table above using the 📦 button to manage its recommendations
                </p>
              </div>
            ) : (
              <>
                {/* Product Info Banner */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-purple-900">
                        {selectedProductForEdit.name || selectedProductForEdit.productName}
                      </h4>
                      <p className="text-sm text-purple-600">
                        Managing recommendations for this product
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendation Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Recommendation Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setRecommendationType('you_may_also_like')}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        recommendationType === 'you_may_also_like' 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Heart className="w-5 h-5 mb-2" />
                      <h4 className="font-medium">You May Also Like</h4>
                      <p className="text-sm text-gray-500">Similar products based on category and features</p>
                    </button>
                    <button
                      onClick={() => setRecommendationType('others_also_bought')}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        recommendationType === 'others_also_bought' 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5 mb-2" />
                      <h4 className="font-medium">Others Also Bought</h4>
                      <p className="text-sm text-gray-500">Frequently bought together items</p>
                    </button>
                  </div>
                </div>

                {/* Recommendation Actions */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${recommendationType ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-medium">
                        Type: {recommendationType === 'you_may_also_like' ? 'You May Also Like' : recommendationType === 'others_also_bought' ? 'Others Also Bought' : 'Not selected'}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    disabled={!recommendationType}
                  >
                    Configure Recommendations
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Status Management Dropdown Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowStatusManagement(!showStatusManagement)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-black">Status Management</h2>
              <p className="text-gray-600 text-sm mt-1">
                {selectedProductForEdit 
                  ? `Managing status for: ${selectedProductForEdit.name || selectedProductForEdit.productName}`
                  : 'Select a product from the table above to manage its status'
                }
              </p>
              {selectedProductForEdit && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <Clock className="w-3 h-3 mr-1" />
                    Selected Product
                  </span>
                </div>
              )}
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showStatusManagement ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </div>
        
        {showStatusManagement && (
          <div className="p-6 space-y-6">
            {!selectedProductForEdit ? (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Selected</h3>
                <p className="text-gray-500 mb-4">
                  Please select a product from the table above using the 📦 button to manage its status
                </p>
              </div>
            ) : (
              <>
                {/* Product Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        {selectedProductForEdit.name || selectedProductForEdit.productName}
                      </h4>
                      <p className="text-sm text-blue-600">
                        Managing status for this product
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Options */}
                <div className="space-y-3">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleStatusChange(selectedProductForEdit, option.value);
                      }}
                      disabled={statusLoading[selectedProductForEdit.itemId || selectedProductForEdit._id]}
                      className={`w-full p-3 rounded border text-sm transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                        (selectedProductForEdit.status || 'draft') === option.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${option.color.split(' ')[0]}`}></div>
                        <span className="font-medium">{option.label}</span>
                        {statusLoading[selectedProductForEdit.itemId || selectedProductForEdit._id] && option.value !== (selectedProductForEdit.status || 'draft') && (
                          <div className="ml-auto">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Recommendation Settings Dropdown Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowRecommendationSettings(!showRecommendationSettings)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-black">Recommendation Settings</h2>
              <p className="text-gray-600 text-sm mt-1">
                {selectedProductForEdit 
                  ? `Managing recommendations for: ${selectedProductForEdit.name || selectedProductForEdit.productName}`
                  : 'Select a product from the table above to manage its recommendations'
                }
              </p>
              {selectedProductForEdit && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <Heart className="w-3 h-3 mr-1" />
                    Selected Product
                  </span>
                </div>
              )}
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showRecommendationSettings ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </div>
        
        {showRecommendationSettings && (
          <div className="p-6 space-y-6">
            {!selectedProductForEdit ? (
              <div className="text-center py-8">
                <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Selected</h3>
                <p className="text-gray-500 mb-4">
                  Please select a product from the table above using the 📦 button to manage its recommendations
                </p>
              </div>
            ) : (
              <>
                {/* Product Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        {selectedProductForEdit.name || selectedProductForEdit.productName}
                      </h4>
                      <p className="text-sm text-blue-600">
                        Managing recommendations for this product
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendation Options */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleAddToRecommendations(selectedProductForEdit, 'youMayAlsoLike')}
                    className="w-full p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="text-sm font-medium">You May Also Like</div>
                        <div className="text-xs text-gray-500">Add to recommendation</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAddToRecommendations(selectedProductForEdit, 'othersAlsoBought')}
                    className="w-full p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Others Also Bought</div>
                        <div className="text-xs text-gray-500">Add to cross-sell</div>
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Product Management Dropdown Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowProductManagement(!showProductManagement)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-black">Product Management</h2>
              <p className="text-gray-600 text-sm mt-1">
                {selectedProductForEdit 
                  ? `Advanced management for: ${selectedProductForEdit.name || selectedProductForEdit.productName}`
                  : 'Select a product from the table above to access advanced management options'
                }
              </p>
              {selectedProductForEdit && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <Package className="w-3 h-3 mr-1" />
                    Selected Product
                  </span>
                </div>
              )}
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showProductManagement ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </div>
        
        {showProductManagement && (
          <div className="p-6 space-y-6">
            {!selectedProductForEdit ? (
              <div className="text-center py-8">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Selected</h3>
                <p className="text-gray-500 mb-4">
                  Please select a product from the table above using the 📦 button to access management options
                </p>
              </div>
            ) : (
              <>
                {/* Product Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        {selectedProductForEdit.name || selectedProductForEdit.productName}
                      </h4>
                      <p className="text-sm text-blue-600">
                        Advanced management options for this product
                      </p>
                    </div>
                  </div>
                </div>

                {/* Management Options */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleMoveToSale(selectedProductForEdit)}
                    className="w-full p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">Move to Sale</div>
                        <div className="text-xs text-gray-500">Apply discount</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleKeepCopyAndMove(selectedProductForEdit)}
                    className="w-full p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Copy className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Keep Copy & Move</div>
                        <div className="text-xs text-gray-500">Duplicate first</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleMoveToEyx(selectedProductForEdit)}
                    className="w-full p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="text-sm font-medium">Move to EYX</div>
                        <div className="text-xs text-gray-500">Transfer platform</div>
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (itemToDelete) {
            handleDeleteItem(itemToDelete._id);
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
        itemName={itemToDelete?.name}
      />
    </div>
  );
};

export default ItemManagement;
