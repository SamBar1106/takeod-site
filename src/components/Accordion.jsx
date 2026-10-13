import { useId, useRef, useState } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "../lib/motion.js";

export function Accordion({ heading, children }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const panelId = useId();

  const toggle = () => {
    const panel = panelRef.current;
    if (!panel || prefersReducedMotion()) {
      setOpen((value) => !value);
      return;
    }
    if (!open) {
      setOpen(true);
      gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.35, ease: "power2.out", overwrite: true });
      return;
    }
    gsap.to(panel, {
      height: 0,
      duration: 0.28,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => setOpen(false),
    });
  };

  return (
    <div className={`accordion${open ? " is-open" : ""}`}>
      <h2 className="accordion__heading">
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={toggle}>
          {heading}
        </button>
      </h2>
      <div className="accordion__panel" id={panelId} ref={panelRef} style={{ height: open ? "auto" : 0 }}>
        {children || <p>PLACEHOLDER</p>}
      </div>
    </div>
  );
}
