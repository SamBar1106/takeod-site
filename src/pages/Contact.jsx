import { useEffect } from "react";
import { AppLink } from "../components/AppLink.jsx";

export function Contact() {
  useEffect(() => {
    document.title = "Ready to Outfit Your Center? | Daykodee";
  }, []);

  return (
    <section className="section cta cta--page" aria-labelledby="contact-title">
      <div className="section__stage">
        <div className="cta__blocks" aria-hidden="true">
          <span className="cta__block cta__block--a" />
          <span className="cta__block cta__block--b" />
          <span className="cta__block cta__block--c" />
        </div>
        <div className="wrap cta__inner">
          <h1 id="contact-title">Ready to Outfit Your Center?</h1>
          <p>Browse the catalog, or tell us what you need and we'll put together a quote.</p>
          <div className="cta__actions">
            <AppLink className="btn btn--primary" to="/shop">
              Shop Products
              <span className="btn__sweep" aria-hidden="true" />
            </AppLink>
          </div>
        </div>
      </div>
    </section>
  );
}
