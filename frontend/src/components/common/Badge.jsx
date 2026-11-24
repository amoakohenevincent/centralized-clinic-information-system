import React from 'react';

const Badge = ({ variant, status, children, className = '' }) => {
  const effectiveVariant = status || variant || 'default';
  const normalizedVariant = String(effectiveVariant).toLowerCase().replace('-', '_');

  // Strict 3-color palette: Teal, Slate, White
  const variantStyles = {
    // Teal Accent (Success, Completed, Active, Primary)
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    success: 'bg-teal-50 text-teal-800 border-teal-200',
    completed: 'bg-teal-50 text-teal-800 border-teal-200',
    fulfilled: 'bg-teal-50 text-teal-800 border-teal-200',
    dispensed: 'bg-teal-50 text-teal-800 border-teal-200',
    booked: 'bg-teal-50 text-teal-800 border-teal-200',
    active: 'bg-teal-50 text-teal-800 border-teal-200',

    // Slate High-Contrast Dark (Urgent, Alert, Critical, Emergency)
    urgent: 'bg-slate-900 text-white border-slate-900 font-bold',
    danger: 'bg-slate-900 text-white border-slate-900 font-bold',
    critical: 'bg-slate-900 text-white border-slate-900 font-bold',
    red: 'bg-slate-900 text-white border-slate-900 font-bold',
    emergency: 'bg-slate-900 text-white border-slate-900 font-bold tracking-wide',

    // Slate Light / Neutral (Pending, Checked in, Warning, Routine)
    pending: 'bg-slate-100 text-slate-800 border-slate-300 font-medium',
    scheduled: 'bg-slate-100 text-slate-800 border-slate-300 font-medium',
    checked_in: 'bg-slate-100 text-slate-800 border-slate-300 font-medium',
    in_consultation: 'bg-slate-100 text-slate-900 border-slate-400 font-semibold',
    warning: 'bg-slate-100 text-slate-900 border-slate-400 font-semibold',
    amber: 'bg-slate-100 text-slate-800 border-slate-300',
    partially_dispensed: 'bg-slate-100 text-slate-800 border-slate-300',
    partial: 'bg-slate-100 text-slate-800 border-slate-300',
    pending_backorder: 'bg-slate-100 text-slate-800 border-slate-300',
    blue: 'bg-slate-100 text-slate-800 border-slate-300',
    purple: 'bg-slate-100 text-slate-800 border-slate-300',
    info: 'bg-slate-100 text-slate-800 border-slate-300',

    // White / Subdued
    cancelled: 'bg-white text-slate-400 border-slate-200 line-through',
    no_show: 'bg-white text-slate-500 border-slate-300',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const style = variantStyles[normalizedVariant] || variantStyles.default;
  const label = children || (status ? String(status).replace(/_/g, ' ') : effectiveVariant);

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-tight capitalize transition-colors ${style} ${className}`}
    >
      {label}
    </span>
  );
};

export { Badge };
export default Badge;
