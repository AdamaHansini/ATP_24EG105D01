// frontend/src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Verifying session...</h3>
        <p className="text-sm text-slate-500 mt-1">Please wait while ShopSphere securely checks your authorization credentials.</p>
      </div>
    );
  }

  // 1. Unauthenticated -> Redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Check: Role mismatch -> 403 Forbidden view
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const getDashboardPath = (role) => {
      switch (role) {
        case 'seller': return '/seller';
        case 'admin': return '/admin';
        case 'support': return '/support';
        case 'delivery': return '/delivery';
        default: return '/';
      }
    };

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-100/60 px-2.5 py-1 rounded-full mb-2">
          403 Access Denied
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Unauthorized Role Access</h2>
        <p className="text-sm text-slate-600 max-w-md mt-2 leading-relaxed">
          Your active account role (<span className="font-semibold text-slate-900 capitalize">{user.role}</span>) does not have authorization to view this protected resource.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={getDashboardPath(user.role)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-colors"
          >
            Go to My Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Marketplace Home
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
