import React, { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, Star, X } from 'lucide-react';
import ReviewDetails from './ReviewDetails';

// Move static data outside component to prevent recreation on every render
const CATEGORIES = ['All categories', 'men', 'Women', 'kids'];
const SUBCATEGORIES = ['sub categories', 'jacket', 't-shirt', 'lower'];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Tshirt',
    image: 'http://localhost:3845/assets/fcfe140894624215171c88f4e69e22948fa65f2b.png',
    rating: 4,
    sizeRating: 3,
    comfortRating: 4,
    durabilityRating: 4,
    category: 'men',
    subcategory: 't-shirt',
    reviewsEnabled: true
  },
  {
    id: 2,
    name: 'manage reviews',
    image: 'http://localhost:3845/assets/fcfe140894624215171c88f4e69e22948fa65f2b.png',
    rating: 4,
    sizeRating: 3,
    comfortRating: 3,
    durabilityRating: 4,
    category: 'Women',
    subcategory: 'jacket',
    reviewsEnabled: true
  }
];

// Memoized ProductRow component to prevent unnecessary re-renders
const ProductRow = React.memo(({ 
  product, 
  renderStars, 
  renderRatingScale, 
  handleViewReviews, 
  handleToggleReviews 
}) => (
  <div key={product.id} className="px-6 py-6">
    <div className="grid grid-cols-12 gap-4 items-start">
      {/* Product Image */}
      <div className="col-span-1">
        <img
          src={product.image}
          alt={product.name}
          className="w-16 h-20 object-cover rounded-md"
        />
      </div>

      {/* Product Name */}
      <div className="col-span-2">
        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
      </div>

      {/* Rating */}
      <div className="col-span-1">
        <div className="flex space-x-1">{renderStars(product.rating)}</div>
      </div>

      {/* Size and Fit Ratings */}
      <div className="col-span-2">
        {renderRatingScale(product.sizeRating, 'size')}
        {renderRatingScale(product.comfortRating, 'comfort')}
        {renderRatingScale(product.durabilityRating, 'durability')}
      </div>

      {/* Category */}
      <div className="col-span-1">
        <span className="text-sm text-gray-700">{product.category}</span>
      </div>

      {/* Subcategory */}
      <div className="col-span-1">
        <span className="text-sm text-gray-700">{product.subcategory}</span>
      </div>

      {/* Action Button */}
      <div className="col-span-2">
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewReviews(product)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            view reviews
          </button>
        </div>
      </div>

      {/* Toggle Reviews */}
      <div className="col-span-2">
        <div className="flex space-x-2">
          <button
            onClick={() => handleToggleReviews(product.id, product.reviewsEnabled)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              product.reviewsEnabled
                ? 'bg-blue-600 text-white border-black'
                : 'bg-gray-200 text-black '
            }`}
          >
            On
          </button>
          <button
            onClick={() => handleToggleReviews(product.id, product.reviewsEnabled)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !product.reviewsEnabled
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-black'
            }`}
          >
            Off
          </button>
        </div>
      </div>
    </div>
  </div>
));

ProductRow.displayName = 'ProductRow';

const ManageReviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [selectedSubcategory, setSelectedSubcategory] = useState('sub categories');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subcategoryDropdownOpen, setSubcategoryDropdownOpen] = useState(false);
  const [showReviewDetails, setShowReviewDetails] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  
  // Consolidated modal state for better performance
  const [modalState, setModalState] = useState({
    showDeleteModal: false,
    showEditModal: false,
    showToggleModal: false,
    showSuccessModal: false,
    successMessage: ''
  });
  
  // Edit states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductCategory, setEditProductCategory] = useState('');
  const [editProductSubcategory, setEditProductSubcategory] = useState('');
  
  // Action states
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [toggleProductId, setToggleProductId] = useState(null);
  const [toggleAction, setToggleAction] = useState('');
  
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Memoized filtered products to avoid recalculation on every render
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All categories' || product.category === selectedCategory;
      const matchesSubcategory = selectedSubcategory === 'sub categories' || product.subcategory === selectedSubcategory;
      
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [products, searchTerm, selectedCategory, selectedSubcategory]);

  const categories = ['All categories', 'men', 'Women', 'kids'];
  const subcategories = ['sub categories', 'jacket', 't-shirt', 'lower'];

  // Memoized event handlers to prevent unnecessary re-renders
  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setEditProductName(product.name);
    setEditProductCategory(product.category);
    setEditProductSubcategory(product.subcategory);
    setModalState(prev => ({ ...prev, showEditModal: true }));
  }, []);

  const handleDeleteProduct = useCallback((productId) => {
    setDeletingProductId(productId);
    setModalState(prev => ({ ...prev, showDeleteModal: true }));
  }, []);

  const handleToggleReviews = useCallback((productId, currentState) => {
    setToggleProductId(productId);
    setToggleAction(currentState ? 'off' : 'on');
    setModalState(prev => ({ ...prev, showToggleModal: true }));
  }, []);

  const handleViewReviews = useCallback((product) => {
    setSelectedProductForReview(product);
    setShowReviewDetails(true);
  }, []);

  const handleGoBackFromReviews = useCallback(() => {
    setShowReviewDetails(false);
    setSelectedProductForReview(null);
  }, []);

  const confirmEdit = useCallback(() => {
    if (editingProduct && editProductName.trim()) {
      setProducts(prevProducts => prevProducts.map(product => 
        product.id === editingProduct.id 
          ? { 
              ...product, 
              name: editProductName.trim(),
              category: editProductCategory,
              subcategory: editProductSubcategory
            }
          : product
      ));
      
      setModalState(prev => ({ 
        ...prev, 
        showEditModal: false,
        showSuccessModal: true,
        successMessage: 'Product updated successfully!'
      }));
      resetEditState();
    }
  }, [editingProduct, editProductName, editProductCategory, editProductSubcategory]);

  const confirmDelete = useCallback(() => {
    if (deletingProductId) {
      setProducts(prevProducts => prevProducts.filter(product => product.id !== deletingProductId));
      setModalState(prev => ({ 
        ...prev, 
        showDeleteModal: false,
        showSuccessModal: true,
        successMessage: 'Product deleted successfully!'
      }));
      setDeletingProductId(null);
    }
  }, [deletingProductId]);

  const confirmToggle = useCallback(() => {
    if (toggleProductId) {
      setProducts(prevProducts => prevProducts.map(product => 
        product.id === toggleProductId 
          ? { ...product, reviewsEnabled: toggleAction === 'on' }
          : product
      ));
      
      setModalState(prev => ({ 
        ...prev, 
        showToggleModal: false,
        showSuccessModal: true,
        successMessage: `Reviews ${toggleAction === 'on' ? 'enabled' : 'disabled'} successfully!`
      }));
      setToggleProductId(null);
      setToggleAction('');
    }
  }, [toggleProductId, toggleAction]);

  const resetEditState = useCallback(() => {
    setEditingProduct(null);
    setEditProductName('');
    setEditProductCategory('');
    setEditProductSubcategory('');
  }, []);

  const closeAllModals = useCallback(() => {
    setModalState({
      showEditModal: false,
      showDeleteModal: false,
      showToggleModal: false,
      showSuccessModal: false,
      successMessage: ''
    });
    resetEditState();
    setDeletingProductId(null);
    setToggleProductId(null);
    setToggleAction('');
  }, [resetEditState]);

  // Memoized render functions to prevent recreation on every render
  const renderStars = useCallback((rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  }, []);

  const renderRatingScale = useCallback((rating, label) => {
    return (
      <div className="flex flex-col items-start space-y-2 mb-4">
        <div className="text-xs font-semibold text-gray-700">
          How was the {label}?
        </div>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <React.Fragment key={value}>
              <div
                className={`w-3 h-3 rounded-full border border-black ${
                  value === rating ? 'bg-black' : 'bg-white'
                }`}
              />
              {value < 5 && <div className="w-4 h-px bg-black" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }, []);

  // Memoized dropdown handlers
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setCategoryDropdownOpen(false);
  }, []);

  const handleSubcategorySelect = useCallback((subcategory) => {
    setSelectedSubcategory(subcategory);
    setSubcategoryDropdownOpen(false);
  }, []);

  return (
    <>
      {showReviewDetails ? (
        <ReviewDetails 
          productName={selectedProductForReview?.name || "Review Details"}
          onGoBack={handleGoBackFromReviews}
        />
      ) : (
        <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage reviews</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center justify-between px-4 py-2.5 border-2 border-black rounded-xl w-40 text-sm font-medium"
            >
              {selectedCategory}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subcategory Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSubcategoryDropdownOpen(!subcategoryDropdownOpen)}
              className="flex items-center justify-between px-4 py-2.5 border-2 border-black rounded-xl w-40 text-sm font-medium"
            >
              {selectedSubcategory}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            {subcategoryDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {SUBCATEGORIES.map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => handleSubcategorySelect(subcategory)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1 text-sm font-bold text-gray-900">Image</div>
            <div className="col-span-2 text-sm font-bold text-gray-900">item</div>
            <div className="col-span-1 text-sm font-bold text-gray-900">rating</div>
            <div className="col-span-2 text-sm font-bold text-gray-900">size and fit</div>
            <div className="col-span-1 text-sm font-bold text-gray-900">category</div>
            <div className="col-span-1 text-sm font-bold text-gray-900">subcategory</div>
            <div className="col-span-2 text-sm font-bold text-gray-900">Action</div>
            <div className="col-span-2 text-sm font-bold text-gray-900">Turn review on/off for this item</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              renderStars={renderStars}
              renderRatingScale={renderRatingScale}
              handleViewReviews={handleViewReviews}
              handleToggleReviews={handleToggleReviews}
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your search criteria.</p>
        </div>
      )}

      {/* Edit Modal */}
      {modalState.showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
              <button
                onClick={closeAllModals}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editProductName}
                  onChange={(e) => setEditProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={editProductCategory}
                  onChange={(e) => setEditProductCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CATEGORIES.filter(cat => cat !== 'All categories').map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  value={editProductSubcategory}
                  onChange={(e) => setEditProductSubcategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SUBCATEGORIES.filter(sub => sub !== 'sub categories').map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={confirmEdit}
                className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Update
              </button>
              <button
                onClick={closeAllModals}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalState.showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Delete Product</h2>
              <button
                onClick={closeAllModals}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={closeAllModals}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Confirmation Modal */}
      {modalState.showToggleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {toggleAction === 'on' ? 'Enable' : 'Disable'} Reviews
              </h2>
              <button
                onClick={closeAllModals}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to {toggleAction === 'on' ? 'enable' : 'disable'} reviews for this product?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmToggle}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors text-white ${
                  toggleAction === 'on' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {toggleAction === 'on' ? 'Enable' : 'Disable'}
              </button>
              <button
                onClick={closeAllModals}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {modalState.showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 max-w-md text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600">{modalState.successMessage}</p>
            </div>
            
            <button
              onClick={closeAllModals}
              className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
        </div>
      )}
    </>
  );
};

export default ManageReviews;