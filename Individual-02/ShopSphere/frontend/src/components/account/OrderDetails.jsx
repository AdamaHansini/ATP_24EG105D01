import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, RefreshCw } from 'lucide-react';
import { orderService } from '../../services/orderService.js';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    orderService.getOrderById(id)
      .then((data) => {
        if (!active) return;
        setOrder(data?.order || null);
        setSellerOrders(data?.sellerOrders || []);
      })
      .catch((loadError) => { if (active) setError(loadError.message || 'Could not load this order.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="py-20 text-center text-slate-500"><RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2" />Loading order…</div>;
  if (error || !order) return <main className="max-w-4xl mx-auto p-6"><p role="alert" className="text-rose-700">{error || 'Order not found.'}</p><button onClick={() => navigate('/account')} className="mt-4 text-indigo-700 font-semibold">Back to orders</button></main>;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <button onClick={() => navigate('/account')} className="text-sm text-indigo-700 font-semibold flex items-center gap-2"><ArrowLeft className="w-4 h-4" />Order history</button>
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-3"><Package className="w-6 h-6 text-indigo-600" /><div><h1 className="text-xl font-bold">Order #{order.orderNumber}</h1><p className="text-xs text-slate-500">Placed {new Date(order.createdAt).toLocaleString()}</p></div></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <p>Order Status: <strong>{order.status}</strong></p>
          <p>Payment Method: <strong>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : '—'}</strong></p>
          <p>Payment Status: <strong>{String(order.paymentStatus || 'PENDING').toUpperCase()}</strong></p>
          <p>Total: <strong>₹{Number(order.totalAmount || 0).toLocaleString()}</strong></p>
          {order.paidAt && <p>Paid: <strong>{new Date(order.paidAt).toLocaleString()}</strong></p>}
        </div>
      </section>
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <h2 className="font-bold">Items</h2>
        {(order.items || []).map((item, index) => <div key={`${item.productId || item.product}-${index}`} className="flex justify-between border-t border-slate-100 py-3 text-sm"><span>{item.name} × {item.quantity}</span><strong>₹{Number(item.subtotal || item.price * item.quantity || 0).toLocaleString()}</strong></div>)}
      </section>
      {sellerOrders.length > 0 && <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3"><h2 className="font-bold">Seller shipments</h2>{sellerOrders.map((sellerOrder) => <div key={sellerOrder._id} className="flex justify-between border-t border-slate-100 py-3 text-sm"><span>{sellerOrder.sellerName}</span><span>{sellerOrder.status}</span></div>)}</section>}
      <section className="bg-white rounded-2xl border border-slate-200 p-6"><h2 className="font-bold mb-2">Delivery address</h2><p className="text-sm text-slate-600">{order.shippingAddress?.fullName}<br />{order.shippingAddress?.street}<br />{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode, order.shippingAddress?.country].filter(Boolean).join(', ')}</p></section>
    </main>
  );
}
