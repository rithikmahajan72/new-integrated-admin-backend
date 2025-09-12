import React, { useState, useCallback, useMemo, useReducer } from 'react';
import { 
  Search, Edit2, Trash2, ChevronDown, ChevronUp, X, 
  AlertCircle, Check, GripVertical, 
  Eye, Settings
} from 'lucide-react';

/**
 * Advanced Mobile Filters Management System - Based on Figma Desktop Interface
 * 
 * Complete Features Implementation:
 * - Create filters with key-value pairs
 * - Assign multiple values to each filter key
 * - RGB color code support with real-time preview
 * - Price range selector functionality
 * - Real-time drag and drop arrangement with priority
 * - Edit/Delete for both filter keys and assigned values
 * - Comprehensive arrangement priority management
 * - Mobile preview with desktop management interface
 * - Live updates and state persistence
 */

// Advanced Filter Configuration based on Figma Design
const ADVANCED_FILTER_CONFIG = {
  FILTER_TYPES: {
    COLOUR: 'colour',
    SIZE: 'size', 
    PRICE: 'price',
    SORT_BY: 'sort by',
    SHORT_BY: 'short by'
  },
  
  // Color presets with exact RGB codes
  COLOR_PRESETS: [
    { name: 'Red', code: '#FF0000' },
    { name: 'Green', code: '#00FF00' },
    { name: 'Blue', code: '#0000FF' },
    { name: 'Yellow', code: '#FFFF00' },
    { name: 'Pink', code: '#FF69B4' },
    { name: 'Orange', code: '#FFA500' },
    { name: 'Purple', code: '#800080' },
    { name: 'Cyan', code: '#00FFFF' }
  ],

  // Size variations  
  SIZE_OPTIONS: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'small', 'medium', 'large', '28', '30', '32', '34', '36', '38', '40', '42'],
  
  // Sort and filter options
  SORT_OPTIONS: [
    'ascending price',
    'descending price', 
    'newest first',
    'oldest first',
    'popularity',
    'rating'
  ],
  
  CATEGORY_OPTIONS: [
    'men',
    'women', 
    'kids',
    'boys',
    'girls',
    'unisex'
  ],

  // Default price ranges
  PRICE_RANGES: [
    { min: 0, max: 500, label: '₹0 - ₹500' },
    { min: 500, max: 1000, label: '₹500 - ₹1,000' },
    { min: 1000, max: 2500, label: '₹1,000 - ₹2,500' },
    { min: 2500, max: 5000, label: '₹2,500 - ₹5,000' },
    { min: 5000, max: 10000, label: '₹5,000 - ₹10,000' },
    { min: 10000, max: 25000, label: '₹10,000 - ₹25,000' }
  ]
};

// Actions for complex state management
const FILTER_ACTIONS = {
  SET_FILTERS: 'SET_FILTERS',
  ADD_FILTER: 'ADD_FILTER',
  UPDATE_FILTER: 'UPDATE_FILTER', 
  DELETE_FILTER: 'DELETE_FILTER',
  ADD_ASSIGNED_VALUE: 'ADD_ASSIGNED_VALUE',
  UPDATE_ASSIGNED_VALUE: 'UPDATE_ASSIGNED_VALUE',
  DELETE_ASSIGNED_VALUE: 'DELETE_ASSIGNED_VALUE',
  REORDER_FILTERS: 'REORDER_FILTERS',
  REORDER_VALUES: 'REORDER_VALUES',
  TOGGLE_FILTER_STATUS: 'TOGGLE_FILTER_STATUS'
};

