import { Delivery, SellerOrder, Order } from '../models/index.js';
import { toPlain } from '../utils/toPlain.js';

export async function getDeliveries(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const deliveries = await Delivery.find(filter);
    deliveries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({
      success: true,
      data: { deliveries: toPlain(deliveries) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getActiveDelivery(req, res, next) {
  try {
    const active = await Delivery.findOne({
      status: { $in: ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'] },
    });

    res.json({
      success: true,
      data: { delivery: active ? toPlain(active) : null },
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

    res.json({
      success: true,
      data: { delivery: toPlain(delivery) },
    });
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

    const updates = [
      ...(delivery.updates || []),
      {
        status,
        note: note || `Status updated to ${status}`,
        location: location || 'Distribution Center',
        timestamp: new Date().toISOString(),
      },
    ];

    await Delivery.findByIdAndUpdate(req.params.id, {
      $set: {
        status,
        updates,
      },
    });

    // Also update associated SellerOrder if exists
    if (delivery.sellerOrder) {
      const sellerOrderStatus = status === 'Delivered' ? 'DELIVERED' : status === 'Out for Delivery' ? 'OUT_FOR_DELIVERY' : 'SHIPPED';
      await SellerOrder.findByIdAndUpdate(delivery.sellerOrder, {
        $set: { status: sellerOrderStatus },
      });
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

    const updates = [
      ...(delivery.updates || []),
      {
        status: delivery.status,
        location: location || 'En Route',
        note: note || 'Location ping logged',
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