// frontend/src/components/common/Footer.jsx
import React from 'react';
import { ShoppingBag, ShieldCheck, RefreshCw, Sparkles, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span>ShopSphere</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Full-Stack Multi-Vendor E-Commerce Marketplace built with automated atomic rollback, Gemini AI taxonomy prediction, and instant price drop alerts.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
              Signature Capabilities
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('ai-studio')}
                  className="hover:text-white flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Category &amp; Tag Predictor</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rollback-lab')}
                  className="hover:text-white flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Atomic Multi-Vendor Rollback</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('wishlist')}
                  className="hover:text-white flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Wishlist Price Drop Alerts</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
              Portals &amp; Hubs
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-white">
                  Marketplace Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cart')} className="hover:text-white">
                  Partitioned Multi-Vendor Cart
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller')} className="hover:text-white">
                  Merchant Management Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-white">
                  Platform Administration Console
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
              Trust &amp; Architecture
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Inventory Leakage Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Mongoose sessions &amp; in-memory proxy engine enforce ACID-compliant two-phase checkout across all vendor sub-orders.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-wrap justify-between items-center gap-4 text-[11px]">
          <div>&copy; {new Date().getFullYear()} ShopSphere Inc. All rights reserved.</div>
          <div className="flex gap-4">
            <span className="text-slate-400">Production-Grade Architecture Specification</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
