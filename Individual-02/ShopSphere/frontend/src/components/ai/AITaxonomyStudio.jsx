import React, { useState } from 'react';
import { aiService } from '../../services/aiService.js';
import { productService } from '../../services/productService.js';
import { CheckCircle2, Package, RefreshCw, Sparkles, Tag } from 'lucide-react';

export default function AITaxonomyStudio({ onProductPublished }) {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    features: '',
    color: '',
    material: '',
    targetAudience: '',
  });
  const [listingPrice, setListingPrice] = useState('');
  const [listingInventory, setListingInventory] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handlePredict = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);
    setPublished(false);
    try {
      setPrediction(await aiService.predictProduct(form));
    } catch (requestError) {
      setError(requestError.message || 'AI classification is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    const price = Number(listingPrice);
    const inventory = Number(listingInventory);
    if (!prediction || !Number.isFinite(price) || price <= 0 || !Number.isInteger(inventory) || inventory < 0) {
      setError('Enter a positive listing price and a whole-number stock quantity before publishing.');
      return;
    }

    setPublishing(true);
    setError('');
    try {
      const product = await productService.createProduct({
        name: form.name.trim(),
        brand: form.brand.trim(),
        description: form.features.trim(),
        category: prediction.category,
        subcategory: prediction.subcategory,
        tags: prediction.tags,
        keywords: prediction.keywords,
        attributes: prediction.attributes,
        price,
        inventory,
        images: [],
        aiMetadata: {
          generated: true,
          confidence: Number(prediction.confidence),
          generatedAt: new Date().toISOString(),
        },
      });
      setPublished(true);
      onProductPublished?.(product);
    } catch (requestError) {
      setError(requestError.message || 'The product could not be published.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Product Classification</h1>
        <p className="text-sm text-slate-500 mt-1">Review AI suggestions, then set your listing price and inventory before publishing.</p>
      </div>

      {error && <div role="alert" className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handlePredict} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Package className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900">Product details</h2>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Product name
            <input required value={form.name} onChange={(e) => updateForm('name', e.target.value)} className="mt-1 w-full p-2.5 border border-slate-200 rounded-lg" />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-slate-700">
              Brand
              <input value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} className="mt-1 w-full p-2.5 border border-slate-200 rounded-lg" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Color or finish
              <input value={form.color} onChange={(e) => updateForm('color', e.target.value)} className="mt-1 w-full p-2.5 border border-slate-200 rounded-lg" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Material
              <input value={form.material} onChange={(e) => updateForm('material', e.target.value)} className="mt-1 w-full p-2.5 border border-slate-200 rounded-lg" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Target audience
              <input value={form.targetAudience} onChange={(e) => updateForm('targetAudience', e.target.value)} className="mt-1 w-full p-2.5 border border-slate-200 rounded-lg" />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Features and specifications
            <textarea rows={4} value={form.features} onChange={(e) => updateForm('features', e.target.value)} className="mt-1 w-full p-2.5 border border-slate-200 rounded-lg" />
          </label>
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Classifying product…' : 'Classify product'}
          </button>
        </form>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Tag className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900">Classification results</h2>
          </div>
          {!prediction ? (
            <div className="py-14 text-center text-slate-400">
              <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p>Submit product details to request an AI classification.</p>
            </div>
          ) : (
            <div className="space-y-5 pt-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-indigo-50 rounded-xl"><p className="text-xs text-indigo-700">Category</p><p className="font-semibold text-slate-900 mt-1">{prediction.category}</p></div>
                <div className="p-3 bg-purple-50 rounded-xl"><p className="text-xs text-purple-700">Subcategory</p><p className="font-semibold text-slate-900 mt-1">{prediction.subcategory}</p></div>
              </div>
              <p className="text-xs text-slate-500">Model confidence: {Math.round(Number(prediction.confidence) * 100)}%</p>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Suggested tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(prediction.tags || []).map((tag) => <span key={tag} className="px-2.5 py-1 bg-slate-100 rounded-full text-xs">#{tag}</span>)}
                </div>
              </div>
              {(prediction.keywords || []).length > 0 && <p className="text-xs text-slate-600"><strong>Search keywords:</strong> {prediction.keywords.join(', ')}</p>}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700">Listing price (₹)<input type="number" min="0.01" step="0.01" value={listingPrice} onChange={(e) => setListingPrice(e.target.value)} className="mt-1 w-full p-2.5 border border-slate-200 rounded-lg" /></label>
                <label className="block text-sm font-medium text-slate-700">Available units<input type="number" min="0" step="1" value={listingInventory} onChange={(e) => setListingInventory(e.target.value)} className="mt-1 w-full p-2.5 border border-slate-200 rounded-lg" /></label>
              </div>
              <button type="button" onClick={handlePublish} disabled={publishing || published} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                {published ? <CheckCircle2 className="w-4 h-4" /> : publishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                {published ? 'Published' : publishing ? 'Publishing…' : 'Publish listing'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
