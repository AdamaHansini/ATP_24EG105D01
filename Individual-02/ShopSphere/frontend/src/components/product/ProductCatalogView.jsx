// frontend/src/components/product/ProductCatalogView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard.jsx';
import ProductDetailModal from './ProductDetailModal.jsx';
import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Sparkles,
  TrendingUp,
  Tag,
  Store,
  History,
  Check,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { productService } from '../../services/productService.js';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Pagination from '../ui/Pagination.jsx';

export default function ProductCatalogView({
  products = [],
  categories = [],
  selectedCategory,
  setSelectedCategory,
  sortOption,
  setSortOption,
  searchQuery,
  setSearchQuery,
  onOpenAIPredictor,
  onProceedToCheckout,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Recently Viewed & Recommendations
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    productService
      .getRecentlyViewed()
      .then((res) => setRecentlyViewed(res || []))
      .catch(() => {});
  }, [selectedProduct]);

  // Extract unique brands, stores, and subcategories
  const availableBrands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(set);
  }, [products]);

  const availableStores = useMemo(() => {
    const set = new Set(products.map((p) => p.storeName).filter(Boolean));
    return Array.from(set);
  }, [products]);

  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const cat = categories.find((c) => c.name.toLowerCase() === selectedCategory.toLowerCase());
    return cat?.subcategories || [];
  }, [selectedCategory, categories]);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category
      if (selectedCategory && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Subcategory
      if (selectedSubcategory && p.subcategory?.toLowerCase() !== selectedSubcategory.toLowerCase()) {
        return false;
      }
      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inName = (p.name || '').toLowerCase().includes(q);
        const inBrand = (p.brand || '').toLowerCase().includes(q);
        const inCat = (p.category || '').toLowerCase().includes(q);
        const inTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        const inKeywords = (p.keywords || []).some((k) => k.toLowerCase().includes(q));
        if (!inName && !inBrand && !inCat && !inTags && !inKeywords) return false;
      }
      // Brand
      if (selectedBrand && p.brand?.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }
      // Store
      if (selectedStore && p.storeName?.toLowerCase() !== selectedStore.toLowerCase()) {
        return false;
      }
      // Price Range
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      // Rating
      if (minRating && (p.rating || 0) < Number(minRating)) return false;
      // In Stock
      const stock = p.availableStock !== undefined ? p.availableStock : (p.inventory || 0);
      if (inStockOnly && stock <= 0) return false;
      // Discount Only
      if (discountOnly && (!p.discountPrice || p.discountPrice <= p.price)) return false;

      return true;
    });
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    selectedBrand,
    selectedStore,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    discountOnly,
  ]);

  // Sorted Products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortOption === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortOption === 'popularity') {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else {
      // Newest
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [filteredProducts, sortOption]);

  // Paginated Slice
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedBrand('');
    setSelectedStore('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setInStockOnly(false);
    setDiscountOnly(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(selectedSubcategory) ||
    Boolean(selectedBrand) ||
    Boolean(selectedStore) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(minRating) ||
    inStockOnly ||
    discountOnly ||
    Boolean(searchQuery);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. Compact Bright Promotional Highlights Banner */}
      {!hasActiveFilters && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 p-6 sm:p-10 text-white shadow-md">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Next-Gen Multi-Vendor Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Curated Electronics & Lifestyle, Direct from Verified Merchants
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-xl">
              Enjoy automated transaction-safe checkout across multiple vendors, instant wishlist price-drop notifications, and AI-optimized catalog exploration.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('catalog-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-xs sm:text-sm font-bold shadow-xs hover:bg-indigo-50 transition-colors"
              >
                Explore Catalog
              </button>
              <button
                onClick={onOpenAIPredictor}
                className="px-5 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold border border-indigo-400/40 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Product Intelligence</span>
              </button>
            </div>
          </div>

          {/* Decorative Soft Graphic Elements */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:flex items-center justify-center">
            <ShoppingBag className="w-72 h-72 text-white" />
          </div>
        </div>
      )}

      {/* 2. Interactive Category Carousel / Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Browse By Category
          </h2>
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedSubcategory('');
                setCurrentPage(1);
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory?.toLowerCase() === cat.name?.toLowerCase();
            return (
              <div
                key={cat._id || cat.name}
                onClick={() => {
                  if (isSelected) {
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                  } else {
                    setSelectedCategory(cat.name);
                    setSelectedSubcategory('');
                  }
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-300 shadow-xs ring-2 ring-indigo-100'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate">
                  <h3 className={`text-xs sm:text-sm font-bold truncate ${
                    isSelected ? 'text-indigo-700' : 'text-slate-800'
                  }`}>
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {cat.subcategories?.length || 0} subcategories
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subcategory Pills (if category selected) */}
      {availableSubcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Subcategory:</span>
          <button
            onClick={() => setSelectedSubcategory('')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              !selectedSubcategory
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          {availableSubcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setSelectedSubcategory(sub === selectedSubcategory ? '' : sub);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSubcategory === sub
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* 3. Main Catalog Section with Sidebar Filters & Product Grid */}
      <div id="catalog-products" className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start pt-4">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
              />
            </div>
          </div>

          {/* Brand Filter */}
          {availableBrands.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-medium p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer"
              >
                <option value="">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Store / Seller Filter */}
          {availableStores.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Merchant Store
              </label>
              <select
                value={selectedStore}
                onChange={(e) => {
                  setSelectedStore(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs font-medium p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer"
              >
                <option value="">All Stores</option>
                {availableStores.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Minimum Rating */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Minimum Rating
            </label>
            <div className="flex gap-1.5">
              {[4, 4.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setMinRating(minRating === String(rate) ? '' : String(rate));
                    setCurrentPage(1);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1 transition-colors ${
                    minRating === String(rate)
                      ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Star className="w-3 h-3 text-amber-500 fill-current" />
                  <span>{rate}+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggles */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
              <input
                type="checkbox"
                checked={discountOnly}
                onChange={(e) => {
                  setDiscountOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>On Sale / Discounted Only</span>
            </label>
          </div>
        </aside>

        {/* Right Section: Sort Bar & Product Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Sort & Results Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="text-xs text-slate-600">
              Showing <span className="font-bold text-slate-900">{sortedProducts.length}</span>{' '}
              {sortedProducts.length === 1 ? 'product' : 'products'}
              {selectedCategory && (
                <span>
                  {' '}in <span className="font-bold text-indigo-600">{selectedCategory}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popularity">Most Popular</option>
              </select>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Active filters:</span>
              {selectedCategory && (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedSubcategory && (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  Sub: {selectedSubcategory}
                  <button onClick={() => setSelectedSubcategory('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBrand && (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedStore && (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  Store: {selectedStore}
                  <button onClick={() => setSelectedStore('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-indigo-600 hover:text-indigo-800 font-bold ml-1 text-xs"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid */}
          {paginatedProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your filters, broadening your price range, or searching for a different keyword.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={() => {
            setSelectedProduct(null);
            if (onProceedToCheckout) onProceedToCheckout();
          }}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}
    </div>
  );
}
