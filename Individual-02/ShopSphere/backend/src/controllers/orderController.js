// backend/src/controllers/orderController.js
import { processMultiVendorCheckout } from '../services/checkoutService.js';
import { updateOrderStatus, cancelOrder, requestOrderReturn } from '../services/orderService.js';
import { Order, SellerOrder, Delivery, Seller, Store } from '../models/index.js';

export async function checkout(req, res, next) {
  try {
    // Customer identity comes from the verified JWT — never from the request body
    const customerId = req.user._id;
    const {
      shippingAddress,
      couponCode,
      paymentMethod,
    } = req.body;

    if (paymentMethod !== 'COD') {
      return res.status(400).json({ success: false, message: 'Cash on Delivery (COD) is the only supported payment method.', errorCode: 'INVALID_PAYMENT_METHOD' });
    }

    const result = await processMultiVendorCheckout({
      customerId,
      shippingAddress,
      couponCode,
      paymentMethod,
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
      const sellerDoc = await Seller.findOne({ user: userId });
      if (sellerDoc) {
        const store = await Store.findOne({ seller: sellerDoc._id });
        if (!store || store.status !== 'active') return res.json({ success: true, data: { orders: [] } });
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

    if (req.user.role === 'customer' && String(order.customer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied to this order', errorCode: 'FORBIDDEN_ORDER_ACCESS' });
    }
    if (req.user.role === 'delivery') {
      const assigned = await Delivery.find({ parentOrder: order._id, assignedTo: req.user._id });
      if (!assigned.length) return res.status(403).json({ success: false, message: 'Access denied to this order' });
      return res.json({ success: true, data: { order, deliveries: toPlain(assigned) } });
    }

    let sellerOrders = await SellerOrder.find({ parentOrder: order._id });
    if (req.user.role === 'seller') {
      const seller = await Seller.findOne({ user: req.user._id });
      if (!seller) return res.status(403).json({ success: false, message: 'Seller account not found' });
      const store = await Store.findOne({ seller: seller._id });
      if (!store || store.status !== 'active') return res.status(403).json({ success: false, message: 'Seller account is awaiting approval' });
      sellerOrders = sellerOrders.filter((sellerOrder) => String(sellerOrder.seller) === String(seller._id));
      if (!sellerOrders.length) return res.status(403).json({ success: false, message: 'Access denied to this order' });
    }
    let deliveries = await Delivery.find({ sellerOrder: { $in: sellerOrders.map((so) => so._id) } });
    if (req.user.role === 'delivery') {
      deliveries = deliveries.filter((delivery) => String(delivery.assignedTo) === String(req.user._id));
      if (!deliveries.length) return res.status(403).json({ success: false, message: 'Access denied to this order' });
      sellerOrders = sellerOrders.filter((sellerOrder) => deliveries.some((delivery) => String(delivery.sellerOrder) === String(sellerOrder._id)));
    }

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
    if (isSellerOrder) {
      return res.status(400).json({ success: false, message: 'Seller orders must be updated through the seller workflow.' });
    }
    if (!['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }
    const updated = await updateOrderStatus(req.params.id, status, isSellerOrder);
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
    const order = await Order.findById(updated._id);
    if (order) {
      await Notification.create({
        user: order.customer,
        type: 'ORDER_STATUS',
        title: 'Order status updated',
        message: `Order ${order.orderNumber} is now ${status.toLowerCase().replaceAll('_', ' ')}.`,
        metadata: { orderId: String(order._id), status },
      });
    }
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

    if (String(order.paymentStatus).toUpperCase() === 'PAID') {
      return res.status(409).json({
        success: false,
        message: 'This paid order cannot be cancelled through self-service. Contact support to request a refund.',
        errorCode: 'PAID_ORDER_SUPPORT_REQUIRED',
      });
    }

    const result = await cancelOrder(req.params.id, reason);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
}

export async function requestReturn(req, res, next) {
  try {
    const createdReturn = await requestOrderReturn({
      orderId: req.params.id,
      userId: req.user._id,
      reason: req.body.reason,
    });
    res.status(201).json({ success: true, message: 'Return request submitted', data: { returnRequest: createdReturn } });
  } catch (err) {
    next(err);
  }
}
