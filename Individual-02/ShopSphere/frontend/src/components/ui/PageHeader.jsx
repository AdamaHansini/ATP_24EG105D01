import React from 'react';
import Breadcrumbs from './Breadcrumbs.jsx';

export default function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  onHomeClick,
  actions,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-3 pb-6 mb-6 border-b border-slate-200/80 ${className}`}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} onHomeClick={onHomeClick} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
