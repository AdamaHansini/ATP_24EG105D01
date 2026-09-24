import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;

  const statusKey = String(status).toUpperCase().trim();

  const styles = {
    // Orders / Deliveries
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    PACKED: 'bg-blue-50 text-blue-700 border-blue-200',
    SHIPPED: 'bg-sky-50 text-sky-700 border-sky-200',
    OUT_FOR_DELIVERY: 'bg-amber-50 text-amber-700 border-amber-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    RETURN_REQUESTED: 'bg-purple-50 text-purple-700 border-purple-200',
    RETURNED: 'bg-purple-50 text-purple-700 border-purple-200',
    REFUNDED: 'bg-slate-100 text-slate-700 border-slate-200',

    // Seller / User statuses
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',

    // Support Priorities
    URGENT: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-slate-50 text-slate-700 border-slate-200',

    // Support Statuses
    OPEN: 'bg-sky-50 text-sky-700 border-sky-200',
    IN_PROGRESS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    WAITING_FOR_CUSTOMER: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const current = styles[statusKey] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${current} ${className}`}>
      {status}
    </span>
  );
}