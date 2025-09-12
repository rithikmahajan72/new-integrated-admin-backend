import React from 'react';
import { CheckCircle, X, XCircle } from 'lucide-react';

/**
 * UploadProgressLoader Component
 * 
 * A sophisticated loader component that shows upload progress for files (images/videos)
 * with thumbnails, filenames, progress bars, and status indicators.
 * Based on the Figma design with proper styling and animations.
 */
const UploadProgressLoader = ({ 
  files = [], 
  uploadStatus = [], 
  onRemoveFile, 
  type = 'images',
  maxDisplay = 5 
}) => {
  if (!uploadStatus || uploadStatus.length === 0) {
    return null;
  }

  // Get the latest upload statuses to display
  const recentStatuses = uploadStatus.slice(-maxDisplay);

  const getFileFromStatus = (status) => {
    return files.find(file => file.id === status.id);
  };

  const getProgressWidth = (progress) => {
    return `${Math.min(Math.max(progress || 0, 0), 100)}%`;
  };

  const handleRemoveFile = (statusId) => {
    if (onRemoveFile) {
      onRemoveFile(statusId, type);
    }
  };

  return (
    <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
      {recentStatuses.map((status) => {
        const file = getFileFromStatus(status);
        const filename = file?.name || `${type === 'images' ? 'Image' : 'Video'} file`;
        const isUploading = status.status === 'uploading';
        const isSuccess = status.status === 'success';
        const isFailed = status.status === 'failed';

        return (
          <div key={status.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
            {/* Thumbnail Container */}
            <div className="relative w-[83px] h-[63px] flex-shrink-0">
              {file?.url ? (
                <div className="w-full h-full rounded overflow-hidden bg-gray-100">
                  {type === 'images' ? (
                    <img 
                      src={file.url} 
                      alt={filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Video thumbnail placeholder
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                  {type === 'images' ? (
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  )}
                </div>
              )}
            </div>

            {/* File Info Container */}
            <div className="flex-1 min-w-0">
              {/* Filename */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-[14px] font-semibold text-[#232321] font-['Open_Sans'] truncate pr-2">
                  {filename}
                </p>
                
                {/* Status Icon and Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isUploading && (
                    <div className="w-4 h-4 border-2 border-[#003F62] border-t-transparent rounded-full animate-spin"></div>
                  )}
                  
                  {isSuccess && (
                    <div className="w-8 h-8 bg-[#003F62] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  {isFailed && (
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  {/* Remove/Cancel Button */}
                  <button
                    onClick={() => handleRemoveFile(status.id)}
                    className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors group"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 relative">
                {/* Background Bar */}
                <div className="absolute inset-0 bg-[#E7E7E3] rounded-full"></div>
                
                {/* Progress Bar */}
                <div 
                  className="absolute left-0 top-0 h-full bg-[#003F62] rounded-full transition-all duration-300 ease-out"
                  style={{ width: getProgressWidth(status.progress) }}
                ></div>
              </div>

              {/* Progress Text */}
              <div className="mt-1">
                {isUploading && (
                  <p className="text-xs text-[#003F62] font-medium">
                    Uploading... {Math.round(status.progress || 0)}%
                  </p>
                )}
                {isSuccess && (
                  <p className="text-xs text-green-600 font-medium">
                    Upload completed
                  </p>
                )}
                {isFailed && (
                  <p className="text-xs text-red-600 font-medium">
                    Upload failed
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UploadProgressLoader;
