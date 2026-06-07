import React from 'react';
import { FiMapPin, FiAlertCircle, FiX } from 'react-icons/fi';

const LocationDialog = ({ isOpen, onClose, onAllow, title, message, type = 'permission' }) => {
  if (!isOpen) return null;

  const icons = {
    permission: FiMapPin,
    error: FiAlertCircle,
    warning: FiAlertCircle
  };

  const colors = {
    permission: {
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    error: {
      bg: 'bg-red-100',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      bg: 'bg-yellow-100',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    }
  };

  const Icon = icons[type];
  const color = colors[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full ${color.bg}`}>
              <Icon className={`text-2xl ${color.icon}`} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-base leading-relaxed">{message}</p>
          
          {type === 'permission' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your location data is only used to verify your attendance and is not shared with third parties.
              </p>
            </div>
          )}

          {type === 'error' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>How to enable location:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Click the lock icon in the address bar</li>
                <li>Find "Location" permission</li>
                <li>Change it to "Allow"</li>
                <li>Refresh the page</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          {type === 'permission' ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onAllow();
                  onClose();
                }}
                className={`px-6 py-2.5 ${color.button} text-white rounded-lg font-medium transition-colors`}
              >
                Allow Location
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`px-6 py-2.5 ${color.button} text-white rounded-lg font-medium transition-colors`}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDialog;
