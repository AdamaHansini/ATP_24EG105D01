// frontend/src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api.js';
import {
  Shield,
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Check,
  Tag,
  HelpCircle,
} from 'lucide-react';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search queries for tables
  const [userSearch, setUserSearch] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmVariant: 'danger',
    onConfirm: () => {},
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, userRes, sellRes, prodRes, ordRes, logRes, disputeRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/sellers'),
        api.get('/products'),
        api.get('/orders'),
        api.get('/admin/audit-logs'),
        api.get('/admin/disputes'),
      ]);
      setDashboardData(dashRes.data);
      setUsers(userRes.data?.users || []);
      setSellers(sellRes.data?.sellers || []);
      setProducts(prodRes.data?.products || []);
      setOrders(ordRes.data?.orders || []);
      setAuditLogs(logRes.data?.logs || []);
      setDisputes(disputeRes.data?.disputes || []);
    } catch (e) {
      console.warn('Admin load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (dispute, resolution) => {
    try {
      await api.patch(`/admin/disputes/${dispute._id}/resolve`, { resolution });
      await fetchAdminData();
    } catch (error) {
      alert('Dispute update failed: ' + error.message);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleSuspend = (user) => {
    setConfirmDialog({
      isOpen: true,
      title: user.isSuspended ? 'Activate User Account' : 'Suspend User Account',
      message: `Are you sure you want to ${user.isSuspended ? 'activate' : 'suspend'} ${user.name} (${user.email})?`,
      confirmVariant: user.isSuspended ? 'primary' : 'danger',
      onConfirm: async () => {
        try {
          await api.patch(`/admin/users/${user._id}/toggle-suspend`, {});
          await fetchAdminData();
        } catch (err) {
          alert('Action failed: ' + err.message);
        }
      },
    });
  };

  const handleUpdateSellerStatus = (seller, newStatus) => {
    setConfirmDialog({
      isOpen: true,
      title: `${newStatus === 'approved' ? 'Approve' : 'Reject'} Merchant Application`,
      message: `Are you sure you want to set status for "${seller.storeName}" to ${newStatus}?`,
      confirmVariant: newStatus === 'approved' ? 'primary' : 'danger',
      onConfirm: async () => {
        try {
          await api.patch(`/admin/sellers/${seller._id}/status`, { status: newStatus });
          await fetchAdminData();
        } catch (err) {
          alert('Action failed: ' + err.message);
        }
      },
    });
  };

  // Filtered lists
  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredSellers = useMemo(() => {
    if (!sellerSearch) return sellers;
    const q = sellerSearch.toLowerCase();
    return sellers.filter(
      (s) =>
        (s.storeName || '').toLowerCase().includes(q) ||
        (s.businessEmail || '').toLowerCase().includes(q)
    );
  }, [sellers, sellerSearch]);

  const filteredLogs = useMemo(() => {
    if (!auditSearch) return auditLogs;
    const q = auditSearch.toLowerCase();
    return auditLogs.filter(
      (l) =>
        (l.action || '').toLowerCase().includes(q) ||
        (l.userName || '').toLowerCase().includes(q) ||
        (l.entityType || '').toLowerCase().includes(q)
    );
  }, [auditLogs, auditSearch]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
        <p className="text-sm">Loading Administration Console...</p>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Platform Administration</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-vendor governance, merchant approvals, audit trail, and transaction monitoring.
            </p>
          </div>
        </div>

      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 font-medium">Gross Merchandise Value (GMV)</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            ₹{(metrics.grossMerchandiseValue || 0).toLocaleString()}
          </span>
          <span className="text-emerald-700 font-medium mt-1 inline-block">Total platform turnover</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 font-medium">Platform Fee Commission</span>
          <span className="text-2xl font-bold text-purple-700 mt-1 block">
            ₹{(metrics.platformCommission || 0).toLocaleString()}
          </span>
          <span className="text-slate-400 mt-1 inline-block">10% marketplace revenue</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 font-medium">Authorized Sellers</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{sellers.length}</span>
          <span className="text-slate-400 mt-1 inline-block">{users.length} registered accounts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 font-medium">Total Orders Placed</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {metrics.totalOrders || orders.length}
          </span>
          <span className="text-slate-400 mt-1 inline-block">{products.length} catalog items</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-1 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview & Audit Trail' },
          { id: 'users', label: `Users (${users.length})` },
          { id: 'sellers', label: `Sellers (${sellers.length})` },
          { id: 'orders', label: `Orders (${orders.length})` },
          { id: 'products', label: `Catalog (${products.length})` },
          { id: 'disputes', label: `Disputes (${disputes.filter((dispute) => dispute.status === 'OPEN').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & AUDIT TRAIL */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Marketplace Audit Trail</h3>
              <p className="text-slate-500">Real-time ledger of price updates, role changes, and sessions</p>
            </div>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search audit actions..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredLogs.slice(0, 15).map((log) => (
              <div key={log._id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></span>
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wide">
                      {log.action}
                    </span>
                    <span className="text-slate-500 ml-2">by {log.userName || log.user}</span>
                    {log.metadata?.newPrice && (
                      <span className="text-emerald-700 font-semibold ml-2">
                        Adjusted price: ₹{log.metadata.newPrice}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">User Directory</h3>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3 uppercase font-bold text-[10px] text-slate-600">{u.role}</td>
                    <td className="p-3">
                      {u.isSuspended ? (
                        <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          Suspended
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleSuspend(u)}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            u.isSuspended
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {u.isSuspended ? 'Activate Account' : 'Suspend Account'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SELLER APPROVALS */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Merchant Applications</h3>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search sellers..."
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Store Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Approval</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSellers.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{s.storeName}</td>
                    <td className="p-3 text-slate-500">{s.businessEmail || s.phone}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          s.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {s.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateSellerStatus(s, 'approved')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      )}
                      {s.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateSellerStatus(s, 'rejected')}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Platform Orders ({orders.length})
          </h3>
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o._id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-slate-900">Order #{o.orderNumber || o._id}</span>
                  <div className="text-slate-500 mt-0.5">
                    Total: ₹{Number(o.totalAmount).toLocaleString()} &bull; Payment:{' '}
                    {String(o.paymentStatus || 'PENDING').toUpperCase()}
                    <br />{o.paymentMethod || 'UNSPECIFIED'} | Placed {new Date(o.createdAt).toLocaleDateString()} | Paid {o.paidAt ? new Date(o.paidAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-800">
                  {o.status || 'CONFIRMED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CATALOG */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Catalog Items ({products.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {products.map((p) => (
              <div key={p._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex gap-3">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded" />
                ) : <Package className="w-12 h-12 p-3 text-slate-400 bg-slate-100 rounded" />}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-slate-500">₹{Number(p.price).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">{p.storeName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Customer disputes and return requests</h3>
          {disputes.length === 0 ? <p className="text-slate-500">No disputes are currently recorded.</p> : disputes.map((dispute) => (
            <div key={dispute._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex justify-between gap-3"><strong>{dispute.reason}</strong><span className="uppercase">{dispute.status}</span></div>
              {dispute.order && <p className="text-slate-500">Order {dispute.order}</p>}
              {dispute.status === 'OPEN' && dispute.returnRequest && (
                <div className="flex gap-2">
                  <button onClick={() => handleResolveDispute(dispute, 'RESOLVED')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg">Approve return</button>
                  <button onClick={() => handleResolveDispute(dispute, 'REJECTED')} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg">Decline return</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
