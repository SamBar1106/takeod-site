import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { AppLink } from "../components/AppLink.jsx";
import { CartLines } from "../components/CartLines.jsx";

export function Cart() {
  const { items, subtotalLabel, checkout, busy, error } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Cart | Daykodee";
  }, []);

  const onCheckout = async () => {
    const result = await checkout();
    if (result?.demo) navigate("/checkout");
  };

  return (
    <section className="section info cart-page">
      <div className="section__stage">
        <div className="wrap">
          <h1>Cart</h1>
          <CartLines items={items} />
          {error ? <p className="cart-note">{error}</p> : null}
          {items.length ? (
            <>
              <p className="cart-subtotal">
                <span>Subtotal</span>
                <span>{subtotalLabel}</span>
              </p>
              <button className="btn btn--gold" type="button" disabled={busy} onClick={onCheckout}>
                Checkout
                <span className="btn__sweep" aria-hidden="true" />
              </button>
            </>
          ) : (
            <AppLink className="btn btn--gold" to="/shop">
              Shop Products
              <span className="btn__sweep" aria-hidden="true" />
            </AppLink>
          )}
        </div>
      </div>
    </section>
  );
}
