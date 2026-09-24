import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function Alert({
  children,
  title,
  variant = 'info',
  onClose,
  className = '',
}) {
  const configs = {
    info: {
      bg: 'bg-indigo-50/80 border-indigo-200 text-indigo-900',
      icon: <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />,
    },
    danger: {
      bg: 'bg-rose-50/80 border-rose-200 text-rose-900',
      icon: <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />,
    },
  };

  const cfg = configs[variant] || configs.info;

  return (
    <div className={`relative flex items-start gap-3 p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${cfg.bg} ${className}`}>
      {cfg.icon}
      <div className="flex-1">
        {title && <h5 className="font-bold mb-0.5">{title}</h5>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 -mt-1 rounded-lg hover:bg-black/5 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
