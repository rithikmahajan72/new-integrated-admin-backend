import React, { useState, useCallback, useMemo } from 'react';
import { Info, Send } from 'lucide-react';

// Constants and Configuration
const RETURN_REASONS = [
  { id: 1, text: 'Size/fit issue (the knowledge on the product)', checked: true },
  { id: 2, text: 'Product not as expected', checked: false },
  { id: 3, text: 'Wrong item received', checked: false },
  { id: 4, text: 'Damaged/defective product', checked: false },
  { id: 5, text: 'Late delivery', checked: false },
  { id: 6, text: 'Quality not as expected', checked: false }
];

const STATUS_OPTIONS = [
  { id: 'accept', label: 'accept', bgColor: 'bg-green-500', hoverColor: 'hover:bg-green-600', lightBg: 'bg-green-100', textColor: 'text-green-700', hoverLight: 'hover:bg-green-200' },
  { id: 'no', label: 'no', bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', lightBg: 'bg-blue-100', textColor: 'text-blue-700', hoverLight: 'hover:bg-blue-200' },
  { id: 'yes', label: 'yes', bgColor: 'bg-red-500', hoverColor: 'hover:bg-red-600', lightBg: 'bg-red-100', textColor: 'text-red-700', hoverLight: 'hover:bg-red-200' },
  { id: 'reject', label: 'reject', bgColor: 'bg-red-600', hoverColor: 'hover:bg-red-700', lightBg: 'bg-red-500', textColor: 'text-white', hoverLight: 'hover:bg-red-600' }
];

const PRODUCT_IMAGES = [
  { id: 1, src: '/api/placeholder/80/80', isMain: true },
  { id: 2, src: '/api/placeholder/60/60', isMain: false },
  { id: 3, src: '/api/placeholder/60/60', isMain: false },
  { id: 4, src: '/api/placeholder/60/60', isMain: false },
  { id: 5, src: '/api/placeholder/60/60', isMain: false }
];

const SUMMARY_STATS = {
  statusOverview: [
    { label: 'Pending Returns', value: 12, colorClass: 'text-orange-600' },
    { label: 'Approved Returns', value: 8, colorClass: 'text-green-600' },
    { label: 'Rejected Returns', value: 3, colorClass: 'text-red-600' }
  ],
  topReasons: [
    { label: 'Size/Fit Issues', percentage: '45%' },
    { label: 'Quality Issues', percentage: '28%' },
    { label: 'Wrong Item', percentage: '18%' }
  ],
  quickActions: [
    { label: 'View All Returns', bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
    { label: 'Bulk Approve', bgColor: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
    { label: 'Export Report', bgColor: 'bg-gray-500', hoverColor: 'hover:bg-gray-600' }
  ]
};

// Pre-computed CSS classes for better performance
const CSS_CLASSES = {
  thumbnailImages: PRODUCT_IMAGES.slice(1),
  checkboxInput: "mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500",
  textareaBase: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm",
  sendButtonValid: "px-8 py-3 rounded-full font-semibold transition-colors flex items-center space-x-2 bg-black text-white hover:bg-gray-800",
  sendButtonInvalid: "px-8 py-3 rounded-full font-semibold transition-colors flex items-center space-x-2 bg-gray-300 text-gray-500 cursor-not-allowed"
};

const INITIAL_FORM_STATE = {
  status: '',
  giveReason: '',
  explanation: ''
};

// Optimized Sub-Components
const ReasonCheckbox = React.memo(({ reason, onReasonChange }) => (
  <label className="flex items-start space-x-3 cursor-pointer">
    <input
      type="checkbox"
      checked={reason.checked}
      onChange={() => onReasonChange(reason.id)}
      className={CSS_CLASSES.checkboxInput}
    />
    <span className="text-sm text-gray-700 leading-relaxed">{reason.text}</span>
  </label>
));

const StatusButton = React.memo(({ option, isSelected, onStatusChange }) => {
  const buttonClass = isSelected 
    ? `w-full px-4 py-2 rounded-full text-sm font-semibold transition-colors ${option.bgColor} text-white`
    : `w-full px-4 py-2 rounded-full text-sm font-semibold transition-colors ${option.lightBg} ${option.textColor} ${option.hoverLight}`;

  return (
    <button
      onClick={() => onStatusChange(option.id)}
      className={buttonClass}
    >
      {option.label}
    </button>
  );
});

const ThumbnailImage = React.memo(({ image }) => (
  <div className="w-12 h-12 bg-gray-200 rounded border-2 border-gray-300 overflow-hidden">
    <img 
      src={image.src} 
      alt={`Product view ${image.id}`}
      className="w-full h-full object-cover"
    />
  </div>
));

const SummaryItem = React.memo(({ item, type }) => {
  if (type === 'status') {
    return (
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{item.label}</span>
        <span className={`text-sm font-semibold ${item.colorClass}`}>{item.value}</span>
      </div>
    );
  }
  
  if (type === 'reason') {
    return (
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{item.label}</span>
        <span className="text-sm font-semibold text-gray-900">{item.percentage}</span>
      </div>
    );
  }
  
  return (
    <button 
      className={`w-full ${item.bgColor} text-white py-2 px-4 rounded-lg text-sm ${item.hoverColor} transition-colors`}
    >
      {item.label}
    </button>
  );
});

const SummarySection = React.memo(({ title, items, type, onQuickAction }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} onClick={type === 'action' ? () => onQuickAction(item.label) : undefined}>
          <SummaryItem item={item} type={type} />
        </div>
      ))}
    </div>
  </div>
));

