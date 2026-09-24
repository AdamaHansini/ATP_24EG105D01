// backend/src/controllers/wishlistController.js
import {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistItemToCart,
} from '../services/wishlistService.js';

export async function getWishlist(req, res, next) {
  try {
    const wishlist = await getUserWishlist(req.user._id);
    res.json({ success: true, message: 'Wishlist retrieved', data: { wishlist } });
  } catch (err) {
    next(err);
  }
}

export async function addWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }
    const wishlist = await addToWishlist(req.user._id, productId);
    res.json({ success: true, message: 'Product added to wishlist', data: { wishlist } });
  } catch (err) {
    next(err);
  }
}

export async function removeWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    const wishlist = await removeFromWishlist(req.user._id, productId);
    res.json({ success: true, message: 'Product removed from wishlist', data: { wishlist } });
  } catch (err) {
    next(err);
  }
}

export async function moveToCart(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }
    await moveWishlistItemToCart(req.user._id, productId);
    res.json({ success: true, message: 'Product moved from wishlist to cart' });
  } catch (err) {
    next(err);
  }
}
