import React from 'react';

const STATUS_CONFIG = {
  'Present':           { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25', dot: 'bg-emerald-400',  lightBg: 'bg-emerald-50', lightText: 'text-emerald-700', lightBorder: 'border-emerald-200', lightDot: 'bg-emerald-500' },
  'Currently Working': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25', dot: 'bg-emerald-400',  lightBg: 'bg-emerald-50', lightText: 'text-emerald-700', lightBorder: 'border-emerald-200', lightDot: 'bg-emerald-500' },
  'Late':              { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/25',   dot: 'bg-amber-400',    lightBg: 'bg-amber-50',   lightText: 'text-amber-700',   lightBorder: 'border-amber-200',   lightDot: 'bg-amber-500'   },
  'Half Day':          { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/25',  dot: 'bg-orange-400',   lightBg: 'bg-orange-50',  lightText: 'text-orange-700',  lightBorder: 'border-orange-200',  lightDot: 'bg-orange-500'  },
  'Absent':            { bg: 'bg-red-500/15',     text: 'text-red-400',     border: 'border-red-500/25',     dot: 'bg-red-400',      lightBg: 'bg-red-50',     lightText: 'text-red-700',     lightBorder: 'border-red-200',     lightDot: 'bg-red-500'     },
  'Work From Home':    { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/25',    dot: 'bg-blue-400',     lightBg: 'bg-blue-50',    lightText: 'text-blue-700',    lightBorder: 'border-blue-200',    lightDot: 'bg-blue-500'    },
  'Government Holiday':{ bg: 'bg-purple-500/15',  text: 'text-purple-400',  border: 'border-purple-500/25',  dot: 'bg-purple-400',   lightBg: 'bg-purple-50',  lightText: 'text-purple-700',  lightBorder: 'border-purple-200',  lightDot: 'bg-purple-500'  },
  'Office Holiday':    { bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'border-violet-500/25',  dot: 'bg-violet-400',   lightBg: 'bg-violet-50',  lightText: 'text-violet-700',  lightBorder: 'border-violet-200',  lightDot: 'bg-violet-500'  },
  'Sunday':            { bg: 'bg-slate-500/15',   text: 'text-slate-400',   border: 'border-slate-500/20',   dot: 'bg-slate-500',    lightBg: 'bg-slate-50',   lightText: 'text-slate-600',   lightBorder: 'border-slate-200',   lightDot: 'bg-slate-400'   },
  'Active':            { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25', dot: 'bg-emerald-400',  lightBg: 'bg-emerald-50', lightText: 'text-emerald-700', lightBorder: 'border-emerald-200', lightDot: 'bg-emerald-500' },
  'Inactive':          { bg: 'bg-red-500/15',     text: 'text-red-400',     border: 'border-red-500/25',     dot: 'bg-red-400',      lightBg: 'bg-red-50',     lightText: 'text-red-700',     lightBorder: 'border-red-200',     lightDot: 'bg-red-500'     },
};

const FALLBACK = {
  bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-400',
  lightBg: 'bg-slate-50', lightText: 'text-slate-600', lightBorder: 'border-slate-200', lightDot: 'bg-slate-400',
};

/**
 * StatusBadge — premium pill badge.
 * @param {string}  status
 * @param {boolean} showDot   default true
 * @param {string}  size      'sm' | 'md'
 * @param {boolean} dark      force dark variant
 * @param {boolean} light     force light variant
 */
const StatusBadge = ({ status, showDot = true, size = 'sm', dark = false, light = false }) => {
  const cfg = STATUS_CONFIG[status] || FALLBACK;
  const sizeCls = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs';

  // Default: use light theme (employee). Pass dark prop for admin context.
  const useDark = dark && !light;

  if (useDark) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border whitespace-nowrap ${sizeCls} ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />}
        {status}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border whitespace-nowrap ${sizeCls} ${cfg.lightBg} ${cfg.lightText} ${cfg.lightBorder}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.lightDot}`} />}
      {status}
    </span>
  );
};

export default StatusBadge;
