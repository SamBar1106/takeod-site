import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const api = useMemo(
    () => ({
      items,
      add(product) {
        setItems((current) => {
          if (current.some((item) => item.id === product.id)) return current;
          return [...current, { id: product.id, name: product.name }];
        });
      },
    }),
    [items],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("CartProvider missing");
  return value;
}
