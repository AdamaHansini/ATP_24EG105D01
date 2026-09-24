// backend/src/models/index.js
// Pure Mongoose models — MongoDB is the single source of truth.
// Compatible with both standard 24-hex string ObjectIds and legacy custom document IDs.
import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

function getModel(name, schemaDefinition, options = {}) {
  if (models[name]) return models[name];
  const fullDefinition = {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    ...schemaDefinition,
  };
  const schema = new Schema(fullDefinition, { timestamps: true, ...options });
  return model(name, schema);
}

// 1. User
export const User = getModel('User', {
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin', 'support', 'delivery'],
    default: 'customer',
  },
  phone: { type: String, trim: true },
  addresses: [
    {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      isDefault: { type: Boolean, default: false },
    },
  ],
  isSuspended: { type: Boolean, default: false },
});

// 2. Seller
export const Seller = getModel('Seller', {
  user: { type: String, ref: 'User', required: true },
  storeName: { type: String, required: true, trim: true },
  businessEmail: { type: String, trim: true, lowercase: true },
  phone: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  taxId: String,
  rating: { type: Number, default: 4.8 },
});

// 3. Store
export const Store = getModel('Store', {
  seller: { type: String, ref: 'Seller', required: true },
  name: { type: String, required: true, trim: true },
  description: String,
  logo: String,
  banner: String,
  rating: { type: Number, default: 4.8 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

// 4. Category
export const Category = getModel('Category', {
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, trim: true },
  description: String,
  subcategories: [String],
  image: String,
});

// 5. Product
export const Product = getModel('Product', {
  name: { type: String, required: true, trim: true },
  description: String,
  shortDescription: String,
  brand: String,
  category: String,
  subcategory: String,
  tags: [String],
  keywords: [String],
  price: { type: Number, required: true },
  discountPrice: Number,
  images: [String],
  specifications: Schema.Types.Mixed,
  attributes: Schema.Types.Mixed,
  variants: [Schema.Types.Mixed],
  inventory: { type: Number, default: 0 },
  seller: { type: String, ref: 'Seller' },
  store: { type: String, ref: 'Store' },
  storeName: String,
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
  aiMetadata: {
    generated: Boolean,
    confidence: Number,
    generatedAt: Date,
  },
});

// 6. ProductVariant
export const ProductVariant = getModel('ProductVariant', {
  product: { type: String, ref: 'Product' },
  sku: String,
  name: String,
  attributes: Schema.Types.Mixed,
  price: Number,
  inventory: Number,
});

// 7. Inventory
export const Inventory = getModel('Inventory', {
  product: { type: String, ref: 'Product', required: true },
  variant: String,
  totalStock: { type: Number, default: 100 },
  reservedStock: { type: Number, default: 0 },
  availableStock: { type: Number, default: 100 },
});

// 8. Cart
export const Cart = getModel('Cart', {
  user: { type: String, ref: 'User', required: true },
  items: [
    {
      product: { type: String, ref: 'Product' },
      productId: String,
      name: String,
      price: Number,
      image: String,
      quantity: { type: Number, default: 1 },
      seller: String,
      sellerName: String,
      variant: Schema.Types.Mixed,
    },
  ],
});

// 9. Wishlist
export const Wishlist = getModel('Wishlist', {
  user: { type: String, ref: 'User', required: true },
  products: [
    {
      product: { type: String, ref: 'Product' },
      productId: String,
      addedAt: { type: Date, default: Date.now },
      savedPrice: Number,
    },
  ],
});

// 10. Order (Parent Order)
export const Order = getModel('Order', {
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: String, ref: 'User', required: true },
  items: [Schema.Types.Mixed],
  totalAmount: Number,
  discountAmount: { type: Number, default: 0 },
  couponApplied: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentDetails: Schema.Types.Mixed,
  shippingAddress: Schema.Types.Mixed,
  sellerOrders: [{ type: String, ref: 'SellerOrder' }],
  status: {
    type: String,
    enum: [
      'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED',
      'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
      'RETURN_REQUESTED', 'RETURNED', 'REFUNDED',
    ],
    default: 'CONFIRMED',
  },
});

// 11. SellerOrder
export const SellerOrder = getModel('SellerOrder', {
  parentOrder: { type: String, ref: 'Order' },
  seller: { type: String, ref: 'Seller' },
  sellerName: String,
  items: [Schema.Types.Mixed],
  subtotal: Number,
  platformFee: Number,
  shippingFee: { type: Number, default: 0 },
  sellerEarnings: Number,
  status: {
    type: String,
    enum: [
      'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED',
      'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
      'RETURN_REQUESTED', 'RETURNED', 'REFUNDED',
    ],
    default: 'CONFIRMED',
  },
  deliveryPartner: String,
  trackingNumber: String,
});

// 12. OrderItem
export const OrderItem = getModel('OrderItem', {
  product: { type: String, ref: 'Product' },
  seller: { type: String, ref: 'Seller' },
  name: String,
  price: Number,
  quantity: Number,
  subtotal: Number,
});

// 13. Payment
export const Payment = getModel('Payment', {
  order: { type: String, ref: 'Order' },
  user: { type: String, ref: 'User' },
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: String,
  method: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  verifiedAt: Date,
});

// 14. Coupon
export const Coupon = getModel('Coupon', {
  code: { type: String, required: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: Number,
  minOrder: Number,
  maxDiscount: Number,
  startDate: Date,
  expiryDate: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
});

// 15. Review
export const Review = getModel('Review', {
  product: { type: String, ref: 'Product' },
  user: { type: String, ref: 'User' },
  userName: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: true },
});

// 16. Return
export const Return = getModel('Return', {
  order: { type: String, ref: 'Order' },
  sellerOrder: { type: String, ref: 'SellerOrder' },
  user: { type: String, ref: 'User' },
  reason: String,
  status: { type: String, default: 'Return Requested' },
  amount: Number,
});

// 17. Refund
export const Refund = getModel('Refund', {
  order: { type: String, ref: 'Order' },
  user: { type: String, ref: 'User' },
  amount: Number,
  status: { type: String, default: 'Refund Processing' },
  transactionId: String,
});

// 18. SupportTicket
export const SupportTicket = getModel('SupportTicket', {
  ticketNumber: String,
  user: { type: String, ref: 'User' },
  userName: String,
  subject: String,
  category: {
    type: String,
    enum: ['Order Issue', 'Payment Issue', 'Delivery Issue', 'Return Issue', 'Product Issue', 'Other'],
    default: 'Order Issue',
  },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
  },
  assignedTo: String,
  messages: [Schema.Types.Mixed],
  internalNotes: [Schema.Types.Mixed],
  relatedOrder: String,
});

