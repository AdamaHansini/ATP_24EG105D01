// backend/src/services/orderService.js
import { Order, SellerOrder, Delivery } from '../models/index.js';

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
  });

  return updated;
}

export async function cancelOrder(orderId, reason = 'Customer request') {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');
  if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
    throw new Error('Order is already in transit or delivered and cannot be cancelled directly.');
  }

  await Order.findByIdAndUpdate(orderId, { $set: { status: 'CANCELLED' } });
  if (order.sellerOrders) {
    for (const sId of order.sellerOrders) {
      await SellerOrder.findByIdAndUpdate(sId, { $set: { status: 'CANCELLED' } });
    }
  }
  return { success: true, message: 'Order cancelled successfully' };
}
