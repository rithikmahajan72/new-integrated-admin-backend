import React from "react";
import PropTypes from "prop-types";
import { Edit, Trash2 } from "lucide-react";

const NotificationItem = ({ notification, onEdit, onDelete }) => {
  const {
    title = "Push Notification",
    message,
    text,
    deeplink,
    platforms,
    date = "No date specified",
  } = notification || {};

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>

          <p className="text-gray-600 mb-2">
            {message || text || "No message available"}
          </p>

          {deeplink && (
            <p className="text-sm text-blue-600 mb-2">Deep Link: {deeplink}</p>
          )}

          {Array.isArray(platforms) && platforms.length > 0 && (
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
