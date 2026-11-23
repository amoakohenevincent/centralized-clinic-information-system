import React from 'react';

export const StatCard = ({ title, count, subtitle, icon: Icon, color = 'teal', onClick, isActive }) => {
  const colorStyles = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-100 hover:border-teal-300',
      activeBorder: 'border-teal-500 ring-2 ring-teal-500/20'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100 hover:border-amber-300',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100 hover:border-blue-300',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100 hover:border-emerald-300',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-100 hover:border-purple-300',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/20'
    }
  }[color] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-100',
    activeBorder: 'border-slate-500'
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white rounded-xl border transition-all shadow-sm ${
        onClick ? 'cursor-pointer' : ''
      } ${isActive ? colorStyles.activeBorder : colorStyles.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colorStyles.bg} ${colorStyles.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-3xl font-bold tracking-tight text-slate-900">{count}</div>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
};
