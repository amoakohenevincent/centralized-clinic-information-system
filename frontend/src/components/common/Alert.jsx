import React from 'react';

export const Alert = ({ type = 'info', title, message, children, className = '', onDismiss }) => {
  // Strict 3 colors: Teal, Slate, White
  const styles = {
    warning: {
      container: 'bg-slate-100 border-slate-300 text-slate-900',
      badge: 'bg-slate-800 text-white',
      badgeText: 'Notice',
      titleColor: 'text-slate-900'
    },
    error: {
      container: 'bg-slate-900 border-slate-900 text-white',
      badge: 'bg-white text-slate-900',
      badgeText: 'Alert',
      titleColor: 'text-white'
    },
    success: {
      container: 'bg-teal-50 border-teal-200 text-teal-900',
      badge: 'bg-teal-700 text-white',
      badgeText: 'Success',
      titleColor: 'text-teal-900'
    },
    info: {
      container: 'bg-teal-50 border-teal-200 text-teal-900',
      badge: 'bg-teal-700 text-white',
      badgeText: 'Info',
      titleColor: 'text-teal-900'
    }
  }[type] || {
    container: 'bg-slate-100 border-slate-300 text-slate-900',
    badge: 'bg-slate-800 text-white',
    badgeText: 'Notice',
    titleColor: 'text-slate-900'
  };

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-xs ${styles.container} ${className}`}>
      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider shrink-0 ${styles.badge}`}>
        {styles.badgeText}
      </span>
      <div className="flex-1 text-sm">
        {title && <h4 className={`font-semibold mb-0.5 ${styles.titleColor}`}>{title}</h4>}
        {message && <p>{message}</p>}
        {children}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-xs font-semibold px-2 py-1 rounded border border-current hover:opacity-75 transition-opacity"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

export default Alert;
