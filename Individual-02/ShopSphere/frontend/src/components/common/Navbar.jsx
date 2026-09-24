// frontend/src/components/common/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import {
  ShoppingBag,
  Heart,
  Bell,
  Search,
  Store,
  Shield,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Headphones,
  Truck,
  LogIn,
  Layers,
  Sparkles,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
}) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const accountRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowAccountMenu(false);
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'seller':
        return <Badge variant="purple" size="sm">Seller</Badge>;
      case 'admin':
        return <Badge variant="danger" size="sm">Platform Admin</Badge>;
      case 'support':
        return <Badge variant="warning" size="sm">Support Agent</Badge>;
      case 'delivery':
        return <Badge variant="success" size="sm">Delivery Partner</Badge>;
      default:
        return <Badge variant="primary" size="sm">Customer</Badge>;
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                ShopSphere
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Role Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 font-semibold text-xs text-slate-600">
            {(!user || user.role === 'customer') && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-slate-100/70 transition-colors ${
                    location.pathname === '/' ? 'text-indigo-600 font-bold bg-indigo-50/50' : ''
                  }`}
                >
                  Marketplace
                </Link>
                {user && (
                  <Link
                    to="/account"
                    className={`px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-slate-100/70 transition-colors ${
                      location.pathname === '/account' ? 'text-indigo-600 font-bold bg-indigo-50/50' : ''
                    }`}
                  >
                    My Orders
                  </Link>
                )}
              </>
            )}

            {user?.role === 'seller' && (
              <>
                <Link
                  to="/seller"
                  className={`px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-slate-100/70 transition-colors ${
                    location.pathname === '/seller' ? 'text-indigo-600 font-bold bg-indigo-50/50' : ''
                  }`}
                >
                  Seller Dashboard
                </Link>
                <Link
                  to="/seller/ai-studio"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-slate-100/70 transition-colors ${
                    location.pathname === '/seller/ai-studio' ? 'text-indigo-600 font-bold bg-indigo-50/50' : ''
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  AI Taxonomy Studio
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-slate-100/70 transition-colors ${
                    location.pathname === '/admin' ? 'text-indigo-600 font-bold bg-indigo-50/50' : ''
                  }`}
                >
                  Admin Console
                </Link>
              </>
            )}

            {user?.role === 'support' && (
              <Link
                to="/support"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-slate-100/70 transition-colors ${
                  location.pathname === '/support' ? 'text-indigo-600 font-bold bg-indigo-50/50' : ''
                }`}
              >
                <Headphones className="w-3.5 h-3.5 text-amber-600" />
                Support Dashboard
              </Link>
            )}

            {user?.role === 'delivery' && (
              <Link
                to="/delivery"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-slate-100/70 transition-colors ${
                  location.pathname === '/delivery' ? 'text-indigo-600 font-bold bg-indigo-50/50' : ''
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Delivery Dashboard
              </Link>
            )}
          </nav>

          {/* Search and Category Filter (Desktop) */}
          <div className="flex-1 max-w-md hidden md:flex items-center gap-2">
            {categories.length > 0 && (
              <div className="relative w-36 flex-shrink-0">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => {
                    if (setSelectedCategory) setSelectedCategory(e.target.value);
                    if (location.pathname !== '/') navigate('/');
                  }}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 cursor-pointer transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery || ''}
                onKeyDown={handleSearchSubmit}
                onChange={(e) => {
                  if (setSearchQuery) setSearchQuery(e.target.value);
                  if (location.pathname !== '/') navigate('/');
                }}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Wishlist (Customer only or Guest) */}
            {(!user || user.role === 'customer') && (
              <Link
                to="/wishlist"
                className={`relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
                  location.pathname === '/wishlist' ? 'bg-rose-50 text-rose-600' : ''
                }`}
                title="Wishlist & Price Drops"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Center (Logged-in users) */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
                    showNotifications || location.pathname === '/notifications'
                      ? 'bg-indigo-50 text-indigo-600'
                      : ''
                  }`}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              if (n.type === 'PRICE_DROP') navigate('/wishlist');
                              else if (n.type === 'ORDER_STATUS') navigate('/account');
                              setShowNotifications(false);
                            }}
                            className={`p-3 text-xs hover:bg-slate-50 cursor-pointer rounded-xl transition-colors ${
                              !n.isRead ? 'bg-indigo-50/50' : ''
                            }`}
                          >
                            <div className="font-semibold text-slate-800 flex items-center justify-between">
                              <span>{n.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-center">
                      <button
                        onClick={() => {
                          navigate('/notifications');
                          setShowNotifications(false);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        View All Notifications &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button (Marketplace Customers & Guests) */}
            {(!user || user.role === 'customer') && (
              <Link
                to="/cart"
                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors ${
                  location.pathname === '/cart' ? 'bg-indigo-50 text-indigo-700 font-bold' : ''
                }`}
                title="Shopping Cart"
                aria-label="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              </Link>
            )}

            {/* Authenticated Account Menu vs Guest Sign-In */}
            {user ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-700"
                  aria-label="User Account Menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="hidden lg:flex flex-col text-left mr-1">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[90px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                    </div>

                    <div className="py-1">
                      {user.role === 'customer' && (
                        <Link
                          to="/account"
                          onClick={() => setShowAccountMenu(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile & Orders</span>
                        </Link>
                      )}

                      {user.role === 'seller' && (
                        <>
                          <Link
                            to="/seller"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Store className="w-4 h-4 text-purple-600" />
                            <span>Seller Dashboard</span>
                          </Link>
                          <Link
                            to="/seller/ai-studio"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span>AI Taxonomy Studio</span>
                          </Link>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Shield className="w-4 h-4 text-rose-600" />
                            <span>Admin Console</span>
                          </Link>
                        </>
                      )}

                      {user.role === 'support' && (
                        <Link
                          to="/support"
                          onClick={() => setShowAccountMenu(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Headphones className="w-4 h-4 text-amber-600" />
                          <span>Support Dashboard</span>
                        </Link>
                      )}

                      {user.role === 'delivery' && (
                        <Link
                          to="/delivery"
                          onClick={() => setShowAccountMenu(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Truck className="w-4 h-4 text-emerald-600" />
                          <span>Delivery Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-100">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery || ''}
                onKeyDown={handleSearchSubmit}
                onChange={(e) => {
                  if (setSearchQuery) setSearchQuery(e.target.value);
                  if (location.pathname !== '/') navigate('/');
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Mobile Categories */}
            {categories.length > 0 && (
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  if (setSelectedCategory) setSelectedCategory(e.target.value);
                  if (location.pathname !== '/') navigate('/');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            {/* Mobile Role Navigation Links */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold text-slate-700">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Marketplace
              </Link>

              {(!user || user.role === 'customer') && (
                <>
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-between"
                  >
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{wishlistCount}</span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-between"
                  >
                    <span>Cart</span>
                    {itemCount > 0 && (
                      <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{itemCount}</span>
                    )}
                  </Link>
                  {user && (
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      Orders & Profile
                    </Link>
                  )}
                </>
              )}

              {user?.role === 'seller' && (
                <>
                  <Link
                    to="/seller"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-600"
                  >
                    Seller Dashboard
                  </Link>
                  <Link
                    to="/seller/ai-studio"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-600"
                  >
                    AI Studio
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600"
                  >
                    Admin Console
                  </Link>
                </>
              )}

              {user?.role === 'support' && (
                <Link
                  to="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-600 col-span-2"
                >
                  Support Dashboard
                </Link>
              )}

              {user?.role === 'delivery' && (
                <Link
                  to="/delivery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 col-span-2"
                >
                  Delivery Dashboard
                </Link>
              )}

              {!user ? (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white text-center font-bold col-span-2"
                >
                  Sign In / Register
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-center font-bold col-span-2"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
