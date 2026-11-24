import React from 'react';

const Badge = ({ variant, status, children, className = '' }) => {
  const effectiveVariant = status || variant || 'default';
  const normalizedVariant = String(effectiveVariant).toLowerCase().replace('-', '_');

  const variantStyles = {
    // Teals & Success
    teal: 'bg-teal-50 text-teal-700 border-teal-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    fulfilled: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dispensed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',

    // Warnings & In-progress
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    checked_in: 'bg-amber-50 text-amber-700 border-amber-200/80',
    in_consultation: 'bg-purple-50 text-purple-700 border-purple-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    partially_dispensed: 'bg-amber-50 text-amber-700 border-amber-200/80',
    partial: 'bg-amber-50 text-amber-700 border-amber-200/80',
    pending_backorder: 'bg-purple-50 text-purple-700 border-purple-200/80',

    // Urgent & Errors
    urgent: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    red: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    emergency: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
    no_show: 'bg-rose-50 text-rose-700 border-rose-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200 line-through',

    // Scheduled & Info
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80',
    scheduled: 'bg-sky-50 text-sky-700 border-sky-200/80',
    booked: 'bg-sky-50 text-sky-700 border-sky-200/80',
    pending: 'bg-amber-50 text-amber-700 border-amber-200/80',

    // Default neutral
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const style = variantStyles[normalizedVariant] || variantStyles.default;
  const label = children || (status ? String(status).replace(/_/g, ' ') : effectiveVariant);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-tight capitalize transition-colors ${style} ${className}`}
    >
      {label}
    </span>
  );
};

export { Badge };
export default Badge;

