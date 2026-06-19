import React from 'react';

const STATUS_CONFIG = {
  'Present': {
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500',
  },
  'Currently Working': {
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500',
  },
  'Late': {
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500',
  },
  'Half Day': {
    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500',
  },
  'Absent': {
    bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500',
  },
  'Work From Home': {
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500',
  },
  'Government Holiday': {
    bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500',
  },
  'Office Holiday': {
    bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500',
  },
  'Sunday': {
    bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400',
  },
  'Active': {
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500',
  },
  'Inactive': {
    bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500',
  },
};

const FALLBACK = {
  bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400',
};

/**
 * StatusBadge — consistent pill badge with a dot indicator.
 * @param {string}  status   — status string
 * @param {boolean} showDot  — show the leading dot (default true)
 * @param {string}  size     — 'sm' | 'md' (default 'sm')
 */
const StatusBadge = ({ status, showDot = true, size = 'sm' }) => {
  const cfg = STATUS_CONFIG[status] || FALLBACK;
  const sizeClass = size === 'md'
    ? 'px-2.5 py-1 text-xs'
    : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap ${sizeClass} ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />}
      {status}
    </span>
  );
};

export default StatusBadge;
