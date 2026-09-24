import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'default',
  onClick,
  ...props
}) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/80 bg-white text-slate-800 shadow-xs transition-all ${
        hover ? 'hover:border-slate-300 hover:shadow-md cursor-pointer' : ''
      } ${paddings[padding] || paddings.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 ${className}`}>
      <div>
        {title && <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