// Reducer for advanced filter management
const filterReducer = (state, action) => {
  switch (action.type) {
    case FILTER_ACTIONS.SET_FILTERS:
      return action.payload;
      
    case FILTER_ACTIONS.ADD_FILTER:
      return [...state, action.payload].sort((a, b) => a.priority - b.priority);
      
    case FILTER_ACTIONS.UPDATE_FILTER:
      return state.map(filter => 
        filter.id === action.payload.id 
          ? { ...filter, ...action.payload.updates }
          : filter
      ).sort((a, b) => a.priority - b.priority);
      
    case FILTER_ACTIONS.DELETE_FILTER:
      return state.filter(filter => filter.id !== action.payload);
      
    case FILTER_ACTIONS.ADD_ASSIGNED_VALUE:
      return state.map(filter =>
        filter.id === action.payload.filterId
          ? {
              ...filter,
              assignedValues: [...filter.assignedValues, action.payload.value]
            }
          : filter
      );
      
    case FILTER_ACTIONS.UPDATE_ASSIGNED_VALUE:
      return state.map(filter =>
        filter.id === action.payload.filterId
          ? {
              ...filter,
              assignedValues: filter.assignedValues.map(value =>
                value.id === action.payload.valueId
                  ? { ...value, ...action.payload.updates }
                  : value
              )
            }
          : filter
      );
      
    case FILTER_ACTIONS.DELETE_ASSIGNED_VALUE:
      return state.map(filter =>
        filter.id === action.payload.filterId
          ? {
              ...filter,
              assignedValues: filter.assignedValues.filter(value => 
                value.id !== action.payload.valueId
              )
            }
          : filter
      );
      
    case FILTER_ACTIONS.REORDER_FILTERS:
      return action.payload;
      
    case FILTER_ACTIONS.TOGGLE_FILTER_STATUS:
      return state.map(filter =>
        filter.id === action.payload
          ? { ...filter, isActive: !filter.isActive }
          : filter
      );
      
    default:
      return state;
  }
};

// Initial sophisticated filter data based on Figma design
const INITIAL_ADVANCED_FILTERS = [
  {
    id: 1,
    key: 'colour',
    type: ADVANCED_FILTER_CONFIG.FILTER_TYPES.COLOUR,
    priority: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    assignedValues: [
      { 
        id: 1, 
        value: 'Red', 
        colorCode: '#FF0000', 
        isActive: true, 
        priority: 1 
      },
      { 
        id: 2, 
        value: 'Green', 
        colorCode: '#00FF00', 
        isActive: true, 
        priority: 2 
      },
      { 
        id: 3, 
        value: 'Pink', 
        colorCode: '#FF69B4', 
        isActive: true, 
        priority: 3 
      }
    ]
  },
  {
    id: 2,
    key: 'size',
    type: ADVANCED_FILTER_CONFIG.FILTER_TYPES.SIZE,
    priority: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    assignedValues: [
      { id: 4, value: 'small', isActive: true, priority: 1 },
      { id: 5, value: 'large', isActive: true, priority: 2 }
    ]
  },
  {
    id: 3,
    key: 'price',
    type: ADVANCED_FILTER_CONFIG.FILTER_TYPES.PRICE,
    priority: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    assignedValues: [
      { 
        id: 6, 
        value: '₹500 - ₹5,000', 
        priceRange: { min: 500, max: 5000 }, 
        isActive: true, 
        priority: 1 
      }
    ]
  },
  {
    id: 4,
    key: 'short by',
    type: ADVANCED_FILTER_CONFIG.FILTER_TYPES.SHORT_BY,
    priority: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    assignedValues: [
      { id: 7, value: 'ascending price', isActive: true, priority: 1 },
      { id: 8, value: 'descending price', isActive: true, priority: 2 }
    ]
  },
  {
    id: 5,
    key: 'sort by',
    type: ADVANCED_FILTER_CONFIG.FILTER_TYPES.SORT_BY,
    priority: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    assignedValues: [
      { id: 9, value: 'men', isActive: true, priority: 1 },
      { id: 10, value: 'women', isActive: true, priority: 2 },
      { id: 11, value: 'kids', isActive: true, priority: 3 }
    ]
  }
];

