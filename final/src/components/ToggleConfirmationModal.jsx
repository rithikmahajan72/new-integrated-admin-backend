import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * ToggleConfirmationModal Component
 * 
 * A reusable confirmation modal for toggle actions (turn on/off settings).
 * Based on Figma design specifications with warning icon and dual action buttons.
 * 
 * Features:
 * - Dynamic message support for turn on/off scenarios
 * - Figma-accurate design with orange warning icon
 * - Smooth animations matching SuccessModal
 * - Keyboard navigation (ESC to cancel)
 * - Overlay click to cancel
 * - Consistent Montserrat fonts
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onCancel - Callback function when modal is cancelled/closed
 * @param {function} onConfirm - Callback function when action is confirmed
 * @param {string} title - Dynamic message text for the modal
 * @param {boolean} isToggleOn - Whether this is for turning something on (true) or off (false)
 * @param {string} confirmText - Text for confirm button (default: "Yes")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 */
const ToggleConfirmationModal = ({ 
  isOpen, 
  onCancel, 
  onConfirm, 
  title,
  isToggleOn = true,
  confirmText = "Yes",
  cancelText = "Cancel"
}) => {
  // Handle keyboard events (ESC to cancel)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  // Handle overlay click to cancel
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  // Generate default title if not provided
  const defaultTitle = title || `are you sure you want to turn this ${isToggleOn ? 'on' : 'off'}`;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-hidden animate-slideUp">
        {/* Close button */}
        <button 
          onClick={onCancel}
          className="absolute right-[20px] top-[20px] w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-full h-full" />
        </button>

        {/* Modal content */}
        <div className="p-8 text-center">
          {/* Warning icon - Orange circle with white exclamation mark */}
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <AlertTriangle className="w-8 h-8 text-white stroke-[3]" />
          </div>

          {/* Confirmation message */}
          <h3 className="font-bold text-black text-[18px] mb-8 font-montserrat leading-tight max-w-[280px] mx-auto">
            {defaultTitle}
          </h3>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            {/* Confirm button (Yes) - Black */}
            <button
              onClick={onConfirm}
              className="bg-black text-white px-8 py-3 rounded-full font-medium text-[16px] font-montserrat hover:bg-gray-800 transition-colors min-w-[120px]"
            >
              {confirmText}
            </button>

            {/* Cancel button - White with border */}
            <button
              onClick={onCancel}
              className="bg-white text-black px-8 py-3 rounded-full font-medium text-[16px] font-montserrat border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors min-w-[120px]"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ToggleConfirmationModal;
