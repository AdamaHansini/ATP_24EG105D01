// frontend/src/components/product/ProductCard.jsx
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { Heart, Star, ShoppingBag, Check, Store, Package } from 'lucide-react';
import Badge from '../ui/Badge.jsx';

export default function ProductCard({ product, onSelectProduct }) {
  const { addItem } = useCart();
  const { canUseWishlist, isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const wishlisted = isWishlisted(product._id);
  const primaryImage = product.images?.[0];

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (wishlisted) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await addItem(product._id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discountPercent =
    product.discountPrice && product.discountPrice > product.price
      ? Math.round(((product.discountPrice - product.price) / product.discountPrice) * 100)
      : null;

  const stock = product.availableStock !== undefined ? product.availableStock : (product.inventory ?? 0);

  return (
    <div
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer relative"
    >
      {/* Top Floating Badges & Wishlist Action */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div>
          {discountPercent ? (
            <Badge variant="danger" size="sm">
              {discountPercent}% OFF
            </Badge>
          ) : null}
        </div>

        {canUseWishlist && <button
          type="button"
          onClick={handleWishlistToggle}
          className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 border border-slate-200/80 hover:bg-white'
          }`}
          title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist for Price-Drop Alerts'}
          aria-label={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>}
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
            <Package className="w-10 h-10" />
            <span className="text-xs">No image provided</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Store */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-slate-500">
              {product.brand || 'Brand'}
            </span>
            {product.storeName && (
              <span className="flex items-center gap-1 truncate max-w-[120px] text-slate-400" title={product.storeName}>
                <Store className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{product.storeName}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating & Review Count */}
          {Number(product.reviewCount) > 0 ? (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold text-slate-800 ml-1">
                  {Number(product.rating).toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-slate-400">({product.reviewCount} reviews)</span>
            </div>
          ) : <p className="text-xs text-slate-400 mt-1.5">No reviews yet</p>}
        </div>

        {/* Pricing, Stock Status & Add to Cart */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{Number(product.price).toLocaleString()}
              </span>
              {product.discountPrice && product.discountPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{Number(product.discountPrice).toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-[11px] mt-0.5">
              {stock <= 0 ? (
                <span className="text-rose-600 font-semibold">Out of stock</span>
              ) : stock < 10 ? (
                <span className="text-amber-600 font-semibold">Only {stock} left</span>
              ) : (
                <span className="text-emerald-600 font-semibold">In stock</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className={`p-2 rounded-xl text-xs font-semibold transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95'
            }`}
            title={stock <= 0 ? 'Out of stock' : 'Add to Cart'}
            aria-label="Add to cart"
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
