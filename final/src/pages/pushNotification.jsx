import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Mail, Edit, Trash2, Info, Menu, X } from "lucide-react";
import ConfirmationDialogue from "../components/confirmationDialogue";
import NotificationItem from "../components/NotificationItem";
import EditNotificationModal from "../components/EditNotificationModal";

// Static data moved outside component to prevent recreation on every render
const PLATFORM_OPTIONS = [
  { label: "Android", value: "android" },
  { label: "ios", value: "ios" },
];

const INITIAL_STACKED_NOTIFICATIONS = [
  { text: "Manage account and services linked to your Yoraa account" },
  { text: "Manage account and services linked to your Yoraa account" },
  { text: "Manage account and services linked to your Yoraa account" },
  { text: "Manage account and services linked to your Yoraa account" },
];

// PushNotification page for sending and managing notifications
// Features:
// - Compose notification text and deeplink
// - Select target platforms (multi-select)
// - Upload and preview notification image (with localStorage persistence)
// - Stack notification section with editable rows and popups
// - Uses NotificationItem and EditNotificationModal for modular UI
// Usage: Access via dashboard sidebar navigation
const PushNotification = () => {
  // State for notification text
  const [notificationText, setNotificationText] = useState("");
  // State for deeplink
  const [deeplink, setDeeplink] = useState("eg yoraa/product/123");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["android"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // State for uploaded image, initialize from localStorage
  const [image, setImage] = useState(() => {
    try {
      return localStorage.getItem("notificationImage") || null;
    } catch {
      return null;
    }
  });

  // Example stacked notifications
  const [stackedNotifications, setStackedNotifications] = useState(INITIAL_STACKED_NOTIFICATIONS);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  // State for confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedNotificationIndex, setSelectedNotificationIndex] = useState(null);

  // Reference for file input element
  const fileInputRef = useRef(null);

  // Navigation hook
  const navigate = useNavigate();

  // Save image to localStorage whenever it changes
  useEffect(() => {
    if (image) {
      try {
        localStorage.setItem("notificationImage", image);
      } catch (error) {
        // Ignore localStorage errors as they are non-critical
        console.debug("Failed to save image to localStorage:", error);
      }
    } else {
      try {
        localStorage.removeItem("notificationImage");
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [image]);

  // Memoized platform dropdown text to avoid recalculation on every render
  const platformDropdownText = useMemo(() => {
    if (selectedPlatforms.length === 2) return "android/ios";
    if (selectedPlatforms.length === 1) {
      return PLATFORM_OPTIONS.find(opt => opt.value === selectedPlatforms[0])?.label;
    }
    return "choose target platform";
  }, [selectedPlatforms]);

  // Optimized event handlers using useCallback to prevent unnecessary re-renders
  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDropdownToggle = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const handlePlatformSelect = useCallback((platforms) => {
    setSelectedPlatforms(platforms);
    setDropdownOpen(false);
  }, []);

  const handleNavigateToPreview = useCallback(() => {
    navigate("/notification-preview", { state: { image } });
  }, [navigate, image]);

  const handleNotificationChange = useCallback((e, index) => {
    if (editIndex === index) {
      setEditValue(e.target.value);
    } else {
      setStackedNotifications(prev => {
        const updated = [...prev];
        updated[index].text = e.target.value;
        return updated;
      });
    }
  }, [editIndex]);

  const handleNotificationInfo = useCallback((notification, index) => {
    setDialogAction("info");
    setSelectedNotification(notification);
    setSelectedNotificationIndex(index);
    setDialogOpen(true);
  }, []);

  const handleNotificationSend = useCallback((notification, index) => {
    setDialogAction("send");
    setSelectedNotification(notification);
    setSelectedNotificationIndex(index);
    setDialogOpen(true);
  }, []);

  const handleNotificationEdit = useCallback((notification, index) => {
    setEditIndex(index);
    setEditValue(notification.text);
    setDialogAction("edit");
    setSelectedNotification(notification);
    setSelectedNotificationIndex(index);
    setDialogOpen(true);
  }, []);

  const handleNotificationDelete = useCallback((notification, index) => {
    setDialogAction("delete");
    setSelectedNotification(notification);
    setSelectedNotificationIndex(index);
    setDialogOpen(true);
  }, []);

  const handleEditSave = useCallback(() => {
    setStackedNotifications(prev => {
      const updated = [...prev];
      updated[editIndex].text = editValue;
      return updated;
    });
    setEditIndex(null);
    setDialogOpen(false);
  }, [editIndex, editValue]);

  const handleEditCancel = useCallback(() => {
    setEditIndex(null);
    setDialogOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setStackedNotifications(prev => 
      prev.filter((_, i) => i !== selectedNotificationIndex)
    );
    setDialogOpen(false);
  }, [selectedNotificationIndex]);

  const handleDialogCancel = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleDialogConfirm = useCallback(() => {
    setDialogOpen(false);
    // Add your action logic here (send, edit, delete, info)
  }, []);

  return (
    <div className="p-4">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column - Form */}
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Notification
          </h2>

          {/* Notification Text */}
          <div className="mb-4 sm:mb-6">
            <textarea
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
              placeholder="Type Here"
              className="w-3xl h-24 sm:h-32 border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-black"
            />
          </div>

          {/* Notification Image Upload */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notification image (optional)
            </label>
            {/* Hidden file input for image upload */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="flex items-center gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
              onClick={handleFileUpload}
            >
              <Upload size={16} />
              Upload Image
            </button>
            <div className="mt-3 w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
              {/* Show uploaded image preview if available */}
              {image ? (
                <img
                  src={image}
                  alt="Notification"
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              )}
            </div>
          </div>

          {/* Deeplink - slightly longer than dropdown */}
          <div className="mb-4 sm:mb-6" style={{ maxWidth: 280 }}>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Deeplink(optional) eg yoraa/product/123
            </label>
            <input
              type="text"
              value={deeplink}
              onChange={(e) => setDeeplink(e.target.value)}
              placeholder="eg yoraa/product/123"
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-black bg-white w-44"
              style={{ minWidth: 140 }}
            />
          </div>

          {/* Custom Target Platform Dropdown - Minimal Style */}
          <div className="mb-4 sm:mb-6 relative" style={{ maxWidth: 180 }}>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Target platform
            </label>
            <button
              type="button"
              className="border border-gray-200 rounded-md px-2 py-1 text-xs text-left focus:outline-none bg-white w-32 h-8 flex items-center focus:border-black"
              style={{ boxShadow: "none", minWidth: 120 }}
              onClick={handleDropdownToggle}
            >
              {platformDropdownText}
            </button>
            {dropdownOpen && (
              <div
                className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-md"
                style={{ minWidth: 120 }}
              >
                <div className="py-1">
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-1 text-xs ${
                      selectedPlatforms.length === 2
                        ? "text-blue-600 bg-gray-100"
                        : "text-gray-900"
                    }`}
                    onClick={() => handlePlatformSelect(["android", "ios"])}
                  >
                    Both
                    {selectedPlatforms.length === 2 && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                  {PLATFORM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`w-full text-left px-3 py-1 text-xs ${
                        selectedPlatforms.includes(opt.value) &&
                        selectedPlatforms.length === 1
                          ? "text-blue-600 bg-gray-100"
                          : "text-gray-900"
                      }`}
                      onClick={() => handlePlatformSelect([opt.value])}
                    >
                      {opt.label}
                      {selectedPlatforms.includes(opt.value) &&
                        selectedPlatforms.length === 1 && (
                          <span className="ml-2">✓</span>
                        )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8">
            <button className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 border border-slate-300 rounded-full">
              save for later
            </button>
            <button className="bg-black text-white px-6 sm:px-8 py-2 rounded-full text-sm hover:bg-gray-800">
              send Now
            </button>
          </div>

          {/* Stack notification for later */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 w-full">
              Stack notification for later
            </h3>
            <div className="space-y-4">
              {stackedNotifications.map((notification, index) => (
                <NotificationItem
                  key={index}
                  value={editIndex === index ? editValue : notification.text}
                  disabled={editIndex !== index}
                  isBold={index === 3}
                  onChange={(e) => handleNotificationChange(e, index)}
                  onInfo={() => handleNotificationInfo(notification, index)}
                  onSend={() => handleNotificationSend(notification, index)}
                  onEdit={() => handleNotificationEdit(notification, index)}
                  onDelete={() => handleNotificationDelete(notification, index)}
                />
              ))}
            </div>
            {dialogOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ boxShadow: "0 0 0 100vmax rgba(0,0,0,0.12)" }}
                />
                {dialogAction === "edit" ? (
                  <EditNotificationModal
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onSave={handleEditSave}
                    onCancel={handleEditCancel}
                    original={selectedNotification?.text}
                  />
                ) : dialogAction === "delete" ? (
                  <ConfirmationDialogue
                    open={dialogOpen}
                    message={`Are you sure you want to delete this notification?`}
                    confirmText="Delete"
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDialogCancel}
                  />
                ) : (
                  <ConfirmationDialogue
                    open={dialogOpen}
                    message={"Are you sure you want to send the notification"}
                    onConfirm={handleDialogConfirm}
                    onCancel={handleDialogCancel}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="absolute right-10 w-full xl:w-80 h-auto order-first xl:order-last">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Preview
            </h3>
            {/* Info button navigates to preview page */}
            <button
              className="bg-black rounded-full flex items-center justify-center"
              onClick={handleNavigateToPreview}
              title="See full preview"
            >
              <Info size={24} className="text-white" />
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center">
            <div className="text-center">
              {/* Show uploaded image if available, else show icon */}
              {image ? (
                <div className="w-full mx-auto border-2 border-blue-500 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={image}
                    alt="Notification Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 border-2 border-blue-500 rounded-lg flex items-center justify-center">
                  <Mail size={24} className="text-blue-500 sm:w-8 sm:h-8" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotification;
