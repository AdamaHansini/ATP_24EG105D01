// frontend/src/components/ai/AITaxonomyStudio.jsx
import React, { useState } from 'react';
import { aiService } from '../../services/aiService.js';
import { productService } from '../../services/productService.js';
import { Sparkles, ArrowRight, CheckCircle2, Tag, RefreshCw, Layers, ShieldCheck, DollarSign, BookOpen } from 'lucide-react';

export default function AITaxonomyStudio({ onProductPublished }) {
  const [form, setForm] = useState({
    name: 'Logitech MX Master 3S Advanced Wireless Mouse',
    brand: 'Logitech',
    features: 'Quiet clicks, 8K DPI any-surface tracking, MagSpeed scrolling, Bluetooth and Logi Bolt, ergonomic thumb rest',
    color: 'Pale Grey',
    material: 'Rubber and Recycled Plastic',
    targetAudience: 'Software developers and digital creators',
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    setPublished(false);

    try {
      const result = await aiService.predictProduct(form);
      setPrediction(result.data || result);
    } catch (err) {
      console.error('Prediction failed:', err);
      alert('AI prediction failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToCatalog = async () => {
    if (!prediction) return;
    setPublishing(true);

    try {
      const price = prediction.pricing?.suggestedPrice || 7999;
      const newProd = await productService.createProduct({
        name: form.name,
        brand: form.brand,
        category: prediction.category,
        subcategory: prediction.subcategory,
        tags: prediction.tags,
        keywords: prediction.keywords,
        description: prediction.seoDescription,
        shortDescription: prediction.seoDescription?.slice(0, 120),
        price,
        discountPrice: Math.round(price * 1.15),
        attributes: prediction.attributes,
        specifications: {
          Brand: form.brand,
          Features: form.features,
          Color: form.color,
          Material: form.material,
        },
        inventory: 35,
        aiMetadata: {
          generated: true,
          confidence: prediction.confidence?.category || 0.95,
          generatedAt: new Date().toISOString(),
        },
      });

      setPublished(true);
      if (onProductPublished) onProductPublished(newProd);
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish product: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Intelligent Product Taxonomy Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          AI Product Tag & Category Predictor
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          Provides automated zero-friction seller onboarding. Input raw product titles and bullet points; the AI model analyzes and predicts exact taxonomy, tags, SEO keywords, attributes, and optimal marketplace pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 5 Cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Product Metadata Input
          </h3>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="e.g. Logitech"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Color / Finish</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="e.g. Matte Black"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Raw Bullet Points / Features
              </label>
              <textarea
                rows={3}
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder="Paste product specs, dimensions, material, battery..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Audience</label>
                <input
                  type="text"
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  placeholder="e.g. Professionals"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Material</label>
                <input
                  type="text"
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                  placeholder="e.g. Aluminum alloy"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Predict Taxonomy & Tags</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Preview: 7 Cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Gemini Prediction Results
              </h3>
              {prediction && (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Confidence: {Math.round((prediction.confidence?.category || 0.96) * 100)}%
                </span>
              )}
            </div>

            {!prediction && !loading && (
              <div className="py-16 text-center text-slate-400">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Ready to Analyze</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Click &ldquo;Predict Taxonomy &amp; Tags&rdquo; to test the live AI model output and inspect predicted categories, tags, and suggested prices.
                </p>
              </div>
            )}

            {loading && (
              <div className="py-16 text-center text-indigo-600 animate-pulse">
                <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold">Running Gemini Semantic Classification...</p>
                <p className="text-xs text-slate-400 mt-1">Extracting taxonomy, facets, and market keywords</p>
              </div>
            )}

            {prediction && (
              <div className="space-y-5 animate-in fade-in">
                {/* Category & Subcategory */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                      Predicted Category
                    </span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">
                      {prediction.category}
                    </span>
                  </div>
                  <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100">
                    <span className="text-[10px] uppercase font-bold text-purple-700 block">
                      Predicted Subcategory
                    </span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">
                      {prediction.subcategory}
                    </span>
                  </div>
                </div>

                {/* Pricing Recommendation */}
                {prediction.pricing && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Market Price Range
                      </span>
                      <span className="font-medium text-slate-700">
                        ₹{prediction.pricing.minPrice?.toLocaleString()} &ndash; ₹{prediction.pricing.maxPrice?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                        Suggested Retail Price
                      </span>
                      <span className="text-base font-bold text-emerald-700">
                        ₹{prediction.pricing.suggestedPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Predicted Tags */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    Predicted Product Tags ({prediction.tags?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prediction.tags?.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-full font-medium transition-colors"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SEO Keywords */}
                {prediction.keywords && prediction.keywords.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1.5">
                      Search Engine Keywords
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prediction.keywords.map((k, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* SEO Description */}
                {prediction.seoDescription && (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      Generated Marketing Description
                    </span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                      {prediction.seoDescription}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 1-Click Publish Action */}
          {prediction && (
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
              {published ? (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-4 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully Published to Marketplace Catalog!</span>
                </div>
              ) : (
                <>
                  <span className="text-xs text-slate-400">
                    Ready to publish this AI-classified listing?
                  </span>
                  <button
                    onClick={handlePublishToCatalog}
                    disabled={publishing}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    {publishing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Publish to Live Catalog</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
