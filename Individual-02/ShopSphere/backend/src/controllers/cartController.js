import { Cart, Product, Inventory, Coupon } from '../models/index.js';
import { toPlain } from '../utils/toPlain.js';

function getCartOwner(req) {
  if (req.user?._id) return String(req.user._id);
  const guestId = String(req.headers['x-guest-id'] || '').trim();
  return /^[a-zA-Z0-9_-]{16,128}$/.test(guestId) ? `guest:${guestId}` : null;
}

export async function getCart(req, res, next) {
  try {
    const userId = getCartOwner(req);
    if (!userId) return res.status(400).json({ success: false, message: 'A guest cart session is required' });
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.json({
      success: true,
      message: 'Cart retrieved',
      data: { cart },
    });
  } catch (err) {
    next(err);
  }
}

export async function mergeGuestCart(req, res, next) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: 'Sign in to merge your cart' });
    const guestOwner = getCartOwner({ headers: req.headers, user: null });
    if (!guestOwner) return res.status(400).json({ success: false, message: 'A guest cart session is required' });

    const guestCart = await Cart.findOne({ user: guestOwner });
    if (!guestCart || guestCart.items.length === 0) {
      return res.json({ success: true, message: 'No guest cart items to merge' });
    }

    const userId = String(req.user._id);
    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) userCart = await Cart.create({ user: userId, items: [] });
    const mergedItems = (userCart.items || []).map((item) => ({ ...toPlain(item) }));
    const remainingGuestItems = [];
    let skippedCount = 0;

    for (const guestItem of guestCart.items) {
      const productId = String(guestItem.productId || guestItem.product || '');
      const product = await Product.findById(productId);
      if (!product || product.status !== 'active') {
        skippedCount += 1;
        remainingGuestItems.push(toPlain(guestItem));
        continue;
      }
      if (product.seller) {
        const { Seller, Store } = await import('../models/index.js');
        const seller = await Seller.findById(product.seller);
        const store = product.store ? await Store.findById(product.store) : null;
        if (!seller || seller.status !== 'approved' || !store || store.status !== 'active') {
          skippedCount += 1;
          remainingGuestItems.push(toPlain(guestItem));
          continue;
        }
      }

      const inventory = await Inventory.findOne({ product: productId });
      const available = inventory ? inventory.availableStock : (product.inventory ?? 0);
      const existing = mergedItems.find((item) => String(item.productId || item.product) === productId);
      const desiredQuantity = Math.min(100, Number(guestItem.quantity || 1) + (existing ? Number(existing.quantity || 0) : 0));
      if (desiredQuantity > available) {
        skippedCount += 1;
        remainingGuestItems.push(toPlain(guestItem));
        continue;
      }

      if (existing) {
        existing.quantity = desiredQuantity;
        existing.price = product.price;
      } else {
        mergedItems.push({
          product: product._id,
          productId,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          quantity: Math.min(100, Number(guestItem.quantity || 1)),
          seller: product.seller ? String(product.seller) : '',
          sellerName: product.storeName || 'Seller',
          variant: guestItem.variant,
        });
      }
    }

    await Cart.findByIdAndUpdate(userCart._id, { $set: { items: mergedItems } });
    await Cart.findByIdAndUpdate(guestCart._id, { $set: { items: remainingGuestItems } });
    res.json({ success: true, data: { mergedCount: mergedItems.length, skippedCount, remainingCount: remainingGuestItems.length } });
  } catch (err) {
    next(err);
  }
}

