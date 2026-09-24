// frontend/src/components/wishlist/WishlistView.jsx
import React, { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import {
  Heart,
  Trash2,
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  Store,
  Check,
} from 'lucide-react';
import ProductDetailModal from '../product/ProductDetailModal.jsx';

export default function WishlistView({ onBrowseProducts, onProceedToCheckout }) {
  const { products, removeItem, moveToCart } = useWishlist();
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedIds, setAddedIds] = useState({});

  const handleAddToCart = async (product) => {
    const prodId = product._id || product.productId;
    await addItem(prodId, 1);
    setAddedIds((prev) => ({ ...prev, [prodId]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [prodId]: false }));
    }, 1500);
  };

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Your wishlist is empty.</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto leading-relaxed">
          Save products here to track them and receive price-drop alerts.
        </p>
        <button
          onClick={onBrowseProducts}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingDown className="w-4 h-4" />
            <span>Automated Price Surveillance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Your Wishlist</h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
            Track price drops across verified sellers. Whenever a seller lowers a price, you will receive an instantaneous alert.
          </p>
        </div>
        <button
          onClick={onBrowseProducts}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          &larr; Continue Shopping
        </button>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((item) => {
          const product = item.product || {};
          const currentPrice = Number(product.price || item.savedPrice || 0);
          const savedPrice = Number(item.savedPrice || currentPrice);
          const hasPriceDropped = currentPrice < savedPrice;
          const dropAmount = savedPrice - currentPrice;
          const prodId = item.productId || product._id;
          const stock = product.availableStock !== undefined ? product.availableStock : (product.inventory || 20);

          const discountPercent =
            product.discountPrice && product.discountPrice > currentPrice
              ? Math.round(((product.discountPrice - currentPrice) / product.discountPrice) * 100)
              : null;

          return (
            <div
              key={prodId}
              className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Price Drop Badge */}
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                  />

                  {/* Price Dropped Banner */}
                  {hasPriceDropped && (
                    <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Price dropped!</span>
                    </div>
                  )}

                  {discountPercent && !hasPriceDropped && (
                    <div className="absolute top-2.5 left-2.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {discountPercent}% OFF
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(prodId);
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors shadow-xs"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Store className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{product.storeName || 'Verified Seller'}</span>
                  </div>

                  <h3
                    onClick={() => setSelectedProduct(product)}
                    className="text-sm font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-2 transition-colors"
                  >
                    {product.name}
                  </h3>

                  {/* Price Comparison Box */}
                  <div className="pt-2">
                    {hasPriceDropped ? (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-emerald-800 block text-[11px]">Price dropped</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-slate-400 line-through">
                            ₹{savedPrice.toLocaleString()}
                          </span>
                          <span className="font-bold text-sm text-emerald-700">
                            → ₹{currentPrice.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-700 block">
                          You save ₹{dropAmount.toLocaleString()}!
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-slate-900">
                          ₹{currentPrice.toLocaleString()}
                        </span>
                        {product.discountPrice && product.discountPrice > currentPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{Number(product.discountPrice).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="text-[11px] font-medium pt-1">
                    {stock <= 0 ? (
                      <span className="text-rose-600">Out of Stock</span>
                    ) : stock < 10 ? (
                      <span className="text-amber-700">Only {stock} left</span>
                    ) : (
                      <span className="text-emerald-700">In Stock</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={stock <= 0}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    addedIds[prodId]
                      ? 'bg-emerald-600 text-white'
                      : stock <= 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {addedIds[prodId] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={() => {
            setSelectedProduct(null);
            if (onProceedToCheckout) onProceedToCheckout();
          }}
        />
      )}
    </div>
  );
}
