import React, { useState } from 'react';
import { Search, Edit2, Trash2, ChevronDown, X, Upload, Image as ImageIcon } from 'lucide-react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const SubCategory = () => {
  // Modal states
  const [modals, setModals] = useState({
    add: false,
    edit: false,
    success: false,
    deleteSuccess: false
  });

  // Form states
  const [formData, setFormData] = useState({
    selectedCategory: 'Category',
    selectedSubCategory: 'sub category',
    searchTerm: '',
    newSubCategoryName: '',
    uploadedImage: null
  });

  // SubCategory states
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Constants
  const SAMPLE_SUBCATEGORIES = [
    { id: 1, category: 'men', subCategory: 'jacket', image: '/api/placeholder/208/208' },
    { id: 2, category: 'women', subCategory: 'shirt', image: '/api/placeholder/208/208' },
    { id: 3, category: 'Kids', subCategory: 'top', image: '/api/placeholder/208/208' }
  ];

  const CATEGORY_OPTIONS = ['men', 'women', 'kids'];
  const SUBCATEGORY_OPTIONS = ['jacket', 'shirt', 'top', 'jeans', 'shorts'];

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
      deleteSuccess: false
    });
  };

  const resetFormData = () => {
    setFormData(prev => ({
      ...prev,
      newSubCategoryName: '',
      uploadedImage: null
    }));
    setEditingSubCategory(null);
    setDeleteConfirmation(null);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    updateFormData('uploadedImage', null);
  };

  // SubCategory management handlers
  const handleAddNewSubCategory = () => {
    resetFormData();
    openModal('add');
  };

  const handleSaveNewSubCategory = () => {
    console.log('Adding new subcategory:', formData.newSubCategoryName, 'Image:', formData.uploadedImage);
    // API call would go here
    closeModal('add');
    openModal('success');
  };

  const handleEdit = (subCategoryId) => {
    const subCategoryToEdit = SAMPLE_SUBCATEGORIES.find(subCat => subCat.id === subCategoryId);
    if (subCategoryToEdit) {
      setEditingSubCategory(subCategoryToEdit);
      updateFormData('newSubCategoryName', subCategoryToEdit.subCategory);
      updateFormData('uploadedImage', subCategoryToEdit.image);
      openModal('edit');
    }
  };

  const handleSaveEdit = () => {
    console.log('Saving edit for subcategory:', editingSubCategory.id, 'New name:', formData.newSubCategoryName);
    // API call would go here
    closeModal('edit');
    openModal('success');
  };

  const handleDelete = (subCategoryId) => {
    const subCategoryToDelete = SAMPLE_SUBCATEGORIES.find(subCat => subCat.id === subCategoryId);
    if (subCategoryToDelete) {
      setDeleteConfirmation(subCategoryToDelete);
    }
  };

  const confirmDelete = () => {
    console.log('Deleting subcategory:', deleteConfirmation.id);
    // API call would go here
    setDeleteConfirmation(null);
    openModal('deleteSuccess');
  };

  const handleCloseWithReset = (modalName) => {
    closeModal(modalName);
    resetFormData();
  };

  // Computed values
  const filteredSubCategories = SAMPLE_SUBCATEGORIES.filter(subCategory =>
    subCategory.category.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
    subCategory.subCategory.toLowerCase().includes(formData.searchTerm.toLowerCase())
  );

  // Component renderers
  const renderImageUploadSection = (title = "Upload image") => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
        {formData.uploadedImage ? (
          <div className="space-y-4">
            <img
              src={formData.uploadedImage}
              alt="SubCategory"
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

  const renderSubCategoryInput = (title, placeholder = "Enter subcategory name") => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <input
        type="text"
        value={formData.newSubCategoryName}
        onChange={(e) => updateFormData('newSubCategoryName', e.target.value)}
        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
        placeholder={placeholder}
      />
    </div>
  );

  const renderModalActions = (onSave, onCancel, saveText = "save", cancelText = "go back") => (
    <div className="flex justify-center gap-4 mt-12">
      <button
        onClick={onSave}
        className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-12 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        {saveText}
      </button>
      <button
        onClick={onCancel}
        className="text-gray-600 hover:text-gray-800 border-2 border-black rounded-xl font-medium py-3 px-12 transition-colors focus:outline-none"
      >
        {cancelText}
      </button>
    </div>
  );

  const renderSuccessModal = (message, onClose) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">
              {message}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Main Content Container */}
      <div className="mx-6 bg-white">
        
        {/* Header */}
        <div className="py-8 px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Create Subcategory</h1>
          
          {/* Controls Section */}
          <div className="flex items-center gap-6 justify-between">
            
            {/* Left side controls */}
            <div className="flex items-center gap-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  value={formData.searchTerm}
                  onChange={(e) => updateFormData('searchTerm', e.target.value)}
                  className="block w-80 pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={formData.selectedCategory}
                  onChange={(e) => updateFormData('selectedCategory', e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                >
                  <option value="Category" disabled>Category</option>
                  {CATEGORY_OPTIONS.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Sub Category Dropdown */}
              <div className="relative">
                <select
                  value={formData.selectedSubCategory}
                  onChange={(e) => updateFormData('selectedSubCategory', e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                >
                  <option value="sub category" disabled>sub category</option>
                  {SUBCATEGORY_OPTIONS.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Add SubCategory Button */}
            <button 
              onClick={handleAddNewSubCategory}
              className="bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2"
            >
              + Add subcategory
            </button>
          </div>
        </div>

        {/* SubCategories Grid */}
        <div className="px-6 pb-6">
          
          {/* Table Header */}
          <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-6 p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-gray-800">Image</h3>
              </div>
              <div className="col-span-4">
                <h3 className="text-sm font-semibold text-gray-800">Category</h3>
              </div>
              <div className="col-span-4">
                <h3 className="text-sm font-semibold text-gray-800">sub category</h3>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-gray-800">Action</h3>
              </div>
            </div>

            {/* SubCategory Rows */}
            <div className="divide-y divide-gray-200">
              {filteredSubCategories.map((subCategory) => (
                <div key={subCategory.id} className="grid grid-cols-12 gap-6 p-4 items-center hover:bg-gray-50 transition-colors duration-150">
                  
                  {/* Image Column */}
                  <div className="col-span-2">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={subCategory.image}
                        alt={subCategory.subCategory}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Category Column */}
                  <div className="col-span-4">
                    <p className="text-base font-medium text-gray-900">
                      {subCategory.category}
                    </p>
                  </div>

                  {/* SubCategory Column */}
                  <div className="col-span-4">
                    <p className="text-base font-medium text-gray-900">
                      {subCategory.subCategory}
                    </p>
                  </div>

                  {/* Action Column */}
                  <div className="col-span-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(subCategory.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        title="Edit SubCategory"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subCategory.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        title="Delete SubCategory"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredSubCategories.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg">No subcategories found matching your search criteria.</p>
                <p className="text-sm mt-2">Try adjusting your search terms or add a new subcategory.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add SubCategory Modal */}
      {modals.add && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 overflow-hidden">
            
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 text-center">
                Add subcategory
              </h2>
              <button
                onClick={() => handleCloseWithReset('add')}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-12">
                {renderImageUploadSection()}
                {renderSubCategoryInput("Type new subcategory")}
              </div>
              {renderModalActions(
                handleSaveNewSubCategory,
                () => handleCloseWithReset('add')
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit SubCategory Modal */}
      {modals.edit && editingSubCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 overflow-hidden">
            
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 text-center">
                Edit SubCategory
              </h2>
              <button
                onClick={() => handleCloseWithReset('edit')}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-12">
                {renderImageUploadSection()}
                {renderSubCategoryInput("Edit subcategory name")}
              </div>
              {renderModalActions(
                handleSaveEdit,
                () => handleCloseWithReset('edit')
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {modals.success && renderSuccessModal(
        "subcategory updated\nsuccessfully!",
        () => handleCloseWithReset('success')
      )}

      {/* Delete Success Modal */}
      {modals.deleteSuccess && renderSuccessModal(
        "Subcategory deleted\nsuccessfully!",
        () => handleCloseWithReset('deleteSuccess')
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={confirmDelete}
        title="Are you sure you want to delete this subcategory?"
      />
    </div>
  );
};

export default SubCategory;
