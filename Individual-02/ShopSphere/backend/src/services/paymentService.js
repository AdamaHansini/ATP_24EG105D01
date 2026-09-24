import mongoose from 'mongoose';
import { Delivery, Order, Payment, Refund } from '../models/index.js';

function httpError(statusCode, errorCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  return error;
}

export function createCODPayment({ order, userId, session }) {
  return Payment.create([{
    order: order._id,
    user: userId,
    amount: Number(order.totalAmount),
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    transactionReference: null,
  }], { session }).then(([payment]) => payment);
}

export async function markPaymentAsPaid({ orderId, assignedTo, transactionReference = null }) {
  const session = await mongoose.startSession();
  try {
    let payment;
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw httpError(404, 'ORDER_NOT_FOUND', 'Order not found.');
      if (order.paymentMethod !== 'COD') throw httpError(409, 'PAYMENT_METHOD_INVALID', 'Only COD orders can be collected.');
      if (order.paymentStatus === 'PAID') {
        payment = await Payment.findOne({ order: orderId }).session(session);
        return;
      }
      if (order.paymentStatus !== 'PENDING') throw httpError(409, 'PAYMENT_NOT_COLLECTIBLE', 'This order payment cannot be collected.');

      const assignedDelivery = await Delivery.exists({
        parentOrder: orderId,
        assignedTo,
        status: 'Out for Delivery',
      });
      if (!assignedDelivery) throw httpError(403, 'DELIVERY_NOT_ASSIGNED', 'Only the assigned delivery partner may collect this COD payment while out for delivery.');

      const paidAt = new Date();
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId, paymentStatus: 'PENDING', paymentMethod: 'COD' },
        { $set: { paymentStatus: 'PAID', paidAt, transactionReference: transactionReference || null, 'paymentDetails.status': 'PAID' } },
        { new: true, session }
      );
      if (!updatedOrder) throw httpError(409, 'PAYMENT_ALREADY_PROCESSED', 'This payment was already collected.');

      payment = await Payment.findOneAndUpdate(
        { order: orderId, paymentStatus: 'PENDING' },
        { $set: { paymentStatus: 'PAID', paidAt, transactionReference: transactionReference || null } },
        { new: true, session }
      );
      if (!payment) throw httpError(409, 'PAYMENT_RECORD_NOT_FOUND', 'The COD payment record could not be found.');
    });
    return payment;
  } finally {
    await session.endSession();
  }
}

export async function processCODCollection({ delivery, userId, transactionReference = null }) {
  if (String(delivery.assignedTo) !== String(userId)) {
    throw httpError(403, 'DELIVERY_NOT_ASSIGNED', 'This delivery is not assigned to you.');
  }
  if (delivery.status !== 'Out for Delivery') {
    throw httpError(409, 'DELIVERY_NOT_READY', 'COD can be collected only when the order is out for delivery.');
  }
  return markPaymentAsPaid({ orderId: delivery.parentOrder, assignedTo: userId, transactionReference });
}

export async function createRefundRecord({ order, amount = order.totalAmount }) {
  if (String(order.paymentStatus).toUpperCase() !== 'PAID') return null;
  return Refund.create({ order: order._id, user: order.customer, amount: Number(amount), status: 'Refund Processing' });
}
