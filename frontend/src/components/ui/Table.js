import React from 'react';

/**
 * Thin wrappers for consistent table styling.
 * Usage: <TableWrapper> <TableHead> <TableRow> <Th> <Td>
 */

export const TableWrapper = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        {children}
      </table>
    </div>
  </div>
);

export const TableHead = ({ children }) => (
  <thead className="bg-slate-50">
    {children}
  </thead>
);

export const Th = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${className}`}>
    {children}
  </th>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-slate-100 bg-white">
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '' }) => (
  <tr className={`hover:bg-slate-50/70 transition-colors ${className}`}>
    {children}
  </tr>
);

export const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-sm text-slate-700 whitespace-nowrap ${className}`}>
    {children}
  </td>
);

export const EmptyRow = ({ cols, message = 'No records found', icon }) => (
  <tr>
    <td colSpan={cols} className="px-4 py-14 text-center">
      <div className="flex flex-col items-center gap-2 text-slate-400">
        {icon && <span className="text-3xl">{icon}</span>}
        <p className="text-sm font-medium">{message}</p>
      </div>
    </td>
  </tr>
);
