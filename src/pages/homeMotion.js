import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { finePointer } from "../lib/motion.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

function revertLater(split, ms = 2600) {
  let done = false;
  const revert = () => {
    if (done) return;
    done = true;
    split.revert();
  };
  const timer = window.setTimeout(revert, ms);
  return { revert, cancel: () => window.clearTimeout(timer) };
}

export function mountHomeMotion(root) {
  const cleanups = [];
  const ctx = gsap.context(() => {
    const fine = finePointer();
    const phone = window.matchMedia("(max-width: 767px)").matches;

    const title = root.querySelector(".hero__title");
    if (title) {
      const split = SplitText.create(title, {
        type: "chars,words",
        tag: "span",
        aria: "auto",
        mask: "chars",
        charsClass: "char",
        wordsClass: "word",
      });
      const guard = revertLater(split, 2800);
      gsap.from(split.chars, {
        yPercent: 115,
        duration: 0.55,
        stagger: 0.028,
        ease: "back.out(2)",
        onComplete: guard.revert,
      });
      cleanups.push(() => {
        guard.cancel();
        guard.revert();
      });
    }

    const hero = root.querySelector(".hero");
    const slot = root.querySelector(".hero .spline-slot");
    const stage = slot?.querySelector(".spline-slot__stage");
    const image = slot?.querySelector(".spline-slot__img");

    if (image && !phone) {
      gsap.fromTo(image, { y: -12 }, { y: 12, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
    if (stage && hero) {
      gsap.to(stage, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }
    if (slot && stage && fine && !phone) {
      const onMove = (event) => {
        const box = slot.getBoundingClientRect();
        const rotateY = ((event.clientX - box.left) / box.width - 0.5) * 10;
        const rotateX = ((event.clientY - box.top) / box.height - 0.5) * -8;
        const x = ((event.clientX - box.left) / box.width - 0.5) * 14;
        gsap.to(stage, {
          rotateX,
          rotateY,
          x,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
          transformPerspective: 800,
        });
      };
      const onLeave = () => {
        gsap.to(stage, {
          rotateX: 0,
          rotateY: 0,
          x: 0,
          duration: 0.6,
          ease: "power3.out",
          overwrite: "auto",
        });
      };
      slot.addEventListener("pointermove", onMove);
      slot.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        slot.removeEventListener("pointermove", onMove);
        slot.removeEventListener("pointerleave", onLeave);
      });
    }

    const cards = gsap.utils.toArray(root.querySelectorAll(".categories .card"));
    if (cards.length) {
      gsap.from(cards, {
        y: 36,
        opacity: 0,
        stagger: 0.08,
        duration: 0.65,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: root.querySelector(".cards"),
          start: "top 85%",
          once: true,
        },
        onComplete: () => gsap.set(cards, { clearProps: "opacity,transform" }),
      });
      const cardTimer = window.setTimeout(() => gsap.set(cards, { clearProps: "opacity,transform" }), 4000);
      cleanups.push(() => window.clearTimeout(cardTimer));
    }
    if (fine) {
      cards.forEach((card) => {
        const img = card.querySelector("img");
        const border = card.querySelector(".card__border");
        const onMove = (event) => {
          const box = card.getBoundingClientRect();
          const rotateY = ((event.clientX - box.left) / box.width - 0.5) * 12;
          const rotateX = ((event.clientY - box.top) / box.height - 0.5) * -10;
          gsap.to(card, {
            rotateX,
            rotateY,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
            transformPerspective: 900,
          });
          if (img) gsap.to(img, { scale: 1.06, duration: 0.35, ease: "power2.out", overwrite: "auto" });
          if (border) gsap.to(border, { scaleX: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
        };
        const onLeave = () => {
          gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
          if (img) gsap.to(img, { scale: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
          if (border) gsap.to(border, { scaleX: 0, duration: 0.25, ease: "power2.in", overwrite: "auto" });
        };
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        });
      });
    }

    const ordering = root.querySelector("#ordering");
    const steps = gsap.utils.toArray(root.querySelectorAll("#ordering .step"));
    const line = root.querySelector(".steps__line-bar");
    const nums = steps.map((step) => step.querySelector(".step__num"));
    if (ordering && steps.length === 3 && line) {
      const originals = nums.map((el, index) => el?.textContent || String(index + 1).padStart(2, "0"));
      const horizontal = !phone;
      const fits = ordering.getBoundingClientRect().height <= window.innerHeight * 0.96;
      const proxy = { p: 0 };
      const write = () => {
        nums.forEach((el, index) => {
          if (!el) return;
          const target = index + 1;
          const start = index / 3;
          const span = 1 / 3;
          const local = gsap.utils.clamp(0, 1, (proxy.p / 3 - start) / span);
          el.textContent = String(Math.round(local * target)).padStart(2, "0");
        });
      };
      const fromVars = horizontal ? { scaleX: 0 } : { scaleY: 0 };
      const toVars = horizontal ? { scaleX: 1 } : { scaleY: 1 };
      gsap.timeline({
        scrollTrigger: {
          trigger: ordering,
          start: "top 72px",
          end: horizontal ? "+=110%" : "+=80%",
          pin: horizontal && fits,
          scrub: 0.55,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      })
        .fromTo(line, fromVars, { ...toVars, ease: "none", duration: 1, immediateRender: false }, 0)
        .to(proxy, { p: 3, ease: "none", duration: 1, immediateRender: false, onUpdate: write }, 0);
      cleanups.push(() => {
        nums.forEach((el, index) => {
          if (el) el.textContent = originals[index];
        });
        gsap.set(line, { scaleX: 1, scaleY: 1 });
      });
    }

    const whyItems = gsap.utils.toArray(root.querySelectorAll(".why__item"));
    if (whyItems.length) {
      gsap.from(whyItems, {
        y: 48,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: root.querySelector(".why__list"),
          start: "top 82%",
          once: true,
        },
        onComplete: () => gsap.set(whyItems, { clearProps: "opacity,transform" }),
      });
      const whyTimer = window.setTimeout(() => gsap.set(whyItems, { clearProps: "opacity,transform" }), 4500);
      cleanups.push(() => window.clearTimeout(whyTimer));
    }

    const parallax = root.querySelector(".about__parallax");
    const about = root.querySelector("#about");
    if (parallax && about) {
      gsap.fromTo(
        parallax,
        { yPercent: 4 },
        {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: about,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }

    const aboutCopy = root.querySelector(".about__copy p");
    if (aboutCopy) {
      const split = SplitText.create(aboutCopy, {
        type: "lines",
        tag: "span",
        aria: "auto",
        linesClass: "line",
      });
      const guard = revertLater(split, 5000);
      gsap.from(split.lines, {
        y: 22,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: aboutCopy,
          start: "top 82%",
          once: true,
        },
        onStart: () => {
          window.setTimeout(guard.revert, 1800);
        },
        onComplete: guard.revert,
      });
      cleanups.push(() => {
        guard.cancel();
        guard.revert();
      });
    }

    const magnet = root.querySelector("[data-magnetic]");
    const magnetBtn = magnet?.querySelector(".btn");
    if (magnet && magnetBtn && fine) {
      const xTo = gsap.quickTo(magnetBtn, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(magnetBtn, "y", { duration: 0.35, ease: "power3.out" });
      const onMove = (event) => {
        const box = magnet.getBoundingClientRect();
        xTo((event.clientX - (box.left + box.width / 2)) * 0.35);
        yTo((event.clientY - (box.top + box.height / 2)) * 0.35);
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
