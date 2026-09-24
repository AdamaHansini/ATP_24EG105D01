// backend/src/services/checkoutService.js
import mongoose from 'mongoose';
import { Order, SellerOrder, Cart, Product, Seller, Store, Coupon, Notification } from '../models/index.js';
import { createCODPayment } from './paymentService.js';
import { reserveInventory, validateStock } from './inventoryService.js';

export async function processMultiVendorCheckout({
  customerId,
  shippingAddress,
  couponCode,
  paymentMethod,
}) {
  const cart = await Cart.findOne({ user: customerId });
  const cartItems = cart?.items || [];
  if (!cartItems || cartItems.length === 0) {
    const err = new Error('Your cart is empty. Add items to cart before proceeding to checkout.');
    err.errorCode = 'EMPTY_CART';
    err.statusCode = 400;
    throw err;
  }

  const requiredAddressFields = ['fullName', 'phone', 'street', 'city', 'state', 'postalCode', 'country'];
  if (!shippingAddress || requiredAddressFields.some((field) => !String(shippingAddress[field] || '').trim())) {
    const err = new Error('Complete all shipping address fields before placing your order.');
    err.errorCode = 'INVALID_SHIPPING_ADDRESS';
    err.statusCode = 400;
    throw err;
  }

  // 1. Validate all items against database for current price, stock, and seller
  const validatedItems = [];
  for (const item of cartItems) {
    const productId = String(item.productId || item._id || item.product);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      const err = new Error('Each cart quantity must be a whole number between 1 and 100.');
      err.errorCode = 'INVALID_QUANTITY';
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      const err = new Error(`Product "${item.name || productId}" is no longer available.`);
      err.errorCode = 'PRODUCT_UNAVAILABLE';
      err.statusCode = 400;
      throw err;
    }
    const seller = product.seller ? await Seller.findById(product.seller) : null;
    if (!seller || seller.status !== 'approved') {
      const err = new Error(`Product "${product.name}" is not currently available from an approved seller.`);
      err.errorCode = 'SELLER_UNAVAILABLE';
      err.statusCode = 400;
      throw err;
    }
    const store = product.store ? await Store.findById(product.store) : null;
    if (!store || store.status !== 'active') {
      const err = new Error(`Product "${product.name}" is not available from an active store.`);
      err.errorCode = 'STORE_UNAVAILABLE';
      err.statusCode = 400;
      throw err;
    }

    const stockCheck = await validateStock(productId, quantity);
    if (!stockCheck.isAvailable) {
      const err = new Error(`Insufficient stock for "${product.name}". Available: ${stockCheck.availableStock}, Requested: ${quantity}`);
      err.errorCode = 'INSUFFICIENT_STOCK';
      err.statusCode = 400;
      throw err;
    }

    validatedItems.push({
      product: product._id,
      productId: String(product._id),
      name: product.name,
      price: Number(product.price), // Always use DB price
      image: product.images?.[0] || item.image || '',
      quantity,
      seller: String(product.seller || ''),
      sellerName: product.storeName || 'Seller',
      variant: item.variant || null,
      subtotal: Number(product.price) * quantity,
    });
  }

  // 2. Validate Coupon server-side if provided
  let discountAmount = 0;
  let appliedCouponCode = null;
  let applicableCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase().trim(),
      status: 'active',
    });
    const now = new Date();
    if (!coupon || (coupon.startDate && coupon.startDate > now) || (coupon.expiryDate && coupon.expiryDate < now) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) {
      const err = new Error('This coupon is invalid, expired, or no longer available.');
      err.errorCode = 'COUPON_UNAVAILABLE';
      err.statusCode = 400;
      throw err;
    }

    const rawSubtotal = validatedItems.reduce((acc, i) => acc + i.subtotal, 0);
    if (coupon.minOrder && rawSubtotal < coupon.minOrder) {
      const err = new Error('The cart subtotal does not meet this coupon’s minimum order requirement.');
      err.errorCode = 'COUPON_MINIMUM_NOT_MET';
      err.statusCode = 400;
      throw err;
    }

    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((rawSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
    } else {
      discountAmount = Math.min(rawSubtotal, coupon.discountValue || 0);
    }
    applicableCoupon = coupon;
    appliedCouponCode = coupon.code;
  }

  // 3. Group verified items by seller
  const sellerGroups = {};
  for (const item of validatedItems) {
    const sId = item.seller;
    if (!sellerGroups[sId]) {
      sellerGroups[sId] = {
        sellerId: sId,
        sellerName: item.sellerName,
        items: [],
        subtotal: 0,
      };
    }
    sellerGroups[sId].items.push(item);
    sellerGroups[sId].subtotal += item.subtotal;
  }
  const sellerIds = Object.keys(sellerGroups);

  // 4. Begin atomic MongoDB transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 5. Reserve inventory atomically
    for (const item of validatedItems) {
      await reserveInventory(item.productId, item.quantity, session);
    }

    if (applicableCoupon) {
      const now = new Date();
      const couponFilter = {
        _id: applicableCoupon._id,
        status: 'active',
        $and: [
          { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }] },
          ...(applicableCoupon.usageLimit ? [{ usedCount: { $lt: applicableCoupon.usageLimit } }] : []),
        ],
      };
      const couponUpdate = await Coupon.updateOne(couponFilter, { $inc: { usedCount: 1 } }, { session });
      if (couponUpdate.modifiedCount !== 1) {
        const err = new Error('This coupon was just used up. Choose another coupon.');
        err.errorCode = 'COUPON_UNAVAILABLE';
        err.statusCode = 409;
        throw err;
      }
    }

    // 6. Determine Payment Status and Method
    const requestedPaymentMethod = paymentMethod;
    if (requestedPaymentMethod !== 'COD') {
      const err = new Error('Select a supported payment method.');
      err.statusCode = 400;
      err.errorCode = 'INVALID_PAYMENT_METHOD';
      throw err;
    }
    const paymentMethod = requestedPaymentMethod;
    const paymentStatus = 'PENDING';

    // 7. Create Parent Order
    const totalCartAmount = validatedItems.reduce((acc, i) => acc + i.subtotal, 0);
    const shippingFee = totalCartAmount > 5000 ? 0 : 99;
    const taxableAmount = Math.max(0, totalCartAmount - discountAmount);
    const taxAmount = Math.round(taxableAmount * 0.05);
    const finalAmount = taxableAmount + shippingFee + taxAmount;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [parentOrder] = await Order.create(
      [
        {
          orderNumber,
          customer: customerId,
          items: validatedItems,
          totalAmount: finalAmount,
          subtotalAmount: totalCartAmount,
          discountAmount,
          shippingFee,
          taxAmount,
          couponApplied: appliedCouponCode,
          paymentStatus,
          paymentMethod,
          paymentDetails: { method: paymentMethod },
          shippingAddress: shippingAddress || {},
          status: 'CONFIRMED',
          sellerOrders: [],
        },
      ],
      { session }
    );

    const payment = await createCODPayment({ order: parentOrder, userId: customerId, session });

    // 8. Create partitioned Seller Orders
    const createdSellerOrders = [];
    for (let i = 0; i < sellerIds.length; i++) {
      const sId = sellerIds[i];
      const group = sellerGroups[sId];

      const platformFee = Math.round(group.subtotal * 0.10);
      const sellerEarnings = group.subtotal - platformFee;

      const [subOrder] = await SellerOrder.create(
        [
          {
            parentOrder: parentOrder._id,
            seller: sId || undefined,
            sellerName: group.sellerName,
            items: group.items,
            subtotal: group.subtotal,
            platformFee,
            shippingFee: 0,
            sellerEarnings,
            status: 'CONFIRMED',
            trackingNumber: `TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          },
        ],
        { session }
      );

      createdSellerOrders.push(subOrder);
    }

    // Link sub-orders to parent order
    await Order.findByIdAndUpdate(
      parentOrder._id,
      { sellerOrders: createdSellerOrders.map((so) => so._id) },
      { session }
    );

    await Cart.updateOne({ user: customerId }, { $set: { items: [] } }, { session });
    await Notification.create([{
      user: customerId,
      type: 'ORDER_STATUS',
      title: 'Order placed',
      message: `Order ${parentOrder.orderNumber} was placed successfully.`,
      metadata: { orderId: String(parentOrder._id), status: parentOrder.status },
    }], { session });

    // 9. Commit Transaction atomically
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: 'Order placed successfully with Cash on Delivery.',
      data: {
        order: parentOrder,
        sellerOrders: createdSellerOrders,
        payment,
      },
    };
  } catch (error) {
    // 10. Aborting the transaction restores all inventory and order writes.
    try {
      await session.abortTransaction();
    } catch (_) {
      // Ignore abort errors
    }
    session.endSession();

    const isClientError = Number(error.statusCode) >= 400 && Number(error.statusCode) < 500;
    if (!isClientError) {
      console.error('[checkout] Database transaction failed:', error.name, error.code, error.message);
    }
    const checkoutError = new Error(
      isClientError ? error.message : 'Checkout could not be completed. Please try again.'
    );
    checkoutError.statusCode = isClientError ? error.statusCode : 500;
    checkoutError.errorCode = error.errorCode || 'CHECKOUT_TRANSACTION_FAILED';
    throw checkoutError;
  }
}
