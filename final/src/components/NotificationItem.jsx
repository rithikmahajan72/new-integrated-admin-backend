import React, { useState } from "react";
import PropTypes from "prop-types";
import { Edit, Trash2, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";

const NotificationItem = ({ 
  notification, 
  onEdit, 
  onDelete, 
  onSend,
  isLoading = false,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    id,
    title = "Push Notification",
    message,
    text,
    body,
    deeplink,
    deepLink,
    platforms,
    targetPlatform,
    date,
    createdAt,
    updatedAt,
    status = "draft",
    imageUrl,
  } = notification || {};

  // Get display text
  const displayText = body || message || text || "No message available";
  const displayDeepLink = deepLink || deeplink;
  const displayDate = date || createdAt || updatedAt || "No date specified";
  
  // Get platform display
  const getPlatformDisplay = () => {
    if (targetPlatform === 'both') return ['Android', 'iOS'];
    if (targetPlatform === 'android') return ['Android'];
    if (targetPlatform === 'ios') return ['iOS'];
    if (Array.isArray(platforms)) return platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1));
    return ['Unknown'];
  };

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={14} />;
      case 'scheduled':
        return <Clock size={14} />;
      case 'failed':
        return <AlertCircle size={14} />;
      default:
        return <Edit size={14} />;
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Header with title and status */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusStyle(status)}`}>
              {getStatusIcon(status)}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {/* Message content */}
          <div className="mb-2">
            <p className={`text-gray-600 ${displayText.length > 100 && !isExpanded ? 'line-clamp-2' : ''}`}>
              {isExpanded || displayText.length <= 100 
                ? displayText 
                : `${displayText.substring(0, 100)}...`
              }
            </p>
            
            {displayText.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 text-sm hover:underline mt-1"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div className="mb-2">
              <img 
                src={imageUrl} 
                alt="Notification" 
                className="h-16 w-16 object-cover rounded border"
              />
            </div>
          )}

          {/* Deep link */}
          {displayDeepLink && (
            <p className="text-sm text-blue-600 mb-2 break-all">
              🔗 {displayDeepLink}
            </p>
          )}

          {/* Platforms */}
          {getPlatformDisplay().length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {platform}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500">{date}</p>
        </div>

        <div className="flex gap-2 ml-4">
          {onEdit && (
            <button
              onClick={() => onEdit(notification)}
              aria-label="Edit notification"
              title="Edit notification"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(notification)}
              aria-label="Delete notification"
              title="Delete notification"
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    title: PropTypes.string,
    message: PropTypes.string,
    text: PropTypes.string,
    deeplink: PropTypes.string,
    platforms: PropTypes.arrayOf(PropTypes.string),
    date: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default NotificationItem;
