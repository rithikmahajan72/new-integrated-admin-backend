import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useReducer,
} from "react";
import {
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  AlertCircle,
  Check,
  Filter,
  Plus,
  Minus,
  GripVertical,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
} from "lucide-react";

// Constants moved outside component to prevent recreation
const DEFAULT_FILTER_FORM = {
  key: "",
  type: "colour",
  priority: 1,
  arrangement: 1,
};

const DEFAULT_VALUE_FORM = {
  filterId: null,
  value: "",
  colorCode: "#000000",
  priceRange: { min: 0, max: 1000 },
  priority: 1,
};

// Memoized color regex for validation
const COLOR_REGEX = /^#[0-9A-F]{6}$/i;

/**
 * Zara-Style Advanced Filters Management System
 *
 * Complete Features Implementation:
 * - Create filters with key-value pairs (based on Figma admin design)
 * - Assign multiple values to each filter key
 * - RGB color code support with real-time preview
 * - Price range selector functionality
 * - Real-time drag and drop arrangement with priority
 * - Edit/Delete for both filter keys and assigned values
 * - Comprehensive arrangement priority management
 * - Mobile preview with desktop management interface
 * - Live updates and state persistence
 * - Zara-style UI design matching Figma specifications
 */

// Zara Filter Configuration based on Figma Design
const ZARA_FILTER_CONFIG = {
  FILTER_TYPES: {
    COLOUR: "colour",
    SIZE: "size",
    PRICE: "price",
    SORT_BY: "sort by",
    SHORT_BY: "short by",
    CATEGORY: "category",
  },

  // Color presets with exact RGB codes (Zara-style colors)
  COLOR_PRESETS: [
    { name: "Black", code: "#000000" },
    { name: "White", code: "#FFFFFF" },
    { name: "Red", code: "#FF0000" },
    { name: "Navy", code: "#000080" },
    { name: "Beige", code: "#F5F5DC" },
    { name: "Green", code: "#008000" },
    { name: "Pink", code: "#FF69B4" },
    { name: "Grey", code: "#808080" },
    { name: "Brown", code: "#8B4513" },
    { name: "Blue", code: "#0000FF" },
  ],

  // Size variations (Zara-style sizing)
  SIZE_OPTIONS: [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "34",
    "36",
    "38",
    "40",
    "42",
    "44",
    "46",
    "48",
    "6",
    "8",
    "10",
    "12",
    "14",
    "16",
    "18",
    "ONE SIZE",
  ],

  // Sort and filter options (Zara-style)
  SORT_OPTIONS: [
    "newest",
    "price low to high",
    "price high to low",
    "most popular",
    "best rated",
    "featured",
  ],

  CATEGORY_OPTIONS: ["woman", "man", "kids", "baby", "home", "beauty"],

  // Zara-style price ranges
  PRICE_RANGES: [
    { min: 0, max: 1000, label: "₹0 - ₹1,000" },
    { min: 1000, max: 2500, label: "₹1,000 - ₹2,500" },
    { min: 2500, max: 5000, label: "₹2,500 - ₹5,000" },
    { min: 5000, max: 10000, label: "₹5,000 - ₹10,000" },
    { min: 10000, max: 20000, label: "₹10,000 - ₹20,000" },
    { min: 20000, max: 50000, label: "₹20,000 - ₹50,000" },
  ],
};

// Actions for complex state management
const FILTER_ACTIONS = {
  SET_FILTERS: "SET_FILTERS",
  ADD_FILTER: "ADD_FILTER",
  UPDATE_FILTER: "UPDATE_FILTER",
  DELETE_FILTER: "DELETE_FILTER",
  ADD_ASSIGNED_VALUE: "ADD_ASSIGNED_VALUE",
  UPDATE_ASSIGNED_VALUE: "UPDATE_ASSIGNED_VALUE",
  DELETE_ASSIGNED_VALUE: "DELETE_ASSIGNED_VALUE",
  REORDER_FILTERS: "REORDER_FILTERS",
  REORDER_VALUES: "REORDER_VALUES",
  TOGGLE_FILTER_STATUS: "TOGGLE_FILTER_STATUS",
};

