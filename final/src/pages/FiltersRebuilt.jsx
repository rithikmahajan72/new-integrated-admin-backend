import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Palette,
  Hash,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  fetchFilters,
  createFilter,
  updateFilter,
  deleteFilter,
  selectAvailableFilters,
  selectFilterLoading,
  selectFilterError,
} from "../store/slices/filtersSlice";

const Filters = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectAvailableFilters);
  const loading = useSelector(selectFilterLoading);
  const error = useSelector(selectFilterError);

  // State management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState("asc");

  // Form states
  const [filterForm, setFilterForm] = useState({
    key: "",
    priority: 1,
    values: [],
  });

  const [valueForm, setValueForm] = useState({
    name: "",
    code: "#000000",
    priority: 1,
  });

  // Load filters on mount
  useEffect(() => {
    dispatch(fetchFilters());
  }, [dispatch]);

  // Filter types configuration
  const FILTER_TYPES = {
    color: { label: "Color", hasColorCode: true, icon: Palette },
    size: { label: "Size", hasColorCode: false, icon: Hash },
    brand: { label: "Brand", hasColorCode: false, icon: Hash },
    category: { label: "Category", hasColorCode: false, icon: Hash },
    occasion: { label: "Occasion", hasColorCode: false, icon: Hash },
    material: { label: "Material", hasColorCode: false, icon: Hash },
  };

  // Preset values for different filter types
  const PRESET_VALUES = {
    color: [
      { name: "Black", code: "#000000" },
      { name: "White", code: "#FFFFFF" },
      { name: "Red", code: "#FF0000" },
      { name: "Blue", code: "#0066CC" },
      { name: "Grey", code: "#808080" },
      { name: "Navy", code: "#000080" },
      { name: "Pink", code: "#FF69B4" },
      { name: "Green", code: "#008000" },
    ],
    size: [
      { name: "XS" }, { name: "S" }, { name: "M" }, 
      { name: "L" }, { name: "XL" }, { name: "XXL" }
    ],
    brand: [
      { name: "Yoraa Premium" }, { name: "Yoraa Casual" },
      { name: "Yoraa Elegance" }, { name: "Yoraa Professional" }
    ],
    occasion: [
      { name: "Casual" }, { name: "Formal" }, 
      { name: "Party" }, { name: "Wedding" }, { name: "Office" }
    ],
  };

  // Handle form submissions
  const handleCreateFilter = async (e) => {
    e.preventDefault();
    if (!filterForm.key.trim()) return;

    try {
      await dispatch(createFilter({
        key: filterForm.key.toLowerCase(),
        priority: filterForm.priority,
        values: filterForm.values,
      })).unwrap();
      
      resetForm();
      setShowCreateModal(false);
      dispatch(fetchFilters());
    } catch (err) {
      console.error("Failed to create filter:", err);
    }
  };

  const handleUpdateFilter = async (filterId, updates) => {
    try {
      await dispatch(updateFilter({ id: filterId, updates })).unwrap();
      dispatch(fetchFilters());
      setEditingFilter(null);
    } catch (err) {
      console.error("Failed to update filter:", err);
    }
  };

  const handleDeleteFilter = async (filterId) => {
    if (window.confirm("Are you sure you want to delete this filter?")) {
      try {
        await dispatch(deleteFilter(filterId)).unwrap();
        dispatch(fetchFilters());
      } catch (err) {
        console.error("Failed to delete filter:", err);
      }
    }
  };

  const resetForm = () => {
    setFilterForm({ key: "", priority: 1, values: [] });
    setValueForm({ name: "", code: "#000000", priority: 1 });
  };

  const addValueToFilter = () => {
    if (!valueForm.name.trim()) return;

    const newValue = {
      name: valueForm.name,
      priority: valueForm.priority,
      _id: Date.now().toString(),
    };

    // Add color code if it's a color filter
    if (filterForm.key === "color" && valueForm.code) {
      newValue.code = valueForm.code;
    }

    setFilterForm(prev => ({
      ...prev,
      values: [...prev.values, newValue]
    }));

    setValueForm({ name: "", code: "#000000", priority: valueForm.priority + 1 });
  };

  const removeValueFromFilter = (valueId) => {
    setFilterForm(prev => ({
      ...prev,
      values: prev.values.filter(v => v._id !== valueId)
    }));
  };

  const loadPresetValues = (filterType) => {
    const presets = PRESET_VALUES[filterType] || [];
    const values = presets.map((preset, index) => ({
      ...preset,
      priority: index + 1,
      _id: Date.now() + index,
    }));
    
    setFilterForm(prev => ({ ...prev, values }));
  };

  // Filtered and sorted filters
  const filteredFilters = filters
    .filter(filter => 
      filter.key.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Filter className="h-6 w-6" />
              Filters Management
            </h1>
            <p className="text-gray-600">Create and manage dynamic filters for products</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Filter
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search filters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="priority">Sort by Priority</option>
            <option value="key">Sort by Name</option>
            <option value="createdAt">Sort by Date</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </button>

          <button
            onClick={() => dispatch(fetchFilters())}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters List */}
      <div className="space-y-4">
        {loading && filteredFilters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Loading filters...</p>
          </div>
        ) : filteredFilters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Filter className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No filters found</p>
          </div>
        ) : (
          filteredFilters.map((filter) => (
            <FilterCard
              key={filter._id}
              filter={filter}
              onEdit={setEditingFilter}
              onDelete={handleDeleteFilter}
              onUpdate={handleUpdateFilter}
              isEditing={editingFilter?._id === filter._id}
            />
          ))
        )}
      </div>

      {/* Create Filter Modal */}
      {showCreateModal && (
        <CreateFilterModal
          filterForm={filterForm}
          setFilterForm={setFilterForm}
          valueForm={valueForm}
          setValueForm={setValueForm}
          onSubmit={handleCreateFilter}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          onAddValue={addValueToFilter}
          onRemoveValue={removeValueFromFilter}
          onLoadPresets={loadPresetValues}
          filterTypes={FILTER_TYPES}
        />
      )}
    </div>
  );
};

