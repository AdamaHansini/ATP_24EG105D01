// backend/src/controllers/sellerController.js
import { Seller, Store, Product, SellerOrder, Inventory, Order, Delivery } from '../models/index.js';
import { computeSellerSettlements } from '../services/settlementService.js';
import { toPlain } from '../utils/toPlain.js';

async function getSellerContext(req) {
  if (!req.user || !req.user._id) return { sellerIds: [], store: null };
  const userId = String(req.user._id);
  const sellerDoc = await Seller.findOne({ user: userId });
  const sellerIds = [userId];
  if (sellerDoc) {
    sellerIds.push(String(sellerDoc._id));
  }
  let store = await Store.findOne({ seller: { $in: sellerIds } });
  if (!store && sellerDoc) {
    store = await Store.create({
      seller: sellerDoc._id,
      name: sellerDoc.storeName || `${req.user.name}'s Store`,
      description: 'Quality goods directly from authorized seller',
      rating: 4.9,
      status: 'active',
    });
  }
  return { userId, sellerDoc, sellerIds, store };
}

export async function getSellerDashboard(req, res, next) {
  try {
    const { sellerIds, store } = await getSellerContext(req);

    const products = await Product.find({ seller: { $in: sellerIds } });
    const orders = await SellerOrder.find({ seller: { $in: sellerIds } });
    const settlementsData = await computeSellerSettlements(sellerIds[0] || '');

    // Compute inventory stats
    const lowStockProducts = products.filter((p) => (p.inventory || 0) <= 10);
    const totalInventory = products.reduce((acc, p) => acc + (p.inventory || 0), 0);

    res.json({
      success: true,
      data: {
        store: store ? toPlain(store) : { name: `${req.user?.name || 'Seller'}'s Store`, rating: 5.0, status: 'active' },
        productsCount: products.length,
        ordersCount: orders.length,
        totalInventory,
        lowStockCount: lowStockProducts.length,
        lowStockProducts: toPlain(lowStockProducts.slice(0, 5)),
        settlements: settlementsData.metrics,
        recentOrders: toPlain(orders.slice(0, 6)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSellerProducts(req, res, next) {
  try {
    const { sellerIds } = await getSellerContext(req);
    const products = await Product.find({ seller: { $in: sellerIds }, status: { $ne: 'archived' } });
    
    // Attach live inventory
    const enhanced = await Promise.all(
      products.map(async (p) => {
        const inv = await Inventory.findOne({ product: p._id });
        const plainP = toPlain(p);
        return {
          ...plainP,
          availableStock: inv ? inv.availableStock : (p.inventory || 0),
          totalStock: inv ? inv.totalStock : (p.inventory || 0),
          reservedStock: inv ? inv.reservedStock : 0,
        };
      })
    );

    res.json({ success: true, data: { products: enhanced } });
  } catch (err) {
    next(err);
  }
}

export async function getSellerOrders(req, res, next) {
  try {
    const { sellerIds } = await getSellerContext(req);
    // Strict isolation: Seller ONLY sees orders containing their products
    const orders = await SellerOrder.find({ seller: { $in: sellerIds } });
    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({ success: true, data: { orders: toPlain(orders) } });
  } catch (err) {
    next(err);
  }
}

export async function getSellerOrderById(req, res, next) {
  try {
    const { sellerIds } = await getSellerContext(req);
    const orderId = req.params.id;

    // Strict ownership verification
    const sellerOrder = await SellerOrder.findById(orderId);
    if (!sellerOrder) {
      return res.status(404).json({ success: false, message: 'Seller order not found' });
    }

    if (!sellerIds.includes(String(sellerOrder.seller)) && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view orders containing your store products.',
        errorCode: 'FORBIDDEN_ORDER_ACCESS',
      });
    }

    const parentOrder = sellerOrder.parentOrder ? await Order.findById(sellerOrder.parentOrder) : null;
    const delivery = await Delivery.findOne({ sellerOrder: sellerOrder._id });

    res.json({
      success: true,
      data: {
        sellerOrder: toPlain(sellerOrder),
        parentOrderNumber: parentOrder?.orderNumber,
        shippingAddress: parentOrder?.shippingAddress,
        delivery: delivery ? toPlain(delivery) : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSellerOrderStatus(req, res, next) {
  try {
    const { sellerIds } = await getSellerContext(req);
    const orderId = req.params.id;
    const { status } = req.body;

    const sellerOrder = await SellerOrder.findById(orderId);
    if (!sellerOrder) {
      return res.status(404).json({ success: false, message: 'Seller order not found' });
    }

    if (!sellerIds.includes(String(sellerOrder.seller)) && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify orders containing your store products.',
        errorCode: 'FORBIDDEN_ORDER_UPDATE',
      });
    }

    const validStatuses = [
      'CONFIRMED',
      'PROCESSING',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updated = await SellerOrder.findByIdAndUpdate(
      orderId,
      { $set: { status } },
      { new: true }
    );

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { order: toPlain(updated) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSellerSettlements(req, res, next) {
  try {
    const { sellerIds } = await getSellerContext(req);
    const data = await computeSellerSettlements(sellerIds[0] || '');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateStore(req, res, next) {
  try {
    const { sellerIds, store } = await getSellerContext(req);
    let updated = await Store.findOneAndUpdate({ seller: { $in: sellerIds } }, req.body, { new: true });
    if (!updated && store) {
      updated = await Store.findByIdAndUpdate(store._id, req.body, { new: true });
    }
    res.json({ success: true, message: 'Store profile updated', data: { store: toPlain(updated || store) } });
  } catch (err) {
    next(err);
  }
}