// Memoized reducer for better performance
const filterReducer = (state, action) => {
  switch (action.type) {
    case FILTER_ACTIONS.SET_FILTERS:
      return action.payload;

    case FILTER_ACTIONS.ADD_FILTER: {
      const newState = [...state, action.payload];
      return newState.sort((a, b) => a.priority - b.priority);
    }

    case FILTER_ACTIONS.UPDATE_FILTER: {
      const newState = state.map((filter) =>
        filter.id === action.payload.id
          ? { ...filter, ...action.payload.updates }
          : filter
      );
      return newState.sort((a, b) => a.priority - b.priority);
    }

    case FILTER_ACTIONS.DELETE_FILTER:
      return state.filter((filter) => filter.id !== action.payload);

    case FILTER_ACTIONS.ADD_ASSIGNED_VALUE:
      return state.map((filter) =>
        filter.id === action.payload.filterId
          ? {
              ...filter,
              assignedValues: [...filter.assignedValues, action.payload.value],
            }
          : filter
      );

    case FILTER_ACTIONS.UPDATE_ASSIGNED_VALUE:
      return state.map((filter) =>
        filter.id === action.payload.filterId
          ? {
              ...filter,
              assignedValues: filter.assignedValues.map((value) =>
                value.id === action.payload.valueId
                  ? { ...value, ...action.payload.updates }
                  : value
              ),
            }
          : filter
      );

    case FILTER_ACTIONS.DELETE_ASSIGNED_VALUE:
      return state.map((filter) =>
        filter.id === action.payload.filterId
          ? {
              ...filter,
              assignedValues: filter.assignedValues.filter(
                (value) => value.id !== action.payload.valueId
              ),
            }
          : filter
      );

    case FILTER_ACTIONS.REORDER_FILTERS:
      return action.payload;

    case FILTER_ACTIONS.TOGGLE_FILTER_STATUS:
      return state.map((filter) =>
        filter.id === action.payload
          ? { ...filter, isActive: !filter.isActive }
          : filter
      );

    default:
      return state;
  }
};

// Memoized initial data to prevent recreation
const INITIAL_ZARA_FILTERS = (() => {
  const timestamp = new Date().toISOString();
  return [
    {
      id: 1,
      key: "colour",
      type: ZARA_FILTER_CONFIG.FILTER_TYPES.COLOUR,
      priority: 1,
      isActive: true,
      createdAt: timestamp,
      assignedValues: [
        {
          id: 1,
          value: "Black",
          colorCode: "#000000",
          isActive: true,
          priority: 1,
        },
        {
          id: 2,
          value: "White",
          colorCode: "#FFFFFF",
          isActive: true,
          priority: 2,
        },
        {
          id: 3,
          value: "Red",
          colorCode: "#FF0000",
          isActive: true,
          priority: 3,
        },
      ],
    },
    {
      id: 2,
      key: "size",
      type: ZARA_FILTER_CONFIG.FILTER_TYPES.SIZE,
      priority: 2,
      isActive: true,
      createdAt: timestamp,
      assignedValues: [
        { id: 4, value: "XS", isActive: true, priority: 1 },
        { id: 5, value: "S", isActive: true, priority: 2 },
        { id: 6, value: "M", isActive: true, priority: 3 },
        { id: 7, value: "L", isActive: true, priority: 4 },
      ],
    },
    {
      id: 3,
      key: "price",
      type: ZARA_FILTER_CONFIG.FILTER_TYPES.PRICE,
      priority: 3,
      isActive: true,
      createdAt: timestamp,
      assignedValues: [
        {
          id: 8,
          value: "₹1,000 - ₹5,000",
          priceRange: { min: 1000, max: 5000 },
          isActive: true,
          priority: 1,
        },
        {
          id: 9,
          value: "₹5,000 - ₹10,000",
          priceRange: { min: 5000, max: 10000 },
          isActive: true,
          priority: 2,
        },
      ],
    },
    {
      id: 4,
      key: "sort by",
      type: ZARA_FILTER_CONFIG.FILTER_TYPES.SORT_BY,
      priority: 4,
      isActive: true,
      createdAt: timestamp,
      assignedValues: [
        { id: 10, value: "newest", isActive: true, priority: 1 },
        { id: 11, value: "price low to high", isActive: true, priority: 2 },
        { id: 12, value: "price high to low", isActive: true, priority: 3 },
      ],
    },
    {
      id: 5,
      key: "category",
      type: ZARA_FILTER_CONFIG.FILTER_TYPES.CATEGORY,
      priority: 5,
      isActive: true,
      createdAt: timestamp,
      assignedValues: [
        { id: 13, value: "woman", isActive: true, priority: 1 },
        { id: 14, value: "man", isActive: true, priority: 2 },
        { id: 15, value: "kids", isActive: true, priority: 3 },
      ],
    },
  ];
})();

