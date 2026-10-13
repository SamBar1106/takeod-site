import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLink } from "../components/AppLink.jsx";

export function ThankYou() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  useEffect(() => {
    document.title = "Thank you | Daykodee";
  }, []);

  return (
    <section className="section info">
      <div className="section__stage">
        <div className="wrap">
          <h1>Thank you</h1>
          {orderId ? <p className="cart-note">Order {orderId}</p> : null}
          <AppLink className="btn btn--gold" to="/shop">
            Shop Products
            <span className="btn__sweep" aria-hidden="true" />
          </AppLink>
        </div>
      </div>
    </section>
  );
}
