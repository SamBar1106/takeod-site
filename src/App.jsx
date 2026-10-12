import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CartProvider } from "./context/CartContext.jsx";
import { prefersReducedMotion } from "./lib/motion.js";
import { CustomCursor } from "./components/CustomCursor.jsx";
import { Layout } from "./components/Layout.jsx";
import { ScrollProgress } from "./components/ScrollProgress.jsx";
import { SmoothScroll, useLenis } from "./components/SmoothScroll.jsx";
import { About } from "./pages/About.jsx";
import { Cart } from "./pages/Cart.jsx";
import { Checkout } from "./pages/Checkout.jsx";
import { Contact } from "./pages/Contact.jsx";
import { Home } from "./pages/Home.jsx";
import { InfoPage } from "./pages/InfoPage.jsx";
import { Missing } from "./pages/Missing.jsx";
import { Product } from "./pages/Product.jsx";
import { Shop } from "./pages/Shop.jsx";
import { ThankYou } from "./pages/ThankYou.jsx";

gsap.registerPlugin(ScrollTrigger);

function basename() {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function catalogPath(pathname) {
  return pathname === "/shop" || pathname.startsWith("/category/");
}

function TransitionShell() {
  const location = useLocation();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const [display, setDisplay] = useState(location);
  const overlayRef = useRef(null);
  const seen = useRef(null);
  const covered = useRef(false);
  const gen = useRef(0);
  const routeKey = `${location.pathname}${location.search}`;

  useLayoutEffect(() => {
    const panel = overlayRef.current;
    if (!panel) return undefined;
    if (seen.current === null) {
      seen.current = routeKey;
      gsap.set(panel, { x: 0, xPercent: 100 });
      return undefined;
    }
    if (seen.current === routeKey) return undefined;
    const previous = seen.current;
    seen.current = routeKey;

    if (catalogPath(previous) && catalogPath(location.pathname)) {
      setDisplay(location);
      return undefined;
    }
    if (prefersReducedMotion()) {
      setDisplay(location);
      if (!location.hash) window.scrollTo(0, 0);
      return undefined;
    }

    const current = ++gen.current;
    covered.current = false;
    panel.style.pointerEvents = "auto";
    const tl = gsap.timeline();
    tl.set(panel, { x: 0, xPercent: 100 }).to(panel, { x: 0, xPercent: 0, duration: 0.42, ease: "power3.inOut" }).add(() => {
      if (gen.current !== current) return;
      covered.current = true;
      setDisplay(location);
    });
    const fail = window.setTimeout(() => {
      if (gen.current !== current) return;
      if (!covered.current) {
        covered.current = true;
        setDisplay(location);
      }
    }, 900);
    return () => {
      window.clearTimeout(fail);
      tl.kill();
    };
  }, [routeKey, location]);

  useLayoutEffect(() => {
    if (!covered.current) return undefined;
    const panel = overlayRef.current;
    const current = gen.current;
    if (!location.hash) {
      const scroller = lenisRef.current;
      if (scroller && !prefersReducedMotion()) scroller.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    }
    if (!panel || prefersReducedMotion()) {
      if (panel) {
        gsap.set(panel, { x: 0, xPercent: 100 });
        panel.style.pointerEvents = "none";
      }
      covered.current = false;
      return undefined;
    }
    const tween = gsap.to(panel, {
      x: 0,
      xPercent: -100,
      duration: 0.48,
      ease: "power3.inOut",
      onComplete: () => {
        if (gen.current !== current) return;
        gsap.set(panel, { x: 0, xPercent: 100 });
        panel.style.pointerEvents = "none";
        covered.current = false;
        ScrollTrigger.refresh();
        document.getElementById("main")?.focus({ preventScroll: true });
      },
    });
    const fail = window.setTimeout(() => {
      if (gen.current !== current) return;
      gsap.set(panel, { x: 0, xPercent: 100 });
      panel.style.pointerEvents = "none";
      covered.current = false;
    }, 1100);
    return () => {
      tween.kill();
      window.clearTimeout(fail);
    };
  }, [display, location.hash]);

  return (
    <>
      <Routes location={display}>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="shop/:productId" element={<Product />} />
          <Route path="category/:slug" element={<Shop />} />
          <Route path="about" element={<About />} />
          <Route path="faq" element={<InfoPage page="faq" />} />
          <Route path="shipping" element={<InfoPage page="shipping" />} />
          <Route path="privacy" element={<InfoPage page="privacy" />} />
          <Route path="terms" element={<InfoPage page="terms" />} />
          <Route path="contact" element={<Contact />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="thank-you" element={<ThankYou />} />
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
      <div className="route-slide" ref={overlayRef} aria-hidden="true" />
    </>
  );
}

export default function App() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  return (
    <BrowserRouter basename={basename()}>
      <CartProvider>
        <SmoothScroll>
          <ScrollProgress />
          <CustomCursor />
          <TransitionShell />
        </SmoothScroll>
      </CartProvider>
    </BrowserRouter>
  );
}
