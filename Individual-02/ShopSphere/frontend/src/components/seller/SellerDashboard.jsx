// frontend/src/components/seller/SellerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { productService } from '../../services/productService.js';
import { aiService } from '../../services/aiService.js';
import {
  Store,
  Package,
  PlusCircle,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Tag,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Clock,
  Edit2,
  Settings,
  Layers,
  Check,
  X,
  FileText,
} from 'lucide-react';

export default function SellerDashboard({ onOpenAIPredictor }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Price adjustment state (Triggers Wishlist Price Drop Alert Engine)
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [priceUpdateResult, setPriceUpdateResult] = useState(null);
  const [updatingPrice, setUpdatingPrice] = useState(false);

  // 8-Section Add Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    description: '',
    shortDescription: '',
    category: 'Electronics',
    subcategory: '',
    price: '',
    discountPrice: '',
    color: '',
    material: '',
    features: '',
    inventory: 50,
    tags: [],
    keywords: [],
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    status: 'active',
  });

  // AI Assistance states for Seller Product Form
  const [aiPredicting, setAiPredicting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productCreatedSuccess, setProductCreatedSuccess] = useState(false);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, ordRes] = await Promise.all([
        api.get('/seller/dashboard'),
        api.get('/seller/products'),
        api.get('/seller/orders'),
      ]);
      setDashboardData(dashRes.data);
      setProducts(prodRes.data?.products || []);
      setOrders(ordRes.data?.orders || []);
    } catch (e) {
      console.warn('Seller dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    if (!editingProduct || !newPrice) return;
    setUpdatingPrice(true);
    setPriceUpdateResult(null);

    try {
      const res = await productService.updateProduct(editingProduct._id, {
        price: Number(newPrice),
      });
      setPriceUpdateResult(res.data?.priceDropResult);
      await fetchSellerData();
      setEditingProduct(null);
      setNewPrice('');
    } catch (err) {
      alert('Price update failed: ' + err.message);
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        isSellerOrder: true,
      });
      await fetchSellerData();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  // Trigger AI product assistance
  const handleRunAiPrediction = async () => {
    if (!productForm.name) {
      alert('Please enter a product name first.');
      return;
    }
    setAiPredicting(true);
    try {
      const prediction = await aiService.predictProduct({
        name: productForm.name,
        brand: productForm.brand,
        features: productForm.features,
        color: productForm.color,
        material: productForm.material,
      });
      setAiSuggestion(prediction);
    } catch (err) {
      alert('AI prediction error: ' + err.message);
    } finally {
      setAiPredicting(false);
    }
  };

  // Accept AI suggestions
  const handleAcceptAiSuggestion = () => {
    if (!aiSuggestion) return;
    setProductForm((prev) => ({
      ...prev,
      category: aiSuggestion.category || prev.category,
      subcategory: aiSuggestion.subcategory || prev.subcategory,
      tags: aiSuggestion.tags || prev.tags,
      keywords: aiSuggestion.keywords || prev.keywords,
      price: aiSuggestion.pricing?.suggestedPrice || prev.price,
      shortDescription: aiSuggestion.seoDescription || prev.shortDescription,
    }));
  };

  // Handle saving new product from seller form
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Product Name and Price are required.');
      return;
    }
    setSavingProduct(true);
    try {
      await productService.createProduct({
        ...productForm,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
        inventory: Number(productForm.inventory),
        aiMetadata: aiSuggestion
          ? {
              generated: true,
              confidence: aiSuggestion.confidence?.category || 0.95,
              generatedAt: new Date().toISOString(),
            }
          : { generated: false },
      });
      setProductCreatedSuccess(true);
      await fetchSellerData();
      setTimeout(() => {
        setProductCreatedSuccess(false);
        setActiveTab('products');
      }, 1500);
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
        <p className="text-sm">Loading Merchant Portal...</p>
      </div>
    );
  }

  const store = dashboardData?.store || {};
  const settlements = dashboardData?.settlements || {};

  // Actionable dashboard metrics
  const pendingOrders = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PENDING');
  const lowStockProducts = products.filter((p) => (p.inventory || 0) < 15);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{store.name || 'Merchant Hub'}</h1>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Verified Store
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage inventory, fulfill orders, adjust pricing, and review settlements.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('add-product')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-1 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'products', label: `Products (${products.length})` },
          { id: 'add-product', label: 'Add Product' },
          { id: 'inventory', label: `Inventory (${lowStockProducts.length} low)` },
          { id: 'orders', label: `Orders (${orders.length})` },
          { id: 'settlements', label: 'Settlements' },
          { id: 'settings', label: 'Store Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Price Drop Alert Trigger Notification Notice */}
      {priceUpdateResult?.triggered && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold">Wishlist Price-Drop Notification Engine Triggered!</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Successfully dispatched {priceUpdateResult.count} automated notifications &amp; email alerts to customers who wishlisted this product.
              </p>
            </div>
          </div>
          <span className="font-bold bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded text-[11px]">
            {priceUpdateResult.count} Alerts Dispatched
          </span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Actionable Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-500 font-medium">Pending Orders</span>
              <span className="text-2xl font-bold text-amber-600 mt-1 block">
                {pendingOrders.length}
              </span>
              <span className="text-slate-400 mt-1 inline-block">Requires fulfillment</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-500 font-medium">Low Stock Items</span>
              <span className="text-2xl font-bold text-rose-600 mt-1 block">
                {lowStockProducts.length}
              </span>
              <span className="text-slate-400 mt-1 inline-block">Stock below 15 units</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-500 font-medium">Gross Sales Revenue</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                ₹{(settlements.totalRevenue || 0).toLocaleString()}
              </span>
              <span className="text-slate-400 mt-1 inline-block">{orders.length} total orders</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-500 font-medium">Net Payouts Accrued</span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                ₹{(settlements.netEarnings || 0).toLocaleString()}
              </span>
              <span className="text-emerald-700 font-medium mt-1 inline-block">Post 10% platform fee</span>
            </div>
          </div>

          {/* Actionable Orders & Price Changes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">Recent Customer Orders</span>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">No orders received yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o._id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">Sub-Order #{o._id}</span>
                        <div className="text-[11px] text-slate-400">
                          {o.items?.length} items &bull; ₹{Number(o.subtotal).toLocaleString()}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Price Adjustments */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">Price Adjustments &amp; Alerts</span>
                <span className="text-[11px] text-slate-400">Triggers wishlist alerts</span>
              </div>

              <div className="divide-y divide-slate-100">
                {products.slice(0, 4).map((p) => (
                  <div key={p._id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Current: <strong className="text-slate-900">₹{Number(p.price).toLocaleString()}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setNewPrice(String(Math.round(p.price * 0.9)));
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold whitespace-nowrap"
                    >
                      Lower Price
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Store Catalog</h3>
              <p className="text-xs text-slate-500">Products currently active in the marketplace</p>
            </div>
            <button
              onClick={() => setActiveTab('add-product')}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
            >
              + Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Inventory</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                      <span className="font-semibold text-slate-900 max-w-xs truncate">{p.name}</span>
                    </td>
                    <td className="p-3 text-slate-600">{p.category}</td>
                    <td className="p-3">
                      <span
                        className={`font-semibold ${
                          (p.inventory || 0) < 15 ? 'text-amber-600' : 'text-emerald-700'
                        }`}
                      >
                        {p.inventory || 25} units
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">₹{Number(p.price).toLocaleString()}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setNewPrice(String(p.price));
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                      >
                        Adjust Price
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ADD PRODUCT */}
      {activeTab === 'add-product' && (
        <form onSubmit={handleSaveProduct} className="space-y-6 max-w-3xl">
          {productCreatedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Product successfully published to marketplace catalog!</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              1. Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Ergonomic Bluetooth Wireless Headphones"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="e.g. TechNova"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Short Description</label>
                  <input
                    type="text"
                    value={productForm.shortDescription}
                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                    placeholder="Brief 1-sentence value proposition"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistance */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">2. AI Assistance</h3>
              </div>
              <button
                type="button"
                onClick={handleRunAiPrediction}
                disabled={aiPredicting}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold flex items-center gap-1"
              >
                {aiPredicting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{aiSuggestion ? 'Regenerate Suggestions' : 'Predict Category &amp; Tags'}</span>
              </button>
            </div>

            {aiSuggestion && (
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">AI Recommendations</span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={handleAcceptAiSuggestion}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-[11px]"
                    >
                      Accept Suggestions
                    </button>
                    <button
                      type="button"
                      onClick={handleRunAiPrediction}
                      className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded font-medium text-[11px]"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="text-slate-400">Predicted Category:</span>{' '}
                    <strong>{aiSuggestion.category}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Subcategory:</span>{' '}
                    <strong>{aiSuggestion.subcategory}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Suggested Price:</span>{' '}
                    <strong>₹{aiSuggestion.pricing?.suggestedPrice || 2999}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Confidence:</span>{' '}
                    <strong>{Math.round((aiSuggestion.confidence?.category || 0.95) * 100)}%</strong>
                  </div>
                </div>

                {aiSuggestion.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {aiSuggestion.tags.map((t, idx) => (
                      <span key={idx} className="bg-white border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Category */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              3. Category &amp; Classification
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department / Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Kitchen">Home &amp; Kitchen</option>
                  <option value="Sports & Fitness">Sports &amp; Fitness</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subcategory</label>
                <input
                  type="text"
                  value={productForm.subcategory}
                  onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                  placeholder="e.g. Headphones, Shoes, Cookware"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Pricing */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              4. Pricing
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Marketplace Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="e.g. 2499"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Original / Strikethrough Price (₹)
                </label>
                <input
                  type="number"
                  value={productForm.discountPrice}
                  onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                  placeholder="e.g. 2999"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Variants & Attributes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              5. Variants &amp; Attributes
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Color / Finish</label>
                <input
                  type="text"
                  value={productForm.color}
                  onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                  placeholder="e.g. Midnight Black"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Material</label>
                <input
                  type="text"
                  value={productForm.material}
                  onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                  placeholder="e.g. Recycled Polymer"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Inventory */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              6. Stock Inventory
            </h3>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Initial Stock Units</label>
              <input
                type="number"
                min="0"
                value={productForm.inventory}
                onChange={(e) => setProductForm({ ...productForm, inventory: e.target.value })}
                className="w-40 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
              />
            </div>
          </div>

          {/* Section 7: Images */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              7. Product Images
            </h3>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Image URL</label>
              <input
                type="text"
                value={productForm.images[0] || ''}
                onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Section 8: Publishing */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              8. Publishing
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Publish immediately to live catalog</span>
              <button
                type="submit"
                disabled={savingProduct}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
              >
                {savingProduct ? 'Publishing...' : 'Save & Publish Product'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Inventory Management</h3>
            <span className="text-slate-500">{lowStockProducts.length} items low in stock</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Stock Available</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{p.inventory || 20}</td>
                    <td className="p-3">
                      {(p.inventory || 0) < 15 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Fulfillment Orders ({orders.length})
          </h3>
          {orders.length === 0 ? (
            <p className="text-slate-400 py-6 text-center">No orders routed to your store yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-bold text-slate-900">Sub-Order #{o._id}</span>
                    <div className="text-slate-500 mt-0.5">
                      Items: {o.items?.length} &bull; Vendor Revenue: ₹{Number(o.sellerEarnings || o.subtotal).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                      {o.status}
                    </span>

                    {o.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o._id, 'PROCESSING')}
                        className="px-3 py-1 bg-indigo-600 text-white font-medium rounded-lg text-xs"
                      >
                        Process Order
                      </button>
                    )}
                    {o.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o._id, 'PACKED')}
                        className="px-3 py-1 bg-purple-600 text-white font-medium rounded-lg text-xs"
                      >
                        Mark Packed
                      </button>
                    )}
                    {o.status === 'PACKED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o._id, 'SHIPPED')}
                        className="px-3 py-1 bg-emerald-600 text-white font-medium rounded-lg text-xs"
                      >
                        Dispatch
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SETTLEMENTS */}
      {activeTab === 'settlements' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Merchant Settlements &amp; Commission Ledger
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Invoiced Sales</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                ₹{(settlements.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Platform Fee (10%)</span>
              <span className="text-xl font-bold text-purple-700 mt-1 block">
                ₹{(settlements.platformFees || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 font-medium">Net Payout Transferred</span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">
                ₹{(settlements.netEarnings || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs max-w-lg">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Store Profile
          </h3>
          <div className="space-y-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Store Name</label>
              <input
                type="text"
                disabled
                value={store.name || 'TechNova Gadgets'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Email</label>
              <input
                type="text"
                disabled
                value={store.businessEmail || ''}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Description</label>
              <textarea
                rows={2}
                disabled
                value={store.description || 'Premier manufacturer and authorized distributor.'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Price Adjustment Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Adjust Product Price</h3>
            <p className="text-slate-500">{editingProduct.name}</p>

            <form onSubmit={handleUpdatePrice} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between">
                <span className="text-slate-500">Current Price:</span>
                <span className="font-bold text-slate-900">₹{Number(editingProduct.price).toLocaleString()}</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm"
                />
              </div>

              {Number(newPrice) < editingProduct.price && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Lowering price will trigger live price-drop alerts to all wishlist users!</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPrice}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {updatingPrice ? 'Saving...' : 'Save & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
