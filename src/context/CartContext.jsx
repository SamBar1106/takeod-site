import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addToCurrentCart,
  isDemoMode,
  readCurrentCart,
  redirectToCheckout,
  removeCurrentCartLines,
  updateCurrentCartQuantity,
} from "../lib/wix.js";

const CartContext = createContext(null);
const DEMO_CART_KEY = "daykodeeDemoCart";

function readDemoCart() {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(sessionStorage.getItem(DEMO_CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDemoCart(items) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(DEMO_CART_KEY, JSON.stringify(items));
}

function demoLine(product, variant, quantity) {
  const variantId = variant?.id || "default";
  const optionsLabel = Object.entries(variant?.choices || {})
    .map(([name, value]) => `${name}: ${value}`)
    .join(", ");
  return {
    id: `${product.id}:${variantId}`,
    productId: product.id,
    name: product.name,
    quantity,
    priceLabel: variant?.priceLabel || product.priceLabel || "PLACEHOLDER",
    lineTotalLabel: variant?.priceLabel || product.priceLabel || "PLACEHOLDER",
    optionsLabel,
    image: product.images?.[0] || null,
  };
}

export function CartProvider({ children }) {
  const demo = isDemoMode();
  const [items, setItems] = useState(() => (demo ? readDemoCart() : []));
  const [subtotalLabel, setSubtotalLabel] = useState(demo ? "PLACEHOLDER" : "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (demo) {
      writeDemoCart(items);
      setSubtotalLabel(items.length ? "PLACEHOLDER" : "");
    }
  }, [demo, items]);

  useEffect(() => {
    if (demo) return undefined;
    let live = true;
    readCurrentCart()
      .then((cart) => {
        if (!live || !cart) return;
        setItems(cart.lines);
        setSubtotalLabel(cart.subtotalLabel || "");
      })
      .catch((reason) => {
        if (!live) return;
        setError(reason?.message || "The cart could not be loaded.");
      });
    return () => {
      live = false;
    };
  }, [demo]);

  const applyCart = useCallback((cart) => {
    setItems(cart.lines);
    setSubtotalLabel(cart.subtotalLabel || "");
    setError("");
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const add = useCallback(
    async ({ product, variant, quantity = 1 }) => {
      setBusy(true);
      setError("");
      try {
        if (demo) {
          const next = demoLine(product, variant, quantity);
          setItems((current) => {
            const existing = current.find((item) => item.id === next.id);
            if (!existing) return [...current, next];
            return current.map((item) =>
              item.id === next.id ? { ...item, quantity: item.quantity + quantity } : item,
            );
          });
          setDrawerOpen(true);
          return;
        }
        applyCart(await addToCurrentCart(product, variant, quantity));
        setDrawerOpen(true);
      } catch (reason) {
        setError(reason?.message || "The item could not be added.");
      } finally {
        setBusy(false);
      }
    },
    [applyCart, demo],
  );

  const setQuantity = useCallback(
    async (lineId, quantity) => {
      const nextQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
      setBusy(true);
      setError("");
      try {
        if (demo) {
          setItems((current) =>
            current.map((item) => (item.id === lineId ? { ...item, quantity: nextQuantity } : item)),
          );
          return;
        }
        applyCart(await updateCurrentCartQuantity(lineId, nextQuantity));
      } catch (reason) {
        setError(reason?.message || "The quantity could not be updated.");
      } finally {
        setBusy(false);
      }
    },
    [applyCart, demo],
  );

  const remove = useCallback(
    async (lineId) => {
      setBusy(true);
      setError("");
      try {
        if (demo) {
          setItems((current) => current.filter((item) => item.id !== lineId));
          return;
        }
        applyCart(await removeCurrentCartLines([lineId]));
      } catch (reason) {
        setError(reason?.message || "The item could not be removed.");
      } finally {
        setBusy(false);
      }
    },
    [applyCart, demo],
  );

  const checkout = useCallback(async () => {
    if (!items.length) return { demo, started: false };
    setBusy(true);
    setError("");
    try {
      if (demo) return { demo: true, started: false };
      await redirectToCheckout();
      return { demo: false, started: true };
    } catch (reason) {
      setError(reason?.message || "Checkout could not be started.");
      return { demo: false, started: false };
    } finally {
      setBusy(false);
    }
  }, [demo, items.length]);

  const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const api = useMemo(
    () => ({
      items,
      count,
      subtotalLabel,
      demo,
      drawerOpen,
      busy,
      error,
      openDrawer,
      closeDrawer,
      add,
      setQuantity,
      remove,
      checkout,
    }),
    [add, busy, checkout, closeDrawer, count, demo, drawerOpen, error, items, openDrawer, remove, setQuantity, subtotalLabel],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("CartProvider missing");
  return value;
}
