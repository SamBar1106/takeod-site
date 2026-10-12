import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "../lib/motion.js";

const QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

export function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    const fine = window.matchMedia(QUERY);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!ring || !dot) return undefined;

    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const xTo = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });
    const xDot = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });

    const enabled = () => fine.matches && !reduce.matches && !prefersReducedMotion();
    const apply = () => {
      document.documentElement.classList.toggle("has-cursor", enabled());
    };
    const onMove = (event) => {
      if (!enabled()) return;
      xTo(event.clientX);
      yTo(event.clientY);
      xDot(event.clientX);
      yDot(event.clientY);
    };
    const onOver = (event) => {
      const hot = event.target instanceof Element && event.target.closest("a, button");
      ring.classList.toggle("is-hot", Boolean(hot));
    };

    apply();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    fine.addEventListener("change", apply);
    reduce.addEventListener("change", apply);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      fine.removeEventListener("change", apply);
      reduce.removeEventListener("change", apply);
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}
