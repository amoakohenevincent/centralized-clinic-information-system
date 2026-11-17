import React from 'react';

const STATUS_CONFIGS = {
  pending: {
    label: 'Pending Pharmacy',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500'
  },
  partially_dispensed: {
    label: 'Partially Dispensed',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500'
  },
  fulfilled: {
    label: 'Fulfilled',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500'
  },
  pending_backorder: {
    label: 'Pending Backorder',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500'
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500'
  },
  dispensed: {
    label: 'Dispensed',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500'
  },
  backordered: {
    label: 'Backordered',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500'
  }
};

export const Badge = ({ status = 'pending', className = '', size = 'md' }) => {
  const config = STATUS_CONFIGS[status] || {
    label: status.replace('_', ' '),
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
