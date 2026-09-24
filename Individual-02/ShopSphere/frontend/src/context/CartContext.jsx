// frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, loading: userLoading } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      if (data) setCart(data);
    } catch (e) {
      console.warn('Cart load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadCart = async () => {
      if (userLoading) return;
      if (user) {
        try {
          await cartService.mergeGuestCart();
        } catch (error) {
          console.warn('Guest cart merge failed:', error.message);
        }
      }
      if (active) await fetchCart();
    };
    loadCart();
    return () => { active = false; };
  }, [user?._id, userLoading, fetchCart]);

  const addItem = async (productId, quantity = 1, variant = null) => {
    const updated = await cartService.addItem(productId, quantity, variant);
    if (updated) setCart(updated);
  };

  const updateQuantity = async (itemId, quantity) => {
    const updated = await cartService.updateQuantity(itemId, quantity);
    if (updated) setCart(updated);
  };

  const removeItem = async (itemId) => {
    const updated = await cartService.removeItem(itemId);
    if (updated) setCart(updated);
  };

  const clearLocalCart = () => {
    setCart({ items: [] });
  };

  const items = cart.items || [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // Group items by Seller for Multi-Vendor display
  const itemsBySeller = items.reduce((acc, item) => {
    const sId = item.seller || 'unassigned';
    if (!acc[sId]) {
      acc[sId] = {
        sellerId: sId,
        sellerName: item.sellerName || (sId === 'unassigned' ? 'Seller details unavailable' : 'Seller'),
        items: [],
        subtotal: 0,
      };
    }
    acc[sId].items.push(item);
    acc[sId].subtotal += item.price * (item.quantity || 1);
    return acc;
  }, {});

  const sellerCount = Object.keys(itemsBySeller).length;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        itemsBySeller,
        sellerCount,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearLocalCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