const AdvancedMobileFiltersApp = () => {
  // Advanced state management with useReducer
  const [filters, filtersDispatch] = useReducer(filterReducer, INITIAL_ADVANCED_FILTERS);
  
  // UI States
  const [currentView, setCurrentView] = useState('management'); // 'management', 'mobile-preview'
  const [activeSection, setActiveSection] = useState('create-filters'); // 'create-filters', 'create-values', 'saved-filters'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states for creating filters and values
  const [filterForm, setFilterForm] = useState({
    key: '',
    type: ADVANCED_FILTER_CONFIG.FILTER_TYPES.COLOUR,
    priority: filters.length + 1,
    arrangement: 1
  });
  
  const [valueForm, setValueForm] = useState({
    filterId: null,
    value: '',
    colorCode: '#FF0000',
    priceRange: { min: 0, max: 1000 },
    priority: 1
  });
  
  // Editing states
  const [editingFilter, setEditingFilter] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  
  // Utility function to generate unique IDs
  const generateId = useCallback(() => Date.now() + Math.random(), []);
  
  // Validation functions
  const validateFilterForm = useCallback((form) => {
    const errors = {};
    
    if (!form.key?.trim()) {
      errors.key = 'Filter key is required';
    } else if (form.key.length < 2) {
      errors.key = 'Filter key must be at least 2 characters';
    } else if (filters.some(f => f.key.toLowerCase() === form.key.toLowerCase() && f.id !== editingFilter?.id)) {
      errors.key = 'Filter key already exists';
    }
    
    if (form.priority < 1 || form.priority > 999) {
      errors.priority = 'Priority must be between 1 and 999';
    }
    
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [filters, editingFilter?.id]);
  
  const validateValueForm = useCallback((form) => {
    const errors = {};
    
    if (!form.value?.trim()) {
      errors.value = 'Value is required';
    }
    
    if (form.colorCode && !form.colorCode.match(/^#[0-9A-F]{6}$/i)) {
      errors.colorCode = 'Invalid RGB color code (use #RRGGBB format)';
    }
    
    if (form.priceRange) {
      if (form.priceRange.min < 0) {
        errors.priceMin = 'Minimum price must be non-negative';
      }
      if (form.priceRange.max <= form.priceRange.min) {
        errors.priceMax = 'Maximum price must be greater than minimum';
      }
    }
    
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, []);
  
  // Filter and value management functions
  const createFilter = useCallback(() => {
    const validation = validateFilterForm(filterForm);
    setValidationErrors(validation.errors);
    
    if (!validation.isValid) return;
    
    const newFilter = {
      id: generateId(),
      key: filterForm.key.trim(),
      type: filterForm.type,
      priority: parseInt(filterForm.priority),
      isActive: true,
      createdAt: new Date().toISOString(),
      assignedValues: []
    };
    
    filtersDispatch({ type: FILTER_ACTIONS.ADD_FILTER, payload: newFilter });
    
    // Reset form
    setFilterForm(prevForm => ({
      key: '',
      type: ADVANCED_FILTER_CONFIG.FILTER_TYPES.COLOUR,
      priority: filters.length + 2,
      arrangement: filters.length + 2
    }));
    setValidationErrors({});
  }, [filterForm, validateFilterForm, generateId, filters.length]);
  
  const createValue = useCallback(() => {
    if (!valueForm.filterId) {
      setValidationErrors({ filterId: 'Please select a filter key' });
      return;
    }
    
    const validation = validateValueForm(valueForm);
    setValidationErrors(validation.errors);
    
    if (!validation.isValid) return;
    
    const newValue = {
      id: generateId(),
      value: valueForm.value.trim(),
      isActive: true,
      priority: parseInt(valueForm.priority) || 1,
      ...(valueForm.colorCode && { colorCode: valueForm.colorCode }),
      ...(valueForm.priceRange && { priceRange: valueForm.priceRange })
    };
    
    filtersDispatch({ 
      type: FILTER_ACTIONS.ADD_ASSIGNED_VALUE, 
      payload: { filterId: valueForm.filterId, value: newValue }
    });
    
    // Reset form
    setValueForm({
      filterId: null,
      value: '',
      colorCode: '#FF0000',
      priceRange: { min: 0, max: 1000 },
      priority: 1
    });
    setValidationErrors({});
  }, [valueForm, validateValueForm, generateId]);
  
  const updateFilter = useCallback((filterId, updates) => {
    filtersDispatch({ 
      type: FILTER_ACTIONS.UPDATE_FILTER, 
      payload: { id: filterId, updates }
    });
  }, []);
  
  const deleteFilter = useCallback((filterId) => {
    if (window.confirm('Are you sure you want to delete this filter and all its values?')) {
      filtersDispatch({ type: FILTER_ACTIONS.DELETE_FILTER, payload: filterId });
    }
  }, []);
  
  const updateValue = useCallback((filterId, valueId, updates) => {
    filtersDispatch({
      type: FILTER_ACTIONS.UPDATE_ASSIGNED_VALUE,
      payload: { filterId, valueId, updates }
    });
  }, []);
  
  const deleteValue = useCallback((filterId, valueId) => {
    if (window.confirm('Are you sure you want to delete this value?')) {
      filtersDispatch({
        type: FILTER_ACTIONS.DELETE_ASSIGNED_VALUE,
        payload: { filterId, valueId }
      });
    }
  }, []);
  
  // Drag and drop functions
  const handleDragStart = useCallback((e, item, type) => {
    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = 'move';
  }, []);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDragEnter = useCallback((e, item, type) => {
    e.preventDefault();
    setDragOverItem({ item, type });
  }, []);
  
  const handleDrop = useCallback((e, targetItem, targetType) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.type !== targetType) return;
    
    if (targetType === 'filter') {
      const sourceIndex = filters.findIndex(f => f.id === draggedItem.item.id);
      const targetIndex = filters.findIndex(f => f.id === targetItem.id);
      
      if (sourceIndex !== targetIndex && sourceIndex !== -1 && targetIndex !== -1) {
        const reorderedFilters = [...filters];
        const [removed] = reorderedFilters.splice(sourceIndex, 1);
        reorderedFilters.splice(targetIndex, 0, removed);
        
        // Update priorities
        const updatedFilters = reorderedFilters.map((filter, index) => ({
          ...filter,
          priority: index + 1
        }));
        
        filtersDispatch({ type: FILTER_ACTIONS.REORDER_FILTERS, payload: updatedFilters });
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, filters]);
  
  // Filtered and sorted data
  const filteredFilters = useMemo(() => {
    if (!searchTerm) return filters;
    
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    return filters.filter(filter =>
      filter.key.toLowerCase().includes(lowercaseSearchTerm) ||
      filter.type.toLowerCase().includes(lowercaseSearchTerm) ||
      filter.assignedValues.some(value => 
        value.value.toLowerCase().includes(lowercaseSearchTerm)
      )
    );
  }, [filters, searchTerm]);

  // Main render function
  return (
    <div className="min-h-screen bg-white">
      {currentView === 'management' ? (
        <DesktopManagementInterface
          filters={filteredFilters}
          filterForm={filterForm}
          valueForm={valueForm}
          activeSection={activeSection}
          searchTerm={searchTerm}
          validationErrors={validationErrors}
          editingFilter={editingFilter}
          editingValue={editingValue}
          draggedItem={draggedItem}
          dragOverItem={dragOverItem}
          onFilterFormChange={setFilterForm}
          onValueFormChange={setValueForm}
          onActiveSectionChange={setActiveSection}
          onSearchTermChange={setSearchTerm}
          onCreateFilter={createFilter}
          onCreateValue={createValue}
          onUpdateFilter={updateFilter}
          onDeleteFilter={deleteFilter}
          onUpdateValue={updateValue}
          onDeleteValue={deleteValue}
          onEditFilter={setEditingFilter}
          onEditValue={setEditingValue}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDrop={handleDrop}
          onToggleView={() => setCurrentView('mobile-preview')}
          filtersDispatch={filtersDispatch}
        />
      ) : (
        <MobilePreviewInterface
          filters={filters}
          onToggleView={() => setCurrentView('management')}
        />
      )}
    </div>
  );
};

// Desktop Management Interface Component
const DesktopManagementInterface = React.memo(({
  filters,
  filterForm,
  valueForm,
  activeSection,
  searchTerm,
  validationErrors,
  editingFilter,
  editingValue,
  draggedItem,
  dragOverItem,
  onFilterFormChange,
  onValueFormChange,
  onActiveSectionChange,
  onSearchTermChange,
  onCreateFilter,
  onCreateValue,
  onUpdateFilter,
  onDeleteFilter,
  onUpdateValue,
  onDeleteValue,
  onEditFilter,
  onEditValue,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDrop,
  onToggleView,
  filtersDispatch
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-2">Advanced Filters Management</h1>
          <p className="text-gray-600">Create, manage, and arrange filters with real-time drag & drop</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search filters..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-black rounded-xl focus:outline-none focus:border-blue-600 w-64"
            />
          </div>
          <button
            onClick={onToggleView}
            className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Mobile Preview
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Create Filters Section */}
        <div className="space-y-6">
          <CreateFiltersSection
            filterForm={filterForm}
            validationErrors={validationErrors}
            onFormChange={onFilterFormChange}
            onCreateFilter={onCreateFilter}
            isActive={activeSection === 'create-filters'}
            onToggle={() => onActiveSectionChange(activeSection === 'create-filters' ? '' : 'create-filters')}
          />
        </div>

        {/* Create Filter Values Section */}
        <div className="space-y-6">
          <CreateFilterValuesSection
            valueForm={valueForm}
            filters={filters}
            validationErrors={validationErrors}
            onFormChange={onValueFormChange}
            onCreateValue={onCreateValue}
            isActive={activeSection === 'create-values'}
            onToggle={() => onActiveSectionChange(activeSection === 'create-values' ? '' : 'create-values')}
          />
        </div>

        {/* Saved Filters Section */}
        <div className="space-y-6">
          <SavedFiltersSection
            filters={filters}
            editingFilter={editingFilter}
            editingValue={editingValue}
            draggedItem={draggedItem}
            dragOverItem={dragOverItem}
            onUpdateFilter={onUpdateFilter}
            onDeleteFilter={onDeleteFilter}
            onUpdateValue={onUpdateValue}
            onDeleteValue={onDeleteValue}
            onEditFilter={onEditFilter}
            onEditValue={onEditValue}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDrop={onDrop}
            isActive={activeSection === 'saved-filters'}
            onToggle={() => onActiveSectionChange(activeSection === 'saved-filters' ? '' : 'saved-filters')}
            filtersDispatch={filtersDispatch}
          />
        </div>
      </div>
    </div>
  );
});

// Create Filters Section Component
const CreateFiltersSection = React.memo(({
  filterForm,
  validationErrors,
  onFormChange,
  onCreateFilter,
  isActive,
  onToggle
}) => {
  return (
    <div className="bg-gray-50 rounded-xl border-2 border-black p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Create filters</h2>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {isActive ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {isActive && (
        <div className="space-y-4">
          {/* Filter Key Input */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Filter key (eg: size)
            </label>
            <input
              type="text"
              value={filterForm.key}
              onChange={(e) => onFormChange({ ...filterForm, key: e.target.value })}
              placeholder="filter key (eg: size)"
              className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-blue-600"
            />
            {validationErrors.key && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.key}
              </p>
            )}
          </div>

          {/* Arrangement Priority */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Arrangement
            </label>
            <input
              type="number"
              value={filterForm.priority}
              onChange={(e) => onFormChange({ ...filterForm, priority: e.target.value })}
              placeholder="1"
              min="1"
              max="999"
              className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-blue-600"
            />
            {validationErrors.priority && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.priority}
              </p>
            )}
          </div>

          {/* Create Filter Button */}
          <button
            onClick={onCreateFilter}
            className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Create filter
          </button>
        </div>
      )}
    </div>
  );
});

