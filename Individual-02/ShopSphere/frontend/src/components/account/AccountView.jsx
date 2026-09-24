// frontend/src/components/account/AccountView.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { orderService } from '../../services/orderService.js';
import {
  User,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Store,
  ChevronRight,
} from 'lucide-react';

export default function AccountView({ onContinueShopping }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    setLoading(true);
    orderService
      .getOrders()
      .then((res) => setOrders(res?.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user?.name || 'Customer'}</h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                Role: {user?.role || 'customer'}
              </span>
              <span className="text-[10px] text-slate-400">ShopSphere Member</span>
            </div>
          </div>
        </div>

        <button
          onClick={onContinueShopping}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          Browse Marketplace
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Order History ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'addresses'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Saved Addresses
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
              <p className="text-xs">Loading order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No orders placed yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your completed marketplace purchases will appear here with live tracking.
              </p>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o._id}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      Order #{o.orderNumber || o._id}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm">
                      Total: ₹{Number(o.totalAmount).toLocaleString()}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {o.status || 'CONFIRMED'}
                    </span>
                  </div>
                </div>

                {/* Sub-Orders by Seller */}
                {o.sellerOrdersList && o.sellerOrdersList.length > 0 ? (
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-600 block text-[11px] uppercase tracking-wider">
                      Merchant Sub-Orders:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {o.sellerOrdersList.map((so) => (
                        <div
                          key={so._id}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Store className="w-3 h-3 text-indigo-600" />
                              {so.sellerName || 'Merchant'}
                            </span>
                            <span className="font-bold text-slate-900">
                              ₹{Number(so.subtotal).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex justify-between">
                            <span>Status: <strong className="text-emerald-700 uppercase">{so.status}</strong></span>
                            <span>Track: <strong className="font-mono text-slate-700">{so.trackingNumber || 'TRK-IN-TRANSIT'}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Plain Items List if sub-orders are flat */
                  <div className="space-y-1 text-slate-600">
                    {o.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.name} &times; {item.quantity}
                        </span>
                        <span>₹{Number(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900">Saved Shipping Addresses</h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 max-w-md space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{user?.name || 'Sophia Chen'}</span>
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                Default
              </span>
            </div>
            <p className="text-slate-600">742 Evergreen Terrace</p>
            <p className="text-slate-600">Springfield, OR 97477, USA</p>
            <p className="text-slate-500 pt-1">Phone: +1 555-0122</p>
          </div>
        </div>
      )}
    </div>
  );
}
