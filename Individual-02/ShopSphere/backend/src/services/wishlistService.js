// backend/src/services/wishlistService.js
import { Wishlist, Product, Cart } from '../models/index.js';
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
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  const exists = (wishlist.products || []).some(p => String(p.productId || p.product) === String(productId));
  if (exists) {
    return wishlist;
  }

  const product = await Product.findById(productId);
  const newProductEntry = {
    productId: String(productId),
    addedAt: new Date().toISOString(),
    savedPrice: product ? product.price : 0,
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
  await removeFromWishlist(userId, productId);
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const existingItem = (cart.items || []).find(i => String(i.productId) === String(productId));
  if (existingItem) {
    existingItem.quantity += 1;
    await Cart.findByIdAndUpdate(cart._id, { $set: { items: cart.items } });
  } else {
    const newItem = {
      productId: String(productId),
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: 1,
      seller: product.seller || 'seller_1',
      sellerName: product.storeName || 'Certified Vendor',
    };
    await Cart.findByIdAndUpdate(cart._id, { $push: { items: newItem } });
  }

  return { success: true };
}
