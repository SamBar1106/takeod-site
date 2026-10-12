import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { MEDIA } from "../config.js";
import { prefersReducedMotion } from "../lib/motion.js";
import { useCart } from "../context/CartContext.jsx";
import { AppLink } from "./AppLink.jsx";

gsap.registerPlugin(Flip);

const LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/#categories", label: "Categories" },
  { to: "/#ordering", label: "Ordering" },
  { to: "/#why", label: "Why Daykodee" },
  { to: "/#about", label: "About" },
];

export function Header() {
  const location = useLocation();
  const brandRef = useRef(null);
  const shrunkRef = useRef(false);
  const flipRef = useRef(null);
  const bootRef = useRef(true);
  const [open, setOpen] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const { count, openDrawer } = useCart();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      if (next === shrunkRef.current) return;
      if (!bootRef.current && brandRef.current && !prefersReducedMotion()) {
        flipRef.current = Flip.getState(brandRef.current);
      }
      shrunkRef.current = next;
      setShrunk(next);
    };
    onScroll();
    bootRef.current = false;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    if (!flipRef.current || !brandRef.current) return undefined;
    const state = flipRef.current;
    flipRef.current = null;
    const tween = Flip.from(state, {
      duration: 0.45,
      ease: "power3.inOut",
      absolute: true,
      nested: true,
    });
    return () => tween?.kill();
  }, [shrunk]);

  return (
    <header className={`site-header${shrunk ? " is-shrunk" : ""}`}>
      <div className="wrap site-header__bar">
        <AppLink className="brand" to="/#main" ref={brandRef}>
          <picture>
            <source srcSet={`${MEDIA}logo.webp`} type="image/webp" />
            <img className="brand__img" src={`${MEDIA}logo.png`} alt="Daykodee" width="720" height="473" />
          </picture>
        </AppLink>
        <nav className={`site-nav${open ? " is-open" : ""}`} id="site-nav" aria-label="Primary">
          {LINKS.map((link) => (
            <AppLink key={link.label} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </AppLink>
          ))}
        </nav>
        <div className="header-tools">
          <button className="cart-toggle" type="button" onClick={openDrawer} aria-label={`Cart, ${count} items`}>
            Cart
            <span className="cart-toggle__count">{count}</span>
          </button>
          <AppLink className="btn btn--gold header-cta" to="/contact">
            Request a Quote
            <span className="btn__sweep" aria-hidden="true" />
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
