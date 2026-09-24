// frontend/src/components/cart/MultiVendorCartView.jsx
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { cartService } from '../../services/cartService.js';
import {
  Trash2,
  Store,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Package,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

export default function MultiVendorCartView({ onProceedToCheckout, onContinueShopping }) {
  const { items, itemsBySeller, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (itemCount === 0) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your cart is empty</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
          Discover products from independent sellers and add them to your cart.
        </p>
        <button
          onClick={onContinueShopping}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-colors"
        >
          <span>Explore Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const sellerKeys = Object.keys(itemsBySeller);

  // Discount from applied coupon
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const shipping = subtotal > 5000 ? 0 : 99;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxableAmount * 0.05); // 5% GST/VAT
  const total = taxableAmount + shipping + tax;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');

    try {
      const res = await cartService.validateCoupon(couponInput, subtotal);
      setAppliedCoupon(res.data);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} grouped across {sellerKeys.length} independent {sellerKeys.length === 1 ? 'seller' : 'sellers'}. Unified atomic checkout.
          </p>
        </div>
        <button
          onClick={onContinueShopping}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          &larr; Continue Shopping
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Grouped by Merchant Store */}
        <div className="lg:col-span-2 space-y-6">
          {sellerKeys.map((sellerId) => {
            const group = itemsBySeller[sellerId];
            return (
              <div
                key={sellerId}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Seller Group Header */}
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          Seller
                        </span>
                        <Badge variant="purple" size="sm">
                          Seller
                        </Badge>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {group.sellerName || 'Independent Merchant'}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Vendor Subtotal</span>
                    <p className="text-sm font-extrabold text-slate-800">
                      ₹{Number(group.subtotal).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Items in this Vendor Group */}
                <div className="divide-y divide-slate-100 p-2 sm:p-4">
                  {group.items.map((item) => {
                    const itemId = item._id || item.productId;
                    return (
                      <div
                        key={itemId}
                        className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : <Package className="w-7 h-7 text-slate-300 m-auto mt-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Unit Price: <span className="font-semibold text-slate-700">₹{Number(item.price).toLocaleString()}</span>
                            </p>
                            <Badge variant="success" size="sm" className="mt-1">
                              In Stock
                            </Badge>
                          </div>
                        </div>

                        {/* Quantity Counter, Subtotal & Delete */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
                          <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                            <button
                              onClick={() => updateQuantity(itemId, item.quantity - 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 text-sm font-semibold"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-1 text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(itemId, item.quantity + 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 text-sm font-semibold"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[80px]">
                            <span className="text-sm font-bold text-slate-900 block">
                              ₹{(Number(item.price) * item.quantity).toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={() => removeItem(itemId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove from cart"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Col: Order Summary & Coupon */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Promo / Coupon Code</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-800 uppercase">{appliedCoupon.code}</span>
                      <p className="text-[11px] text-emerald-600">
                        ₹{discountAmount.toLocaleString()} discount applied
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. WELCOME10)"
                    className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 uppercase font-semibold"
                  />
                  <Button
                    type="submit"
                    loading={validatingCoupon}
                    size="sm"
                    variant="primary"
                  >
                    Apply
                  </Button>
                </form>
              )}
              {couponError && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>- ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-semibold text-slate-800">
                  {shipping === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shipping}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (5% GST):</span>
                <span className="font-semibold text-slate-800">₹{tax.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-indigo-600">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Button
              onClick={() => onProceedToCheckout && onProceedToCheckout(appliedCoupon)}
              variant="primary"
              size="lg"
              className="w-full mt-4"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <div className="pt-3 text-[11px] text-slate-400 space-y-1 text-center">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Inventory is checked again when you place your order.</span>
              </p>
              <p>Items will be partitioned into respective seller fulfillment orders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
