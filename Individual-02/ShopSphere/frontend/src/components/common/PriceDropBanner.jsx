// frontend/src/components/common/PriceDropBanner.jsx
import React from 'react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { Tag, X, ArrowRight, TrendingDown } from 'lucide-react';

export default function PriceDropBanner({ onNavigateToWishlist }) {
  const { latestPriceDrop, dismissPriceDropAlert } = useNotifications();

  if (!latestPriceDrop) return null;

  const metadata = latestPriceDrop.metadata || {};
  const oldPrice = metadata.oldPrice;
  const newPrice = metadata.newPrice;
  const productName = metadata.productName || 'Wishlist Item';
  const discount = oldPrice && newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white rounded-xl shadow-2xl border border-emerald-200 overflow-hidden animate-bounce-short">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <TrendingDown className="w-4 h-4 text-emerald-200" />
          <span>Instant Price Drop Alert!</span>
          {discount && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {discount}% OFF
            </span>
          )}
        </div>
        <button
          onClick={dismissPriceDropAlert}
          className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex gap-4 items-center">
        {metadata.productImage && (
          <img
            src={metadata.productImage}
            alt={productName}
            className="w-16 h-16 object-cover rounded-lg border border-slate-100 flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900 truncate">{productName}</h4>
          <p className="text-xs text-slate-500 mt-0.5">An item in your wishlist just dropped in price!</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-bold text-emerald-700">₹{newPrice?.toLocaleString()}</span>
            {oldPrice && (
              <span className="text-xs text-slate-400 line-through">₹{oldPrice?.toLocaleString()}</span>
            )}
            {oldPrice && newPrice && (
              <span className="text-xs text-emerald-600 font-medium">
                Save ₹{(oldPrice - newPrice)?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={dismissPriceDropAlert}
          className="text-xs text-slate-500 hover:text-slate-700 font-medium"
        >
          Dismiss
        </button>
        <button
          onClick={() => {
            dismissPriceDropAlert();
            if (onNavigateToWishlist) onNavigateToWishlist();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <span>View in Wishlist</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
