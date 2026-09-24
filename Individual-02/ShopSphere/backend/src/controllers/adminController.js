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
} from '../models/index.js';
import { toPlain } from '../utils/toPlain.js';

export async function getAdminDashboard(req, res, next) {
  try {
    const users = await User.find();
    const sellers = await Seller.find();
    const products = await Product.find();
    const orders = await Order.find();
    const disputes = await Dispute.find();
    const tickets = await SupportTicket.find();

    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const platformCommission = Math.round(totalRevenue * 0.10);

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
    const seller = await Seller.findByIdAndUpdate(req.params.id, { $set: { status } });
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
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, {
      $set: { status: resolution, adminNotes },
    });
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
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    const newCat = await Category.create({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      subcategories: subcategories || [],
      image: image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80',
    });

    res.status(201).json({ success: true, message: 'Category created', data: { category: toPlain(newCat) } });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminCategory(req, res, next) {
  try {
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
    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required' });
    }

    const coupon = await Coupon.create({
      code: String(code).toUpperCase().trim(),
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrder: Number(minOrder) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
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
