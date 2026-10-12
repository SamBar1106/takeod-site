import { MEDIA } from "../config.js";
import { AppLink } from "./AppLink.jsx";

const LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/shipping", label: "Shipping" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/contact", label: "Request a Quote" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__bar">
        <AppLink className="brand" to="/#main">
          <img className="brand__img" src={`${MEDIA}logo.webp`} alt="Daykodee" width="720" height="473" />
        </AppLink>
        <ul className="site-footer__links">
          {LINKS.map((link) => (
            <li key={link.to}>
              <AppLink to={link.to}>{link.label}</AppLink>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