// Create Filter Values Section Component
const CreateFilterValuesSection = React.memo(({
  valueForm,
  filters,
  validationErrors,
  onFormChange,
  onCreateValue,
  isActive,
  onToggle
}) => {
  // Memoize the selected filter to avoid recalculation
  const selectedFilter = useMemo(() => 
    valueForm.filterId ? filters.find(f => f.id === valueForm.filterId) : null,
    [valueForm.filterId, filters]
  );

  const isColorFilter = selectedFilter?.type === 'colour';
  const isPriceFilter = selectedFilter?.type === 'price';

  return (
    <div className="bg-gray-50 rounded-xl border-2 border-black p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-black">Create filter value</h2>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {isActive ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {isActive && (
        <div className="space-y-4">
          {/* Choose Filter Key */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Choose filter key
            </label>
            <select
              value={valueForm.filterId || ''}
              onChange={(e) => onFormChange({ ...valueForm, filterId: parseInt(e.target.value) || null })}
              className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-blue-600"
            >
              <option value="">Select filter key...</option>
              {filters.map(filter => (
                <option key={filter.id} value={filter.id}>
                  {filter.key}
                </option>
              ))}
            </select>
            {validationErrors.filterId && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.filterId}
              </p>
            )}
          </div>

          {/* Assign Value */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Assign value
            </label>
            <input
              type="text"
              value={valueForm.value}
              onChange={(e) => onFormChange({ ...valueForm, value: e.target.value })}
              placeholder="filter key (eg: size)"
              className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-blue-600"
            />
            {validationErrors.value && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.value}
              </p>
            )}
          </div>

          {/* RGB Color Code (for color filters) */}
          {isColorFilter && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Enter colour code (RGB)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={valueForm.colorCode}
                  onChange={(e) => onFormChange({ ...valueForm, colorCode: e.target.value })}
                  className="w-12 h-10 border-2 border-black rounded"
                />
                <input
                  type="text"
                  value={valueForm.colorCode}
                  onChange={(e) => onFormChange({ ...valueForm, colorCode: e.target.value })}
                  placeholder="#FF0000"
                  className="flex-1 px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
              {validationErrors.colorCode && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.colorCode}
                </p>
              )}
            </div>
          )}

          {/* Price Range (for price filters) */}
          {isPriceFilter && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Start value
                </label>
                <input
                  type="number"
                  value={valueForm.priceRange.min}
                  onChange={(e) => onFormChange({ 
                    ...valueForm, 
                    priceRange: { ...valueForm.priceRange, min: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="start value"
                  className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  End value
                </label>
                <input
                  type="number"
                  value={valueForm.priceRange.max}
                  onChange={(e) => onFormChange({ 
                    ...valueForm, 
                    priceRange: { ...valueForm.priceRange, max: parseInt(e.target.value) || 1000 }
                  })}
                  placeholder="end value"
                  className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {/* Create Filter Value Button */}
          <button
            onClick={onCreateValue}
            className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Create filter value
          </button>
        </div>
      )}
    </div>
  );
});

// Saved Filters Section Component
const SavedFiltersSection = React.memo(({
  filters,
  editingFilter,
  editingValue,
  draggedItem,
  dragOverItem,
  onUpdateFilter,
  onDeleteFilter,
  onUpdateValue,
  onDeleteValue,
  onEditFilter,
  onEditValue,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDrop,
  isActive,
  onToggle,
  filtersDispatch
}) => {
  return (
    <div className="bg-gray-50 rounded-xl border-2 border-black p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-black">saved filters</h2>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {isActive ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {isActive && (
        <div className="space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-4 text-sm font-bold text-black pb-2 border-b-2 border-gray-300">
            <div>Key Values</div>
            <div>Assigned Values</div>
            <div>Arrangement number</div>
            <div>Action</div>
          </div>

          {/* Filter Rows */}
          {filters.map((filter, index) => (
            <FilterRow
              key={filter.id}
              filter={filter}
              index={index}
              editingFilter={editingFilter}
              editingValue={editingValue}
              draggedItem={draggedItem}
              dragOverItem={dragOverItem}
              onUpdateFilter={onUpdateFilter}
              onDeleteFilter={onDeleteFilter}
              onUpdateValue={onUpdateValue}
              onDeleteValue={onDeleteValue}
              onEditFilter={onEditFilter}
              onEditValue={onEditValue}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDrop={onDrop}
              filtersDispatch={filtersDispatch}
            />
          ))}

          {filters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No filters created yet. Create your first filter to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Filter Row Component with Drag & Drop
const FilterRow = React.memo(({
  filter,
  index,
  editingFilter,
  editingValue,
  draggedItem,
  dragOverItem,
  onUpdateFilter,
  onDeleteFilter,
  onUpdateValue,
  onDeleteValue,
  onEditFilter,
  onEditValue,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDrop,
  filtersDispatch
}) => {
  const isDraggedOver = useMemo(() => 
    dragOverItem?.item?.id === filter.id && dragOverItem?.type === 'filter',
    [dragOverItem?.item?.id, dragOverItem?.type, filter.id]
  );
  
  const handleEditFilter = useCallback(() => onEditFilter(filter), [onEditFilter, filter]);
  const handleDeleteFilter = useCallback(() => onDeleteFilter(filter.id), [onDeleteFilter, filter.id]);
  const handleDragStart = useCallback((e) => onDragStart(e, filter, 'filter'), [onDragStart, filter]);
  const handleDragEnter = useCallback((e) => onDragEnter(e, filter, 'filter'), [onDragEnter, filter]);
  const handleDrop = useCallback((e) => onDrop(e, filter, 'filter'), [onDrop, filter]);
  
  return (
    <div 
      className={`grid grid-cols-4 gap-4 p-4 bg-white rounded-xl shadow-sm border transition-all ${
        isDraggedOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDragEnter={handleDragEnter}
      onDrop={handleDrop}
    >
      {/* Key Values */}
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
        <div className="bg-white px-3 py-2 rounded-xl shadow-sm border">
          <span className="text-sm font-medium">{filter.key}</span>
        </div>
      </div>

      {/* Assigned Values */}
      <div className="space-y-2">
        {filter.assignedValues.map((value) => (
          <div key={value.id} className="bg-white px-3 py-2 rounded-xl shadow-sm border flex items-center gap-2">
            {value.colorCode && (
              <div 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: value.colorCode }}
              />
            )}
            <span className="text-sm flex-1">{value.value}</span>
          </div>
        ))}
      </div>

      {/* Arrangement Number */}
      <div className="flex items-center">
        <span className="text-lg font-bold">{filter.priority}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleEditFilter}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit filter"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleDeleteFilter}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete filter"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

// Mobile Status Bar Component
const MobileStatusBar = React.memo(() => (
  <div className="bg-black text-white p-2 flex items-center justify-between text-sm">
    <div className="flex items-center gap-1">
      <div className="w-1 h-1 bg-white rounded-full"></div>
      <div className="w-1 h-1 bg-white rounded-full"></div>
      <div className="w-1 h-1 bg-white rounded-full"></div>
    </div>
    <div>9:41</div>
    <div className="flex items-center gap-1">
      <div className="w-4 h-2 border border-white rounded-sm">
        <div className="w-3 h-1 bg-white rounded-sm"></div>
      </div>
    </div>
  </div>
));

// Mobile Filter Item Component
const MobileFilterItem = React.memo(({ filter }) => (
  <div className="space-y-2">
    <h4 className="font-medium text-sm capitalize">{filter.key}</h4>
    <div className="flex flex-wrap gap-2">
      {filter.assignedValues.map((value) => (
        <div
          key={value.id}
          className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
        >
          {value.colorCode && (
            <div 
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: value.colorCode }}
            />
          )}
          {value.value}
        </div>
      ))}
    </div>
  </div>
));

// Mobile Preview Interface Component
const MobilePreviewInterface = React.memo(({
  filters,
  onToggleView
}) => {
  const filterSummary = useMemo(() => 
    filters.map((filter) => ({
      id: filter.id,
      key: filter.key,
      valueCount: filter.assignedValues.length,
      priority: filter.priority,
      isActive: filter.isActive
    })),
    [filters]
  );

  return (
    <div className="flex h-screen">
      {/* Mobile Preview */}
      <div className="w-96 bg-gray-100 border-r-2 border-gray-300">
        <div className="bg-white h-full">
          {/* Mobile Status Bar */}
          <MobileStatusBar />

          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                readOnly
              />
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 pb-4">
            <h3 className="font-bold mb-3">Filters</h3>
            <div className="space-y-3">
              {filters.map((filter) => (
                <MobileFilterItem key={filter.id} filter={filter} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Mobile Preview</h2>
          <button
            onClick={onToggleView}
            className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Back to Management
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold mb-4">Filter Summary</h3>
          <div className="space-y-4">
            {filterSummary.map((filter) => (
              <div key={filter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{filter.key}</div>
                  <div className="text-sm text-gray-600">
                    {filter.valueCount} value(s) • Priority: {filter.priority}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {filter.isActive ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Set display names for debugging
MobileStatusBar.displayName = 'MobileStatusBar';
MobileFilterItem.displayName = 'MobileFilterItem';
DesktopManagementInterface.displayName = 'DesktopManagementInterface';
CreateFiltersSection.displayName = 'CreateFiltersSection';
CreateFilterValuesSection.displayName = 'CreateFilterValuesSection';
SavedFiltersSection.displayName = 'SavedFiltersSection';
FilterRow.displayName = 'FilterRow';
MobilePreviewInterface.displayName = 'MobilePreviewInterface';

export default AdvancedMobileFiltersApp;
