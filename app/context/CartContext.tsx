"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
  id: string;
  name: string;
  priceText: string;
  originalPriceText?: string;
  image?: string;
  type?: 'combo' | 'tool' | 'course';
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalAmount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('bt_cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart items", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('bt_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      // Avoid duplicate items
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Helper to extract numeric price from text like "990,000đ/tháng"
  const totalAmount = cartItems.reduce((sum, item) => {
    // Just replace everything not a digit
    const num = item.priceText.split('/')[0].replace(/[^0-9]/g, '');
    return sum + (parseInt(num) || 0);
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, clearCart,
      isCartOpen, setIsCartOpen, totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
