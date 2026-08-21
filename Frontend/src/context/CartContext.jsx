import { createContext, useContext, useState, useEffect } from 'react';
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

  // Generate a unique cart key from product id + name (handles color variants)
  function cartKey(product) {
    return `${product.id}::${product.name}`;
  }

  function addToCart(product, qty = 1) {
    const key = cartKey(product);
    setCartItems((prev) => {
      const existing = prev.find((i) => cartKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          cartKey(i) === key ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...product, cartKey: key, quantity: qty }];
    });
  }

  function updateQuantity(key, quantity) {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => ((item.cartKey || cartKey(item)) === key ? { ...item, quantity } : item))
    );
  }

  function removeFromCart(key) {
    setCartItems((prev) => prev.filter((item) => (item.cartKey || cartKey(item)) !== key));
  }

  function clearCart() {
    setCartItems([]);
    sessionStorage.removeItem('malmalee_cart');
  }

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, cartSubtotal, addToCart, updateQuantity, removeFromCart, clearCart, cartKey }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
