import React from 'react';

export const StatCard = ({ title, count, subtitle, color = 'teal', onClick, isActive }) => {
  // Strict 3-color palette: Teal, Slate, White
  const isTeal = color === 'teal';

  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white rounded-2xl border transition-all shadow-sm ${
        onClick ? 'cursor-pointer hover:border-slate-400' : ''
      } ${
        isActive
          ? 'border-teal-600 ring-2 ring-teal-600/20'
          : isTeal
          ? 'border-slate-200 hover:border-teal-600'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <span className={`w-2 h-2 rounded-full ${isTeal ? 'bg-teal-600' : 'bg-slate-400'}`} />
      </div>
      <div className="mt-3">
        <div className="text-3xl font-extrabold tracking-tight text-slate-900">{count}</div>
        {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
