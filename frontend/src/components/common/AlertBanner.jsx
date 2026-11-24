import React from 'react';

const AlertBanner = ({ type = 'info', title, message, children, className = '' }) => {
  const isDanger = type === 'danger' || type === 'warning' || type === 'error';

  const style = isDanger
    ? 'bg-slate-900 text-white border-slate-900'
    : 'bg-teal-50 text-teal-900 border-teal-200';

  return (
    <div className={`p-4 rounded-xl border ${style} text-xs sm:text-sm ${className}`}>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold mb-1">{title}</h4>}
        {message && <p className="leading-relaxed opacity-95">{message}</p>}
        {children}
      </div>
    </div>
  );
};

export default AlertBanner;
