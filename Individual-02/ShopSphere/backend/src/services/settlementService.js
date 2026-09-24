// backend/src/services/settlementService.js
import { Settlement, SellerOrder } from '../models/index.js';

export async function computeSellerSettlements(sellerId) {
  const sellerOrders = await SellerOrder.find({ seller: String(sellerId) });

  let totalRevenue = 0;
  let totalPlatformFee = 0;
  let totalEarnings = 0;

  for (const order of sellerOrders) {
    totalRevenue += order.subtotal || 0;
    totalPlatformFee += order.platformFee || 0;
    totalEarnings += order.sellerEarnings || 0;
  }

  const settlements = await Settlement.find({ seller: String(sellerId) });

  return {
    metrics: {
      totalOrders: sellerOrders.length,
      totalRevenue,
      totalPlatformFee,
      netEarnings: totalEarnings,
      pendingPayout: totalEarnings,
    },
    orders: sellerOrders,
    settlements,
  };
}
