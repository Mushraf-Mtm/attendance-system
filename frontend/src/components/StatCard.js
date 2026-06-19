import React from 'react';

const COLOR_MAP = {
  blue:   { icon: 'bg-blue-100 text-blue-600',    bar: 'bg-blue-500'   },
  green:  { icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500' },
  yellow: { icon: 'bg-amber-100 text-amber-600',  bar: 'bg-amber-500'  },
  red:    { icon: 'bg-red-100 text-red-600',       bar: 'bg-red-500'    },
  purple: { icon: 'bg-purple-100 text-purple-600', bar: 'bg-purple-500' },
  orange: { icon: 'bg-orange-100 text-orange-600', bar: 'bg-orange-500' },
  indigo: { icon: 'bg-indigo-100 text-indigo-600', bar: 'bg-indigo-500' },
};

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const cfg = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.icon}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-none">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-1 h-10 rounded-full flex-shrink-0 ${cfg.bar} opacity-60`} />
    </div>
  );
};

export default StatCard;
