import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const TYPE_CONFIG = {
  success: {
    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    Icon: FiCheckCircle,
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
  info: {
    iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
    Icon: FiInfo,
  },
};

const AlertDialog = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
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
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{message}</p>
        </div>
        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className={`px-5 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${cfg.btn}`}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
