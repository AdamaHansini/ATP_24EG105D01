import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({
  items = [],
  onHomeClick,
  className = '',
}) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-500 ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <button
            type="button"
            onClick={onHomeClick}
            className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-slate-300" />
              {isLast || !item.onClick ? (
                <span className={`font-medium ${isLast ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-indigo-600 transition-colors"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
