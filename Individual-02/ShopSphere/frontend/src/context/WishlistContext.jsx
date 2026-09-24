// frontend/src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { wishlistService } from '../services/wishlistService.js';
import { useAuth } from './AuthContext.jsx';
import { useCart } from './CartContext.jsx';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { fetchCart } = useCart();
  const canUseWishlist = user?.role === 'customer';
  const requestId = useRef(0);
  const customerId = useRef(null);
  customerId.current = canUseWishlist ? String(user._id) : null;
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!canUseWishlist) {
      requestId.current += 1;
      setWishlist({ products: [] });
      setLoading(false);
      return;
    }

    const currentRequestId = ++requestId.current;
    const requestedCustomerId = String(user._id);
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      if (data && requestId.current === currentRequestId && customerId.current === requestedCustomerId) {
        setWishlist(data);
      }
    } catch (e) {
      if (requestId.current === currentRequestId && customerId.current === requestedCustomerId) {
        console.warn('Wishlist load error:', e);
      }
    } finally {
      if (requestId.current === currentRequestId) setLoading(false);
    }
  }, [canUseWishlist, user?._id]);

  useEffect(() => {
    // Do not fetch until auth determination is complete
    if (authLoading) return;
    // The wishlist is a customer-only resource; clear any previous user's state.
    if (!canUseWishlist) {
      requestId.current += 1;
      setWishlist({ products: [] });
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, [authLoading, canUseWishlist, user?._id, fetchWishlist]);

  const addItem = async (productId) => {
    if (!canUseWishlist) return null;
    const updated = await wishlistService.addItem(productId);
    if (updated) setWishlist(updated);
  };

  const removeItem = async (productId) => {
    if (!canUseWishlist) return null;
    const updated = await wishlistService.removeItem(productId);
    if (updated) setWishlist(updated);
  };

  const moveToCart = async (productId) => {
    if (!canUseWishlist) return null;
    await wishlistService.moveToCart(productId);
    await fetchWishlist();
    await fetchCart();
  };

  const isWishlisted = (productId) => {
    if (!canUseWishlist) return false;
    return (wishlist.products || []).some(
      p => String(p.productId || p.product?._id || p.product) === String(productId)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        canUseWishlist,
        products: wishlist.products || [],
        count: (wishlist.products || []).length,
        loading,
        addItem,
        removeItem,
        moveToCart,
        isWishlisted,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