const Filters = () => {
  // Advanced state management with useReducer
  const [filters, filtersDispatch] = useReducer(
    filterReducer,
    INITIAL_ZARA_FILTERS
  );

  // UI States
  const [currentView, setCurrentView] = useState("management");
  const [activeSection, setActiveSection] = useState("create-filters");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Form states - use useMemo to prevent recreation
  const [filterForm, setFilterForm] = useState(() => ({
    ...DEFAULT_FILTER_FORM,
    priority: INITIAL_ZARA_FILTERS.length + 1,
  }));

  const [valueForm, setValueForm] = useState(DEFAULT_VALUE_FORM);

  // Editing states
  const [editingFilter, setEditingFilter] = useState(null);
  const [editingValue, setEditingValue] = useState(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoized utility function to generate unique IDs
  const generateId = useCallback(() => Date.now() + Math.random(), []);

  // Memoized validation functions for better performance
  const validateFilterForm = useCallback(
    (form) => {
      const errors = {};
      const trimmedKey = form.key?.trim();

      if (!trimmedKey) {
        errors.key = "Filter key is required";
      } else if (trimmedKey.length < 2) {
        errors.key = "Filter key must be at least 2 characters";
      } else {
        const existingFilter = filters.find(
          (f) =>
            f.key.toLowerCase() === trimmedKey.toLowerCase() &&
            f.id !== editingFilter?.id
        );
        if (existingFilter) {
          errors.key = "Filter key already exists";
        }
      }

      const priority = parseInt(form.priority);
      if (isNaN(priority) || priority < 1 || priority > 999) {
        errors.priority = "Priority must be between 1 and 999";
      }

      return { errors, isValid: Object.keys(errors).length === 0 };
    },
    [filters, editingFilter?.id]
  );

  const validateValueForm = useCallback((form) => {
    const errors = {};

    if (!form.value?.trim()) {
      errors.value = "Value is required";
    }

    if (form.colorCode && !COLOR_REGEX.test(form.colorCode)) {
      errors.colorCode = "Invalid RGB color code (use #RRGGBB format)";
    }

    if (form.priceRange) {
      if (form.priceRange.min < 0) {
        errors.priceMin = "Minimum price must be non-negative";
      }
      if (form.priceRange.max <= form.priceRange.min) {
        errors.priceMax = "Maximum price must be greater than minimum";
      }
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, []);

  // Optimized filter and value management functions
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
      assignedValues: [],
    };

    filtersDispatch({ type: FILTER_ACTIONS.ADD_FILTER, payload: newFilter });

    // Reset form with new priority
    setFilterForm((prev) => ({
      ...DEFAULT_FILTER_FORM,
      priority: prev.priority + 1,
    }));
    setValidationErrors({});
  }, [filterForm, validateFilterForm, generateId]);

  const createValue = useCallback(() => {
    if (!valueForm.filterId) {
      setValidationErrors({ filterId: "Please select a filter key" });
      return;
    }

    const validation = validateValueForm(valueForm);
    setValidationErrors(validation.errors);

    if (!validation.isValid) return;

    const selectedFilter = filters.find((f) => f.id === valueForm.filterId);
    if (!selectedFilter) return;

    const newValue = {
      id: generateId(),
      value: valueForm.value.trim(),
      isActive: true,
      priority: parseInt(valueForm.priority) || 1,
      ...(selectedFilter.type === "colour" &&
        valueForm.colorCode && { colorCode: valueForm.colorCode }),
      ...(selectedFilter.type === "price" &&
        valueForm.priceRange && { priceRange: valueForm.priceRange }),
    };

    filtersDispatch({
      type: FILTER_ACTIONS.ADD_ASSIGNED_VALUE,
      payload: { filterId: valueForm.filterId, value: newValue },
    });

    // Reset form
    setValueForm(DEFAULT_VALUE_FORM);
    setValidationErrors({});
  }, [valueForm, validateValueForm, generateId, filters]);

  // Memoized action callbacks to prevent unnecessary re-renders
  const updateFilter = useCallback((filterId, updates) => {
    filtersDispatch({
      type: FILTER_ACTIONS.UPDATE_FILTER,
      payload: { id: filterId, updates },
    });
  }, []);

  const deleteFilter = useCallback((filterId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this filter and all its values?"
      )
    ) {
      filtersDispatch({
        type: FILTER_ACTIONS.DELETE_FILTER,
        payload: filterId,
      });
    }
  }, []);

  const updateValue = useCallback((filterId, valueId, updates) => {
    filtersDispatch({
      type: FILTER_ACTIONS.UPDATE_ASSIGNED_VALUE,
      payload: { filterId, valueId, updates },
    });
  }, []);

  const deleteValue = useCallback((filterId, valueId) => {
    if (window.confirm("Are you sure you want to delete this value?")) {
      filtersDispatch({
        type: FILTER_ACTIONS.DELETE_ASSIGNED_VALUE,
        payload: { filterId, valueId },
      });
    }
  }, []);

  // Optimized drag and drop functions with better performance
  const handleDragStart = useCallback((e, item, type) => {
    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback((e, item, type) => {
    e.preventDefault();
    setDragOverItem({ item, type });
  }, []);

  const handleDrop = useCallback(
    (e, targetItem, targetType) => {
      e.preventDefault();

      if (
        !draggedItem ||
        draggedItem.type !== targetType ||
        draggedItem.item.id === targetItem.id
      ) {
        setDraggedItem(null);
        setDragOverItem(null);
        return;
      }

      if (targetType === "filter") {
        const sourceIndex = filters.findIndex(
          (f) => f.id === draggedItem.item.id
        );
        const targetIndex = filters.findIndex((f) => f.id === targetItem.id);

        if (
          sourceIndex !== -1 &&
          targetIndex !== -1 &&
          sourceIndex !== targetIndex
        ) {
          const reorderedFilters = [...filters];
          const [removed] = reorderedFilters.splice(sourceIndex, 1);
          reorderedFilters.splice(targetIndex, 0, removed);

          // Update priorities
          const updatedFilters = reorderedFilters.map((filter, index) => ({
            ...filter,
            priority: index + 1,
          }));

          filtersDispatch({
            type: FILTER_ACTIONS.REORDER_FILTERS,
            payload: updatedFilters,
          });
        }
      }

      setDraggedItem(null);
      setDragOverItem(null);
    },
    [draggedItem, filters]
  );

  // Optimized filtered and sorted data with debounced search
  const filteredFilters = useMemo(() => {
    if (!debouncedSearchTerm) return filters;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return filters.filter((filter) => {
      const keyMatch = filter.key.toLowerCase().includes(searchLower);
      const typeMatch = filter.type.toLowerCase().includes(searchLower);
      const valueMatch = filter.assignedValues.some((value) =>
        value.value.toLowerCase().includes(searchLower)
      );
      return keyMatch || typeMatch || valueMatch;
    });
  }, [filters, debouncedSearchTerm]);

  // Memoized view toggle functions
  const toggleToMobileView = useCallback(
    () => setCurrentView("mobile-preview"),
    []
  );
  const toggleToManagementView = useCallback(
    () => setCurrentView("management"),
    []
  );

  // Memoized section toggle functions
  const toggleCreateFiltersSection = useCallback(() => {
    setActiveSection((prev) =>
      prev === "create-filters" ? "" : "create-filters"
    );
  }, []);

  const toggleCreateValuesSection = useCallback(() => {
    setActiveSection((prev) =>
      prev === "create-values" ? "" : "create-values"
    );
  }, []);

  const toggleSavedFiltersSection = useCallback(() => {
    setActiveSection((prev) =>
      prev === "saved-filters" ? "" : "saved-filters"
    );
  }, []);

  // Main render function
  return (
    <div className="min-h-screen bg-white">
      {currentView === "management" ? (
        <ZaraDesktopManagementInterface
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
          onToggleView={toggleToMobileView}
          onToggleCreateFilters={toggleCreateFiltersSection}
          onToggleCreateValues={toggleCreateValuesSection}
          onToggleSavedFilters={toggleSavedFiltersSection}
          filtersDispatch={filtersDispatch}
        />
      ) : (
        <ZaraMobilePreviewInterface
          filters={filters}
          onToggleView={toggleToManagementView}
        />
      )}
    </div>
  );
};

// Optimized Zara Desktop Management Interface Component
const ZaraDesktopManagementInterface = React.memo(
  ({
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
    onToggleCreateFilters,
    onToggleCreateValues,
    onToggleSavedFilters,
    filtersDispatch,
  }) => {
    return (
      <div className="2xl:max-w-7xl xl:w-full p-4">
        {/* Zara-style Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-black">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2 tracking-wide">
              FILTERS MANAGEMENT
            </h1>
            <p className="text-gray-600 text-lg">
              Create, manage, and arrange filters with real-time preview
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search filters..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-12 pr-6 py-3 border-2 border-black rounded-none focus:outline-none focus:border-gray-600 w-80 text-lg"
              />
            </div>
            <button
              onClick={onToggleView}
              className="px-5 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors flex items-center gap-3 text-lg"
            >
              <Smartphone className="h-5 w-5" />
              PREVIEW APP
            </button>
          </div>
        </div>

        {/* Main Content Grid - Zara Style */}
        <div className="grid xl:grid-cols-2 sm:grid-cols-1 gap-4">
          {/* Create Filters Section */}
          <div className="space-y-6">
            <ZaraCreateFiltersSection
              filterForm={filterForm}
              validationErrors={validationErrors}
              onFormChange={onFilterFormChange}
              onCreateFilter={onCreateFilter}
              isActive={activeSection === "create-filters"}
              onToggle={onToggleCreateFilters}
            />
          </div>

          {/* Create Filter Values Section */}
          <div className="space-y-6">
            <ZaraCreateFilterValuesSection
              valueForm={valueForm}
              filters={filters}
              validationErrors={validationErrors}
              onFormChange={onValueFormChange}
              onCreateValue={onCreateValue}
              isActive={activeSection === "create-values"}
              onToggle={onToggleCreateValues}
            />
          </div>

          {/* Saved Filters Section */}
          <div className="space-y-6 xl:min-w-[700px]">
            <ZaraSavedFiltersSection
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
              isActive={activeSection === "saved-filters"}
              onToggle={onToggleSavedFilters}
              filtersDispatch={filtersDispatch}
            />
          </div>
        </div>
      </div>
    );
  }
);

// Zara Create Filters Section Component
const ZaraCreateFiltersSection = React.memo(
  ({
    filterForm,
    validationErrors,
    onFormChange,
    onCreateFilter,
    isActive,
    onToggle,
  }) => {
    return (
      <div className="bg-gray-50 border-2 border-black rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-2.5 bg-black text-white">
          <h2 className="text-xl font-bold tracking-wide">CREATE FILTERS</h2>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-800 transition-colors rounded-full"
          >
            {isActive ? (
              <ChevronUp className="h-6 w-6" />
            ) : (
              <ChevronDown className="h-6 w-6" />
            )}
          </button>
        </div>

        {isActive && (
          <div className="p-6 space-y-6">
            {/* Filter Key Input */}
            <div>
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                Filter key (eg: size)
              </label>
              <input
                type="text"
                value={filterForm.key}
                onChange={(e) =>
                  onFormChange({ ...filterForm, key: e.target.value })
                }
                placeholder="Enter filter key"
                className="w-full px-4 py-4 border-2 border-black focus:outline-none focus:border-gray-600 text-lg"
              />
              {validationErrors.key && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.key}
                </p>
              )}
            </div>

            {/* Filter Type Selection */}
            <div>
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                Filter Type
              </label>
              <select
                value={filterForm.type}
                onChange={(e) =>
                  onFormChange({ ...filterForm, type: e.target.value })
                }
                className="w-full px-4 py-4 border-2 border-black focus:outline-none focus:border-gray-600 text-lg"
              >
                {Object.entries(ZARA_FILTER_CONFIG.FILTER_TYPES).map(
                  ([key, value]) => (
                    <option key={key} value={value} className="uppercase">
                      {value}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Arrangement Priority */}
            <div>
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                Arrangement Priority
              </label>
              <input
                type="number"
                value={filterForm.priority}
                onChange={(e) =>
                  onFormChange({ ...filterForm, priority: e.target.value })
                }
                placeholder="1"
                min="1"
                max="999"
                className="w-full px-4 py-4 border-2 border-black focus:outline-none focus:border-gray-600 text-lg"
              />
              {validationErrors.priority && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.priority}
                </p>
              )}
            </div>

            {/* Create Filter Button */}
            <button
              onClick={onCreateFilter}
              className="w-full bg-black text-white py-4 font-bold text-lg tracking-wide hover:bg-gray-800 transition-colors uppercase"
            >
              Create Filter
            </button>
          </div>
        )}
      </div>
    );
  }
);

