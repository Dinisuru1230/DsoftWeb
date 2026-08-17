import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Use sessionStorage — cart clears when browser/tab closes
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem('malmalee_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to sessionStorage (not localStorage — so it clears on browser/system restart)
  useEffect(() => {
    sessionStorage.setItem('malmalee_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // When user logs out, wipe cart too
  const { user } = useAuth();
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      sessionStorage.removeItem('malmalee_cart');
    }
  }, [user]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(product, qty = 1) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }

  function removeFromCart(id) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCartItems([]);
    sessionStorage.removeItem('malmalee_cart');
  }

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, cartSubtotal, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
