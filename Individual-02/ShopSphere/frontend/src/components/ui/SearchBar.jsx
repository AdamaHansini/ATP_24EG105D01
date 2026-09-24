import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  size = 'md',
  autoFocus = false,
}) {
  const sizeClasses = {
    sm: 'text-xs py-1.5 pl-8 pr-7',
    md: 'text-sm py-2 pl-9 pr-8',
    lg: 'text-base py-2.5 pl-10 pr-9',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-2.5',
    md: 'w-4 h-4 left-3',
    lg: 'w-5 h-5 left-3.5',
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className={`pointer-events-none absolute text-slate-400 ${iconSizes[size] || iconSizes.md}`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 hover:border-slate-300 ${
          sizeClasses[size] || sizeClasses.md
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else if (onChange) onChange('');
          }}
          className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
