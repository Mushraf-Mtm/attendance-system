import React from 'react';
import { FiAlertTriangle, FiLogOut, FiX } from 'react-icons/fi';

const LogoutWarningDialog = ({ isOpen, onClose, onLogout, userRole }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Dialog */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>

          {/* Icon */}
          <div className="flex justify-center pt-8 pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="text-5xl text-orange-600 animate-pulse" />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              You're Still Logged In!
            </h2>
            <p className="text-gray-600 mb-6">
              Please logout properly before closing the page to ensure your session is ended securely.
            </p>

            {/* Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={onLogout}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FiLogOut className="text-xl" />
                <span>Logout Now</span>
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LogoutWarningDialog;
