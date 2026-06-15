import React from 'react';
import { FiX } from 'react-icons/fi';

const DetailsDialog = ({ isOpen, onClose, title, details }) => {
  if (!isOpen) return null;

  // Parse details if it's a string
  let parsedDetails = details;
  if (typeof details === 'string') {
    try {
      parsedDetails = JSON.parse(details);
    } catch (e) {
      parsedDetails = { message: details };
    }
  }

  // Format the details for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const renderDetails = (obj, depth = 0) => {
    if (!obj || typeof obj !== 'object') {
      return (
        <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 whitespace-pre-wrap break-words">
          {formatValue(obj)}
        </div>
      );
    }

    return (
      <div className={`space-y-2 ${depth > 0 ? 'ml-4' : ''}`}>
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="border-l-2 border-blue-300 pl-3">
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-semibold text-gray-700 text-sm min-w-[120px]">
                {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:
              </span>
              {typeof value === 'object' && value !== null ? (
                <div className="flex-1">{renderDetails(value, depth + 1)}</div>
              ) : (
                <span className="text-gray-600 text-sm flex-1 break-all">
                  {formatValue(value)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <FiX className="text-xl sm:text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {parsedDetails && Object.keys(parsedDetails).length > 0 ? (
            renderDetails(parsedDetails)
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No details available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsDialog;
