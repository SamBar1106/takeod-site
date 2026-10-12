import { useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";

export function Checkout() {
  const { items } = useCart();

  useEffect(() => {
    document.title = "PLACEHOLDER — Checkout | Daykodee";
  }, []);

  return (
    <section className="section info">
      <div className="section__stage">
        <div className="wrap">
          <h1>PLACEHOLDER — Checkout</h1>
          {items.length ? (
            <ul className="checkout-list">
              {items.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
