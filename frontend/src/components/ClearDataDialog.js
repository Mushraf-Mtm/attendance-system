import React, { useState } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

const ClearDataDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, type = 'attendance' }) => {
  const [typedText, setTypedText] = useState('');
  const [checkbox, setCheckbox] = useState(false);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (type === 'attendance') {
      if (checkbox && typedText === confirmText && month && year) {
        onConfirm(year, month);
        handleClose();
      }
    } else {
      if (checkbox && typedText === confirmText) {
        onConfirm();
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setTypedText('');
    setCheckbox(false);
    setMonth('');
    setYear(new Date().getFullYear().toString());
    onClose();
  };

  const isValid = type === 'attendance' 
    ? (checkbox && typedText === confirmText && month && year)
    : (checkbox && typedText === confirmText);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C2540] border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <FiAlertTriangle className="text-red-400" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-white/5 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-sm text-red-300 leading-relaxed">{message}</p>
          </div>

          {/* Month and Year Selection for Attendance */}
          {type === 'attendance' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Select Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0E1320] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="">-- Select Month --</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Select Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0E1320] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checkbox}
              onChange={(e) => setCheckbox(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-red-500/30 bg-red-500/5 checked:bg-red-500 checked:border-red-500 focus:ring-2 focus:ring-red-500/20 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm text-white font-medium block">
                I understand this action cannot be undone
              </span>
              <span className="text-xs text-[#94A3B8] mt-1 block">
                This will permanently delete all selected records from the database
              </span>
            </div>
          </label>

          {/* Type Confirmation Text */}
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
              Type <span className="text-red-400 font-bold">"{confirmText}"</span> to confirm
            </label>
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={confirmText}
              className="w-full px-4 py-2.5 bg-[#0E1320] border border-white/10 rounded-xl text-white placeholder-[#475569] focus:outline-none focus:border-red-500/50 font-mono"
              disabled={!checkbox}
            />
            {typedText && typedText !== confirmText && (
              <p className="text-xs text-red-400 mt-2">Text does not match. Please type exactly: {confirmText}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#161D2E]/60">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-semibold text-[#94A3B8] border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="px-5 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearDataDialog;
