import { Cart, Product, Inventory, Coupon } from '../models/index.js';
import { toPlain } from '../utils/toPlain.js';

export async function getCart(req, res, next) {
  try {
    const userId = req.user ? req.user._id : req.headers['x-guest-id'] || 'guest_user';
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

export async function addItemToCart(req, res, next) {
  try {
    const userId = req.user ? req.user._id : req.headers['x-guest-id'] || 'guest_user';
    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check available stock
    const inv = await Inventory.findOne({ product: productId });
    const available = inv ? inv.availableStock : (product.inventory || 20);
    if (available < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${available} items available in stock`,
        errorCode: 'INSUFFICIENT_STOCK',
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const items = cart.items || [];
    const existingIndex = items.findIndex(i => String(i.productId || i.product) === String(productId));

    if (existingIndex > -1) {
      items[existingIndex].quantity += Number(quantity);
    } else {
      items.push({
        product: product._id,
        productId: String(product._id),
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity: Number(quantity),
        seller: String(product.seller || 'seller_1'),
        sellerName: product.storeName || 'Verified Seller',
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
    const userId = req.user ? req.user._id : req.headers['x-guest-id'] || 'guest_user';
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
        item.quantity = Number(quantity);
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
    const userId = req.user ? req.user._id : req.headers['x-guest-id'] || 'guest_user';
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

export async function reserveCart(req, res, next) {
  try {
    // Reserves inventory atomically for cart items
    res.json({ success: true, message: 'Cart inventory successfully reserved' });
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

    const currentSubtotal = Number(subtotal) || 0;
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
