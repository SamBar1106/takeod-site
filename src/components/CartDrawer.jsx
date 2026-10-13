import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { AppLink } from "./AppLink.jsx";
import { CartLines } from "./CartLines.jsx";

export function CartDrawer() {
  const { items, count, subtotalLabel, drawerOpen, closeDrawer, checkout, busy, error } = useCart();
  const closeRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  useEffect(() => {
    document.body.classList.toggle("drawer-open", drawerOpen);
    return () => document.body.classList.remove("drawer-open");
  }, [drawerOpen]);

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
          <div>
            <h2 id="cart-drawer-title">Your Center Cart</h2>
            <p className="cart-meta">
              {items.length} {items.length === 1 ? "Product" : "Products"}
              {count !== items.length ? ` · ${count} Units` : ""}
            </p>
          </div>
          <button ref={closeRef} type="button" onClick={closeDrawer}>
            Close
          </button>
        </div>
        <p className="tier-note--drawer">Bulk discounts apply automatically at 25+ units.</p>
        <CartLines items={items} />
        {!items.length ? <p>Your center cart is empty.</p> : null}
        {error ? <p className="cart-note">{error}</p> : null}
        {items.length ? (
          <div className="cart-totals">
            <p className="cart-subtotal">
              <span>Subtotal</span>
              <span>{subtotalLabel}</span>
            </p>
            <p>
              <span>Campus Direct Freight</span>
              <span>At checkout</span>
            </p>
            <p className="cart-total">
              <span>Total Investment</span>
              <span>{subtotalLabel}</span>
            </p>
          </div>
        ) : null}
        <div className="cart-drawer__actions">
          <button className="btn btn--gold" type="button" disabled={busy || !items.length} onClick={onCheckout}>
            Proceed to Checkout
          </button>
          <AppLink className="btn btn--ghost" to="/cart" onClick={closeDrawer}>
            View Cart
          </AppLink>
          <AppLink className="btn btn--ghost" to="/contact" onClick={closeDrawer}>
            Download Formal Purchase Order Quote PDF
          </AppLink>
        </div>
        <p className="cart-assure">
          <span>Net-30 Available</span>
          <span>100% Reprint Guarantee</span>
        </p>
      </div>
    </div>
  );
}
