import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { finePointer, prefersReducedMotion } from "../lib/motion.js";

gsap.registerPlugin(ScrollTrigger);

export function mountHomeMotion(root) {
  if (prefersReducedMotion()) return () => {};
  const cleanups = [];
  const ctx = gsap.context(() => {
    const heroBits = root.querySelectorAll("[data-hero]");
    if (heroBits.length) {
      const tween = gsap.from(heroBits, {
        y: 22,
        opacity: 0,
        stagger: 0.07,
        duration: 0.6,
        ease: "power3.out",
        immediateRender: false,
        onComplete: () => gsap.set(heroBits, { clearProps: "opacity,transform" }),
      });
      const timer = window.setTimeout(() => gsap.set(heroBits, { clearProps: "opacity,transform" }), 2400);
      cleanups.push(() => {
        tween.kill();
        window.clearTimeout(timer);
      });
    }

    const cards = gsap.utils.toArray(root.querySelectorAll(".cat-card"));
    if (cards.length) {
      const tween = gsap.from(cards, {
        y: 28,
        opacity: 0,
        stagger: 0.06,
        duration: 0.55,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: root.querySelector(".cat-grid"), start: "top 86%", once: true },
        onComplete: () => gsap.set(cards, { clearProps: "opacity,transform" }),
      });
      cleanups.push(() => tween.kill());
    }

    const showcase = root.querySelector(".hero-visual");
    const stage = root.querySelector(".hero-visual__media");
    if (showcase && stage && finePointer()) {
      const onMove = (event) => {
        const box = showcase.getBoundingClientRect();
        const x = ((event.clientX - box.left) / box.width - 0.5) * 16;
        const y = ((event.clientY - box.top) / box.height - 0.5) * 10;
        gsap.to(stage, { x, y, duration: 0.45, ease: "power2.out", overwrite: "auto" });
      };
      const onLeave = () => gsap.to(stage, { x: 0, y: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      showcase.addEventListener("pointermove", onMove);
      showcase.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        showcase.removeEventListener("pointermove", onMove);
        showcase.removeEventListener("pointerleave", onLeave);
      });
    }

    const magnet = root.querySelector("[data-magnetic]");
    const magnetBtn = magnet?.querySelector(".btn");
    if (magnet && magnetBtn && finePointer()) {
      const xTo = gsap.quickTo(magnetBtn, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(magnetBtn, "y", { duration: 0.35, ease: "power3.out" });
      const onMove = (event) => {
        const box = magnet.getBoundingClientRect();
        xTo((event.clientX - (box.left + box.width / 2)) * 0.28);
        yTo((event.clientY - (box.top + box.height / 2)) * 0.28);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };
      magnet.addEventListener("pointermove", onMove);
      magnet.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        magnet.removeEventListener("pointermove", onMove);
        magnet.removeEventListener("pointerleave", onLeave);
      });
    }
  }, root);

  requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => {
    cleanups.forEach((fn) => fn());
    ctx.revert();
  };
}
