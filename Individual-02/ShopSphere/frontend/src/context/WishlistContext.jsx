// frontend/src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService.js';
import { useAuth } from './AuthContext.jsx';
import { useCart } from './CartContext.jsx';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { fetchCart } = useCart();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      if (data) setWishlist(data);
    } catch (e) {
      console.warn('Wishlist load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Do not fetch until auth determination is complete
    if (authLoading) return;
    // Only fetch if there is an authenticated user
    if (!user) {
      setWishlist({ products: [] });
      return;
    }
    fetchWishlist();
  }, [authLoading, user?._id]);

  const addItem = async (productId) => {
    const updated = await wishlistService.addItem(productId);
    if (updated) setWishlist(updated);
  };

  const removeItem = async (productId) => {
    const updated = await wishlistService.removeItem(productId);
    if (updated) setWishlist(updated);
  };

  const moveToCart = async (productId) => {
    await wishlistService.moveToCart(productId);
    await fetchWishlist();
    await fetchCart();
  };

  const isWishlisted = (productId) => {
    return (wishlist.products || []).some(
      p => String(p.productId || p.product?._id || p.product) === String(productId)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
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
