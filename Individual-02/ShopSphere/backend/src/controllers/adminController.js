// backend/src/controllers/adminController.js
import {
  User,
  Seller,
  Store,
  Product,
  Order,
  SellerOrder,
  Dispute,
  SupportTicket,
  AuditLog,
  Category,
  Coupon,
  Return,
  Notification,
} from '../models/index.js';
import { toPlain } from '../utils/toPlain.js';
import { createRefundRecord } from '../services/paymentService.js';

export async function getAdminDashboard(req, res, next) {
  try {
    const users = await User.find();
    const sellers = await Seller.find();
    const products = await Product.find();
    const orders = await Order.find();
    const disputes = await Dispute.find();
    const tickets = await SupportTicket.find();

    const paidOrders = orders.filter((order) => String(order.paymentStatus).toUpperCase() === 'PAID');
    const totalRevenue = paidOrders.reduce((acc, order) => acc + Number(order.totalAmount || 0), 0);
    const paidSellerOrders = await SellerOrder.find({ parentOrder: { $in: paidOrders.map((order) => order._id) } });
    const platformCommission = paidSellerOrders.reduce((acc, order) => acc + Number(order.platformFee || 0), 0);

    const auditLogs = await AuditLog.find();
    auditLogs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers: users.length,
          totalSellers: sellers.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          grossMerchandiseValue: totalRevenue,
          platformCommission,
          pendingDisputes: disputes.filter((d) => d.status === 'OPEN').length,
          openTickets: tickets.filter((t) => t.status === 'OPEN').length,
        },
        recentOrders: toPlain(orders.slice(0, 6)),
        recentAuditLogs: toPlain(auditLogs.slice(0, 8)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await User.find();
    const sanitized = users.map((u) => {
      const copy = toPlain(u);
      delete copy.password;
      return copy;
    });
    res.json({ success: true, data: { users: sanitized } });
  } catch (err) {
    next(err);
  }
}

export async function toggleUserSuspension(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Administrator accounts cannot be suspended from this action.' });

    const newSuspended = !user.isSuspended;
    await User.findByIdAndUpdate(req.params.id, { $set: { isSuspended: newSuspended } });

    await AuditLog.create({
      user: req.user ? req.user._id : 'admin',
      userName: req.user ? req.user.name : 'Admin',
      action: newSuspended ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      entityType: 'User',
      entityId: user._id,
      metadata: { email: user.email },
    });

    res.json({
      success: true,
      message: `User ${newSuspended ? 'suspended' : 'activated'} successfully`,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSellers(req, res, next) {
  try {
    const sellers = await Seller.find();
    res.json({ success: true, data: { sellers: toPlain(sellers) } });
  } catch (err) {
    next(err);
  }
}

export async function updateSellerStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid seller status' });
    }
    const seller = await Seller.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
    await Store.updateOne(
      { seller: seller._id },
      { $set: { status: status === 'approved' ? 'active' : 'pending' } }
    );
    await Product.updateMany(
      { seller: seller._id, status: { $nin: ['archived', 'draft'] } },
      { $set: { status: status === 'approved' ? 'active' : 'inactive' } }
    );
    await AuditLog.create({
      user: req.user ? req.user._id : 'admin',
      userName: req.user ? req.user.name : 'Admin',
      action: `SELLER_${String(status).toUpperCase()}`,
      entityType: 'Seller',
      entityId: req.params.id,
    });
    res.json({ success: true, message: `Seller status updated to ${status}`, data: { seller: toPlain(seller) } });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find();
    logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    res.json({ success: true, data: { logs: toPlain(logs) } });
  } catch (err) {
    next(err);
  }
}

export async function getDisputes(req, res, next) {
  try {
    const disputes = await Dispute.find();
    res.json({ success: true, data: { disputes: toPlain(disputes) } });
  } catch (err) {
    next(err);
  }
}

