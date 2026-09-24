import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { orderService } from '../../services/orderService.js';
import { X, CheckCircle2, AlertTriangle, RefreshCw, Store, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CheckoutModal({ onClose, onOrderPlaced, initialCoupon }) {
  const navigate = useNavigate();
  const { items, itemsBySeller, subtotal, clearLocalCart } = useCart();
  const [step, setStep] = useState('address');
  const [address, setAddress] = useState({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'India' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const discount = Number(initialCoupon?.discountAmount || 0);
  const shipping = subtotal > 5000 ? 0 : 99;
  const tax = Math.round(Math.max(0, subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount) + shipping + tax;
  const updateAddress = (field, value) => setAddress((current) => ({ ...current, [field]: value }));

  const placeOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await orderService.checkout({
        shippingAddress: address,
        paymentMethod: 'COD',
        couponCode: initialCoupon?.couponCode,
      });
      setResult(response);
      clearLocalCart();
      onOrderPlaced?.(response.order);
      setStep('confirmation');
    } catch (checkoutError) {
      setError(checkoutError.message || 'Checkout could not be completed. Your cart is unchanged.');
    } finally {
      setLoading(false);
    }
  };

  const addressFields = [
    ['fullName', 'Full name'], ['phone', 'Phone number'], ['street', 'Street address'],
    ['city', 'City'], ['state', 'State'], ['postalCode', 'Postal code'],
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-xl border border-slate-200 relative p-6 sm:p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500" aria-label="Close checkout"><X className="w-5 h-5" /></button>

        {step === 'confirmation' && result ? (
          <div className="py-5 text-center space-y-5">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Order Placed Successfully!</h2>
              <p className="text-sm text-slate-500 mt-2">Order ID: <strong>#{result.order?.orderNumber}</strong></p>
              <div className="text-sm text-slate-600 mt-3">Payment Method: <strong>Cash on Delivery</strong><br />Payment Status: <strong>{result.order?.paymentStatus || 'PENDING'}</strong><br />Total: <strong>₹{Number(result.order?.totalAmount || 0).toLocaleString()}</strong></div>
              <p className="text-sm text-slate-500 mt-3">Your order will be processed shortly.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { onClose(); navigate(`/orders/${result.order?._id}`); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl">View Order</button>
              <button onClick={onClose} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl">Continue Shopping</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                {['address', 'review', 'payment'].map((key, index) => <React.Fragment key={key}><span className={step === key ? 'text-indigo-600' : ''}>{index + 1}. {key === 'address' ? 'Address' : key === 'review' ? 'Order Review' : 'Payment'}</span>{index < 2 && <span>→</span>}</React.Fragment>)}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{step === 'address' ? 'Shipping Address' : step === 'review' ? 'Review Your Order' : 'Payment Method'}</h2>
            </div>

            {error && <div role="alert" className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-sm"><AlertTriangle className="inline w-4 h-4 mr-1" />{error}</div>}

            {step === 'address' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addressFields.map(([field, label]) => <label key={field} className="text-xs font-semibold text-slate-700">{label}<input required value={address[field]} onChange={(event) => updateAddress(field, event.target.value)} className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" /></label>)}
              <div className="sm:col-span-2 flex justify-end"><button onClick={() => {
                if (addressFields.some(([field]) => !address[field].trim())) { setError('Complete all shipping address fields before continuing.'); return; }
                setError(''); setStep('review');
              }} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2">Review Order <ArrowRight className="w-4 h-4" /></button></div>
            </div>}

            {step === 'review' && <div className="space-y-4">
              <div className="space-y-3">{Object.entries(itemsBySeller).map(([sellerId, group]) => <div key={sellerId} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800 pb-2 border-b border-slate-200 mb-2 flex items-center gap-2"><Store className="w-4 h-4 text-indigo-600" />{group.sellerName}</div>
                {group.items.map((item) => <div key={item._id || item.productId} className="flex justify-between text-xs py-1"><span>{item.name} × {item.quantity}</span><span>₹{(item.price * item.quantity).toLocaleString()}</span></div>)}
              </div>)}</div>
              <div className="p-4 border rounded-xl text-sm space-y-2"><div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>{discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}<div className="flex justify-between"><span>Shipping</span><span>{shipping ? `₹${shipping}` : 'FREE'}</span></div><div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax.toLocaleString()}</span></div><div className="pt-2 border-t font-bold flex justify-between"><span>Total</span><span>₹{total.toLocaleString()}</span></div></div>
              <div className="flex justify-between"><button onClick={() => setStep('address')} className="text-xs text-slate-600 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Address</button><button onClick={() => setStep('payment')} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button></div>
            </div>}

            {step === 'payment' && <div className="space-y-5">
              <div className="p-4 rounded-xl border border-indigo-600 bg-indigo-50/50 text-indigo-900"><div className="font-bold">◉ Cash on Delivery</div><p className="text-xs text-slate-600 mt-1">Pay when your order is delivered.</p></div>
              <div className="flex justify-between items-center border-t pt-4"><button onClick={() => setStep('review')} className="text-xs text-slate-600 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Order Review</button><button disabled={loading || !items.length} onClick={placeOrder} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-60">{loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Placing Order…</> : <>Place Order · ₹{total.toLocaleString()}<ArrowRight className="w-4 h-4" /></>}</button></div>
            </div>}
          </div>
        )}
      </div>
    </div>
  );
}
