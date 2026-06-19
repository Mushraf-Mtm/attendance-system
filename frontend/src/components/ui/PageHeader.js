import React from 'react';

/**
 * PageHeader — consistent page-level header with title, subtitle, and optional action slot.
 * @param {string}      title
 * @param {string}      subtitle
 * @param {ReactNode}   actions  — buttons / controls on the right
 */
const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-xl font-bold text-slate-900 leading-tight">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
