import React, { useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight, Ruler } from 'lucide-react';

const SizeChartModal = ({ charts, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const currentChart = charts[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % charts.length);
    setZoom(100);
    setRotation(0);
  }, [charts.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + charts.length) % charts.length);
    setZoom(100);
    setRotation(0);
  }, [charts.length]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 300));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const getChartTitle = (type) => {
    switch (type) {
      case 'inch':
        return 'Size Chart (Inches)';
      case 'cm':
        return 'Size Chart (Centimeters)';
      case 'measurement':
        return 'Measurement Guide';
      default:
        return 'Size Chart';
    }
  };

  const getChartIcon = (type) => {
    switch (type) {
      case 'measurement':
        return '📏';
      default:
        return '📐';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {getChartTitle(currentChart.type)}
              </h3>
            </div>
            {charts.length > 1 && (
              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {charts.length}
              </span>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {charts.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Previous chart"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Next chart"
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
                link.href = currentChart.url;
                link.download = currentChart.name;
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
          <div className="relative">
            <img
              src={currentChart.url || '/api/placeholder/600/800'}
              alt={currentChart.name}
              className="max-w-full max-h-full object-contain transition-transform duration-200 shadow-lg"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              }}
            />
          </div>
        </div>

        {/* Footer with chart navigation */}
        {charts.length > 1 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-gray-600">Available Charts:</span>
              <div className="flex gap-2">
                {charts.map((chart, index) => (
                  <button
                    key={chart.id}
                    onClick={() => {
                      setCurrentIndex(index);
                      setZoom(100);
                      setRotation(0);
                    }}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      index === currentIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <span className="mr-1">{getChartIcon(chart.type)}</span>
                    {getChartTitle(chart.type)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chart info footer */}
        <div className="px-4 pb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-lg">{getChartIcon(currentChart.type)}</div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">{getChartTitle(currentChart.type)}</h4>
                <p className="text-sm text-blue-700">
                  {currentChart.type === 'measurement' 
                    ? 'This guide shows how to properly measure your body for the best fit.'
                    : `Size chart showing measurements in ${currentChart.type === 'inch' ? 'inches' : 'centimeters'}.`
                  }
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  File: {currentChart.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