// 19. Dispute
export const Dispute = getModel('Dispute', {
  order: { type: String, ref: 'Order' },
  seller: { type: String, ref: 'Seller' },
  customer: { type: String, ref: 'User' },
  reason: String,
  status: { type: String, default: 'OPEN' },
  messages: [Schema.Types.Mixed],
  adminNotes: String,
});

// 20. Notification
export const Notification = getModel('Notification', {
  user: { type: String, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['PRICE_DROP', 'ORDER_STATUS', 'SYSTEM', 'SUPPORT'],
    default: 'SYSTEM',
  },
  product: { type: String, ref: 'Product' },
  title: String,
  message: String,
  metadata: {
    oldPrice: Number,
    newPrice: Number,
  },
  isRead: { type: Boolean, default: false },
});

// 21. Delivery
export const Delivery = getModel('Delivery', {
  sellerOrder: { type: String, ref: 'SellerOrder' },
  parentOrder: { type: String, ref: 'Order' },
  deliveryPartner: String,
  trackingNumber: String,
  status: {
    type: String,
    enum: ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed Delivery'],
    default: 'Assigned',
  },
  customerName: String,
  customerPhone: String,
  shippingAddress: Schema.Types.Mixed,
  items: [Schema.Types.Mixed],
  assignedTo: { type: String, ref: 'User' },
  updates: [Schema.Types.Mixed],
});

// 22. Settlement
export const Settlement = getModel('Settlement', {
  seller: { type: String, ref: 'Seller' },
  sellerOrder: { type: String, ref: 'SellerOrder' },
  productRevenue: Number,
  discount: Number,
  platformFee: Number,
  tax: Number,
  shipping: Number,
  sellerEarnings: Number,
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED'], default: 'PAID' },
  paidAt: Date,
});

// 23. AuditLog
export const AuditLog = getModel('AuditLog', {
  user: { type: String, ref: 'User' },
  userName: String,
  action: String,
  entityType: String,
  entityId: String,
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

// 24. BrowsingHistory
export const BrowsingHistory = getModel('BrowsingHistory', {
  user: { type: String, ref: 'User' },
  product: { type: String, ref: 'Product' },
  viewedAt: { type: Date, default: Date.now },
});
