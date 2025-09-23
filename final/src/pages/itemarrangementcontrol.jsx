/**
 * Item Arrangement Control Component
 */

import React, { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  ArrowUpDown,
  Eye,
  Grid,
  List,
  RotateCcw,
  Save,
  ShoppingBag,
} from "lucide-react";

// Redux imports
import {
  fetchCategoriesForArrangement,
  fetchItemsForArrangement,
  updateItemsDisplayOrder,
  updateCategoriesDisplayOrder,
  updateItemsOrderLocally,
  resetItemsOrder,
  setSelectedCategory,
  setSelectedSubCategory,
  setViewMode,
  clearSuccess,
} from "../store/slices/arrangementSlice";

import {
  selectCategories,
  selectItems,
  selectSelectedCategory,
  selectSelectedSubCategory,
  selectArrangementType,
  selectViewMode,
  selectArrangementLoading,
  selectArrangementError,
  selectArrangementSuccess,
} from "../store/slices/arrangementSlice";

// Reusable Components
const CategoryDropdown = memo(({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  loading 
}) => {
  const selectedCategoryObj = categories.find(cat => cat._id === selectedCategory);
  
  return (
    <div className="relative">
      <select
        value={selectedCategory || ""}
        onChange={(e) => onCategoryChange(e.target.value)}
        disabled={loading}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm appearance-none cursor-pointer disabled:opacity-50"
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category._id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      {selectedCategoryObj && (
        <div className="mt-2 text-xs text-gray-500">
          {selectedCategoryObj.subcategories?.length || 0} subcategories
        </div>
      )}
    </div>
  );
});

CategoryDropdown.displayName = "CategoryDropdown";
CategoryDropdown.propTypes = {
  categories: PropTypes.array.isRequired,
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

const ViewModeToggle = memo(({ viewMode, onViewModeChange }) => (
  <div className="flex bg-gray-100 rounded-lg p-1">
    <button
      onClick={() => onViewModeChange("category")}
      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
        viewMode === "category"
          ? "bg-white text-black shadow-sm"
          : "text-gray-600 hover:text-black"
      }`}
    >
      <List className="h-3 w-3" />
      <span>Category View</span>
    </button>
    <button
      onClick={() => onViewModeChange("preview")}
      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
        viewMode === "preview"
          ? "bg-white text-black shadow-sm"
          : "text-gray-600 hover:text-black"
      }`}
    >
      <Eye className="h-3 w-3" />
      <span>Preview</span>
    </button>
  </div>
));

ViewModeToggle.displayName = "ViewModeToggle";
ViewModeToggle.propTypes = {
  viewMode: PropTypes.string.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
};

const DraggableItem = memo(({
  item,
  index,
  draggedItem,
  dragOverIndex,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}) => {
  const isDragging = draggedItem?.index === index;
  const isDropTarget = dragOverIndex === index;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-move group hover:shadow-md ${
        isDragging
          ? "border-black shadow-lg scale-105 opacity-80"
          : isDropTarget
          ? "border-dashed border-gray-400 bg-gray-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="absolute top-2 right-2">
        <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
      
      <div className="p-4">
        <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
          {item.images && item.images.length > 0 ? (
            <img 
              src={item.images[0]} 
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          )}
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
            {item.name}
          </h4>
          <p className="text-xs text-gray-500 truncate">
            ₹{item.price || '0'}
          </p>
        </div>
      </div>
      
      {isDragging && (
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl flex items-center justify-center">
          <div className="text-black font-semibold text-sm">Moving...</div>
        </div>
      )}
    </div>
  );
});

DraggableItem.displayName = "DraggableItem";
DraggableItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  draggedItem: PropTypes.object,
  dragOverIndex: PropTypes.number,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragEnter: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
};

