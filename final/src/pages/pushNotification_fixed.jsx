import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Mail, Edit, Trash2, Info, Menu, X, Heart, Star, ShoppingCart, Bookmark, Package, Grid, List, Search } from "lucide-react";

// Simple PushNotification component without complex nested conditionals
const PushNotification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Local state
  const [activeTab, setActiveTab] = useState('notifications');
  const [currentNotification, setCurrentNotification] = useState({
    body: '',
    deepLink: '',
    image: null,
    imageUrl: '',
    platforms: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Mock data for save for later
  const saveForLaterItems = [];
  const saveForLaterCount = 0;
  const saveForLaterLoading = false;

  // Handlers
  const handleNavigateToPreview = () => {
    navigate('/notification-preview');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        // Mock upload - in real app would upload to server
        const imageUrl = URL.createObjectURL(file);
        setCurrentNotification(prev => ({
          ...prev,
          imageUrl,
          image: file
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSendNotification = async () => {
    if (!currentNotification.body.trim()) {
      alert('Please enter notification text');
      return;
    }

    setIsSending(true);
    try {
      // Mock send - in real app would call API
      console.log('Sending notification:', currentNotification);
      alert('Notification sent successfully!');
      
      // Reset form
      setCurrentNotification({
        body: '',
        deepLink: '',
        image: null,
        imageUrl: '',
        platforms: []
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const handlePlatformChange = (platform) => {
    setCurrentNotification(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  // Render notifications tab
  const renderNotificationsTab = () => (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left Column - Form */}
      <div className="flex-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Create Notification
        </h2>

        {/* Notification Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Text
          </label>
          <textarea
            value={currentNotification.body}
            onChange={(e) => setCurrentNotification(prev => ({ ...prev, body: e.target.value }))}
            placeholder="Enter your notification message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Deep Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deep Link (Optional)
          </label>
          <input
            type="text"
            value={currentNotification.deepLink}
            onChange={(e) => setCurrentNotification(prev => ({ ...prev, deepLink: e.target.value }))}
            placeholder="Enter deep link URL..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Platform Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Platforms
          </label>
          <div className="flex gap-4">
            {['android', 'ios'].map(platform => (
              <label key={platform} className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentNotification.platforms.includes(platform)}
                  onChange={() => handlePlatformChange(platform)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 capitalize">{platform}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Image (Optional)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md border border-gray-300 flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </label>
            {currentNotification.imageUrl && (
              <img
                src={currentNotification.imageUrl}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-md border"
              />
            )}
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendNotification}
          disabled={isSending || !currentNotification.body.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? 'Sending...' : 'Send Notification'}
        </button>
      </div>

      {/* Right Column - Preview */}
      <div className="w-full xl:w-80">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
          <button
            onClick={handleNavigateToPreview}
            className="p-1 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            title="See full preview"
          >
            <Info size={16} />
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            {currentNotification.imageUrl ? (
              <img
                src={currentNotification.imageUrl}
                alt="Notification Preview"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-blue-500 rounded-lg flex items-center justify-center">
                <Mail size={24} className="text-blue-500" />
              </div>
            )}
            
            {currentNotification.body && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800 font-medium">Preview:</p>
                <p className="text-xs text-gray-600 mt-1">{currentNotification.body}</p>
                {currentNotification.deepLink && (
                  <p className="text-xs text-blue-600 mt-1">→ {currentNotification.deepLink}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render save for later tab
  const renderSaveForLaterTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Save For Later ({saveForLaterCount} items)
        </h2>
        
        {/* Search and View Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {saveForLaterCount === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items saved for later</h3>
          <p className="text-gray-500">Items you save for later will appear here.</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Save for later functionality will be implemented here.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="inline w-4 h-4 mr-2" />
              Push Notifications
            </button>
            <button
              onClick={() => setActiveTab('saveForLater')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'saveForLater'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bookmark className="inline w-4 h-4 mr-2" />
              Save For Later ({saveForLaterCount})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'saveForLater' && renderSaveForLaterTab()}
      </div>
    </div>
  );
};

export default PushNotification;
