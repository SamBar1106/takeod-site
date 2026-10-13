import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { AppLink } from "./AppLink.jsx";
import { CartLines } from "./CartLines.jsx";

export function CartDrawer() {
  const { items, subtotalLabel, drawerOpen, closeDrawer, checkout, busy, error } = useCart();
  const closeRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer, drawerOpen]);

  if (!drawerOpen) return null;

  const onCheckout = async () => {
    const result = await checkout();
    if (result?.demo) {
      closeDrawer();
      navigate("/checkout");
    }
  };

  return (
    <div className="cart-drawer" role="presentation">
      <button className="cart-drawer__shade" type="button" aria-label="Close cart" onClick={closeDrawer} />
      <div className="cart-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <div className="cart-drawer__bar">
          <h2 id="cart-drawer-title">Cart</h2>
          <button ref={closeRef} type="button" onClick={closeDrawer}>
            Close
          </button>
        </div>
        <CartLines items={items} />
        {error ? <p className="cart-note">{error}</p> : null}
        {items.length ? (
          <p className="cart-subtotal">
            <span>Subtotal</span>
            <span>{subtotalLabel}</span>
          </p>
        ) : null}
        <div className="cart-drawer__actions">
          <AppLink className="btn btn--primary" to="/cart" onClick={closeDrawer}>
            Cart
            <span className="btn__sweep" aria-hidden="true" />
          </AppLink>
          <button className="btn btn--gold" type="button" disabled={busy || !items.length} onClick={onCheckout}>
            Checkout
            <span className="btn__sweep" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
