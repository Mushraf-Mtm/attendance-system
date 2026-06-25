import React from 'react';

const PageHeader = ({ title, subtitle, actions, dark = false }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className={`text-xl font-bold leading-tight ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{title}</h1>
      {subtitle && <p className={`text-sm mt-0.5 ${dark ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
export default PageHeader;