const ArrangementControl = memo(() => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const categories = useSelector(selectCategories);
  const items = useSelector(selectItems);
  const selectedCategory = useSelector(selectSelectedCategory);
  const selectedSubCategory = useSelector(selectSelectedSubCategory);
  const arrangementType = useSelector(selectArrangementType);
  const viewMode = useSelector(selectViewMode);
  const loading = useSelector(selectArrangementLoading);
  const error = useSelector(selectArrangementError);
  const success = useSelector(selectArrangementSuccess);

  // Local state
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, item, index) => {
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.target.style.opacity = "0.5";
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = "1";
    setDraggedItem(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e, targetIndex) => {
      e.preventDefault();

      if (!draggedItem || draggedItem.index === targetIndex) {
        setDragOverIndex(null);
        return;
      }

      const newItems = [...items];
      const draggedItemData = newItems[draggedItem.index];

      newItems.splice(draggedItem.index, 1);
      newItems.splice(targetIndex, 0, draggedItemData);

      dispatch(updateItemsOrderLocally(newItems));

      setDraggedItem(null);
      setDragOverIndex(null);
    },
    [draggedItem, items, dispatch]
  );

  // Load data when component mounts
  useEffect(() => {
    dispatch(fetchCategoriesForArrangement());
  }, [dispatch]);

  // Load items when category changes
  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchItemsForArrangement({ 
        categoryId: selectedCategory, 
        subCategoryId: selectedSubCategory 
      }));
    }
  }, [selectedCategory, selectedSubCategory, dispatch]);

  // Category handler
  const handleCategoryChange = useCallback((categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category) {
      dispatch(setSelectedCategory(category._id));
    }
  }, [categories, dispatch]);

  // Save arrangement
  const saveArrangement = useCallback(() => {
    setShowSaveConfirmModal(true);
  }, []);

  const handleSaveConfirm = useCallback(() => {
    setShowSaveConfirmModal(false);
    
    if (arrangementType === 'items') {
      dispatch(updateItemsDisplayOrder(items));
    } else if (arrangementType === 'categories') {
      dispatch(updateCategoriesDisplayOrder(categories));
    }
  }, [arrangementType, items, categories, dispatch]);

  // Reset arrangement
  const resetArrangement = useCallback(() => {
    dispatch(resetItemsOrder());
  }, [dispatch]);

  // Modal handlers
  const handleModalClose = useCallback(() => {
    setShowSaveConfirmModal(false);
    setShowSaveSuccessModal(false);
    dispatch(clearSuccess());
  }, [dispatch]);

  // Show success modal when save is successful
  useEffect(() => {
    if (success.updating) {
      setShowSaveSuccessModal(true);
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success.updating, dispatch]);

  if (loading.categories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Item Arrangement Control
            </h1>
            <p className="text-gray-600 text-lg">
              Drag and drop items to arrange their display order
            </p>
          </div>
          
          {/* Control Panel */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-48">
              <CategoryDropdown
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                loading={loading.categories}
              />
            </div>
            
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={(mode) => dispatch(setViewMode(mode))}
            />
          </div>
        </div>

        {/* Error Display */}
        {error.fetching && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Error: {error.fetching}</p>
          </div>
        )}

        {/* Arrangement Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Grid className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="font-semibold text-gray-900">Arrangement Status</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {items.length} items ready for arrangement
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={saveArrangement}
                  disabled={loading.updating}
                  className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors duration-200 text-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
                
                <button
                  onClick={resetArrangement}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-3 gap-6 mb-8 relative">
            {items.map((item, index) => (
              <DraggableItem
                key={item._id}
                item={item}
                index={index}
                draggedItem={draggedItem}
                dragOverIndex={dragOverIndex}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ))}
          </div>
        ) : selectedCategory ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Found</h3>
            <p className="text-gray-600">No items available for arrangement in this category.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Category</h3>
            <p className="text-gray-600">Choose a category to start arranging items.</p>
          </div>
        )}

        {/* Success Modal */}
        {showSaveSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Save className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Changes Saved!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your arrangement has been saved successfully.
                </p>
                <button
                  onClick={handleModalClose}
                  className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Confirmation Modal */}
        {showSaveConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Save className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Save Changes?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to save the current arrangement?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSaveConfirmModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveConfirm}
                    className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ArrangementControl.displayName = "ArrangementControl";

export default ArrangementControl;
