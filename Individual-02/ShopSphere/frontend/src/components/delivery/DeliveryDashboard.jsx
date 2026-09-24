// frontend/src/components/delivery/DeliveryDashboard.jsx
import React, { useState, useEffect } from 'react';
import { deliveryService } from '../../services/deliveryService.js';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkpointNote, setCheckpointNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const [allDelivs, active] = await Promise.all([
        deliveryService.getDeliveries(),
        deliveryService.getActiveDelivery(),
      ]);
      setDeliveries(allDelivs);
      setActiveDelivery(active || (allDelivs.length > 0 ? allDelivs[0] : null));
    } catch (e) {
      console.warn('Delivery load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleUpdateStatus = async (newStatus) => {
    if (!activeDelivery) return;
    setUpdating(true);
    try {
      const updated = await deliveryService.updateDeliveryStatus(activeDelivery._id, {
        status: newStatus,
        note: `Courier updated status to ${newStatus}`,
      });
      setActiveDelivery(updated);
      await loadDeliveries();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddCheckpoint = async (e) => {
    e.preventDefault();
    if (!checkpointNote.trim() || !activeDelivery) return;
    setUpdating(true);
    try {
      const updated = await deliveryService.addTrackingCheckpoint(activeDelivery._id, {
        location: 'Local Delivery Van',
        note: checkpointNote,
      });
      setActiveDelivery(updated);
      setCheckpointNote('');
      await loadDeliveries();
    } catch (err) {
      alert('Checkpoint ping failed: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCollectPayment = async () => {
    if (!activeDelivery) return;
    setUpdating(true);
    try {
      await deliveryService.collectCODPayment(activeDelivery._id);
      await loadDeliveries();
    } catch (error) {
      alert(`Payment collection failed: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-2" />
        <p className="text-sm">Loading Delivery Console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Delivery Logistics Console</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned courier dispatches, live delivery tracking, and status progression.
            </p>
          </div>
        </div>

        <button onClick={loadDeliveries} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Deliveries</span>
        </button>
      </div>

      {/* Main Layout: Active Delivery & Assigned List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Delivery Detail (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Active Assignment
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Package {activeDelivery?.trackingNumber || 'No Active Package'}
              </h2>
            </div>
            {activeDelivery && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold uppercase text-[11px]">
                {activeDelivery.status}
              </span>
            )}
          </div>

          {!activeDelivery ? (
            <p className="py-12 text-center text-slate-400">No active assignment.</p>
          ) : (
            <>
              {/* Customer & Destination Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">
                    {activeDelivery.customerName}
                  </span>
                  <a
                    href={`tel:${activeDelivery.customerPhone}`}
                    className="flex items-center gap-1 text-indigo-600 font-semibold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{activeDelivery.customerPhone}</span>
                  </a>
                </div>

                <div className="flex items-start gap-1.5 text-slate-600 pt-1">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {activeDelivery.shippingAddress?.street}, {activeDelivery.shippingAddress?.city},{' '}
                    {activeDelivery.shippingAddress?.state} {activeDelivery.shippingAddress?.postalCode}
                  </span>
                </div>
              </div>

              {/* Package Items */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2">Package Items:</h4>
                <div className="divide-y divide-slate-100 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  {activeDelivery.items?.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between">
                      <span className="font-medium text-slate-800">{item.name}</span>
                      <span className="text-slate-500">&times; {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons */}
              {activeDelivery.paymentMethod === 'COD' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-900">Payment Collection</h4>
                  <p className="text-amber-800">Amount Due: ₹{Number(activeDelivery.orderTotal || 0).toLocaleString()}</p>
                  <p className="text-amber-800">Payment Status: {activeDelivery.paymentStatus}</p>
                  {activeDelivery.status === 'Out for Delivery' && activeDelivery.paymentStatus !== 'PAID' && (
                    <button disabled={updating} onClick={handleCollectPayment} className="px-3 py-2 rounded-lg bg-amber-700 text-white font-semibold disabled:opacity-50">
                      Mark Payment Collected
                    </button>
                  )}
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block">Advance Delivery Status:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    disabled={updating || activeDelivery.status === 'Picked Up'}
                    onClick={() => handleUpdateStatus('Picked Up')}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold disabled:opacity-50"
                  >
                    Mark Picked Up
                  </button>
                  <button
                    type="button"
                    disabled={updating || activeDelivery.status === 'In Transit'}
                    onClick={() => handleUpdateStatus('In Transit')}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold disabled:opacity-50"
                  >
                    In Transit
                  </button>
                  <button
                    type="button"
                    disabled={updating || activeDelivery.status === 'Out for Delivery'}
                    onClick={() => handleUpdateStatus('Out for Delivery')}
                    className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-semibold disabled:opacity-50"
                  >
                    Out for Delivery
                  </button>
                  <button
                    type="button"
                    disabled={updating || activeDelivery.status === 'Delivered' || (activeDelivery.paymentMethod === 'COD' && activeDelivery.paymentStatus !== 'PAID')}
                    onClick={() => handleUpdateStatus('Delivered')}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    Delivered
                  </button>
                </div>
              </div>

              {/* Checkpoint ping logger */}
              <form onSubmit={handleAddCheckpoint} className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a location update checkpoint..."
                  value={checkpointNote}
                  onChange={(e) => setCheckpointNote(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
                <button
                  type="submit"
                  disabled={updating || !checkpointNote.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Log Ping
                </button>
              </form>

              {/* Status Update History */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 block">Tracking Log:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {activeDelivery.updates?.map((u, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800 uppercase">[{u.status}]</span>{' '}
                        <span className="text-slate-600">{u.note}</span>
                      </div>
                      <span className="text-slate-400">
                        {new Date(u.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Assigned Deliveries List (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            All Assigned Deliveries ({deliveries.length})
          </h3>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {deliveries.map((d) => (
              <div
                key={d._id}
                onClick={() => setActiveDelivery(d)}
                className={`py-3 px-2 rounded-lg cursor-pointer transition-colors ${
                  activeDelivery?._id === d._id ? 'bg-amber-50/70 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-slate-700">{d.trackingNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {d.status}
                  </span>
                </div>
                <p className="text-slate-800 truncate">{d.customerName}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {d.shippingAddress?.city}, {d.shippingAddress?.state}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