export async function resolveDispute(req, res, next) {
  try {
    const { resolution, adminNotes } = req.body;
    if (!['RESOLVED', 'REJECTED', 'IN_PROGRESS'].includes(resolution)) {
      return res.status(400).json({ success: false, message: 'Invalid dispute resolution' });
    }
    const current = await Dispute.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: 'Dispute not found' });
    const dispute = await Dispute.findByIdAndUpdate(current._id, { $set: { status: resolution, adminNotes } }, { new: true });
    if (current.returnRequest && ['RESOLVED', 'REJECTED'].includes(resolution)) {
      const returnStatus = resolution === 'RESOLVED' ? 'Approved' : 'Rejected';
      await Return.findByIdAndUpdate(current.returnRequest, { $set: { status: returnStatus } });
      const order = await Order.findById(current.order);
      if (order && resolution === 'REJECTED') {
        await Order.findByIdAndUpdate(order._id, { $set: { status: 'DELIVERED' } });
        await SellerOrder.updateMany({ parentOrder: order._id }, { $set: { status: 'DELIVERED' } });
      }
      if (order && resolution === 'RESOLVED') {
        await Return.findByIdAndUpdate(current.returnRequest, { $set: { status: 'Returned' } });
        await Order.findByIdAndUpdate(order._id, { $set: { status: 'RETURNED' } });
        await SellerOrder.updateMany({ parentOrder: order._id }, { $set: { status: 'RETURNED' } });
        if (String(order.paymentStatus).toUpperCase() === 'PAID' && Number(order.totalAmount) > 0) await createRefundRecord({ order });
      }
      await Notification.create({
        user: current.customer,
        type: 'ORDER_STATUS',
        title: resolution === 'RESOLVED' ? 'Return approved' : 'Return declined',
        message: resolution === 'RESOLVED' ? 'Your return was approved. Any eligible refund is pending processing.' : 'Your return request was declined.',
        metadata: { orderId: String(current.order), status: resolution },
      });
    }
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    res.json({ success: true, message: 'Dispute resolved', data: { dispute: toPlain(dispute) } });
  } catch (err) {
    next(err);
  }
}

// Category Management
export async function getAdminCategories(req, res, next) {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: { categories: toPlain(categories) } });
  } catch (err) {
    next(err);
  }
}

export async function createAdminCategory(req, res, next) {
  try {
    const { name, description, subcategories, image } = req.body;
    if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ success: false, message: 'Category name is required' });
    if (subcategories !== undefined && (!Array.isArray(subcategories) || subcategories.some((value) => typeof value !== 'string'))) {
      return res.status(400).json({ success: false, message: 'Subcategories must be a list of names' });
    }

    const newCat = await Category.create({
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      subcategories: subcategories || [],
      image: image || undefined,
    });

    res.status(201).json({ success: true, message: 'Category created', data: { category: toPlain(newCat) } });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    if (await Product.exists({ category: category.name, status: { $ne: 'archived' } })) {
      return res.status(409).json({ success: false, message: 'This category is used by active products. Reassign those products first.' });
    }
    await Category.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}

// Coupon Management
export async function getAdminCoupons(req, res, next) {
  try {
    const coupons = await Coupon.find();
    res.json({ success: true, data: { coupons: toPlain(coupons) } });
  } catch (err) {
    next(err);
  }
}

export async function createAdminCoupon(req, res, next) {
  try {
    const { code, discountType, discountValue, minOrder, maxDiscount } = req.body;
    const numericValue = Number(discountValue);
    if (typeof code !== 'string' || !code.trim() || !Number.isFinite(numericValue) || numericValue <= 0) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required' });
    }
    if (!['percentage', 'fixed'].includes(discountType || 'percentage')) {
      return res.status(400).json({ success: false, message: 'Coupon discount type must be percentage or fixed' });
    }
    if ((discountType || 'percentage') === 'percentage' && numericValue > 100) {
      return res.status(400).json({ success: false, message: 'Percentage coupons cannot exceed 100%' });
    }

    const coupon = await Coupon.create({
      code: String(code).toUpperCase().trim(),
      discountType: discountType || 'percentage',
      discountValue: numericValue,
      minOrder: Number.isFinite(Number(minOrder)) && Number(minOrder) >= 0 ? Number(minOrder) : 0,
      maxDiscount: Number.isFinite(Number(maxDiscount)) && Number(maxDiscount) > 0 ? Number(maxDiscount) : undefined,
      status: 'active',
    });

    res.status(201).json({ success: true, message: 'Coupon created', data: { coupon: toPlain(coupon) } });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminCoupon(req, res, next) {
  try {
    await Coupon.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
}
