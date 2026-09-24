// backend/src/ai/recommendationService.js
import { Product, Wishlist, BrowsingHistory, Inventory } from '../models/index.js';

export async function getRecommendationsForUser(userId, currentProductId = null) {
  let targetCategory = null;
  let targetTags = [];

  if (currentProductId) {
    const current = await Product.findById(currentProductId);
    if (current) {
      targetCategory = current.category;
      targetTags = current.tags || [];
    }
  }

  if (!targetCategory && userId) {
    const history = await BrowsingHistory.find({ user: userId });
    const lastViewed = history.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))[0];
    if (lastViewed) {
      const viewedProduct = await Product.findById(lastViewed.product);
      if (viewedProduct) {
        targetCategory = viewedProduct.category;
        targetTags = viewedProduct.tags || [];
      }
    }
    const wishlist = await Wishlist.findOne({ user: userId });

    if (wishlist && wishlist.products?.length > 0) {
      const wishProduct = await Product.findById(wishlist.products[0].productId);
      if (wishProduct) targetCategory = wishProduct.category;
    }
  }

  const allProducts = await Product.find({ status: 'active' });
  const filtered = allProducts.filter(p => String(p._id) !== String(currentProductId));

  // Score products based on category match, tags overlap, and rating
  const scored = filtered.map(product => {
    let score = Number(product.rating || 0) * 2;
    if (targetCategory && product.category === targetCategory) score += 10;
    if (product.tags && targetTags.length > 0) {
      const overlap = product.tags.filter(t => targetTags.includes(t)).length;
      score += overlap * 3;
    }
    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const available = [];
  for (const candidate of scored) {
    const inventory = await Inventory.findOne({ product: candidate.product._id });
    const stock = inventory ? inventory.availableStock : Number(candidate.product.inventory || 0);
    if (stock > 0) available.push(candidate.product);
    if (available.length === 8) break;
  }
  return available;
}
