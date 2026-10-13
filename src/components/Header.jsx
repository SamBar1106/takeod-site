import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MEDIA } from "../config.js";
import { useCart } from "../context/CartContext.jsx";
import { AppLink } from "./AppLink.jsx";

const LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { count, openDrawer } = useCart();
  const shop = location.pathname.startsWith("/shop") || location.pathname.startsWith("/category");

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  return (
    <header className="site-header">
      <div className="announce" role="region" aria-label="Center notice">
        <p className="announce__track">
          <span>
            <AppLink to="/contact">Ordering for a group? Contact us</AppLink>
          </span>
          <span aria-hidden="true">Ordering for a group? Contact us</span>
        </p>
      </div>
      <div className="site-header__bar">
        <AppLink className="brand" to="/">
          <img className="brand__img" src={`${MEDIA}logo.webp`} alt="Daykodee" width="720" height="473" />
          <span className="brand__word">Daykodee</span>
        </AppLink>
        <nav className={`site-nav${open ? " is-open" : ""}`} id="site-nav" aria-label="Primary">
          {LINKS.map((link) => (
            <AppLink
              key={link.label}
              to={link.to}
              aria-current={link.label === "Shop" && shop ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </AppLink>
          ))}
        </nav>
        <div className="header-tools">
          <AppLink className="icon-btn" to="/shop" aria-label="Search catalog">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </AppLink>
          <button className="cart-toggle" type="button" onClick={openDrawer} aria-label={`Cart, ${count} items`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 8h12l-1 12H7L6 8z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M9 8V7a3 3 0 0 1 6 0v1" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="cart-toggle__count">
              <span className="cart-toggle__n">{count}</span>
              <span className="cart-toggle__label"> items</span>
            </span>
          </button>
          <AppLink className="director" to="/contact">
            Director
          </AppLink>
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
