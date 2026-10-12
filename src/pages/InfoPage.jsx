import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "../lib/motion.js";
import { Accordion } from "../components/Accordion.jsx";

const PAGES = {
  faq: "PLACEHOLDER — FAQ",
  shipping: "PLACEHOLDER — Shipping",
  privacy: "PLACEHOLDER — Privacy",
  terms: "PLACEHOLDER — Terms",
};

export function InfoPage({ page }) {
  const heading = PAGES[page] || "PLACEHOLDER";
  const rootRef = useRef(null);

  useEffect(() => {
    document.title = `${heading} | Daykodee`;
  }, [heading]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    const items = root.querySelectorAll("[data-fade]");
    const tween = gsap.from(items, {
      y: 24,
      opacity: 0,
      stagger: 0.08,
      duration: 0.5,
      ease: "power3.out",
      immediateRender: false,
      onComplete: () => gsap.set(items, { clearProps: "opacity,transform" }),
    });
    const timer = window.setTimeout(() => gsap.set(items, { clearProps: "opacity,transform" }), 2200);
    return () => {
      tween.kill();
      window.clearTimeout(timer);
      gsap.set(items, { clearProps: "opacity,transform" });
    };
  }, [page]);

  return (
    <section className="section info" ref={rootRef}>
      <div className="section__stage">
        <div className="wrap">
          <h1 data-fade>{heading}</h1>
          <div className="accordions">
            {[0, 1, 2].map((item) => (
              <div data-fade key={item}>
                <Accordion heading="PLACEHOLDER" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
