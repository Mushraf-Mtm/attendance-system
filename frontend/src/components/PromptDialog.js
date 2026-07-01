import React, { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const PromptDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Submit', type = 'danger' }) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#1E293B] border border-white/10 rounded-2xl shadow-clay-admin-modal w-full max-w-md animate-scale-in">
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'danger' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
              <FiAlertTriangle className={type === 'danger' ? 'text-red-400' : 'text-blue-400'} size={20} />
            </div>
            <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white transition-colors ml-2 flex-shrink-0">
            <FiX size={17} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-white mb-4">{message}</p>
          <input 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder="Optional: Enter reason" 
            className="w-full bg-[#0F172A] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-white border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onConfirm(inputText); setInputText(''); onClose(); }} className={`px-5 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptDialog;
