import React, { useState, useCallback, useMemo, memo } from 'react';
import { Search, Plus, Trash2, Edit2, GripVertical, Palette, DollarSign } from 'lucide-react';

// Memoized constants to prevent recreation
const INITIAL_FILTERS = [
  {
    id: 1,
    key: 'Category',
    values: [
      { id: 101, name: 'Electronics', assigned: 'Technology', color: '#3B82F6' },
      { id: 102, name: 'Clothing', assigned: 'Fashion', color: '#EF4444' }
    ]
  },
  {
    id: 2,
    key: 'Brand',
    values: [
      { id: 201, name: 'Apple', assigned: 'Premium', color: '#10B981' },
      { id: 202, name: 'Samsung', assigned: 'Popular', color: '#F59E0B' }
    ]
  }
];

const INITIAL_NEW_FILTER = { key: '', type: 'text' };
const INITIAL_NEW_VALUE = { 
  filterId: '', 
  name: '', 
  assigned: '', 
  color: '#3B82F6',
  priceMin: '',
  priceMax: ''
};

const MobileFiltersApp = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [newFilter, setNewFilter] = useState(INITIAL_NEW_FILTER);
  const [newValue, setNewValue] = useState(INITIAL_NEW_VALUE);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  // Memoized helper functions
  const isValidRGB = useCallback((color) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }, []);

  // Filter data based on search term with optimized search
  const filteredData = useMemo(() => {
    if (!searchTerm) return filters;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return filters.filter(filter => {
      const keyMatch = filter.key.toLowerCase().includes(lowerSearchTerm);
      if (keyMatch) return true;
      
      return filter.values.some(value => 
        value.name.toLowerCase().includes(lowerSearchTerm) ||
        value.assigned.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [filters, searchTerm]);

  // Drag and drop functions  
  const handleDragStart = useCallback((e, item, type) => {
    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, targetId, targetType) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    if (targetType === 'filter') {
      const newFilters = [...filters];
      const draggedIndex = newFilters.findIndex(f => f.id === draggedItem.item.id);
      const targetIndex = newFilters.findIndex(f => f.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = newFilters.splice(draggedIndex, 1);
        newFilters.splice(targetIndex, 0, removed);
        setFilters(newFilters);
      }
    }
    
    setDraggedItem(null);
  }, [draggedItem, filters]);

  // Filter management functions
  const createFilter = useCallback(() => {
    if (!newFilter.key.trim()) return;
    
    const filter = {
      id: Date.now(),
      key: newFilter.key,
      values: []
    };
    
    setFilters(prev => [...prev, filter]);
    setNewFilter(INITIAL_NEW_FILTER);
  }, [newFilter]);

  const deleteFilter = useCallback((filterId) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  const createFilterValue = useCallback(() => {
    if (!newValue.filterId || !newValue.name.trim()) return;
    
    const value = {
      id: Date.now(),
      name: newValue.name,
      assigned: newValue.assigned,
      color: newValue.color,
      ...(newValue.priceMin && newValue.priceMax && {
        priceRange: `$${newValue.priceMin}-$${newValue.priceMax}`
      })
    };
    
    setFilters(prev => prev.map(filter => 
      filter.id === parseInt(newValue.filterId)
        ? { ...filter, values: [...filter.values, value] }
        : filter
    ));
    
    setNewValue(INITIAL_NEW_VALUE);
  }, [newValue]);

  const deleteFilterValue = useCallback((filterId, valueId) => {
    setFilters(prev => prev.map(filter => 
      filter.id === filterId
        ? { ...filter, values: filter.values.filter(v => v.id !== valueId) }
        : filter
    ));
  }, []);

  // Memoized FilterCard component to prevent unnecessary re-renders
  const FilterCard = memo(({ filter }) => (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4"
      draggable
      onDragStart={(e) => handleDragStart(e, filter, 'filter')}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, filter.id, 'filter')}
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <h3 className="font-medium text-gray-900">{filter.key}</h3>
          </div>
          <button
            onClick={() => deleteFilter(filter.id)}
            className="p-1 text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {filter.values.map(value => (
          <div key={value.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: value.color }}
              />
              <div>
                <span className="font-medium text-sm">{value.name}</span>
                {value.assigned && (
                  <div className="text-xs text-gray-500">→ {value.assigned}</div>
                )}
                {value.priceRange && (
                  <div className="text-xs text-green-600">{value.priceRange}</div>
                )}
              </div>
            </div>
            <button
              onClick={() => deleteFilterValue(filter.id, value.id)}
              className="p-1 text-red-500 hover:bg-red-100 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  ), [handleDragStart, handleDragOver, handleDrop, deleteFilter, deleteFilterValue]);

  // Optimized input change handlers
  const handleNewFilterKeyChange = useCallback((e) => {
    setNewFilter(prev => ({ ...prev, key: e.target.value }));
  }, []);

  const handleNewValueChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setNewValue(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleColorChange = useCallback((e) => {
    const value = e.target.value;
    if (isValidRGB(value) || value === '') {
      setNewValue(prev => ({ ...prev, color: value }));
    }
  }, [isValidRGB]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoized active filters computation
  const activeFilters = useMemo(() => {
    return filters.flatMap(filter => 
      filter.values.map(value => ({
        ...value,
        filterKey: filter.key
      }))
    );
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mobile Filters</h1>
          <p className="text-gray-600 text-sm">Create and manage dynamic filters with real-time arrangement</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search filters..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Create Filter Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 p-4">
          <h2 className="font-medium text-gray-900 mb-3 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Filter
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Filter key (e.g., Category, Brand)"
              value={newFilter.key}
              onChange={handleNewFilterKeyChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={createFilter}
              disabled={!newFilter.key.trim()}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create Filter
            </button>
          </div>
        </div>

        {/* Create Filter Value Section */}
        {filters.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 p-4">
            <h2 className="font-medium text-gray-900 mb-3 flex items-center">
              <Edit2 className="w-4 h-4 mr-2" />
              Add Filter Value
            </h2>
            <div className="space-y-3">
              <select
                value={newValue.filterId}
                onChange={handleNewValueChange('filterId')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select filter</option>
                {filters.map(filter => (
                  <option key={filter.id} value={filter.id}>{filter.key}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Value name"
                value={newValue.name}
                onChange={handleNewValueChange('name')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <input
                type="text"
                placeholder="Assigned value"
                value={newValue.assigned}
                onChange={handleNewValueChange('assigned')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-gray-500" />
                <input
                  type="color"
                  value={newValue.color}
                  onChange={handleNewValueChange('color')}
                  className="w-12 h-8 border border-gray-200 rounded cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="#3B82F6"
                  value={newValue.color}
                  onChange={handleColorChange}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  placeholder="Min price"
                  value={newValue.priceMin}
                  onChange={handleNewValueChange('priceMin')}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max price"
                  value={newValue.priceMax}
                  onChange={handleNewValueChange('priceMax')}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={createFilterValue}
                disabled={!newValue.filterId || !newValue.name.trim()}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Value
              </button>
            </div>
          </div>
        )}

        {/* Filters List */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No filters found matching your search.' : 'No filters created yet.'}
            </div>
          ) : (
            filteredData.map(filter => (
              <FilterCard key={filter.id} filter={filter} />
            ))
          )}
        </div>

        {/* Mobile Preview Interface */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <h2 className="font-medium text-gray-900 mb-4">Mobile Preview</h2>
          <div className="bg-gray-100 rounded-lg p-4 min-h-32">
            <div className="text-sm text-gray-600 mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(value => (
                <span 
                  key={value.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white border border-gray-200"
                  style={{ borderLeftColor: value.color, borderLeftWidth: '3px' }}
                >
                  {value.filterKey}: {value.name}
                  {value.assigned && <span className="ml-1 text-gray-500">({value.assigned})</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFiltersApp;
