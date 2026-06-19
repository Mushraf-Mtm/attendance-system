import React from 'react';
import { FiAlertTriangle, FiLogOut, FiX } from 'react-icons/fi';

const LogoutWarningDialog = ({ isOpen, onClose, onLogout, userRole }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm animate-scale-in">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
          <FiX size={17} />
        </button>

        {/* Icon */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
            <FiAlertTriangle size={28} className="text-orange-600" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">You're still logged in!</h2>
          <p className="text-sm text-slate-500 mb-6">
            Please sign out properly before closing to end your session securely.
          </p>
          <div className="space-y-2">
            <button
              onClick={onLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <FiLogOut size={16} />
              Sign Out Now
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-5 rounded-xl text-sm font-semibold transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutWarningDialog;
