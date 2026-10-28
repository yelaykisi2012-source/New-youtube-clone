import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

const WishlistContext = createContext(null);
const storageKey = "loyixa-wishlist";

function readWishlist() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function wishlistReducer(items, action) {
  switch (action.type) {
    case "toggle": {
      const exists = items.some((id) => id === action.id);
      return exists ? items.filter((id) => id !== action.id) : [...items, action.id];
    }
    case "remove":
      return items.filter((id) => id !== action.id);
    case "clear":
      return [];
    default:
      return items;
  }
}

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(wishlistReducer, undefined, readWishlist);

  const toggleWishlist = useCallback((id) => dispatch({ type: "toggle", id }), []);
  const removeFromWishlist = useCallback((id) => dispatch({ type: "remove", id }), []);
  const clearWishlist = useCallback(() => dispatch({ type: "clear" }), []);
  const isWishlisted = useCallback((id) => items.includes(id), [items]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error("Sevimlilar ro'yxatini saqlab bo'lmadi:", error);
    }
  }, [items]);

  const value = useMemo(() => ({
    items,
    count: items.length,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    isWishlisted,
  }), [items, toggleWishlist, removeFromWishlist, clearWishlist, isWishlisted]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist WishlistProvider ichida ishlatilishi kerak.");
  }
  return context;
}
