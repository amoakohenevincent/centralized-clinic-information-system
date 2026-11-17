import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const isUrgent = variant === 'urgent' || variant === 'red' || variant === 'danger';

  const style = isUrgent
    ? 'bg-[#191919] text-white border border-[#191919] font-semibold'
    : 'bg-[#f1f1ef] text-[#191919] border border-[#e5e5e3] font-medium';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-none text-[11px] transition-colors ${style} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
