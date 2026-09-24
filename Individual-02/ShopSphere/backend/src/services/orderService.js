// backend/src/services/orderService.js
import { Order, SellerOrder, Inventory, Delivery, Return, Notification, Dispute } from '../models/index.js';

const VALID_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  RETURNED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export async function updateOrderStatus(orderId, newStatus, isSellerOrder = false) {
  const Model = isSellerOrder ? SellerOrder : Order;
  const order = await Model.findById(orderId);
  if (!order) throw new Error('Order not found');

  const allowed = VALID_STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus) && newStatus !== order.status) {
    throw new Error(`Invalid status transition from ${order.status} to ${newStatus}. Allowed: ${allowed.join(', ')}`);
  }

  const updated = await Model.findByIdAndUpdate(orderId, {
    $set: { status: newStatus }
  }, { new: true });

  return updated;
}

export async function cancelOrder(orderId, reason = 'Customer request') {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');
  if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
    throw new Error('Order is already in transit or delivered and cannot be cancelled directly.');
  }
  if (!['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED'].includes(order.status)) {
    throw new Error(`Order status ${order.status} cannot be cancelled.`);
  }
  const session = await Order.startSession();
  try {
    await session.withTransaction(async () => {
      await Order.findByIdAndUpdate(orderId, { $set: { status: 'CANCELLED', cancellationReason: reason } }, { session });
      if (order.sellerOrders?.length) {
        await SellerOrder.updateMany({ _id: { $in: order.sellerOrders } }, { $set: { status: 'CANCELLED' } }, { session });
        await Delivery.updateMany(
          { sellerOrder: { $in: order.sellerOrders }, status: { $nin: ['Delivered', 'Failed Delivery'] } },
          { $set: { status: 'Failed Delivery' } },
          { session }
        );
      }
      for (const item of order.items || []) {
        const productId = String(item.productId || item.product || '');
        const quantity = Number(item.quantity || 0);
        if (productId && quantity > 0) {
          await Inventory.updateOne(
            { product: productId, reservedStock: { $gte: quantity } },
            { $inc: { reservedStock: -quantity, availableStock: quantity } },
            { session }
          );
        }
      }
    });
  } finally {
    await session.endSession();
  }
  return { success: true, message: 'Order cancelled successfully' };
}

export async function requestOrderReturn({ orderId, userId, reason }) {
  if (typeof reason !== 'string' || !reason.trim()) {
    const error = new Error('A reason is required for the return request.');
    error.statusCode = 400;
    error.errorCode = 'RETURN_REASON_REQUIRED';
    throw error;
  }
  const order = await Order.findOne({ _id: orderId, customer: userId });
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    error.errorCode = 'ORDER_NOT_FOUND';
    throw error;
  }
  if (order.status !== 'DELIVERED') {
    const error = new Error('Returns can be requested only after delivery.');
    error.statusCode = 409;
    error.errorCode = 'ORDER_NOT_DELIVERED';
    throw error;
  }
  const existingReturn = await Return.findOne({ order: order._id, user: userId, status: { $ne: 'Rejected' } });
  if (existingReturn) {
    const error = new Error('A return request already exists for this order.');
    error.statusCode = 409;
    error.errorCode = 'RETURN_ALREADY_REQUESTED';
    throw error;
  }

  const createdReturn = await Return.create({ order: order._id, user: userId, reason: reason.trim(), amount: order.totalAmount });
  await Order.findByIdAndUpdate(order._id, { $set: { status: 'RETURN_REQUESTED' } });
  await SellerOrder.updateMany({ parentOrder: order._id }, { $set: { status: 'RETURN_REQUESTED' } });
  await Dispute.create({
    order: order._id,
    customer: userId,
    reason: reason.trim(),
    returnRequest: createdReturn._id,
    status: 'OPEN',
    messages: [{ senderRole: 'customer', content: `Return request: ${reason.trim()}`, timestamp: new Date() }],
  });
  await Notification.create({
    user: userId,
    type: 'ORDER_STATUS',
    title: 'Return requested',
    message: `Return requested for order ${order.orderNumber}.`,
    metadata: { orderId: String(order._id), status: 'RETURN_REQUESTED' },
  });
  return createdReturn;
}
