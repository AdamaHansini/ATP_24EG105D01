// backend/src/services/checkoutService.js
import mongoose from 'mongoose';
import { Order, SellerOrder, Cart, Product, Coupon } from '../models/index.js';
import { reserveInventory, releaseInventory, validateStock } from './inventoryService.js';

export async function processMultiVendorCheckout({
  customerId,
  cartItems = [],
  shippingAddress,
  paymentDetails,
  couponCode,
  simulateSellerFailure = false,
}) {
  if (!cartItems || cartItems.length === 0) {
    const err = new Error('Your cart is empty. Add items to cart before proceeding to checkout.');
    err.errorCode = 'EMPTY_CART';
    err.statusCode = 400;
    throw err;
  }

  // 1. Validate all items against database for current price, stock, and seller
  const validatedItems = [];
  for (const item of cartItems) {
    const productId = String(item.productId || item._id || item.product);
    const quantity = Math.max(1, Number(item.quantity) || 1);

    const product = await Product.findById(productId);
    if (!product || product.status === 'archived') {
      const err = new Error(`Product "${item.name || productId}" is no longer available.`);
      err.errorCode = 'PRODUCT_UNAVAILABLE';
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
      sellerName: product.storeName || item.sellerName || 'Verified Partner Store',
      variant: item.variant || null,
      subtotal: Number(product.price) * quantity,
    });
  }

  // 2. Validate Coupon server-side if provided
  let discountAmount = 0;
  let appliedCouponCode = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase().trim(),
      status: 'active',
    });
    if (coupon) {
      const rawSubtotal = validatedItems.reduce((acc, i) => acc + i.subtotal, 0);
      if (!coupon.minOrder || rawSubtotal >= coupon.minOrder) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((rawSubtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = Math.min(rawSubtotal, coupon.discountValue || 0);
        }
        appliedCouponCode = coupon.code;
      }
    }
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

  const reservedItems = [];

  try {
    // 5. Reserve inventory atomically
    for (const item of validatedItems) {
      await reserveInventory(item.productId, item.quantity, session);
      reservedItems.push({ productId: item.productId, quantity: item.quantity });
    }

    // 6. Determine Payment Status and Method
    const paymentStatus = paymentDetails?.status === 'paid' ? 'paid' : 'pending';
    const paymentMethod = paymentDetails?.method || 'Pay on Delivery';

    // 7. Create Parent Order
    const totalCartAmount = validatedItems.reduce((acc, i) => acc + i.subtotal, 0);
    const finalAmount = Math.max(0, totalCartAmount - discountAmount);
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [parentOrder] = await Order.create(
      [
        {
          orderNumber,
          customer: customerId,
          items: validatedItems,
          totalAmount: finalAmount,
          discountAmount,
          couponApplied: appliedCouponCode,
          paymentStatus,
          paymentDetails: {
            method: paymentMethod,
            status: paymentStatus,
            transactionId: paymentDetails?.transactionId || `TXN-${Date.now()}`,
          },
          shippingAddress: shippingAddress || {},
          status: 'CONFIRMED',
          sellerOrders: [],
        },
      ],
      { session }
    );

    // 8. Create partitioned Seller Orders
    const createdSellerOrders = [];
    for (let i = 0; i < sellerIds.length; i++) {
      const sId = sellerIds[i];
      const group = sellerGroups[sId];

      // Simulated fault injection test hook
      if (simulateSellerFailure && (i >= 2 || (sellerIds.length <= 2 && i === 1))) {
        const err = new Error(`Simulated vendor fulfillment failure for: ${group.sellerName}`);
        err.errorCode = 'CHECKOUT_TRANSACTION_FAILED';
        throw err;
      }

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

    // 9. Commit Transaction atomically
    await session.commitTransaction();
    session.endSession();

    // Clear cart on successful commit
    if (customerId) {
      await Cart.updateOne({ user: customerId }, { $set: { items: [] } });
    }

    return {
      success: true,
      message:
        paymentStatus === 'paid'
          ? 'Order placed and payment processed successfully.'
          : 'Order created successfully! Payment is pending.',
      data: {
        order: parentOrder,
        sellerOrders: createdSellerOrders,
      },
    };
  } catch (error) {
    // 10. Rollback transaction and restore inventory
    try {
      await session.abortTransaction();
    } catch (_) {
      // Ignore abort errors
    }
    session.endSession();

    // Release any inventory that was reserved prior to failure
    for (const item of reservedItems) {
      try {
        await releaseInventory(item.productId, item.quantity);
      } catch (_) {
        // Individual release failure ignored — stock will be reconciled
      }
    }

    const customError = new Error(
      error.errorCode === 'CHECKOUT_TRANSACTION_FAILED'
        ? error.message
        : "Checkout couldn't be completed. No inventory was permanently deducted."
    );
    customError.errorCode = 'CHECKOUT_TRANSACTION_FAILED';
    customError.statusCode = 400;
    customError.originalMessage = error.message;
    throw customError;
  }
}
