import { Inventory, Product } from '../models/index.js';

export async function getInventoryByProduct(productId) {
  let inventory = await Inventory.findOne({ product: productId });
  if (!inventory) {
    const product = await Product.findById(productId);
    const initialStock = product?.inventory !== undefined ? product.inventory : 50;
    inventory = await Inventory.create({
      product: productId,
      totalStock: initialStock,
      reservedStock: 0,
      availableStock: initialStock,
    });
  }
  return inventory;
}

export async function validateStock(productId, quantity = 1) {
  const inventory = await getInventoryByProduct(productId);
  const qty = Number(quantity) || 1;
  const isAvailable = inventory.availableStock >= qty;

  return {
    isAvailable,
    availableStock: inventory.availableStock,
    requestedQuantity: qty,
    product: productId,
  };
}

// Atomically reserves inventory during checkout
export async function reserveInventory(productId, quantity, session = null) {
  const qty = Number(quantity) || 1;
  const inventory = await getInventoryByProduct(productId);

  if (inventory.availableStock < qty) {
    throw new Error(`Insufficient stock for product. Available: ${inventory.availableStock}, Requested: ${qty}`);
  }

  const options = session ? { session } : {};
  await Inventory.updateOne(
    { product: productId },
    {
      $inc: {
        reservedStock: qty,
        availableStock: -qty,
      },
    },
    options
  );

  return { success: true, productId, reservedQuantity: qty };
}

// Releases previously reserved inventory during rollback or order cancellation
export async function releaseInventory(productId, quantity, session = null) {
  const qty = Number(quantity) || 1;
  const options = session ? { session } : {};

  await Inventory.updateOne(
    { product: productId },
    {
      $inc: {
        reservedStock: -qty,
        availableStock: qty,
      },
    },
    options
  );

  return { success: true, productId, releasedQuantity: qty };
}

export async function updateStock(productId, { totalStock, reservedStock }) {
  let inventory = await Inventory.findOne({ product: productId });
  if (!inventory) {
    const available = totalStock - (reservedStock || 0);
    return await Inventory.create({
      product: productId,
      totalStock,
      reservedStock: reservedStock || 0,
      availableStock: Math.max(0, available),
    });
  }

  const updatedTotal = totalStock !== undefined ? totalStock : inventory.totalStock;
  const updatedReserved = reservedStock !== undefined ? reservedStock : inventory.reservedStock;
  const available = Math.max(0, updatedTotal - updatedReserved);

  return await Inventory.findByIdAndUpdate(inventory._id, {
    totalStock: updatedTotal,
    reservedStock: updatedReserved,
    availableStock: available,
  });
}
