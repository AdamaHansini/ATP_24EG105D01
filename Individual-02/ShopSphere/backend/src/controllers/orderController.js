// backend/src/controllers/orderController.js
import { processMultiVendorCheckout } from '../services/checkoutService.js';
import { updateOrderStatus, cancelOrder } from '../services/orderService.js';
import { Order, SellerOrder, Delivery } from '../models/index.js';

export async function checkout(req, res, next) {
  try {
    // Customer identity comes from the verified JWT — never from the request body
    const customerId = req.user._id;
    const {
      cartItems,
      shippingAddress,
      paymentDetails,
      couponCode,
      simulateSellerFailure,
    } = req.body;

    const result = await processMultiVendorCheckout({
      customerId,
      cartItems,
      shippingAddress,
      paymentDetails: paymentDetails || {
        status: 'pending',
        method: 'Pay on Delivery',
      },
      couponCode,
      simulateSellerFailure: Boolean(simulateSellerFailure),
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrders(req, res, next) {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let orders = [];
    if (role === 'admin') {
      orders = await Order.find().sort({ createdAt: -1 });
    } else if (role === 'seller') {
      // Return seller sub-orders for this seller's user ID
      // The seller document has seller.user = userId
      const { Seller } = await import('../models/index.js');
      const sellerDoc = await Seller.findOne({ user: userId });
      if (sellerDoc) {
        const sellerOrders = await SellerOrder.find({ seller: sellerDoc._id }).sort({ createdAt: -1 });
        return res.json({ success: true, data: { orders: sellerOrders } });
      }
      return res.json({ success: true, data: { orders: [] } });
    } else {
      orders = await Order.find({ customer: userId }).sort({ createdAt: -1 });
    }

    // Attach sub-orders for customer/admin
    const fullOrders = await Promise.all(
      orders.map(async (o) => {
        const subOrders = await SellerOrder.find({ parentOrder: o._id });
        return {
          ...o.toObject(),
          sellerOrdersList: subOrders.map((so) => so.toObject()),
        };
      })
    );

    res.json({
      success: true,
      message: 'Orders retrieved',
      data: { orders: fullOrders },
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Customers may only see their own orders
    if (req.user.role === 'customer' && String(order.customer) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.',
        errorCode: 'FORBIDDEN_ORDER_ACCESS',
      });
    }

    const sellerOrders = await SellerOrder.find({ parentOrder: order._id });
    const deliveries = await Delivery.find({
      sellerOrder: { $in: sellerOrders.map((so) => so._id) },
    });

    res.json({
      success: true,
      data: {
        order,
        sellerOrders,
        deliveries,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status, isSellerOrder } = req.body;
    const updated = await updateOrderStatus(req.params.id, status, isSellerOrder);
    res.json({ success: true, message: `Status updated to ${status}`, data: { order: updated } });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req, res, next) {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'customer' && String(order.customer) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own orders.',
        errorCode: 'FORBIDDEN_ORDER_ACCESS',
      });
    }

    const result = await cancelOrder(req.params.id, reason);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
}