// Optimized Zara Create Filter Values Section Component
const ZaraCreateFilterValuesSection = React.memo(
  ({
    valueForm,
    filters,
    validationErrors,
    onFormChange,
    onCreateValue,
    isActive,
    onToggle,
  }) => {
    // Memoize selected filter to prevent unnecessary calculations
    const selectedFilter = useMemo(
      () => filters.find((f) => f.id === valueForm.filterId),
      [filters, valueForm.filterId]
    );

    // Memoized form change handlers to prevent object recreation
    const handleFilterChange = useCallback(
      (e) => {
        onFormChange({
          ...valueForm,
          filterId: parseInt(e.target.value) || null,
        });
      },
      [valueForm, onFormChange]
    );

    const handleValueChange = useCallback(
      (e) => {
        onFormChange({ ...valueForm, value: e.target.value });
      },
      [valueForm, onFormChange]
    );

    const handleColorChange = useCallback(
      (e) => {
        onFormChange({ ...valueForm, colorCode: e.target.value });
      },
      [valueForm, onFormChange]
    );

    const handleColorAndValueChange = useCallback(
      (color, value) => {
        onFormChange({
          ...valueForm,
          colorCode: color,
          value: value,
        });
      },
      [valueForm, onFormChange]
    );

    const handlePriceRangeChange = useCallback(
      (priceRange, value) => {
        onFormChange({
          ...valueForm,
          priceRange: priceRange,
          value: value,
        });
      },
      [valueForm, onFormChange]
    );

    const handlePriceMinChange = useCallback(
      (e) => {
        onFormChange({
          ...valueForm,
          priceRange: {
            ...valueForm.priceRange,
            min: parseInt(e.target.value) || 0,
          },
        });
      },
      [valueForm, onFormChange]
    );

    const handlePriceMaxChange = useCallback(
      (e) => {
        onFormChange({
          ...valueForm,
          priceRange: {
            ...valueForm.priceRange,
            max: parseInt(e.target.value) || 1000,
          },
        });
      },
      [valueForm, onFormChange]
    );

    const handleSizeSelect = useCallback(
      (size) => {
        onFormChange({ ...valueForm, value: size });
      },
      [valueForm, onFormChange]
    );

    return (
      <div className="bg-gray-50 border-2 border-black rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-2.5 bg-black text-white">
          <h2 className="text-lg font-bold tracking-wide">
            CREATE FILTER VALUE
          </h2>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-800 transition-colors rounded-full"
          >
            {isActive ? (
              <ChevronUp className="h-6 w-6" />
            ) : (
              <ChevronDown className="h-6 w-6" />
            )}
          </button>
        </div>

        {isActive && (
          <div className="p-6 space-y-6">
            {/* Choose Filter Key */}
            <div>
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                Choose Filter Key
              </label>
              <select
                value={valueForm.filterId || ""}
                onChange={handleFilterChange}
                className="w-full px-4 py-4 border-2 border-black focus:outline-none focus:border-gray-600 text-lg"
              >
                <option value="">Select filter key...</option>
                {filters.map((filter) => (
                  <option
                    key={filter.id}
                    value={filter.id}
                    className="uppercase"
                  >
                    {filter.key}
                  </option>
                ))}
              </select>
              {validationErrors.filterId && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.filterId}
                </p>
              )}
            </div>

            {/* Assign Value */}
            <div>
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                Assign Value
              </label>
              <input
                type="text"
                value={valueForm.value}
                onChange={handleValueChange}
                placeholder="Enter value"
                className="w-full px-4 py-4 border-2 border-black focus:outline-none focus:border-gray-600 text-lg"
              />
              {validationErrors.value && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.value}
                </p>
              )}
            </div>

            {/* RGB Color Code (for color filters) */}
            {selectedFilter?.type === "colour" && (
              <div>
                <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                  Enter Colour Code (RGB)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={valueForm.colorCode}
                    onChange={handleColorChange}
                    className="w-16 h-16 border-2 border-black cursor-pointer"
                  />
                  <input
                    type="text"
                    value={valueForm.colorCode}
                    onChange={handleColorChange}
                    placeholder="#000000"
                    className="flex-1 px-4 py-4 border-2 border-black focus:outline-none focus:border-gray-600 text-lg"
                  />
                </div>
                {validationErrors.colorCode && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.colorCode}
                  </p>
                )}

                {/* Color Presets */}
                <div className="mt-4">
                  <p className="text-sm font-bold text-black mb-3 uppercase tracking-wide">
                    Quick Colors
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {ZARA_FILTER_CONFIG.COLOR_PRESETS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() =>
                          handleColorAndValueChange(color.code, color.name)
                        }
                        className="w-12 h-12 border-2 border-black hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.code }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Price Range (for price filters) */}
            {selectedFilter?.type === "price" && (
              <div className="space-y-4">
                <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                  Price Range
                </label>

                {/* Quick Price Range Presets */}
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {ZARA_FILTER_CONFIG.PRICE_RANGES.map((range, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handlePriceRangeChange(
                          { min: range.min, max: range.max },
                          range.label
                        )
                      }
                      className="p-3 border-2 border-black hover:bg-black hover:text-white transition-colors text-left font-medium"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Custom Price Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      Start Value (₹)
                    </label>
                    <input
                      type="number"
                      value={valueForm.priceRange.min}
                      onChange={handlePriceMinChange}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-gray-600 text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">
                      End Value (₹)
                    </label>
                    <input
                      type="number"
                      value={valueForm.priceRange.max}
                      onChange={handlePriceMaxChange}
                      placeholder="1000"
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-gray-600 text-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Size Options (for size filters) */}
            {selectedFilter?.type === "size" && (
              <div>
                <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                  Quick Size Options
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ZARA_FILTER_CONFIG.SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className="p-3 border-2 border-black hover:bg-black hover:text-white transition-colors font-medium"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create Filter Value Button */}
            <button
              onClick={onCreateValue}
              className="w-full bg-black text-white py-4 font-bold text-lg tracking-wide hover:bg-gray-800 transition-colors uppercase"
            >
              Create Filter Value
            </button>
          </div>
        )}
      </div>
    );
  }
);

