import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { useLenis } from "./SmoothScroll.jsx";

export function ScrollProgress() {
  const barRef = useRef(null);
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      gsap.set(bar, { scaleX: max > 0 ? Math.min(1, Math.max(0, y / max)) : 0 });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    lenis?.on("scroll", update);
    return () => {
      window.removeEventListener("scroll", update);
      lenis?.off("scroll", update);
    };
  }, [pathname, lenis]);

  return <div className="scroll-progress" ref={barRef} aria-hidden="true" />;
}
