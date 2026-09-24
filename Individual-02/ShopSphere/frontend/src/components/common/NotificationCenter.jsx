// frontend/src/components/common/NotificationCenter.jsx
import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import {
  Bell,
  CheckCircle2,
  TrendingDown,
  Package,
  Headphones,
  Info,
  Check,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function NotificationCenter({ onNavigateToWishlist, onNavigateToOrders }) {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [filterType, setFilterType] = useState('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'PRICE_DROP') return n.type === 'PRICE_DROP';
    if (filterType === 'ORDER') return n.type === 'ORDER_STATUS';
    if (filterType === 'SUPPORT') return n.type === 'SUPPORT';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stay updated with real-time price drops, order tracking updates, and support messages.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ALL', label: 'All Updates' },
          { id: 'PRICE_DROP', label: 'Price Drops' },
          { id: 'ORDER', label: 'Orders' },
          { id: 'SUPPORT', label: 'Support' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No notifications</h3>
          <p className="text-xs text-slate-400 mt-1">
            You&apos;re all caught up! When product prices drop or orders change status, notifications appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const isPriceDrop = n.type === 'PRICE_DROP';
            return (
              <div
                key={n._id}
                onClick={() => markAsRead(n._id)}
                className={`p-4 rounded-xl border transition-all ${
                  !n.isRead
                    ? 'bg-indigo-50/40 border-indigo-100 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isPriceDrop
                          ? 'bg-emerald-100 text-emerald-700'
                          : n.type === 'ORDER_STATUS'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isPriceDrop ? (
                        <TrendingDown className="w-5 h-5" />
                      ) : n.type === 'ORDER_STATUS' ? (
                        <Package className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                      {/* Price Drop metadata box */}
                      {isPriceDrop && n.metadata?.oldPrice && n.metadata?.newPrice && (
                        <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200/80 inline-flex items-center gap-3 text-xs">
                          <span className="text-slate-400 line-through">
                            ₹{Number(n.metadata.oldPrice).toLocaleString()}
                          </span>
                          <span className="font-bold text-emerald-700">
                            → ₹{Number(n.metadata.newPrice).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigateToWishlist) onNavigateToWishlist();
                            }}
                            className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-0.5 ml-2"
                          >
                            <span>View Product</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
