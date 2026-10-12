import { useEffect } from "react";
import gsap from "gsap";
import { finePointer, prefersReducedMotion } from "../lib/motion.js";

export function useButtonMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const fine = finePointer();

    const closestButton = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return null;
      return target.closest(".btn");
    };

    const enter = (event) => {
      const button = closestButton(event);
      if (!button || !fine) return;
      if (button.contains(event.relatedTarget)) return;
      const sweep = button.querySelector(".btn__sweep");
      gsap.to(button, { scale: 1.05, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      if (sweep) gsap.to(sweep, { scaleX: 1, duration: 0.25, ease: "power2.out", overwrite: "auto" });
    };
    const leave = (event) => {
      const button = closestButton(event);
      if (!button || !fine) return;
      if (button.contains(event.relatedTarget)) return;
      const sweep = button.querySelector(".btn__sweep");
      gsap.to(button, { scale: 1, duration: 0.2, ease: "power2.out", overwrite: "auto" });
      if (sweep) gsap.to(sweep, { scaleX: 0, duration: 0.2, ease: "power2.in", overwrite: "auto" });
    };
    const down = (event) => {
      const button = closestButton(event);
      if (!button) return;
      gsap.to(button, { scale: 0.97, duration: 0.08, overwrite: "auto" });
    };
    const up = (event) => {
      const button = closestButton(event);
      if (!button) return;
      gsap.to(button, { scale: fine ? 1.05 : 1, duration: 0.15, ease: "power2.out", overwrite: "auto" });
    };

    document.addEventListener("pointerover", enter);
    document.addEventListener("pointerout", leave);
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", up);
    return () => {
      document.removeEventListener("pointerover", enter);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
    };
  }, []);
}
