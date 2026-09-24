// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import PriceDropBanner from './components/common/PriceDropBanner.jsx';
import NotificationCenter from './components/common/NotificationCenter.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import LoginPage from './components/auth/LoginPage.jsx';

import AccountView from './components/account/AccountView.jsx';
import ProductCatalogView from './components/product/ProductCatalogView.jsx';
import MultiVendorCartView from './components/cart/MultiVendorCartView.jsx';
import CheckoutModal from './components/checkout/CheckoutModal.jsx';
import WishlistView from './components/wishlist/WishlistView.jsx';
import AITaxonomyStudio from './components/ai/AITaxonomyStudio.jsx';
import RollbackLab from './components/admin/RollbackLab.jsx';
import SellerDashboard from './components/seller/SellerDashboard.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import SupportDashboard from './components/support/SupportDashboard.jsx';
import DeliveryDashboard from './components/delivery/DeliveryDashboard.jsx';

import { productService } from './services/productService.js';

function MainApp() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const navigate = useNavigate();

  const loadCatalog = async () => {
    try {
      setCatalogLoading(true);
      const [prodsData, catsData] = await Promise.all([
        productService.getProducts({
          category: selectedCategory,
          search: searchQuery,
          sort: sortOption,
        }),
        productService.getCategories(),
      ]);

      setProducts(prodsData?.products || []);
      setCategories(catsData || []);
    } catch (err) {
      console.warn('Catalog load error:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory, searchQuery, sortOption]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Global Navbar with Role-Isolated Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      {/* 2. Main Router with Protected Routes */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              catalogLoading ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                  <div className="h-44 w-full rounded-2xl bg-slate-200/80 animate-pulse" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="h-16 rounded-xl bg-slate-200/80 animate-pulse" />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div key={idx} className="h-72 rounded-xl border border-slate-200 bg-white p-3 space-y-3">
                        <div className="h-40 w-full rounded-lg bg-slate-200/80 animate-pulse" />
                        <div className="h-4 w-3/4 bg-slate-200/80 rounded animate-pulse" />
                        <div className="h-4 w-1/2 bg-slate-200/80 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <ProductCatalogView
                  products={products}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onOpenAIPredictor={() => navigate('/seller/ai-studio')}
                  onProceedToCheckout={() => setShowCheckout(true)}
                />
              )
            }
          />

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/cart"
            element={
              <MultiVendorCartView
                onProceedToCheckout={(coupon) => {
                  setSelectedCoupon(coupon);
                  setShowCheckout(true);
                }}
                onContinueShopping={() => navigate('/')}
              />
            }
          />

          {/* Protected Customer Routes */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <WishlistView
                  onBrowseProducts={() => navigate('/')}
                  onProceedToCheckout={() => setShowCheckout(true)}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'seller']}>
                <AccountView onContinueShopping={() => navigate('/')} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'seller']}>
                <AccountView onContinueShopping={() => navigate('/')} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['customer', 'seller', 'admin', 'support', 'delivery']}>
                <NotificationCenter
                  onNavigateToWishlist={() => navigate('/wishlist')}
                  onNavigateToOrders={() => navigate('/account')}
                />
              </ProtectedRoute>
            }
          />

          {/* Protected Seller Routes */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <SellerDashboard onOpenAIPredictor={() => navigate('/seller/ai-studio')} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <SellerDashboard onOpenAIPredictor={() => navigate('/seller/ai-studio')} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/ai-studio"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <AITaxonomyStudio
                  onProductPublished={() => {
                    loadCatalog();
                    navigate('/seller');
                  }}
                />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard onOpenRollbackLab={() => navigate('/admin/rollback-lab')} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard onOpenRollbackLab={() => navigate('/admin/rollback-lab')} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/rollback-lab"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RollbackLab />
              </ProtectedRoute>
            }
          />

          {/* Protected Support Routes */}
          <Route
            path="/support"
            element={
              <ProtectedRoute allowedRoles={['support', 'admin']}>
                <SupportDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/support/dashboard"
            element={
              <ProtectedRoute allowedRoles={['support', 'admin']}>
                <SupportDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Delivery Routes */}
          <Route
            path="/delivery"
            element={
              <ProtectedRoute allowedRoles={['delivery', 'admin']}>
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/delivery/dashboard"
            element={
              <ProtectedRoute allowedRoles={['delivery', 'admin']}>
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Interactive Multi-Vendor Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          initialCoupon={selectedCoupon}
          onClose={() => setShowCheckout(false)}
          onOrderPlaced={() => {
            loadCatalog();
          }}
        />
      )}

      {/* 4. Live Wishlist Price Drop Alert Notification Banner */}
      <PriceDropBanner onNavigateToWishlist={() => navigate('/wishlist')} />

      {/* 5. Footer */}
      <Footer onNavigate={(view) => {
        if (view === 'catalog') navigate('/');
        else if (view === 'cart') navigate('/cart');
        else if (view === 'wishlist') navigate('/wishlist');
        else if (view === 'account') navigate('/account');
        else if (view === 'seller') navigate('/seller');
        else if (view === 'admin') navigate('/admin');
        else if (view === 'support') navigate('/support');
        else if (view === 'delivery') navigate('/delivery');
        else navigate('/');
      }} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider>
            <MainApp />
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