/**
 * Return Orders Component
 * 
 * PERFORMANCE OPTIMIZED ARCHITECTURE:
 * ==================================
 * 
 * 1. CONSTANTS & CONFIGURATION
 *    - Pre-computed CSS classes to avoid runtime concatenation
 *    - Optimized data structures for better memory usage
 *    - Separate memoized sub-components for better re-render control
 * 
 * 2. STATE MANAGEMENT
 *    - Removed unused state (selectedReason)
 *    - Optimized state updates with specific dependencies
 *    - Efficient computed values with proper memoization
 * 
 * 3. SUB-COMPONENTS (Memoized for Performance)
 *    - ReasonCheckbox: Isolated checkbox rendering
 *    - StatusButton: Optimized button with pre-computed classes
 *    - ThumbnailImage: Separate image component
 *    - SummaryItem: Unified summary item renderer
 *    - SummarySection: Complete summary section
 * 
 * 4. OPTIMIZATIONS IMPLEMENTED
 *    - React.memo() on all sub-components
 *    - Pre-computed CSS classes to reduce runtime calculations
 *    - Specific useCallback dependencies
 *    - Reduced inline object/function creation
 *    - Optimized list rendering with proper keys
 *    - Moved static JSX outside render callbacks
 */
const ReturnOrders = React.memo(() => {
  // State Management - Form Data (removed unused selectedReason)
  const [status, setStatus] = useState(INITIAL_FORM_STATE.status);
  const [giveReason, setGiveReason] = useState(INITIAL_FORM_STATE.giveReason);
  const [explanation, setExplanation] = useState(INITIAL_FORM_STATE.explanation);

  // State Management - Return Reasons
  const [reasons, setReasons] = useState(RETURN_REASONS);

  // Computed Values with optimized dependencies
  const selectedReasons = useMemo(() => 
    reasons.filter(reason => reason.checked),
    [reasons]
  );

  const isFormValid = useMemo(() => {
    const hasReasons = selectedReasons.length > 0;
    const hasStatus = Boolean(status);
    const hasText = giveReason.trim() || explanation.trim();
    return hasReasons && hasStatus && hasText;
  }, [selectedReasons.length, status, giveReason, explanation]);

  // Event Handlers with specific dependencies
  const handleReasonChange = useCallback((id) => {
    setReasons(prev => 
      prev.map(reason => 
        reason.id === id ? { ...reason, checked: !reason.checked } : reason
      )
    );
  }, []);

  const handleStatusChange = useCallback((newStatus) => {
    setStatus(newStatus);
  }, []);

  const handleReasonTextChange = useCallback((e) => {
    setGiveReason(e.target.value);
  }, []);

  const handleExplanationChange = useCallback((e) => {
    setExplanation(e.target.value);
  }, []);

  // Form Submission with optimized dependencies
  const handleSendResponse = useCallback(() => {
    if (!isFormValid) {
      console.warn('Form is not valid');
      return;
    }

    const responseData = {
      selectedReasons,
      status,
      giveReason: giveReason.trim(),
      explanation: explanation.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('Sending response with:', responseData);
    
    // TODO: Implement actual API call
    // Reset form after successful submission
    setReasons(RETURN_REASONS);
    setStatus('');
    setGiveReason('');
    setExplanation('');
  }, [isFormValid, selectedReasons, status, giveReason, explanation]);

  const handleQuickAction = useCallback((actionLabel) => {
    console.log(`Executing quick action: ${actionLabel}`);
    // TODO: Implement quick action logic
  }, []);

  // Static JSX elements that don't need re-creation
  const imagePreviewHeader = useMemo(() => (
    <div className="flex items-center space-x-2 mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
      <div className="flex items-center justify-center w-6 h-6 bg-gray-800 text-white rounded-full text-sm font-bold">
        <Info className="h-3 w-3" />
      </div>
    </div>
  ), []);

  const mainProductImage = useMemo(() => (
    <div className="mb-4">
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
        <img 
          src="/api/placeholder/200/250" 
          alt="Product main view"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  ), []);

  // Optimized render functions
  const renderImagePreview = useMemo(() => (
    <div className="lg:col-span-1">
      {imagePreviewHeader}
      {mainProductImage}
      
      {/* Thumbnail Images */}
      <div className="flex space-x-2">
        {CSS_CLASSES.thumbnailImages.map((image) => (
          <ThumbnailImage key={image.id} image={image} />
        ))}
      </div>
    </div>
  ), [imagePreviewHeader, mainProductImage]);

  const renderReturnReasons = useMemo(() => (
    <div className="lg:col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reason of return</h3>
      <div className="space-y-3">
        {reasons.map((reason) => (
          <ReasonCheckbox 
            key={reason.id} 
            reason={reason} 
            onReasonChange={handleReasonChange} 
          />
        ))}
      </div>
    </div>
  ), [reasons, handleReasonChange]);

  const renderStatusButtons = useMemo(() => (
    <div className="lg:col-span-1">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">status</h3>
      <div className="space-y-3">
        {STATUS_OPTIONS.map((option) => (
          <StatusButton
            key={option.id}
            option={option}
            isSelected={status === option.id}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  ), [status, handleStatusChange]);

  const renderTextInputs = useMemo(() => (
    <div className="lg:col-span-1">
      <div className="space-y-6">
        {/* Give Reason */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">give reason</h3>
          <textarea
            value={giveReason}
            onChange={handleReasonTextChange}
            placeholder="Enter reason..."
            className={`${CSS_CLASSES.textareaBase} h-20`}
          />
        </div>

        {/* Give Explanation */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">give explanation</h3>
          <textarea
            value={explanation}
            onChange={handleExplanationChange}
            placeholder="Enter explanation..."
            className={`${CSS_CLASSES.textareaBase} h-32`}
          />
        </div>
      </div>
    </div>
  ), [giveReason, explanation, handleReasonTextChange, handleExplanationChange]);

  const sendButtonClass = isFormValid ? CSS_CLASSES.sendButtonValid : CSS_CLASSES.sendButtonInvalid;

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Return window screen</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {renderImagePreview}
          {renderReturnReasons}
          {renderStatusButtons}
          {renderTextInputs}
        </div>

        {/* Send Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSendResponse}
            disabled={!isFormValid}
            className={sendButtonClass}
          >
            <span>send response</span>
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Return Summary Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummarySection 
            title="Status Overview" 
            items={SUMMARY_STATS.statusOverview} 
            type="status"
          />
          <SummarySection 
            title="Top Return Reasons" 
            items={SUMMARY_STATS.topReasons} 
            type="reason"
          />
          <SummarySection 
            title="Quick Actions" 
            items={SUMMARY_STATS.quickActions} 
            type="action"
            onQuickAction={handleQuickAction}
          />
        </div>
      </div>
    </div>
  );
});

ReasonCheckbox.displayName = 'ReasonCheckbox';
StatusButton.displayName = 'StatusButton';
ThumbnailImage.displayName = 'ThumbnailImage';
SummaryItem.displayName = 'SummaryItem';
SummarySection.displayName = 'SummarySection';
ReturnOrders.displayName = 'ReturnOrders';

export default ReturnOrders;
