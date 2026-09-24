import { Product, Inventory, Category, Store, Seller, AuditLog, Review, BrowsingHistory, Order } from '../models/index.js';
import { sendPriceDropNotification } from '../services/priceDropService.js';
import { updateStock } from '../services/inventoryService.js';
import { toPlain } from '../utils/toPlain.js';

function getHistoryOwner(req) {
  if (req.user?._id) return String(req.user._id);
  const guestId = String(req.headers['x-guest-id'] || '').trim();
  return /^[a-zA-Z0-9_-]{16,128}$/.test(guestId) ? `guest:${guestId}` : null;
}

export async function getProducts(req, res, next) {
  try {
    const {
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      rating,
      brand,
      inStock,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    let products = await Product.find({ status: 'active' });
    const sellerIds = [...new Set(products.map((product) => product.seller).filter(Boolean).map(String))];
    const sellers = await Seller.find({ _id: { $in: sellerIds }, status: 'approved' });
    const approvedSellerIds = new Set(sellers.map((seller) => String(seller._id)));
    const stores = await Store.find({ seller: { $in: Array.from(approvedSellerIds) }, status: 'active' });
    const activeStoreSellerIds = new Set(stores.map((store) => String(store.seller)));
    products = products.filter((product) => !product.seller || activeStoreSellerIds.has(String(product.seller)));

    // Search filter across: Name, Description, Brand, Category, Tags, Keywords
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => {
        const inName = (p.name || '').toLowerCase().includes(q);
        const inDesc = (p.description || '').toLowerCase().includes(q);
        const inBrand = (p.brand || '').toLowerCase().includes(q);
        const inCat = (p.category || '').toLowerCase().includes(q);
        const inTags = (p.tags || []).some(t => t.toLowerCase().includes(q));
        const inKeywords = (p.keywords || []).some(k => k.toLowerCase().includes(q));
        return inName || inDesc || inBrand || inCat || inTags || inKeywords;
      });
    }

    // Category & Subcategory Filter
    if (category) {
      products = products.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
    }
    if (subcategory) {
      products = products.filter(p => (p.subcategory || '').toLowerCase() === subcategory.toLowerCase());
    }

    // Price Range Filter
    if (minPrice !== undefined && minPrice !== '') {
      products = products.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      products = products.filter(p => p.price <= Number(maxPrice));
    }

    // Rating Filter
    if (rating !== undefined && rating !== '') {
      products = products.filter(p => (p.rating || 0) >= Number(rating));
    }

    // Brand Filter
    if (brand) {
      const brands = brand.split(',').map(b => b.toLowerCase().trim());
      products = products.filter(p => brands.includes((p.brand || '').toLowerCase()));
    }

    // In Stock Filter
    if (inStock === 'true') {
      products = products.filter(p => (p.inventory || 0) > 0);
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'popularity') {
      products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else {
      // Newest
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = products.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = products.slice(startIndex, startIndex + Number(limit));

    // Attach current inventory availableStock
    const enhanced = await Promise.all(
      paginated.map(async p => {
        const inv = await Inventory.findOne({ product: p._id });
        const plainP = toPlain(p);
        return {
          ...plainP,
          availableStock: inv ? inv.availableStock : (p.inventory ?? 0),
        };
      })
    );

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: enhanced,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', errorCode: 'PRODUCT_NOT_FOUND' });
    }
    if (product.seller) {
      const seller = await Seller.findById(product.seller);
      const store = product.store ? await Store.findById(product.store) : null;
      if (!seller || seller.status !== 'approved' || !store || store.status !== 'active' || product.status !== 'active') {
        return res.status(404).json({ success: false, message: 'Product not found', errorCode: 'PRODUCT_NOT_FOUND' });
      }
    }

    const inv = await Inventory.findOne({ product: product._id });
    const store = product.store ? await Store.findById(product.store) : null;
    const plainProduct = toPlain(product);

    res.json({
      success: true,
      message: 'Product details retrieved',
      data: {
        product: {
          ...plainProduct,
          availableStock: inv ? inv.availableStock : (product.inventory ?? 0),
          storeDetails: toPlain(store),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const {
      name,
      description,
      shortDescription,
      brand,
      category,
      subcategory,
      tags = [],
      keywords = [],
      price,
      discountPrice,
      images = [],
      specifications = {},
      attributes = {},
      variants = [],
      inventory = 0,
      aiMetadata,
    } = req.body;

    const numericPrice = Number(price);
    const numericInventory = Number(inventory);
    if (!String(name || '').trim() || !String(category || '').trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Product name, category, and a positive price are required' });
    }
    if (!Number.isInteger(numericInventory) || numericInventory < 0) {
      return res.status(400).json({ success: false, message: 'Inventory must be a whole number of zero or more' });
    }

    // Look up the seller document for the authenticated user
    const sellerDoc = await Seller.findOne({ user: req.user._id });
    if (!sellerDoc) {
      return res.status(403).json({
        success: false,
        message: 'No seller account found for your user. Please register as a seller.',
        errorCode: 'SELLER_NOT_FOUND',
      });
    }
    if (sellerDoc.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Your seller account must be approved before publishing products.' });
    }

    const store = await Store.findOne({ seller: sellerDoc._id });

    const newProduct = await Product.create({
      name,
      description,
      shortDescription,
      brand: brand ? String(brand).trim() : undefined,
      category: String(category).trim(),
      subcategory: subcategory || '',
      tags,
      keywords,
      price: numericPrice,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      images: images.length > 0 ? images : [],
      specifications,
      attributes,
      variants,
      inventory: numericInventory,
      seller: sellerDoc._id,
      store: store ? store._id : null,
      storeName: store ? store.name : sellerDoc.storeName,
      rating: 0,
      reviewCount: 0,
      status: 'active',
      aiMetadata: aiMetadata || { generated: false },
    });

    // Initialize Inventory record
    await Inventory.create({
      product: newProduct._id,
      totalStock: numericInventory,
      reservedStock: 0,
      availableStock: numericInventory,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully in catalog',
      data: { product: toPlain(newProduct) },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ownership check for sellers
    if (req.user && req.user.role === 'seller') {
      const sellerDoc = await Seller.findOne({ user: req.user._id });
      const sellerIds = [String(req.user._id)];
      if (sellerDoc) sellerIds.push(String(sellerDoc._id));
      if (!sellerIds.includes(String(existingProduct.seller))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot modify products belonging to another store.',
          errorCode: 'FORBIDDEN_PRODUCT_ACCESS',
        });
      }
    }

    const oldPrice = Number(existingProduct.price);
    const editableFields = [
      'name', 'description', 'shortDescription', 'brand', 'category', 'subcategory',
      'tags', 'keywords', 'price', 'discountPrice', 'images', 'specifications',
      'attributes', 'variants', 'inventory',
    ];
    const updateData = Object.fromEntries(
      editableFields.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
    );
    if (!Object.keys(updateData).length) {
      return res.status(400).json({ success: false, message: 'No editable product fields were provided' });
    }
    if (updateData.price !== undefined && (!Number.isFinite(Number(updateData.price)) || Number(updateData.price) <= 0)) {
      return res.status(400).json({ success: false, message: 'Product price must be greater than zero' });
    }
    let inventoryRecord = null;
    if (updateData.inventory !== undefined) {
      const requestedStock = Number(updateData.inventory);
      const currentInventory = await Inventory.findOne({ product: productId });
      const reservedStock = currentInventory?.reservedStock || 0;
      if (!Number.isInteger(requestedStock) || requestedStock < reservedStock) {
        return res.status(400).json({ success: false, message: 'Inventory must be a whole number and cannot be less than reserved stock' });
      }
      updateData.inventory = requestedStock;
      inventoryRecord = currentInventory
        ? await Inventory.findOneAndUpdate(
          { product: productId },
          { $set: { totalStock: requestedStock, availableStock: requestedStock - reservedStock } },
          { new: true, runValidators: true }
        )
        : await updateStock(productId, { totalStock: requestedStock });
    }

    // Update Product in DB
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!updatedProduct && inventoryRecord) {
      await Inventory.findOneAndUpdate(
        { product: productId },
        { $set: { totalStock: inventoryRecord.totalStock - Number(updateData.inventory) + Number(existingProduct.inventory || 0) } }
      );
    }

    let priceDropResult = null;
    // Trigger price-drop surveillance when price decreases
    if (updateData.price !== undefined) {
      const newPrice = Number(updateData.price);
      if (newPrice < oldPrice) {
        priceDropResult = await sendPriceDropNotification(productId, oldPrice, newPrice);

        await AuditLog.create({
          user: req.user._id,
          userName: req.user.name,
          action: 'PRICE_UPDATED',
          entityType: 'Product',
          entityId: productId,
          metadata: { oldPrice, newPrice, notificationsSent: priceDropResult.count },
        });
      }
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: toPlain(updatedProduct),
        priceDropResult,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ownership check for sellers
    if (req.user && req.user.role === 'seller') {
      const sellerDoc = await Seller.findOne({ user: req.user._id });
      const sellerIds = [String(req.user._id)];
      if (sellerDoc) sellerIds.push(String(sellerDoc._id));
      if (!sellerIds.includes(String(existingProduct.seller))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot delete products belonging to another store.',
          errorCode: 'FORBIDDEN_PRODUCT_ACCESS',
        });
      }
    }

    await Product.findByIdAndUpdate(req.params.id, { status: 'archived' });
    await Inventory.deleteOne({ product: req.params.id });
    res.json({ success: true, message: 'Product archived successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
}

export async function getProductReviews(req, res, next) {
  try {
    const productId = req.params.id;
    if (!await Product.exists({ _id: productId })) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const reviews = await Review.find({ product: productId });
    res.json({
      success: true,
      data: { reviews },
    });
  } catch (err) {
    next(err);
  }
}

export async function addProductReview(req, res, next) {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user._id;
    const authorName = req.user.name;

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'A review comment is required' });
    }
    if (await Review.exists({ product: productId, user: userId })) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    }
    const verifiedPurchase = Boolean(await Order.exists({
      customer: userId,
      status: { $in: ['DELIVERED', 'RETURN_REQUESTED'] },
      $or: [
        { 'items.productId': String(productId) },
        { 'items.product': String(productId) },
      ],
    }));

    const review = await Review.create({
      product: productId,
      user: userId,
      userName: authorName,
      rating: numericRating,
      comment: comment.trim().slice(0, 2000),
      isVerifiedPurchase: verifiedPurchase,
      createdAt: new Date().toISOString(),
    });

    // Recalculate product rating
    const allReviews = await Review.find({ product: productId });
    const avgRating = (allReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / allReviews.length).toFixed(1);
    await Product.findByIdAndUpdate(productId, {
      $set: {
        rating: Number(avgRating),
        reviewCount: allReviews.length,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review },
    });
  } catch (err) {
    next(err);
  }
}

export async function recordProductView(req, res, next) {
  try {
    const productId = req.params.id;
    const userId = getHistoryOwner(req);
    if (!userId) return res.json({ success: true, message: 'View not recorded without a session', data: {} });

    await BrowsingHistory.create({
      user: userId,
      product: productId,
      viewedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'View recorded' });
  } catch (err) {
    next(err);
  }
}

export async function getRecentlyViewed(req, res, next) {
  try {
    const userId = getHistoryOwner(req);
    if (!userId) return res.json({ success: true, data: { products: [] } });
    const views = await BrowsingHistory.find({ user: userId });
    views.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));

    const uniqueProductIds = Array.from(new Set(views.map(v => v.product))).slice(0, 8);
    const products = await Promise.all(
      uniqueProductIds.map(async id => {
        const prod = await Product.findById(id);
        return prod ? toPlain(prod) : null;
      })
    );

    res.json({
      success: true,
      data: { products: products.filter(Boolean) },
    });
  } catch (err) {
    next(err);
  }
}
