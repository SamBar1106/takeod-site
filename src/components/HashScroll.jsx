import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion } from "../lib/motion.js";
import { useLenis } from "./SmoothScroll.jsx";

export function HashScroll() {
  const { hash, pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (!hash || hash.length < 2) return undefined;
    const started = performance.now();
    let frame = 0;
    const go = () => {
      const el = document.getElementById(hash.slice(1));
      if (!el) {
        if (performance.now() - started < 1400) frame = requestAnimationFrame(go);
        return;
      }
      if (lenis && !prefersReducedMotion()) lenis.scrollTo(el, { offset: -72 });
      else {
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: "auto" });
      }
    };
    const timer = window.setTimeout(go, 40);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [hash, pathname, lenis]);

  return null;
}
