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
        <p>
          Get instant volume pricing, custom student rosters sorted, and a free sample sizing kit sent to your campus
          office.
        </p>
        <div className="hero-actions" data-magnetic>
          <AppLink className="btn btn--gold" to="/shop">
            Browse 2025 Catalog
          </AppLink>
          <AppLink className="btn btn--ghost" to="/shop">
            Download Director PDF Catalog
          </AppLink>
        </div>
        <p className="help-line">Need a custom sample box? Call Director Support: (800) 555-DAYK</p>
      </div>
    </section>
  );
}
