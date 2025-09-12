import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Edit2, Trash2, ChevronDown, X, Upload, Image as ImageIcon } from 'lucide-react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  clearErrors,
  clearMessages 
} from '../store/slices/categoriesSlice';

const UploadCategorySimple = () => {
  const dispatch = useDispatch();
  const { 
    categories, 
    categoriesLoading, 
    categoriesError,
    createLoading,
    updateLoading,
    deleteLoading,
    successMessage,
    error
  } = useSelector(state => state.categories);

  // Modal states
  const [modals, setModals] = useState({
    add: false,
    edit: false,
    success: false,
    delete: false,
    deleteSuccess: false
  });

  // Form states
  const [formData, setFormData] = useState({
    selectedCategory: 'Category',
    searchTerm: '',
    newCategoryName: '',
    newCategoryDescription: '',
    uploadedImage: null,
    imageFile: null
  });

  // Category states
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Load categories on component mount
  useEffect(() => {
    console.log('UploadCategorySimple: Fetching categories...');
    dispatch(fetchCategories())
      .then((result) => console.log('UploadCategorySimple: Fetch result:', result))
      .catch((error) => console.error('UploadCategorySimple: Fetch error:', error));
  }, [dispatch]);

  // Debug: Log categories when they change
  useEffect(() => {
    console.log('UploadCategorySimple: Categories from store:', categories);
    console.log('UploadCategorySimple: Categories loading:', categoriesLoading);
    console.log('UploadCategorySimple: Categories error:', categoriesError);
  }, [categories, categoriesLoading, categoriesError]);

  // Handle success messages
  useEffect(() => {
    if (successMessage) {
      openModal('success');
      setTimeout(() => {
        dispatch(clearMessages());
        closeModal('success');
      }, 2000);
    }
  }, [successMessage, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Category operation error:', error);
      setTimeout(() => {
        dispatch(clearErrors());
      }, 3000);
    }
  }, [error, dispatch]);

  // Utility functions
  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const closeAllModals = () => {
    setModals({
      add: false,
      edit: false,
      success: false,
      delete: false,
      deleteSuccess: false
    });
  };

  const resetFormData = () => {
    setFormData(prev => ({
      ...prev,
      newCategoryName: '',
      newCategoryDescription: '',
      uploadedImage: null,
      imageFile: null
    }));
    setEditingCategory(null);
    setDeletingCategory(null);
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Event handlers
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateFormData('uploadedImage', e.target.result);
        updateFormData('imageFile', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    updateFormData('uploadedImage', null);
    updateFormData('imageFile', null);
  };

  // Category management handlers
  const handleAddNewCategory = () => {
    resetFormData();
    openModal('add');
  };

  const handleSaveNewCategory = async () => {
    if (!formData.newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    if (!formData.imageFile) {
      alert('Please upload an image');
      return;
    }

    const categoryData = new FormData();
    categoryData.append('name', formData.newCategoryName.trim());
    categoryData.append('description', formData.newCategoryDescription.trim() || '');
    categoryData.append('image', formData.imageFile);

    try {
      await dispatch(createCategory(categoryData)).unwrap();
      closeModal('add');
      resetFormData();
      dispatch(fetchCategories()); // Refresh categories list
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    updateFormData('newCategoryName', category.name);
    updateFormData('newCategoryDescription', category.description || '');
    updateFormData('uploadedImage', category.imageUrl);
    openModal('edit');
  };

  const handleSaveEdit = async () => {
    if (!formData.newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    const categoryData = new FormData();
    categoryData.append('name', formData.newCategoryName.trim());
    categoryData.append('description', formData.newCategoryDescription.trim() || '');
    
    // Only append image if a new one was selected
    if (formData.imageFile) {
      categoryData.append('image', formData.imageFile);
    }

    try {
      await dispatch(updateCategory({ 
        categoryId: editingCategory._id, 
        categoryData 
      })).unwrap();
      closeModal('edit');
      resetFormData();
      dispatch(fetchCategories()); // Refresh categories list
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDelete = (category) => {
    setDeletingCategory(category);
    openModal('delete');
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteCategory(deletingCategory._id)).unwrap();
      closeModal('delete');
      setDeletingCategory(null);
      dispatch(fetchCategories()); // Refresh categories list
      openModal('deleteSuccess');
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleCloseWithReset = (modalName) => {
    closeModal(modalName);
    resetFormData();
  };

  // Computed values
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(formData.searchTerm.toLowerCase())
  );

  // Dynamic dropdown data from API
  const categoryOptions = categories.map(cat => cat.name);

  // Component renderers
  const renderImageUploadSection = (title = "Upload image") => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
        {formData.uploadedImage ? (
          <div className="space-y-4">
            <img
              src={formData.uploadedImage}
              alt="Category"
              className="mx-auto w-32 h-32 object-cover rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Remove image
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Drop your image</p>
              <p className="text-xs text-gray-500">here PNG, JPEG allowed</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload image
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>
      </div>
    </div>
  );

  const renderCategoryInput = (title, placeholder = "Enter category name") => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <input
        type="text"
        value={formData.newCategoryName}
        onChange={(e) => updateFormData('newCategoryName', e.target.value)}
        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base mb-4"
        placeholder={placeholder}
      />
      
      <input
        type="text"
        value={formData.newCategoryDescription}
        onChange={(e) => updateFormData('newCategoryDescription', e.target.value)}
        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
        placeholder="Enter category description (optional)"
      />
    </div>
  );

  const renderDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="mb-8">
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
          >
            <span className={formData.selectedCategory === 'Category' ? 'text-gray-500' : 'text-gray-900'}>
              {formData.selectedCategory}
            </span>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              <div className="py-1">
                {categoriesLoading ? (
                  <div className="px-4 py-2 text-gray-500">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500">No categories available</div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        updateFormData('selectedCategory', category.name);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSearchBox = () => (
    <div className="mb-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={formData.searchTerm}
          onChange={(e) => updateFormData('searchTerm', e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderCategoryGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categoriesLoading ? (
        <div className="col-span-full text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-600">No categories found</p>
        </div>
      ) : (
        filteredCategories.map((category) => (
          <div key={category._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-square w-full">
              <img 
                src={category.imageUrl || '/api/placeholder/208/208'} 
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/208/208';
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 capitalize">{category.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    disabled={updateLoading}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    disabled={deleteLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderModal = (modalKey, title, content, actions) => {
    if (!modals[modalKey]) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={() => handleCloseWithReset(modalKey)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6">
            {content}
          </div>
          
          {actions && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage your product categories</p>
          </div>
          
          <button
            onClick={handleAddNewCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            disabled={createLoading}
          >
            {createLoading ? 'Adding...' : 'Add Category'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Dropdown and Search */}
        {renderDropdown()}
        {renderSearchBox()}

        {/* Categories Grid */}
        {renderCategoryGrid()}

        {/* Add Category Modal */}
        {renderModal(
          'add',
          'Add New Category',
          <div className="space-y-6">
            {renderImageUploadSection()}
            {renderCategoryInput('Category details')}
          </div>,
          <>
            <button
              onClick={() => handleCloseWithReset('add')}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={createLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
              disabled={createLoading}
            >
              {createLoading ? 'Saving...' : 'Save Category'}
            </button>
          </>
        )}

        {/* Edit Category Modal */}
        {renderModal(
          'edit',
          'Edit Category',
          <div className="space-y-6">
            {renderImageUploadSection('Update image')}
            {renderCategoryInput('Update category details')}
          </div>,
          <>
            <button
              onClick={() => handleCloseWithReset('edit')}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={updateLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
              disabled={updateLoading}
            >
              {updateLoading ? 'Updating...' : 'Update Category'}
            </button>
          </>
        )}

        {/* Success Modal */}
        {renderModal(
          'success',
          'Success!',
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-900">{successMessage || 'Operation completed successfully!'}</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {modals.delete && (
          <DeleteConfirmationModal
            isOpen={modals.delete}
            onClose={() => closeModal('delete')}
            onConfirm={handleConfirmDelete}
            title="Delete Category"
            message={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
            confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
            isLoading={deleteLoading}
          />
        )}

        {/* Delete Success Modal */}
        {renderModal(
          'deleteSuccess',
          'Category Deleted',
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="text-gray-900">Category has been deleted successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCategorySimple;
