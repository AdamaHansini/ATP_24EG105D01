// frontend/src/components/checkout/CheckoutModal.jsx
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { orderService } from '../../services/orderService.js';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Building,
  Store,
  ArrowRight,
  ArrowLeft,
  MapPin,
  ClipboardList,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function CheckoutModal({ onClose, onOrderPlaced, initialCoupon }) {
  const { items, itemsBySeller, subtotal, clearLocalCart } = useCart();

  // 4-Step Flow: 'address' -> 'review' -> 'payment' -> 'confirmation'
  const [currentStep, setCurrentStep] = useState('address');

  // Address State
  const [address, setAddress] = useState({
    fullName: 'Sophia Chen',
    phone: '+1 555-0122',
    street: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
    country: 'USA',
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  // Simulation test switch for checking transaction rollback
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Execution states
  const [loading, setLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [rollbackFailed, setRollbackFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sellerKeys = Object.keys(itemsBySeller);
  const discountAmount = initialCoupon?.discountAmount || 0;
  const shipping = subtotal > 5000 ? 0 : 99;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxableAmount * 0.05);
  const total = taxableAmount + shipping + tax;

  const handleExecuteCheckout = async () => {
    setLoading(true);
    setRollbackFailed(false);
    setErrorMessage('');

    try {
      const response = await orderService.checkout({
        cartItems: items,
        shippingAddress: address,
        paymentDetails: {
          method: paymentMethod,
          status: 'paid',
          transactionId: `txn_${Date.now()}`,
        },
        couponCode: initialCoupon?.couponCode,
        discountAmount,
        simulateSellerFailure: simulateFailure,
      });

      setCheckoutResult(response);
      setCurrentStep('confirmation');
      clearLocalCart();
      if (onOrderPlaced) onOrderPlaced(response.order);
    } catch (err) {
      // Transaction Rollback occurred
      setRollbackFailed(true);
      setErrorMessage(err.message || 'Checkout could not be processed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Transaction Failed State */}
        {rollbackFailed ? (
          <div className="py-6 text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Checkout couldn&apos;t be completed.
              </h2>
              <div className="text-xs sm:text-sm text-slate-600 space-y-1 leading-relaxed">
                <p>Your order was not placed.</p>
                <p>No inventory was permanently deducted.</p>
                <p>Your cart has been preserved.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
              >
                Return to Cart
              </button>
              <button
                onClick={() => {
                  setRollbackFailed(false);
                  setSimulateFailure(false);
                  setCurrentStep('review');
                }}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : currentStep === 'confirmation' && checkoutResult ? (
          /* Step 4: Confirmation State */
          <div className="py-4 text-center space-y-5 animate-in fade-in">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Order Placed Successfully!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Parent Order <span className="font-mono font-bold text-slate-800">#{checkoutResult.order?._id || checkoutResult.order?.orderNumber}</span>
              </p>
            </div>

            {/* Partitioned Sub-Orders */}
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800">Partitioned Merchant Sub-Orders:</h4>
              <div className="divide-y divide-slate-200/60">
                {checkoutResult.sellerOrders?.map((so) => (
                  <div key={so._id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{so.sellerName || 'Merchant Store'}</span>
                      <div className="text-[11px] text-slate-500">
                        Tracking: <span className="font-mono text-slate-700">{so.trackingNumber || 'TRK-IN-TRANSIT'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">₹{Number(so.subtotal).toLocaleString()}</span>
                      <span className="block text-[10px] font-bold text-emerald-700">CONFIRMED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Step 1 - 3 Wizard */
          <div className="space-y-6">
            {/* Step Indicator Header */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span className={currentStep === 'address' ? 'text-indigo-600 font-bold' : ''}>
                  1. Address
                </span>
                <span>&rarr;</span>
                <span className={currentStep === 'review' ? 'text-indigo-600 font-bold' : ''}>
                  2. Review
                </span>
                <span>&rarr;</span>
                <span className={currentStep === 'payment' ? 'text-indigo-600 font-bold' : ''}>
                  3. Payment
                </span>
                <span>&rarr;</span>
                <span>4. Confirmation</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {currentStep === 'address' && 'Shipping Address'}
                {currentStep === 'review' && 'Review Multi-Vendor Order'}
                {currentStep === 'payment' && 'Select Payment Method'}
              </h2>
            </div>

            {/* STEP 1: Address Form */}
            {currentStep === 'address' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('review')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <span>Continue to Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Review Order Grouped by Seller */}
            {currentStep === 'review' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-3">
                  {sellerKeys.map((sId) => {
                    const g = itemsBySeller[sId];
                    return (
                      <div key={sId} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                        <div className="flex items-center justify-between font-semibold text-slate-800 pb-2 border-b border-slate-200/60 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-indigo-600" />
                            {g.sellerName}
                          </span>
                          <span>₹{g.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="space-y-1 text-[11px] text-slate-600">
                          {g.items.map((i) => (
                            <div key={i._id || i.productId} className="flex justify-between">
                              <span>
                                {i.name} &times; {i.quantity}
                              </span>
                              <span>₹{(i.price * i.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total breakdown */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount:</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (5% GST):</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm text-slate-900">
                    <span>Total Payable:</span>
                    <span className="text-indigo-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('address')}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('payment')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Method */}
            {currentStep === 'payment' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Razorpay')}
                    className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                      paymentMethod === 'Razorpay'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <div className="text-left">
                        <div className="font-bold">Razorpay Secure Checkout</div>
                        <div className="text-[11px] text-slate-500">Cards, UPI, NetBanking, Wallets</div>
                      </div>
                    </div>
                    {paymentMethod === 'Razorpay' && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NetBanking')}
                    className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                      paymentMethod === 'NetBanking'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-slate-500" />
                      <div className="text-left">
                        <div className="font-bold">Direct Bank Transfer</div>
                        <div className="text-[11px] text-slate-500">Direct account settlement</div>
                      </div>
                    </div>
                    {paymentMethod === 'NetBanking' && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                </div>

                {/* Developer Simulation Hook for Rollback Verification */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">
                        Simulate Mid-Transaction Vendor Failure
                      </span>
                      <span className="text-[11px] text-slate-500 block leading-normal">
                        Tests the atomic rollback engine. When checked, the transaction will fail intentionally during sub-order creation and restore all inventory cleanly.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('review')}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Review
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleExecuteCheckout}
                    className={`px-6 py-2.5 text-xs font-semibold rounded-xl text-white shadow-xs flex items-center gap-2 transition-colors ${
                      simulateFailure
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <span>{simulateFailure ? 'Execute Simulation' : `Pay ₹${total.toLocaleString()}`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
