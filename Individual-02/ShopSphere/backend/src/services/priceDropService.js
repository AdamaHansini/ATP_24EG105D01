import { Wishlist, Notification, User, Product } from '../models/index.js';
import { sendEmail } from '../config/mail.js';

export async function sendPriceDropNotification(productId, oldPrice, newPrice) {
  const numericOldPrice = Number(oldPrice);
  const numericNewPrice = Number(newPrice);

  // Strictly trigger only when price decreases
  if (!numericOldPrice || !numericNewPrice || numericNewPrice >= numericOldPrice) {
    return { triggered: false, reason: 'Price did not decrease' };
  }

  const product = await Product.findById(productId);
  if (!product) {
    return { triggered: false, reason: 'Product not found' };
  }

  // Query MongoDB directly for wishlists containing this product
  const idStr = String(productId);
  const wishlists = await Wishlist.find({
    $or: [
      { 'products.productId': idStr },
      { 'products.product': idStr },
    ],
  });

  if (!wishlists || wishlists.length === 0) {
    return { triggered: true, count: 0, message: 'Price decreased, but no users currently wishlist this product.' };
  }

  const notificationsCreated = [];
  const productName = product.name || 'Wishlist Item';
  const title = 'Price Drop Alert!';
  const message = `${productName} dropped from ₹${numericOldPrice.toLocaleString()} to ₹${numericNewPrice.toLocaleString()}.`;

  for (const wishlist of wishlists) {
    try {
      const notification = await Notification.create({
        user: wishlist.user,
        type: 'PRICE_DROP',
        product: idStr,
        title,
        message,
        metadata: {
          oldPrice: numericOldPrice,
          newPrice: numericNewPrice,
          productName,
          productImage: product.images?.[0] || '',
        },
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      notificationsCreated.push(notification);

      // Trigger isolated email alert in background without blocking response
      User.findById(wishlist.user).then(userDoc => {
        if (userDoc?.email) {
          sendEmail({
            to: userDoc.email,
            subject: `Price Drop Alert: ${productName} is now ₹${numericNewPrice.toLocaleString()}!`,
            text: `Great news! An item on your ShopSphere wishlist (${productName}) just dropped in price from ₹${numericOldPrice.toLocaleString()} to ₹${numericNewPrice.toLocaleString()}. Visit ShopSphere to purchase now.`,
          }).catch((error) => console.warn('[notifications] Price drop email failed:', error.name, error.code));
        }
      }).catch((error) => console.warn('[notifications] Could not load price drop recipient:', error.name, error.code));
    } catch (err) {
      console.error('[notifications] Could not create price drop notification:', err.name, err.code);
    }
  }

  return {
    triggered: true,
    count: notificationsCreated.length,
    notifications: notificationsCreated,
  };
}

export const handlePriceDropCheck = sendPriceDropNotification;
