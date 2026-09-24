import { Delivery, SellerOrder, Order } from '../models/index.js';
import { toPlain } from '../utils/toPlain.js';
import { processCODCollection } from '../services/paymentService.js';

const canAccessDelivery = (delivery, user) => (
  user.role === 'admin' || String(delivery.assignedTo) === String(user._id)
);

export async function getDeliveries(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (req.user.role === 'delivery') {
      filter.assignedTo = req.user._id;
      filter.status = { $in: ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed Delivery'] };
      if (status) filter.status = status;
    }

    const deliveries = await Delivery.find(filter);
    deliveries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const enriched = await Promise.all(deliveries.map(async (delivery) => {
      const order = delivery.parentOrder ? await Order.findById(delivery.parentOrder) : null;
      return { ...toPlain(delivery), orderTotal: Number(order?.totalAmount || 0), paymentMethod: order?.paymentMethod || 'UNSPECIFIED', paymentStatus: String(order?.paymentStatus || 'PENDING').toUpperCase() };
    }));

    res.json({
      success: true,
      data: { deliveries: enriched },
    });
  } catch (err) {
    next(err);
  }
}

export async function getActiveDelivery(req, res, next) {
  try {
    const active = await Delivery.findOne({
      status: { $in: ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'] },
      ...(req.user.role === 'delivery' ? { assignedTo: req.user._id } : {}),
    });

    const order = active?.parentOrder ? await Order.findById(active.parentOrder) : null;
    res.json({
      success: true,
      data: { delivery: active ? { ...toPlain(active), orderTotal: Number(order?.totalAmount || 0), paymentMethod: order?.paymentMethod || 'UNSPECIFIED', paymentStatus: String(order?.paymentStatus || 'PENDING').toUpperCase() } : null },
    });
  } catch (err) {
    next(err);
  }
}

export async function getDeliveryById(req, res, next) {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    if (!canAccessDelivery(delivery, req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied to this delivery' });
    }

    res.json({
      success: true,
      data: { delivery: toPlain(delivery) },
    });
  } catch (err) {
    next(err);
  }
}

export async function collectCODPayment(req, res, next) {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    if (!canAccessDelivery(delivery, req.user) || req.user.role !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Only the assigned delivery partner can collect payment.' });
    }
    const payment = await processCODCollection({
      delivery,
      userId: req.user._id,
      transactionReference: typeof req.body.transactionReference === 'string' ? req.body.transactionReference.trim().slice(0, 120) : null,
    });
    res.json({ success: true, message: 'COD payment collected.', data: { payment } });
  } catch (err) {
    next(err);
  }
}

export async function updateDeliveryStatus(req, res, next) {
  try {
    const { status, note, location } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    if (!canAccessDelivery(delivery, req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied to this delivery' });
    }
    const allowedStatuses = ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed Delivery'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'A valid delivery status is required' });
    }
    if (status !== delivery.status) {
      const allowedNext = {
        Assigned: ['Picked Up', 'Failed Delivery'],
        'Picked Up': ['In Transit', 'Failed Delivery'],
        'In Transit': ['Out for Delivery', 'Failed Delivery'],
        'Out for Delivery': ['Delivered', 'Failed Delivery'],
        Delivered: [],
        'Failed Delivery': ['Picked Up'],
      };
      if (!(allowedNext[delivery.status] || []).includes(status)) {
        return res.status(409).json({ success: false, message: `Invalid delivery transition from ${delivery.status} to ${status}` });
      }
    }
    if (status === 'Delivered' && delivery.parentOrder) {
      const order = await Order.findById(delivery.parentOrder);
      if (order?.paymentMethod === 'COD' && String(order.paymentStatus).toUpperCase() !== 'PAID') {
        return res.status(409).json({ success: false, message: 'Collect the COD payment before marking this delivery as delivered.' });
      }
    }

    const updates = [
      ...(delivery.updates || []),
      {
        status,
        note: note || '',
        location: location || '',
        timestamp: new Date().toISOString(),
      },
    ];

    await Delivery.findByIdAndUpdate(req.params.id, {
      $set: {
        status,
        updates,
      },
    }, { new: true });

    // Also update associated SellerOrder if exists
    if (delivery.sellerOrder) {
      const sellerOrderStatus = status === 'Delivered' ? 'DELIVERED' : status === 'Out for Delivery' ? 'OUT_FOR_DELIVERY' : 'SHIPPED';
      await SellerOrder.findByIdAndUpdate(delivery.sellerOrder, {
        $set: { status: sellerOrderStatus },
      });
      if (status === 'Delivered') {
        const sellerOrder = await SellerOrder.findById(delivery.sellerOrder);
        const order = sellerOrder ? await Order.findById(sellerOrder.parentOrder) : null;
        if (order?.sellerOrders?.length) {
          const subOrders = await SellerOrder.find({ _id: { $in: order.sellerOrders } });
          if (subOrders.length && subOrders.every((entry) => entry.status === 'DELIVERED')) {
            await Order.findByIdAndUpdate(order._id, { $set: { status: 'DELIVERED' } });
          }
        }
      }
    }

    const updated = await Delivery.findById(req.params.id);
    res.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      data: { delivery: toPlain(updated) },
    });
  } catch (err) {
    next(err);
  }
}

export async function addTrackingUpdate(req, res, next) {
  try {
    const { location, note } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    if (!canAccessDelivery(delivery, req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied to this delivery' });
    }

    const updates = [
      ...(delivery.updates || []),
      {
        status: delivery.status,
        location: location || '',
        note: note || '',
        timestamp: new Date().toISOString(),
      },
    ];

    await Delivery.findByIdAndUpdate(req.params.id, { $set: { updates } });
    const updated = await Delivery.findById(req.params.id);

    res.json({
      success: true,
      message: 'Tracking checkpoint recorded',
      data: { delivery: toPlain(updated) },
    });
  } catch (err) {
    next(err);
  }
}
