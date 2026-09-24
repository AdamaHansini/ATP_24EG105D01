// frontend/src/components/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ShoppingBag, Lock, Mail, User, Store, ArrowRight,
  AlertCircle, CheckCircle, Shield, Truck, HeadphonesIcon,
} from 'lucide-react';

const STAFF_ROLES = [
  {
    role: 'admin',
    label: 'Admin',
    email: 'admin@gmail.com',
    icon: Shield,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-600',
    description: 'Platform administration',
  },
  {
    role: 'support',
    label: 'Support',
    email: 'support@gmail.com',
    icon: HeadphonesIcon,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-600',
    description: 'Customer support',
  },
  {
    role: 'delivery',
    label: 'Delivery',
    email: 'delivery@gmail.com',
    icon: Truck,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-600',
    description: 'Delivery operations',
  },
];

export default function LoginPage() {
  // 'customer' | 'staff'
  const [loginMode, setLoginMode] = useState('customer');
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Customer/Seller login + register fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [storeName, setStoreName] = useState('');

  // Staff login fields
  const [selectedStaff, setSelectedStaff] = useState(STAFF_ROLES[0]);
  const [staffPassword, setStaffPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const getDestination = (userRole) => {
    if (from && from !== '/login') return from;
    switch (userRole) {
      case 'seller': return '/seller';
      case 'admin': return '/admin';
      case 'support': return '/support';
      case 'delivery': return '/delivery';
      default: return '/';
    }
  };

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      // Do not send a role for customer/seller login — backend derives it from the DB
      const res = await login(email, password);
      setSuccessMsg('Authentication successful! Redirecting...');
      const target = getDestination(res?.role || res?.user?.role);
      setTimeout(() => navigate(target, { replace: true }), 400);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!staffPassword) {
      setError('Password is required.');
      return;
    }

    try {
      setSubmitting(true);
      // Send the staff email and expected role — backend validates both against MongoDB
      const res = await login(selectedStaff.email, staffPassword, selectedStaff.role);
      setSuccessMsg('Authentication successful! Redirecting...');
      const target = getDestination(res?.role || res?.user?.role);
      setTimeout(() => navigate(target, { replace: true }), 400);
    } catch (err) {
      setError(err.message || 'Invalid credentials or incorrect role.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (role === 'seller' && !storeName.trim()) {
      setError('Store Name is required for Seller registration.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await register({
        name,
        email,
        password,
        role,
        storeName: role === 'seller' ? storeName : undefined,
      });
      setSuccessMsg('Account registered successfully! Redirecting...');
      const target = getDestination(res?.role || res?.user?.role);
      setTimeout(() => navigate(target, { replace: true }), 400);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/60">

        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">ShopSphere</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">
            {loginMode === 'staff' ? 'Staff Sign In' : tab === 'login' ? 'Sign in to your account' : 'Create your ShopSphere account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {loginMode === 'staff'
              ? 'Admin, Support, and Delivery portal'
              : tab === 'login'
              ? 'Access orders, wishlist, or your seller dashboard'
              : 'Join as a customer or register your seller store'}
          </p>
        </div>

        {/* Mode Switcher: Customer/Seller vs Staff */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => { setLoginMode('customer'); setTab('login'); resetMessages(); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              loginMode === 'customer'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer / Seller
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode('staff'); resetMessages(); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              loginMode === 'staff'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Staff Portal
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs animate-in fade-in duration-150">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* ─── STAFF LOGIN ─── */}
        {loginMode === 'staff' && (
          <form className="mt-2 space-y-4" onSubmit={handleStaffLogin}>
            {/* Staff role selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {STAFF_ROLES.map((s) => {
                  const Icon = s.icon;
                  const isSelected = selectedStaff.role === s.role;
                  return (
                    <button
                      key={s.role}
                      type="button"
                      onClick={() => { setSelectedStaff(s); resetMessages(); }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? `${s.border} ${s.bg} ${s.color} font-bold`
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pre-filled email display (read-only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <div className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-500 select-none">
                  {selectedStaff.email}
                </div>
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-1">{selectedStaff.description}</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-100 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : `Sign In as ${selectedStaff.label}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ─── CUSTOMER / SELLER ─── */}
        {loginMode === 'customer' && (
          <>
            {/* Login / Register tab switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => { setTab('login'); resetMessages(); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  tab === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); resetMessages(); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  tab === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Customer/Seller Login Form */}
            {tab === 'login' ? (
              <form className="mt-2 space-y-4" onSubmit={handleCustomerLogin}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-100 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Authenticating...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Registration Form */
              <form className="mt-2 space-y-4" onSubmit={handleRegister}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Role selector — only customer and seller allowed */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        role === 'customer'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        role === 'seller'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      Seller
                    </button>
                  </div>
                </div>

                {role === 'seller' && (
                  <div className="animate-in fade-in duration-150">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Store / Business Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Apex Electronics Store"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                      />
                      <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-100 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
