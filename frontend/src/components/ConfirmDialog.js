import React from 'react';
import { FiAlertTriangle, FiInfo, FiAlertCircle, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const TYPE_CONFIG = {
  danger:  { iconBg: 'bg-red-500/20',   iconColor: 'text-red-400',   btn: 'bg-red-600 hover:bg-red-500',   Icon: FiAlertCircle,
             lightIconBg: 'bg-red-100',   lightIconColor: 'text-red-600',   lightBtn: 'bg-red-600 hover:bg-red-700'   },
  warning: { iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400', btn: 'bg-amber-500 hover:bg-amber-400', Icon: FiAlertTriangle,
             lightIconBg: 'bg-amber-100', lightIconColor: 'text-amber-600', lightBtn: 'bg-amber-500 hover:bg-amber-600' },
  info:    { iconBg: 'bg-blue-500/20',  iconColor: 'text-blue-400',  btn: 'bg-blue-600 hover:bg-blue-500',  Icon: FiInfo,
             lightIconBg: 'bg-blue-100',  lightIconColor: 'text-blue-600',  lightBtn: 'bg-blue-600 hover:bg-blue-700'  },
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  const { isAdmin } = useAuth();
  if (!isOpen) return null;
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.danger;
  const { Icon } = cfg;

  if (isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
        <div className="bg-[#1E293B] border border-white/10 rounded-2xl shadow-clay-admin-modal w-full max-w-md animate-scale-in">
          <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                <Icon size={20} className={cfg.iconColor} />
              </div>
              <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white transition-colors ml-2 flex-shrink-0">
              <FiX size={17} />
            </button>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-white leading-relaxed">{message}</p>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5 rounded-b-2xl">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
              {cancelText}
            </button>
            <button onClick={() => { onConfirm(); onClose(); }} className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all duration-200 ${cfg.btn}`}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-clay-modal w-full max-w-md animate-scale-in border border-[#E2E8F0]">
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.lightIconBg}`}>
              <Icon size={20} className={cfg.lightIconColor} />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] leading-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-colors ml-2 flex-shrink-0">
            <FiX size={17} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-[#475569] leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#475569] border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] transition-colors">
            {cancelText}
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors ${cfg.lightBtn}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
