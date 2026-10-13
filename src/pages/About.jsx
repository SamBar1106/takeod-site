import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MEDIA } from "../config.js";
import { prefersReducedMotion, whenFontsReady } from "../lib/motion.js";
import { useLifestyleVideo } from "../components/useHeroReel.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

const PANELS = [
  { kind: "title", text: "Part of the Family Affair Family" },
  { kind: "line", text: "Daykodee is the merchandise shop for Family Affair Child Care Centers locations." },
  { kind: "line", text: "The franchise is built on its founders' four decades in early childhood education." },
  {
    kind: "line",
    text: "Daykodee helps every center carry that warm, family-first spirit onto the products kids and families use every day.",
  },
  { kind: "media" },
];

export function About() {
  const rootRef = useRef(null);
  useLifestyleVideo(rootRef);

  useEffect(() => {
    document.title = "Part of the Family Affair Family | Daykodee";
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    let dead = false;
    let cleanup = () => {};
    whenFontsReady().then(() => {
      if (dead || !rootRef.current) return;
      cleanup = mountStory(rootRef.current);
    });
    return () => {
      dead = true;
      cleanup();
    };
  }, []);

  return (
    <section className="story" ref={rootRef} aria-labelledby="story-title">
      <div className="story__viewport">
        <div className="story__track">
          {PANELS.map((panel, index) => (
            <article className={`story__panel story__panel--${panel.kind}`} key={panel.text || "media"}>
              {panel.kind === "title" ? (
                <h1 id="story-title" data-reveal>
                  {panel.text}
                </h1>
              ) : null}
              {panel.kind === "line" ? <p data-reveal>{panel.text}</p> : null}
              {panel.kind === "media" ? (
                <div className="about__media">
                  <div className="about__parallax">
                    <img
                      className="about__poster"
                      src={`${MEDIA}poster-l1.webp`}
                      alt="Children and a teacher smiling in a bright classroom"
                      width="1280"
                      height="720"
                    />
                    <video className="about__video" muted playsInline preload="none" aria-hidden="true" />
                  </div>
                </div>
              ) : null}
              <span className="story__index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function mountStory(root) {
  const viewport = root.querySelector(".story__viewport");
  const track = root.querySelector(".story__track");
  const panels = [...root.querySelectorAll(".story__panel")];
  if (!viewport || !track || !panels.length) return () => {};

  const pinTop = () => {
    const header = document.querySelector(".site-header");
    const banner = document.querySelector(".demo-banner");
    return Math.round((header?.getBoundingClientRect().height || 0) + (banner?.getBoundingClientRect().height || 0));
  };
  root.style.setProperty("--pin-offset", `${pinTop()}px`);
  root.classList.add("is-animated");
  const size = () => {
    const width = viewport.clientWidth;
    panels.forEach((panel) => {
      panel.style.flexBasis = `${width}px`;
      panel.style.width = `${width}px`;
    });
    return Math.max(0, track.scrollWidth - width);
  };
  size();

  const reveals = [];
  panels.forEach((panel) => {
    const target = panel.querySelector("[data-reveal]");
    if (!target) return;
    const split = SplitText.create(target, {
      type: "lines",
      tag: "span",
      aria: "auto",
      linesClass: "line",
    });
    let reverted = false;
    const revert = () => {
      if (reverted) return;
      reverted = true;
      split.revert();
    };
    const tween = gsap.from(split.lines, {
      y: 24,
      opacity: 0,
      stagger: 0.06,
      duration: 0.45,
      ease: "power3.out",
      paused: true,
      immediateRender: false,
      onComplete: revert,
    });
    const timer = window.setTimeout(revert, 8000);
    reveals.push({ panel, tween, revert, timer });
  });

  const playReveal = (index) => {
    const item = reveals.find((entry) => entry.panel === panels[index]);
    if (!item || item.tween.progress() > 0) return;
    item.tween.play();
  };
  playReveal(0);

  const tween = gsap.to(track, {
    x: () => -size(),
    ease: "none",
    scrollTrigger: {
      trigger: root,
      start: () => `top ${pinTop()}px`,
      end: () => `+=${size() + window.innerHeight * 0.15}`,
      pin: viewport,
      scrub: 0.6,
      anticipatePin: 0,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onUpdate: (self) => {
        const index = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
        playReveal(index);
      },
    },
  });

  return () => {
    reveals.forEach((item) => {
      window.clearTimeout(item.timer);
      item.revert();
    });
    tween.scrollTrigger?.kill();
    tween.kill();
    root.classList.remove("is-animated");
    panels.forEach((panel) => {
      panel.style.flexBasis = "";
      panel.style.width = "";
    });
    gsap.set(track, { clearProps: "transform" });
  };
}