// Filter Card Component
const FilterCard = ({ filter, onEdit, onDelete, onUpdate, isEditing }) => {
  const [editForm, setEditForm] = useState({
    key: filter.key,
    priority: filter.priority,
  });

  const handleSaveEdit = () => {
    onUpdate(filter._id, editForm);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <input
                type="text"
                value={editForm.key}
                onChange={(e) => setEditForm(prev => ({ ...prev, key: e.target.value }))}
                className="text-lg font-semibold border border-gray-300 rounded px-2 py-1"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-800 capitalize">
                {filter.key}
              </h3>
            )}
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              Priority: {filter.priority}
            </span>
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(null)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onEdit(filter)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(filter._id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Values */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filter.values?.map((value, index) => (
            <div
              key={value._id || index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
            >
              {value.code && (
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: value.code }}
                />
              )}
              <span className="text-sm font-medium">{value.name}</span>
              {value.code && (
                <span className="text-xs text-gray-500 ml-auto">{value.code}</span>
              )}
            </div>
          ))}
        </div>
        
        {(!filter.values || filter.values.length === 0) && (
          <p className="text-gray-500 text-sm">No values assigned to this filter</p>
        )}
      </div>
    </div>
  );
};

// Create Filter Modal Component
const CreateFilterModal = ({
  filterForm,
  setFilterForm,
  valueForm,
  setValueForm,
  onSubmit,
  onClose,
  onAddValue,
  onRemoveValue,
  onLoadPresets,
  filterTypes
}) => {
  const isColorFilter = filterForm.key === "color";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Create New Filter</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          {/* Filter Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Type
              </label>
              <select
                value={filterForm.key}
                onChange={(e) => setFilterForm(prev => ({ ...prev, key: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Filter Type</option>
                {Object.entries(filterTypes).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <input
                type="number"
                min="1"
                value={filterForm.priority}
                onChange={(e) => setFilterForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Load Presets */}
          {filterForm.key && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => onLoadPresets(filterForm.key)}
                className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
              >
                Load Preset Values for {filterTypes[filterForm.key]?.label}
              </button>
            </div>
          )}

          {/* Add Values Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Values</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <input
                  type="text"
                  placeholder="Value name"
                  value={valueForm.name}
                  onChange={(e) => setValueForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isColorFilter && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={valueForm.code}
                    onChange={(e) => setValueForm(prev => ({ ...prev, code: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#000000"
                    value={valueForm.code}
                    onChange={(e) => setValueForm(prev => ({ ...prev, code: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={onAddValue}
                disabled={!valueForm.name.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Value
              </button>
            </div>
          </div>

          {/* Current Values */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-2">Current Values:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filterForm.values.map((value) => (
                <div key={value._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  {value.code && (
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: value.code }}
                    />
                  )}
                  <span className="flex-1">{value.name}</span>
                  {value.code && <span className="text-xs text-gray-500">{value.code}</span>}
                  <button
                    type="button"
                    onClick={() => onRemoveValue(value._id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            
            {filterForm.values.length === 0 && (
              <p className="text-gray-500 text-sm">No values added yet</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!filterForm.key || filterForm.values.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Create Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Filters;