// Zara Saved Filters Section Component
const ZaraSavedFiltersSection = React.memo(
  ({
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
    filtersDispatch,
  }) => {
    return (
      <div className="bg-gray-50 border-2 border-black max-w-7xl rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-2.5 bg-black text-white">
          <h2 className="text-lg font-bold tracking-wide">SAVED FILTERS</h2>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-800 transition-colors rounded-full"
          >
            {isActive ? (
              <ChevronUp className="h-6 w-6" />
            ) : (
              <ChevronDown className="h-6 w-6" />
            )}
          </button>
        </div>

        {isActive && (
          <div className="p-6 space-y-4">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-4 text-sm font-bold text-black pb-3 border-b-2 border-gray-300 uppercase tracking-wide">
              <div>Key Values</div>
              <div>Assigned Values</div>
              <div>Arrangement</div>
              <div>Actions</div>
            </div>

            {/* Filter Rows */}
            {filters.map((filter, index) => (
              <ZaraFilterRow
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
              <div className="text-center py-12 text-gray-500">
                <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No filters created yet</p>
                <p className="text-sm">
                  Create your first filter to get started
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

// Optimized Zara Filter Row Component with Drag & Drop
const ZaraFilterRow = React.memo(
  ({
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
    filtersDispatch,
  }) => {
    // Memoize computed values
    const isDraggedOver = useMemo(
      () =>
        dragOverItem?.item?.id === filter.id && dragOverItem?.type === "filter",
      [dragOverItem, filter.id]
    );

    // Memoized handlers to prevent recreation
    const handleDragStart = useCallback(
      (e) => {
        onDragStart(e, filter, "filter");
      },
      [onDragStart, filter]
    );

    const handleDragEnter = useCallback(
      (e) => {
        onDragEnter(e, filter, "filter");
      },
      [onDragEnter, filter]
    );

    const handleDrop = useCallback(
      (e) => {
        onDrop(e, filter, "filter");
      },
      [onDrop, filter]
    );

    const handleEditFilter = useCallback(() => {
      onEditFilter(filter);
    }, [onEditFilter, filter]);

    const handleDeleteFilter = useCallback(() => {
      onDeleteFilter(filter.id);
    }, [onDeleteFilter, filter.id]);

    const handleToggleFilter = useCallback(() => {
      filtersDispatch({
        type: FILTER_ACTIONS.TOGGLE_FILTER_STATUS,
        payload: filter.id,
      });
    }, [filtersDispatch, filter.id]);

    return (
      <div
        className={`grid grid-cols-4 gap-4 p-4 bg-white border-2 transition-all ${
          isDraggedOver ? "border-blue-500 bg-blue-50" : "border-gray-200"
        } hover:border-black cursor-move`}
        draggable
        onDragStart={handleDragStart}
        onDragOver={onDragOver}
        onDragEnter={handleDragEnter}
        onDrop={handleDrop}
      >
        {/* Key Values */}
        <div className="flex items-center gap-3">
          <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
          <div className="bg-black text-white px-3 py-2 font-bold text-sm uppercase tracking-wide">
            {filter.key}
          </div>
        </div>

        {/* Assigned Values */}
        <div className="space-y-2">
          {filter.assignedValues.map((value) => (
            <ZaraFilterValue
              key={value.id}
              value={value}
              filterId={filter.id}
              onDeleteValue={onDeleteValue}
            />
          ))}
          {filter.assignedValues.length === 0 && (
            <div className="text-gray-400 text-sm italic">
              No values assigned
            </div>
          )}
        </div>

        {/* Arrangement Number */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-black">
            {filter.priority}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEditFilter}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit filter"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleDeleteFilter}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete filter"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleFilter}
            className={`p-2 transition-colors ${
              filter.isActive
                ? "text-green-600 hover:text-green-800 hover:bg-green-50"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
            title={filter.isActive ? "Deactivate filter" : "Activate filter"}
          >
            {filter.isActive ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    );
  }
);

// Separate component for filter values to optimize rendering
const ZaraFilterValue = React.memo(({ value, filterId, onDeleteValue }) => {
  const handleDelete = useCallback(() => {
    onDeleteValue(filterId, value.id);
  }, [onDeleteValue, filterId, value.id]);

  return (
    <div className="bg-gray-100 px-3 py-2 border border-gray-300 flex items-center gap-2 text-sm">
      {value.colorCode && (
        <div
          className="w-4 h-4 border border-gray-400"
          style={{ backgroundColor: value.colorCode }}
        />
      )}
      <span className="flex-1 font-medium">{value.value}</span>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-800 p-1"
        title="Delete value"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
});

// Optimized Zara Mobile Preview Interface Component
const ZaraMobilePreviewInterface = React.memo(({ filters, onToggleView }) => {
  // Memoize active filters to prevent recalculation
  const activeFilters = useMemo(
    () => filters.filter((f) => f.isActive),
    [filters]
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Preview Device Frame */}
      <div className="w-96 bg-black p-4 border-r-4 border-black">
        <div className="bg-white h-full rounded-lg overflow-hidden shadow-2xl">
          {/* Mobile Status Bar */}
          <div className="bg-black text-white p-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <div className="font-bold">9:41</div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-3 border border-white rounded-sm">
                <div className="w-4 h-2 bg-white rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Zara App Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-black tracking-widest text-center">
              ZARA
            </h1>
          </div>

          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border-2 border-black focus:outline-none"
                readOnly
              />
            </div>
          </div>

          {/* Filters Display */}
          <div className="px-4 pb-4 max-h-96 overflow-y-auto">
            <h3 className="font-bold mb-4 text-lg uppercase tracking-wide">
              Filters
            </h3>
            <div className="space-y-4">
              {activeFilters.map((filter) => (
                <MobileFilterSection key={filter.id} filter={filter} />
              ))}
            </div>
          </div>

          {/* Sample Products */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 aspect-square flex items-center justify-center text-gray-500 text-xs">
                PRODUCT
              </div>
              <div className="bg-gray-100 aspect-square flex items-center justify-center text-gray-500 text-xs">
                PRODUCT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="flex-1 p-8 bg-white">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-wide uppercase">
            Mobile Preview
          </h2>
          <button
            onClick={onToggleView}
            className="px-6 py-3 bg-black text-white font-bold tracking-wide hover:bg-gray-800 transition-colors flex items-center gap-3 uppercase"
          >
            <Monitor className="h-5 w-5" />
            Back to Management
          </button>
        </div>

        <div className="bg-gray-50 border-2 border-black p-6">
          <h3 className="font-bold mb-6 text-xl uppercase tracking-wide">
            Filter Summary
          </h3>
          <div className="space-y-4">
            {filters.map((filter) => (
              <FilterSummaryCard key={filter.id} filter={filter} />
            ))}
          </div>

          {filters.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Filter className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-bold uppercase tracking-wide">
                No Filters Available
              </p>
              <p className="text-sm mt-2">
                Create filters in the management panel to see them here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Separate component for mobile filter sections
const MobileFilterSection = React.memo(({ filter }) => {
  const activeValues = useMemo(
    () => filter.assignedValues.filter((v) => v.isActive),
    [filter.assignedValues]
  );

  return (
    <div className="space-y-3">
      <h4 className="font-bold text-sm uppercase tracking-wider text-black border-b border-gray-300 pb-1">
        {filter.key}
      </h4>
      <div className="flex flex-wrap gap-2">
        {activeValues.map((value) => (
          <div
            key={value.id}
            className="flex items-center gap-2 px-3 py-2 border-2 border-black text-sm font-medium hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            {value.colorCode && (
              <div
                className="w-4 h-4 border border-gray-400"
                style={{ backgroundColor: value.colorCode }}
              />
            )}
            {value.value}
          </div>
        ))}
      </div>
    </div>
  );
});

// Separate component for filter summary cards
const FilterSummaryCard = React.memo(({ filter }) => {
  return (
    <div className="flex gap-12 p-4 bg-white border-2 border-gray-200">
      <div>
        <div className="font-bold text-lg uppercase tracking-wide">
          {filter.key}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {filter.assignedValues.length} value(s) • Priority: {filter.priority}{" "}
          • Type: {filter.type}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {filter.assignedValues.slice(0, 3).map((value) => (
            <span
              key={value.id}
              className="text-xs bg-gray-200 px-2 py-1 border"
            >
              {value.value}
            </span>
          ))}
          {filter.assignedValues.length > 3 && (
            <span className="text-xs text-gray-500">
              +{filter.assignedValues.length - 3} more
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={`px-3 py-1 text-sm font-bold border-2 ${
            filter.isActive
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-red-100 text-red-800 border-red-300"
          }`}
        >
          {filter.isActive ? "ACTIVE" : "INACTIVE"}
        </div>
        {filter.isActive ? (
          <Check className="h-5 w-5 text-green-600" />
        ) : (
          <X className="h-5 w-5 text-red-600" />
        )}
      </div>
    </div>
  );
});

// Set display names for debugging and React DevTools
ZaraDesktopManagementInterface.displayName = "ZaraDesktopManagementInterface";
ZaraCreateFiltersSection.displayName = "ZaraCreateFiltersSection";
ZaraCreateFilterValuesSection.displayName = "ZaraCreateFilterValuesSection";
ZaraSavedFiltersSection.displayName = "ZaraSavedFiltersSection";
ZaraFilterRow.displayName = "ZaraFilterRow";
ZaraFilterValue.displayName = "ZaraFilterValue";
ZaraMobilePreviewInterface.displayName = "ZaraMobilePreviewInterface";
MobileFilterSection.displayName = "MobileFilterSection";
FilterSummaryCard.displayName = "FilterSummaryCard";

export default Filters;