export async function addItemToCart(req, res, next) {
  try {
    const userId = getCartOwner(req);
    if (!userId) return res.status(400).json({ success: false, message: 'A guest cart session is required' });
    const { productId, quantity = 1, variant } = req.body;
    const requestedQuantity = Number(quantity);
    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > 100) {
      return res.status(400).json({ success: false, message: 'Quantity must be a whole number between 1 and 100' });
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller) {
      const { Seller, Store } = await import('../models/index.js');
      const seller = await Seller.findById(product.seller);
      const store = product.store ? await Store.findById(product.store) : null;
      if (!seller || seller.status !== 'approved' || !store || store.status !== 'active') {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const items = cart.items || [];
    const existingIndex = items.findIndex(i => String(i.productId || i.product) === String(productId));
    const inv = await Inventory.findOne({ product: productId });
    const available = inv ? inv.availableStock : (product.inventory ?? 0);
    const requestedTotal = requestedQuantity + (existingIndex > -1 ? Number(items[existingIndex].quantity) : 0);
    if (requestedTotal > available || requestedTotal > 100) {
      return res.status(400).json({
        success: false,
        message: `Only ${available} items are available in stock`,
        errorCode: 'INSUFFICIENT_STOCK',
      });
    }

    if (existingIndex > -1) {
      items[existingIndex].quantity = requestedTotal;
    } else {
      items.push({
        product: product._id,
        productId: String(product._id),
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity: requestedQuantity,
        seller: product.seller ? String(product.seller) : '',
        sellerName: product.storeName || 'Seller',
        variant,
      });
    }

    await Cart.findByIdAndUpdate(cart._id, { $set: { items } });
    const updatedCart = await Cart.findById(cart._id);

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cart: updatedCart },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const userId = getCartOwner(req);
    if (!userId) return res.status(400).json({ success: false, message: 'A guest cart session is required' });
    const itemId = req.params.id;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const items = cart.items || [];
    const item = items.find(i => String(i._id || i.productId) === String(itemId));
    if (item) {
      if (quantity <= 0) {
        cart.items = items.filter(i => String(i._id || i.productId) !== String(itemId));
      } else {
        const nextQuantity = Number(quantity);
        if (!Number.isInteger(nextQuantity) || nextQuantity > 100) {
          return res.status(400).json({ success: false, message: 'Quantity must be a whole number of 100 or less' });
        }
        const product = await Product.findById(item.productId || item.product);
        if (!product || product.status !== 'active') {
          return res.status(404).json({ success: false, message: 'Product is no longer available' });
        }
        const inventory = await Inventory.findOne({ product: item.productId || item.product });
        const available = inventory ? inventory.availableStock : (product?.inventory ?? 0);
        if (nextQuantity > available) {
          return res.status(400).json({ success: false, message: `Only ${available} items are available in stock` });
        }
        item.quantity = nextQuantity;
      }
      await Cart.findByIdAndUpdate(cart._id, { $set: { items: cart.items } });
    }

    res.json({ success: true, message: 'Cart updated', data: { cart } });
  } catch (err) {
    next(err);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const userId = getCartOwner(req);
    if (!userId) return res.status(400).json({ success: false, message: 'A guest cart session is required' });
    const itemId = req.params.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const items = (cart.items || []).filter(i => String(i._id || i.productId) !== String(itemId));
    await Cart.findByIdAndUpdate(cart._id, { $set: { items } });

    const plainCart = toPlain(cart);
    res.json({ success: true, message: 'Item removed from cart', data: { cart: { ...plainCart, items } } });
  } catch (err) {
    next(err);
  }
}

export async function validateCoupon(req, res, next) {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim(), status: 'active' });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const now = new Date();
    if ((coupon.startDate && coupon.startDate > now) || (coupon.expiryDate && coupon.expiryDate < now) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const currentSubtotal = Number(subtotal);
    if (!Number.isFinite(currentSubtotal) || currentSubtotal < 0) {
      return res.status(400).json({ success: false, message: 'A valid subtotal is required' });
    }
    if (coupon.minOrder && currentSubtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.minOrder.toLocaleString()} required for this coupon`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((currentSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(currentSubtotal, coupon.discountValue || 0);
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied!`,
      data: {
        code: coupon.code,
        discountAmount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (err) {
    next(err);
  }
}
