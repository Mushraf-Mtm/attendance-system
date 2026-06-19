import React from 'react';

/* Full-page loading spinner */
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
      <p className="text-sm text-slate-500 font-medium">Loading…</p>
    </div>
  </div>
);

/* Inline page skeleton — use inside page containers */
export const PageSkeleton = () => (
  <div className="flex-1 p-6 lg:p-8 space-y-6 animate-pulse">
    <div className="h-8 w-48 bg-slate-200 rounded-lg" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-6 w-12 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <div className="h-5 w-36 bg-slate-200 rounded" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 w-full bg-slate-100 rounded-lg" />
      ))}
    </div>
  </div>
);

/* Inline spinner for buttons / table loading.
   size: number (px) | 'sm' (16) | 'md' (20) | 'lg' (40)
   color: 'indigo' (default) | 'white' */
export const Spinner = ({ size = 'md', color = 'indigo', className = '' }) => {
  const px = typeof size === 'number' ? size : ({ sm: 16, md: 20, lg: 40 }[size] ?? 20);
  const trackCls = color === 'white'
    ? 'border-white/30 border-t-white'
    : 'border-slate-200 border-t-indigo-600';
  return (
    <div
      className={`rounded-full border-2 animate-spin flex-shrink-0 ${trackCls} ${className}`}
      style={{ width: px, height: px }}
    />
  );
};

/* Table rows skeleton */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <>
    {[...Array(rows)].map((_, i) => (
      <tr key={i} className="border-b border-slate-100">
        {[...Array(cols)].map((_, j) => (
          <td key={j} className="px-4 py-3">
            <div className="h-4 bg-slate-100 rounded skeleton-shimmer" style={{ width: `${60 + Math.random() * 30}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default Loader;
