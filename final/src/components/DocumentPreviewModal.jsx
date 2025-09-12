import React, { useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const DocumentPreviewModal = ({ documents, initialDocumentIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialDocumentIndex);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const currentDocument = documents[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % documents.length);
    setZoom(100);
    setRotation(0);
  }, [documents.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + documents.length) % documents.length);
    setZoom(100);
    setRotation(0);
  }, [documents.length]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 300));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'document';
    return 'unknown';
  };

  const renderDocumentContent = () => {
    const fileType = getFileType(currentDocument.name);
    
    switch (fileType) {
      case 'image':
        return (
          <img
            src={currentDocument.preview || '/api/placeholder/600/800'}
            alt={currentDocument.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            }}
          />
        );
      case 'pdf':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg font-medium text-red-800">PDF Document</p>
            <p className="text-red-600 mt-2">{currentDocument.name}</p>
            <p className="text-sm text-red-500 mt-4">
              PDF preview requires a PDF viewer. Click download to view the document.
            </p>
          </div>
        );
      case 'document':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-lg font-medium text-blue-800">Document File</p>
            <p className="text-blue-600 mt-2">{currentDocument.name}</p>
            <p className="text-sm text-blue-500 mt-4">
              Document preview requires appropriate software. Click download to view the document.
            </p>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-lg font-medium text-gray-800">Unknown File Type</p>
            <p className="text-gray-600 mt-2">{currentDocument.name}</p>
            <p className="text-sm text-gray-500 mt-4">
              This file type cannot be previewed. Click download to view the document.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Document Preview: {currentDocument.name}
            </h3>
            {documents.length > 1 && (
              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {documents.length}
              </span>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {documents.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Previous document"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Next document"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
              </>
            )}
            
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleRotate}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                // Handle download
                const link = document.createElement('a');
                link.href = currentDocument.preview;
                link.download = currentDocument.name;
                link.click();
              }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
          {renderDocumentContent()}
        </div>

        {/* Footer with document info */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 font-medium">{currentDocument.type}</span>
            </div>
            <div>
              <span className="text-gray-500">Size:</span>
              <span className="ml-2 font-medium">{currentDocument.size || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-gray-500">Modified:</span>
              <span className="ml-2 font-medium">{currentDocument.modified || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-gray-500">Format:</span>
              <span className="ml-2 font-medium">{currentDocument.name.split('.').pop().toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
