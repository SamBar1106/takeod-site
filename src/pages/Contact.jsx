import { useEffect } from "react";
import { AppLink } from "../components/AppLink.jsx";

export function Contact() {
  useEffect(() => {
    document.title = "Ready to Outfit Your Center for the New Term? | Daykodee";
  }, []);

  return (
    <section className="closer" aria-labelledby="contact-title">
      <div className="wrap">
        <h1 id="contact-title">Ready to Outfit Your Center for the New Term?</h1>
        <p>Ordering for a group? Contact us.</p>
        <div className="hero-actions" data-magnetic>
          <AppLink className="btn btn--gold" to="/shop">
            Browse 2025 Catalog
          </AppLink>
        </div>
      </div>
    </section>
  );
}
