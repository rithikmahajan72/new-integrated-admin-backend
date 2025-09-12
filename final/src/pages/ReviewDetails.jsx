import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Star, Upload, Edit2, Trash2, X, Check } from 'lucide-react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import SuccessModal from '../components/SuccessModal';

const ReviewDetails = ({ productName = "Review 1", onGoBack }) => {
  // Customer reviews state
  const [customerReviews, setCustomerReviews] = useState([
    {
      id: 1,
      title: "Review 1",
      message: "Great product! Love the quality and fit.",
      rating: 4,
      sizeRating: 3,
      comfortRating: 4,
      durabilityRating: 4,
      image: null
    },
    {
      id: 2,
      title: "Review 2", 
      message: "Good value for money. Comfortable to wear.",
      rating: 4,
      sizeRating: 4,
      comfortRating: 5,
      durabilityRating: 3,
      image: null
    }
  ]);

  // Admin review form state
  const [adminReview, setAdminReview] = useState({
    message: '',
    rating: 0,
    sizeRating: 0,
    comfortRating: 0,
    durabilityRating: 0,
    image: null
  });

  // Stack reviews for later
  const [stackedReviews, setStackedReviews] = useState([
    {
      id: 1,
      title: "Review 1",
      message: "This is a saved review that will be posted later.",
      rating: 4,
      sizeRating: 3,
      comfortRating: 4,
      durabilityRating: 4,
      image: null
    }
  ]);

  // Modal states
  const [showEditMainReviewModal, setShowEditMainReviewModal] = useState(false);
  const [showEditAdminReviewModal, setShowEditAdminReviewModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'main' or 'stack'

  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setAdminReview(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRatingClick = useCallback((type, rating) => {
    if (showEditMainReviewModal && editingReview) {
      setEditingReview(prev => ({ ...prev, [type]: rating }));
    } else {
      setAdminReview(prev => ({ ...prev, [type]: rating }));
    }
  }, [showEditMainReviewModal, editingReview]);

  const handleEditMainReview = useCallback((review) => {
    setEditingReview({ ...review });
    setShowEditMainReviewModal(true);
  }, []);

  const handleEditAdminReview = useCallback(() => {
    setShowEditAdminReviewModal(true);
  }, []);

  const handleDeleteMainReview = useCallback((review) => {
    setDeletingReview(review);
    setDeleteType('main');
    setShowDeleteConfirmModal(true);
  }, []);

  const handleDeleteStackedReview = useCallback((review) => {
    setDeletingReview(review);
    setDeleteType('stack');
    setShowDeleteConfirmModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deletingReview) {
      if (deleteType === 'main') {
        setCustomerReviews(prev => prev.filter(review => review.id !== deletingReview.id));
      } else if (deleteType === 'stack') {
        setStackedReviews(prev => prev.filter(review => review.id !== deletingReview.id));
      }
      
      setShowDeleteConfirmModal(false);
      setShowDeleteSuccessModal(true);
      setDeletingReview(null);
      setDeleteType('');
    }
  }, [deletingReview, deleteType]);

  const handleSaveMainReview = useCallback(() => {
    if (editingReview) {
      setCustomerReviews(prev => 
        prev.map(review => 
          review.id === editingReview.id ? editingReview : review
        )
      );
      setShowEditMainReviewModal(false);
      setEditingReview(null);
    }
  }, [editingReview]);

  const handleCloseModals = useCallback(() => {
    setShowEditMainReviewModal(false);
    setShowEditAdminReviewModal(false);
    setShowDeleteConfirmModal(false);
    setShowDeleteSuccessModal(false);
    setEditingReview(null);
    setDeletingReview(null);
    setDeleteType('');
  }, []);

  const renderStars = useMemo(() => (rating, onStarClick = null, size = "w-6 h-6") => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`${size} cursor-pointer transition-colors ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => onStarClick && onStarClick(index + 1)}
      />
    ));
  }, []);

  const renderRatingScale = useMemo(() => (rating, label, type, isEditable = false) => {
    return (
      <div className="flex flex-col items-start space-y-2">
        <div className="text-xs font-semibold text-gray-700">
          How was the {label}?
        </div>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <React.Fragment key={value}>
              <div
                className={`w-3 h-3 rounded-full border border-black cursor-pointer ${
                  value === rating ? 'bg-black' : 'bg-white'
                }`}
                onClick={() => isEditable && handleRatingClick(type, value)}
              />
              {value < 5 && <div className="w-4 h-px bg-black" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }, [handleRatingClick]);

  const handlePostReview = useCallback(() => {
    if (adminReview.message.trim() && adminReview.rating > 0) {
      const newReview = {
        id: Date.now(),
        title: `Admin Review ${customerReviews.length + 1}`,
        message: adminReview.message,
        rating: adminReview.rating,
        sizeRating: adminReview.sizeRating || 3,
        comfortRating: adminReview.comfortRating || 3,
        durabilityRating: adminReview.durabilityRating || 3,
        image: adminReview.image
      };
      
      setCustomerReviews(prev => [...prev, newReview]);
      
      // Reset form
      setAdminReview({
        message: '',
        rating: 0,
        sizeRating: 0,
        comfortRating: 0,
        durabilityRating: 0,
        image: null
      });
      setImagePreview(null);
    }
  }, [adminReview, customerReviews.length]);

  const handlePostFromStack = useCallback((reviewId) => {
    const reviewToPost = stackedReviews.find(review => review.id === reviewId);
    if (reviewToPost) {
      setCustomerReviews(prev => [...prev, { ...reviewToPost, id: Date.now() }]);
      setStackedReviews(prev => prev.filter(review => review.id !== reviewId));
    }
  }, [stackedReviews]);

  const handleDeleteFromStack = useCallback((review) => {
    setDeletingReview(review);
    setDeleteType('stacked');
    setShowDeleteConfirmModal(true);
  }, []);

  const handleEditStackedReview = useCallback((review) => {
    setEditingReview({ ...review });
    setShowEditMainReviewModal(true);
  }, []);

  // Memoized image component to prevent unnecessary re-renders
  const ImagePreview = useMemo(() => ({ image, className = "w-full h-full object-cover" }) => {
    return image ? (
      <img src={image} alt="Preview" className={className} />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <img 
          src="http://localhost:3845/assets/fcfe140894624215171c88f4e69e22948fa65f2b.png" 
          alt="Default" 
          className={className}
        />
      </div>
    );
  }, []);

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={onGoBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          go back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 text-center">reviews details</h1>
      </div>

      {/* Main Reviews Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Main</h2>
        
        {customerReviews.map((review, index) => (
          <div key={review.id} className="mb-8 p-6 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-12 gap-6">
              {/* Review Title */}
              <div className="col-span-2">
                <h3 className="font-bold text-gray-900 mb-2">{review.title}</h3>
                <div className="text-sm font-medium text-gray-700 mb-2">Image Preview</div>
                <div className="w-24 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <ImagePreview image={review.image} className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>

              {/* Message */}
              <div className="col-span-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Message</div>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[80px]">
                  {review.message}
                </div>
              </div>

              {/* Rating */}
              <div className="col-span-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Rating</div>
                <div className="flex space-x-1">
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Size and Fit */}
              <div className="col-span-3">
                <div className="text-sm font-medium text-gray-700 mb-4">size and fit</div>
                <div className="space-y-4">
                  {renderRatingScale(review.sizeRating, 'size', 'sizeRating')}
                  {renderRatingScale(review.comfortRating, 'comfort', 'comfortRating')}
                  {renderRatingScale(review.durabilityRating, 'durability', 'durabilityRating')}
                </div>
              </div>

              {/* Action */}
              <div className="col-span-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Action</div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditMainReview(review)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMainReview(review)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Review from Admin Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Post review from admin</h2>
        
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-12 gap-6">
            {/* Image Preview */}
            <div className="col-span-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Image Preview</div>
              <div className="w-24 h-32 border border-gray-300 rounded-lg overflow-hidden mb-4">
                <ImagePreview image={imagePreview} />
              </div>
              <label className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Message */}
            <div className="col-span-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Message</div>
              <textarea
                value={adminReview.message}
                onChange={useCallback((e) => setAdminReview(prev => ({ ...prev, message: e.target.value })), [])}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-none"
                placeholder="Write your review message..."
              />
            </div>

            {/* Rating */}
            <div className="col-span-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Rating</div>
              <div className="flex space-x-1">
                {renderStars(adminReview.rating, (rating) => handleRatingClick('rating', rating))}
              </div>
            </div>

            {/* Size and Fit */}
            <div className="col-span-3">
              <div className="text-sm font-medium text-gray-700 mb-4">size and fit</div>
              <div className="space-y-4">
                {renderRatingScale(adminReview.sizeRating, 'size', 'sizeRating', true)}
                {renderRatingScale(adminReview.comfortRating, 'comfort', 'comfortRating', true)}
                {renderRatingScale(adminReview.durabilityRating, 'durability', 'durabilityRating', true)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="col-span-2">
              <div className="space-y-3">
                <button
                  onClick={handleEditAdminReview}
                  className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Post review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stack Reviews for Later Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Stack reviews for later</h2>
        
        {stackedReviews.map((review) => (
          <div key={review.id} className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-12 gap-6">
              {/* Review Title */}
              <div className="col-span-2">
                <h3 className="font-bold text-gray-900 mb-2">{review.title}</h3>
                <div className="text-sm font-medium text-gray-700 mb-2">Image Preview</div>
                <div className="w-24 h-32 border border-gray-300 rounded-lg overflow-hidden">
                  <ImagePreview image={review.image} />
                </div>
              </div>

              {/* Message */}
              <div className="col-span-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Message</div>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-white min-h-[80px]">
                  {review.message}
                </div>
              </div>

              {/* Rating */}
              <div className="col-span-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Rating</div>
                <div className="flex space-x-1">
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Size and Fit */}
              <div className="col-span-3">
                <div className="text-sm font-medium text-gray-700 mb-4">size and fit</div>
                <div className="space-y-4">
                  {renderRatingScale(review.sizeRating, 'size', 'sizeRating')}
                  {renderRatingScale(review.comfortRating, 'comfort', 'comfortRating')}
                  {renderRatingScale(review.durabilityRating, 'durability', 'durabilityRating')}
                </div>
              </div>

              {/* Action */}
              <div className="col-span-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Action</div>
                <div className="space-y-2">
                  <button
                    onClick={() => handlePostFromStack(review.id)}
                    className="w-full bg-black text-white py-2 px-3 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                  >
                    Post Now
                  </button>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditStackedReview(review)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFromStack(review)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Main Review Modal */}
      {showEditMainReviewModal && editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-5xl w-full mx-4">
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-8 mb-6 pb-4 border-b border-gray-200">
              <div className="text-lg font-bold text-gray-900">Image Preview</div>
              <div className="text-lg font-bold text-gray-900">Message</div>
              <div className="text-lg font-bold text-gray-900">Rating</div>
              <div className="text-lg font-bold text-gray-900">size and fit</div>
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModals}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Content Row */}
            <div className="grid grid-cols-5 gap-8">
              {/* Image Preview */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 border border-gray-300 rounded-lg overflow-hidden mb-4">
                  <ImagePreview image={editingReview.image} />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  upload image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setEditingReview(prev => ({ ...prev, image: event.target.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </button>
              </div>

              {/* Message */}
              <div>
                <textarea
                  value={editingReview.message}
                  onChange={useCallback((e) => setEditingReview(prev => ({ ...prev, message: e.target.value })), [])}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-none text-sm"
                  placeholder="Manage account and services linked to your Yoraa account"
                />
              </div>

              {/* Rating */}
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  {renderStars(editingReview.rating, (rating) => handleRatingClick('rating', rating), "w-8 h-8")}
                </div>
              </div>

              {/* Size and Fit */}
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">How was the size?</div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <React.Fragment key={value}>
                        <div
                          className={`w-3 h-3 rounded-full border border-black cursor-pointer ${
                            value === editingReview.sizeRating ? 'bg-black' : 'bg-white'
                          }`}
                          onClick={() => handleRatingClick('sizeRating', value)}
                        />
                        {value < 5 && <div className="w-4 h-px bg-black" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">How was the comfort?</div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <React.Fragment key={value}>
                        <div
                          className={`w-3 h-3 rounded-full border border-black cursor-pointer ${
                            value === editingReview.comfortRating ? 'bg-black' : 'bg-white'
                          }`}
                          onClick={() => handleRatingClick('comfortRating', value)}
                        />
                        {value < 5 && <div className="w-4 h-px bg-black" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">How was the durability?</div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <React.Fragment key={value}>
                        <div
                          className={`w-3 h-3 rounded-full border border-black cursor-pointer ${
                            value === editingReview.durabilityRating ? 'bg-black' : 'bg-white'
                          }`}
                          onClick={() => handleRatingClick('durabilityRating', value)}
                        />
                        {value < 5 && <div className="w-4 h-px bg-black" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Empty column for spacing */}
              <div></div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center space-x-8 mt-8">
              <button
                onClick={handleSaveMainReview}
                className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
              >
                save and post
              </button>
              <button
                onClick={handleCloseModals}
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                go back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Review Modal */}
      {showEditAdminReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-5xl w-full mx-4">
            {/* Header Row */}
            <div className="grid grid-cols-5 gap-8 mb-6 pb-4 border-b border-gray-200">
              <div className="text-lg font-bold text-gray-900">Image Preview</div>
              <div className="text-lg font-bold text-gray-900">Message</div>
              <div className="text-lg font-bold text-gray-900">Rating</div>
              <div className="text-lg font-bold text-gray-900">size and fit</div>
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModals}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Content Row */}
            <div className="grid grid-cols-5 gap-8">
              {/* Image Preview */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 border border-gray-300 rounded-lg overflow-hidden mb-4">
                  <ImagePreview image={imagePreview} />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  upload image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </button>
              </div>

              {/* Message */}
              <div>
                <textarea
                  value={adminReview.message}
                  onChange={useCallback((e) => setAdminReview(prev => ({ ...prev, message: e.target.value })), [])}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-none text-sm"
                  placeholder="Manage account and services linked to your Yoraa account"
                />
              </div>

              {/* Rating */}
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  {renderStars(adminReview.rating, (rating) => handleRatingClick('rating', rating), "w-8 h-8")}
                </div>
              </div>

              {/* Size and Fit */}
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">How was the size?</div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <React.Fragment key={value}>
                        <div
                          className={`w-3 h-3 rounded-full border border-black cursor-pointer ${
                            value === adminReview.sizeRating ? 'bg-black' : 'bg-white'
                          }`}
                          onClick={() => handleRatingClick('sizeRating', value)}
                        />
                        {value < 5 && <div className="w-4 h-px bg-black" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">How was the comfort?</div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <React.Fragment key={value}>
                        <div
                          className={`w-3 h-3 rounded-full border border-black cursor-pointer ${
                            value === adminReview.comfortRating ? 'bg-black' : 'bg-white'
                          }`}
                          onClick={() => handleRatingClick('comfortRating', value)}
                        />
                        {value < 5 && <div className="w-4 h-px bg-black" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">How was the durability?</div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <React.Fragment key={value}>
                        <div
                          className={`w-3 h-3 rounded-full border border-black cursor-pointer ${
                            value === adminReview.durabilityRating ? 'bg-black' : 'bg-white'
                          }`}
                          onClick={() => handleRatingClick('durabilityRating', value)}
                        />
                        {value < 5 && <div className="w-4 h-px bg-black" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Empty column for spacing */}
              <div></div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center space-x-6 mt-8">
              <button
                onClick={useCallback(() => {
                  handlePostReview();
                  handleCloseModals();
                }, [handlePostReview, handleCloseModals])}
                className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
              >
                save and post
              </button>
              <button
                onClick={useCallback(() => {
                  // Save for later functionality
                  if (adminReview.message.trim() && adminReview.rating > 0) {
                    const newReview = {
                      id: Date.now(),
                      title: `Saved Review ${stackedReviews.length + 1}`,
                      message: adminReview.message,
                      rating: adminReview.rating,
                      sizeRating: adminReview.sizeRating || 3,
                      comfortRating: adminReview.comfortRating || 3,
                      durabilityRating: adminReview.durabilityRating || 3,
                      image: adminReview.image
                    };
                    
                    setStackedReviews(prev => [...prev, newReview]);
                    
                    // Reset form
                    setAdminReview({
                      message: '',
                      rating: 0,
                      sizeRating: 0,
                      comfortRating: 0,
                      durabilityRating: 0,
                      image: null
                    });
                    setImagePreview(null);
                    handleCloseModals();
                  }
                }, [adminReview, stackedReviews.length, handleCloseModals])}
                className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-colors font-medium"
              >
                save for later
              </button>
              <button
                onClick={handleCloseModals}
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                go back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Are you sure you want to delete this review?"
      />

      {/* Delete Success Modal */}
      <SuccessModal
        isOpen={showDeleteSuccessModal}
        onClose={() => setShowDeleteSuccessModal(false)}
        title="Deleted successfully!"
      />
    </div>
  );
};

export default ReviewDetails;
