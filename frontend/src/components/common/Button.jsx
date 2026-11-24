import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base'
  }[size] || 'px-4 py-2.5 text-sm';

  // Strict 3-color variants: Teal, Slate, White
  const variantClasses = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-sm',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 border border-slate-300',
    outline: 'border border-teal-600 text-teal-700 hover:bg-teal-50 focus:ring-teal-500',
    danger: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-800 shadow-sm',
    dangerOutline: 'border border-slate-900 text-slate-900 hover:bg-slate-100 focus:ring-slate-800',
    ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-300'
  }[variant] || 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          <span>Processing...</span>
        </span>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
};

export default Button;
