// frontend/src/components/product/ProductDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { productService } from '../../services/productService.js';
import {
  X,
  Heart,
  Star,
  ShoppingBag,
  Zap,
  Store,
  ShieldCheck,
  Check,
  Truck,
  RotateCcw,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

export default function ProductDetailModal({
  product,
  onClose,
  onBuyNow,
  allProducts = [],
  onSelectProduct,
}) {
  const { addItem } = useCart();
  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!product?._id) return;
    setSelectedImage(0);
    setQuantity(1);
    setAdded(false);

    // Record view in browsing history
    productService.recordView(product._id).catch(() => {});

    // Fetch verified reviews
    setLoadingReviews(true);
    productService
      .getReviews(product._id)
      .then((res) => setReviews(res || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [product?._id]);

  if (!product) return null;

  const wishlisted = isWishlisted(product._id);
  const images =
    product.images?.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

  const stock = product.availableStock !== undefined ? product.availableStock : (product.inventory || 20);

  const discountAmount =
    product.discountPrice && product.discountPrice > product.price
      ? product.discountPrice - product.price
      : 0;

  const discountPercent =
    product.discountPrice && product.discountPrice > product.price
      ? Math.round((discountAmount / product.discountPrice) * 100)
      : null;

  const handleAddToCart = async () => {
    await addItem(product._id, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    await addItem(product._id, quantity, selectedVariant);
    if (onBuyNow) {
      onBuyNow();
    }
  };

  const handleWishlistToggle = async () => {
    if (wishlisted) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const created = await productService.addReview(product._id, {
        rating: Number(newRating),
        comment: newComment,
      });
      setReviews([created, ...reviews]);
      setNewComment('');
      setShowReviewForm(false);
    } catch (err) {
      console.warn('Review submit error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Related products from same category
  const relatedProducts = allProducts
    .filter((p) => p._id !== product._id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Main Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-slate-100">
            {/* Gallery Column */}
            <div>
              <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3 border border-slate-200/80">
                <img
                  src={images[selectedImage] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImage === idx
                          ? 'border-indigo-600 ring-2 ring-indigo-100'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta Column */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                {/* Brand & Store */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-bold uppercase tracking-wider text-slate-500">
                    {product.brand || 'Brand'}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Store className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{product.storeName || 'Verified Partner Store'}</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Review */}
                <div className="flex items-center gap-3 mt-2.5">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold text-slate-800 ml-1.5">
                      {product.rating || '4.8'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs text-slate-600 font-medium">
                    {product.reviewCount || 24} customer reviews
                  </span>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <Badge variant={stock > 0 ? 'success' : 'danger'} size="sm">
                    {stock > 0 ? `In Stock (${stock} available)` : 'Out of Stock'}
                  </Badge>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        ₹{Number(product.price).toLocaleString()}
                      </span>
                      {product.discountPrice && product.discountPrice > product.price && (
                        <span className="text-sm text-slate-400 line-through">
                          ₹{Number(product.discountPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {discountAmount > 0 && (
                      <p className="text-xs text-emerald-600 font-bold mt-0.5">
                        You save ₹{discountAmount.toLocaleString()} ({discountPercent}% OFF)
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2.5 rounded-xl border transition-all ${
                      wishlisted
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-white text-slate-400 hover:text-rose-500 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist for Price Drops'}
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Short Description */}
                {product.shortDescription && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}

                {/* Quantity and Actions */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Quantity:</span>
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-xs font-bold text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                        disabled={quantity >= stock}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      onClick={handleAddToCart}
                      disabled={stock <= 0}
                      variant="primary"
                      size="md"
                      className="w-full"
                    >
                      {added ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 mr-1.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleBuyNow}
                      disabled={stock <= 0}
                      variant="secondary"
                      size="md"
                      className="w-full"
                    >
                      <Zap className="w-4 h-4 mr-1.5 text-amber-400" />
                      <span>Buy Now</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Delivery and Guarantee Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-600">
                  <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Free delivery above ₹5,000</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-600">
                  <RotateCcw className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>7-Day Return Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Specifications Section */}
          <div className="py-6 border-b border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Description</h3>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              {product.description || 'No detailed description available.'}
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-semibold text-slate-500">{k}</span>
                      <span className="font-bold text-slate-800">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags & Keywords */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1">Tags:</span>
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Verified Customer Reviews Section */}
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Customer Reviews</span>
              </h3>
              <Button
                onClick={() => setShowReviewForm(!showReviewForm)}
                variant="outline"
                size="sm"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </Button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                <h4 className="text-xs font-bold text-slate-800">Submit Your Feedback</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`p-1 ${newRating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows="3"
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                />
                <Button type="submit" loading={submittingReview} size="sm" variant="primary">
                  Publish Review
                </Button>
              </form>
            )}

            {/* Review List */}
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No customer reviews yet. Be the first to share your opinion!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r, idx) => (
                  <div key={r._id || idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{r.userName || 'Verified Buyer'}</span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: r.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 mt-1.5 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
