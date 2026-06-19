import React from 'react';
import { FiMapPin, FiAlertCircle, FiX } from 'react-icons/fi';

const TYPE_CONFIG = {
  permission: {
    iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
    Icon: FiMapPin,
  },
  error: {
    iconBg: 'bg-red-100', iconColor: 'text-red-600',
    btn: 'bg-red-600 hover:bg-red-700',
    Icon: FiAlertCircle,
  },
  warning: {
    iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
    btn: 'bg-amber-500 hover:bg-amber-600',
    Icon: FiAlertCircle,
  },
};

const LocationDialog = ({ isOpen, onClose, onAllow, title, message, type = 'permission' }) => {
  if (!isOpen) return null;
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.permission;
  const { Icon } = cfg;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
              <Icon size={20} className={cfg.iconColor} />
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors ml-2 flex-shrink-0">
            <FiX size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

          {type === 'permission' && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
              <p className="text-xs text-indigo-800 leading-relaxed">
                <strong>Privacy note:</strong> Your location is only used to verify attendance and is never shared with third parties.
              </p>
            </div>
          )}

          {type === 'error' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-slate-700 mb-2">How to enable location:</p>
              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                <li>Click the lock icon in the address bar</li>
                <li>Find "Location" permission</li>
                <li>Change it to "Allow"</li>
                <li>Refresh the page</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          {type === 'permission' ? (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { onAllow(); onClose(); }}
                className={`px-5 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${cfg.btn}`}
              >
                Allow Location
              </button>
            </>
          ) : (
            <button onClick={onClose} className={`px-5 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${cfg.btn}`}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDialog;
