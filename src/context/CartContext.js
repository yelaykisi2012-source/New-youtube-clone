import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import sampleProducts from "../data/products.json";

const CartContext = createContext(null);
const storageKey = "loyixa-cart";
const productCatalogMap = new Map(sampleProducts.map((p) => [p.id, p]));

function sanitizeProduct(product) {
  if (!product) return product;
  const catalog = productCatalogMap.get(Number(product.id));
  let image = catalog?.image || product.image || "";
  if (image && image.includes("fakestoreapi.com") && image.endsWith(".jpg")) {
    image = image.replace(/\.jpg$/, "_t.png");
  }
  return {
    ...product,
    image,
  };
}

function isValidCart(items) {
  return (
    Array.isArray(items) &&
    items.every(
      (item) =>
        item &&
        item.product &&
        (typeof item.product.id === "number" || typeof item.product.id === "string") &&
        typeof item.product.title === "string" &&
        typeof item.product.price === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )
  );
}

function readCart() {
  try {
    const savedCart = localStorage.getItem(storageKey);
    if (!savedCart) return [];
    const parsedCart = JSON.parse(savedCart);
    if (!isValidCart(parsedCart)) return [];
    return parsedCart.map((item) => ({
      ...item,
      product: sanitizeProduct(item.product),
    }));
  } catch (error) {
    console.error("Savat ma’lumotlarini yuklab bo‘lmadi:", error);
    return [];
  }
}

function cartReducer(items, action) {
  switch (action.type) {
    case "add": {
      const existingItem = items.find((item) => item.product.id === action.product.id);
      if (existingItem) {
        return items.map((item) =>
          item.product.id === action.product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...items, { product: action.product, quantity: 1 }];
    }
    case "setQuantity":
      return items.map((item) =>
        item.product.id === action.id
          ? { ...item, quantity: Math.max(1, Math.floor(action.quantity)) }
          : item,
      );
    case "remove":
      return items.filter((item) => item.product.id !== action.id);
    case "clear":
      return [];
    default:
      return items;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, readCart);
  const addItem = useCallback((product) => dispatch({ type: "add", product }), [dispatch]);
  const setQuantity = useCallback(
    (id, quantity) => dispatch({ type: "setQuantity", id, quantity }),
    [dispatch],
  );
  const removeItem = useCallback((id) => dispatch({ type: "remove", id }), [dispatch]);
  const clearCart = useCallback(() => dispatch({ type: "clear" }), [dispatch]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error("Savat ma’lumotlarini saqlab bo‘lmadi:", error);
    }
  }, [items]);

  const value = useMemo(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return {
      items,
      count,
      total,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    };
  }, [addItem, clearCart, items, removeItem, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart CartProvider ichida ishlatilishi kerak.");
  }
  return context;
}
