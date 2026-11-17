import React from 'react';

const AlertBanner = ({ type = 'info', title, message, children, className = '' }) => {
  const isDanger = type === 'danger' || type === 'warning';

  const bgStyle = isDanger
    ? 'bg-[#fbfbfa] border-[#191919] text-[#191919]'
    : 'bg-[#f7f6f3] border-[#e9e9e7] text-[#191919]';

  return (
    <div className={`p-3.5 sm:p-4 rounded-none border ${bgStyle} text-xs sm:text-sm ${className}`}>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold text-[#191919] mb-1">{title}</h4>}
        {message && <p className="text-[#191919] leading-relaxed">{message}</p>}
        {children}
      </div>
    </div>
  );
};

export default AlertBanner;
