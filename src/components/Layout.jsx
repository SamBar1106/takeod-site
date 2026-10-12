import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { isDemoMode } from "../lib/wix.js";
import { CartDrawer } from "./CartDrawer.jsx";
import { Footer } from "./Footer.jsx";
import { HashScroll } from "./HashScroll.jsx";
import { Header } from "./Header.jsx";
import { useButtonMotion } from "./useButtonMotion.js";

export function Layout() {
  const location = useLocation();
  useButtonMotion();

  useEffect(() => {
    const link = document.querySelector('link[rel="canonical"]');
    if (!link) return;
    const root = import.meta.env.BASE_URL.replace(/\/$/, "");
    const path = location.pathname === "/" ? "/" : location.pathname;
    link.setAttribute("href", `https://sambar1106.github.io${root}${path}`);
  }, [location.pathname]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="site-top">
        {isDemoMode() ? (
          <p className="demo-banner" role="status">
            Demo mode
          </p>
        ) : null}
        <Header />
      </div>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <HashScroll />
    </>
  );
}
