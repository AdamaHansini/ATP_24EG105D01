// backend/src/services/wishlistService.js
import { Wishlist, Product, Cart, Inventory } from '../models/index.js';
import { toPlain } from '../utils/toPlain.js';

export async function getUserWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  // Populate product details for frontend
  const populatedProducts = [];
  for (const item of (wishlist.products || [])) {
    const itemPlain = toPlain(item);
    const p = await Product.findById(itemPlain.productId || itemPlain.product);
    if (p) {
      populatedProducts.push({
        ...itemPlain,
        product: toPlain(p),
      });
    }
  }

  const plainWishlist = toPlain(wishlist);
  return {
    ...plainWishlist,
    products: populatedProducts,
  };
}

export async function addToWishlist(userId, productId) {
  const product = await Product.findById(productId);
  if (!product || product.status !== 'active') {
    const error = new Error('Product not found');
    error.statusCode = 404;
    error.errorCode = 'PRODUCT_NOT_FOUND';
    throw error;
  }
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  const exists = (wishlist.products || []).some(p => String(p.productId || p.product) === String(productId));
  if (exists) {
    return wishlist;
  }

  const newProductEntry = {
    productId: String(productId),
    addedAt: new Date().toISOString(),
    savedPrice: product.price,
  };

  await Wishlist.findByIdAndUpdate(wishlist._id, {
    $push: { products: newProductEntry }
  });

  return await getUserWishlist(userId);
}

export async function removeFromWishlist(userId, productId) {
  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) return { products: [] };

  const updatedProducts = (wishlist.products || []).filter(p => String(p.productId || p.product) !== String(productId));

  await Wishlist.findByIdAndUpdate(wishlist._id, {
    $set: { products: updatedProducts }
  });

  return await getUserWishlist(userId);
}

export async function moveWishlistItemToCart(userId, productId) {
  const product = await Product.findById(productId);
  if (!product || product.status !== 'active') {
    const error = new Error('Product not found');
    error.statusCode = 404;
    error.errorCode = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  const inventory = await Inventory.findOne({ product: productId });
  const availableStock = inventory ? inventory.availableStock : Number(product.inventory || 0);
  if (availableStock < 1) {
    const error = new Error('This product is currently out of stock');
    error.statusCode = 409;
    error.errorCode = 'INSUFFICIENT_STOCK';
    throw error;
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const existingItem = (cart.items || []).find(i => String(i.productId) === String(productId));
  if (existingItem) {
    if (existingItem.quantity + 1 > availableStock || existingItem.quantity >= 100) {
      const error = new Error(`Only ${availableStock} items are available in stock`);
      error.statusCode = 409;
      error.errorCode = 'INSUFFICIENT_STOCK';
      throw error;
    }
    existingItem.quantity += 1;
    await Cart.findByIdAndUpdate(cart._id, { $set: { items: cart.items } });
  } else {
    const newItem = {
      productId: String(productId),
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: 1,
      seller: product.seller ? String(product.seller) : '',
      sellerName: product.storeName || 'Seller',
    };
    await Cart.findByIdAndUpdate(cart._id, { $push: { items: newItem } });
  }

  await removeFromWishlist(userId, productId);

  return { success: true };
}
