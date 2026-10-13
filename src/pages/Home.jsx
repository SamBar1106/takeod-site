import { useEffect, useLayoutEffect, useRef } from "react";
import { MEDIA } from "../config.js";
import { prefersReducedMotion, whenFontsReady } from "../lib/motion.js";
import { AppLink } from "../components/AppLink.jsx";
import { mountHomeMotion } from "./homeMotion.js";

const CATEGORIES = [
  {
    title: "Mugs & Tumblers",
    copy: "Toddler spill-proof cups and teacher appreciation vacuum mugs.",
    href: "/category/mugs",
    label: "Explore Cups",
    image: "c2-800.webp",
    alt: "Branded ceramic mugs and water bottles",
  },
  {
    title: "T-Shirts & Apparel",
    copy: "Ultra-soft 100% ringspun cotton tees and durable staff embroidered polos.",
    href: "/category/shirts",
    label: "Explore Apparel",
    image: "c1-800.webp",
    alt: "Branded shirts and hats",
  },
  {
    title: "Backpacks & Totes",
    copy: "Field trip tote bags and mini cubby packs with clear nametag slots.",
    href: "/category/bags",
    label: "Explore Bags",
    image: "c3-800.webp",
    alt: "Branded tote bags",
  },
  {
    title: "Water Bottles",
    copy: "Double-wall stainless steel with easy-flip straws and silicone bases.",
    href: "/category/water-bottles",
    label: "Explore Bottles",
    image: "poster-h1-1280.webp",
    alt: "Branded water bottles",
  },
  {
    title: "Hats & Beanies",
    copy: "Sun-safe UV playground hats and cozy winter knit beanies.",
    href: "/category/hats",
    label: "Explore Hats",
    image: "poster-h2.webp",
    alt: "Branded caps",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Select Products",
    copy: "Browse mugs, shirts, bags, bottles, and hats in the catalog.",
    note: "Shop Products",
  },
  {
    n: "02",
    title: "Ordering for a Group",
    copy: "Ordering for a group? Contact us.",
    note: "Contact us",
    href: "/contact",
  },
  {
    n: "03",
    title: "Add to Cart",
    copy: "Choose the options shown on a product, then add it to your cart.",
    note: "Proceed to Checkout",
  },
];

const WHY = [
  ["Shop the Catalog", "Browse mugs, shirts, bags, bottles, and hats."],
  ["Ordering for a Group", "Ordering for a group? Contact us.", "/contact"],
  ["Family Affair Centers", "Daykodee is the merchandise shop for Family Affair Child Care Centers locations."],
  [
    "Family-first",
    "Daykodee helps every center carry that warm, family-first spirit onto the products kids and families use every day.",
  ],
];

export function Home() {
  const rootRef = useRef(null);

  useEffect(() => {
    document.title = "Daykodee | Branded Kids' Gear for Family Affair Centers";
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    let cleanup = () => {};
    let dead = false;
    whenFontsReady().then(() => {
      if (dead || !rootRef.current) return;
      cleanup = mountHomeMotion(rootRef.current);
    });
    return () => {
      dead = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={rootRef}>
      <section className="hero-block">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow" data-hero>
              Part of the Family Affair Family
            </p>
            <h1 data-hero>
              Branded Kids’ Gear, Made for <span>Family Affair Centers</span>
            </h1>
            <p className="lede" data-hero>
              Durable apparel and gear for Family Affair childcare classrooms, field trips, and everyday adventures.
              Built tough for little hands.
            </p>
            <div className="hero-actions" data-hero>
              <AppLink className="btn btn--gold" to="/shop">
                Shop Products
              </AppLink>
              <AppLink className="btn btn--ghost" to="/contact">
                Contact us
              </AppLink>
            </div>
            <ul className="pills" data-hero>
              <li>Mugs</li>
              <li>Shirts</li>
              <li>Bags</li>
              <li>Bottles</li>
              <li>Hats</li>
            </ul>
          </div>
          <div className="hero-visual" data-hero>
            <div className="hero-visual__media">
              <video
                className="hero__video"
                poster={`${MEDIA}poster-h1-1280.webp`}
                muted
                playsInline
                autoPlay
                loop
                preload="metadata"
              >
                <source src={`${MEDIA}h1-bottles.mp4`} type="video/mp4" />
              </video>
            </div>
            <p className="float-card float-card--a">
              <strong>Field-Trip Ready</strong>
              Water Bottles
            </p>
            <p className="float-card float-card--b">Family Affair Centers</p>
          </div>
        </div>
        <div className="wrap trust">
          <p>
            <strong>Daykodee</strong>
            Merchandise shop
          </p>
          <p>
            <strong>Family Affair</strong>
            Child Care Centers
          </p>
          <p>
            <strong>Family-first</strong>
            Everyday products
          </p>
        </div>
      </section>

      <section className="band" id="categories">
        <div className="wrap">
          <div className="band__head">
            <div>
              <p className="eyebrow eyebrow--gold">Curated Essentials</p>
              <h2>Shop by Category</h2>
              <p>Explore everyday childcare essentials designed for little learners, classroom sanity, and proud center staff.</p>
            </div>
            <AppLink to="/shop">View all products</AppLink>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((item) => (
              <article className="cat-card" key={item.title}>
                <AppLink to={item.href}>
                  <span className="cat-card__media">
                    <img src={`${MEDIA}${item.image}`} alt={item.alt} width="800" height="800" />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  <span className="text-link">{item.label}</span>
                </AppLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--navy" id="ordering">
        <div className="wrap">
          <p className="eyebrow">Director-Friendly Logistics</p>
          <h2>How Ordering Works</h2>
          <p className="lede">
            <AppLink className="group-link" to="/contact">
              Ordering for a group? Contact us
            </AppLink>
          </p>
          <ol className="steps">
            {STEPS.map((step) => (
              <li key={step.n}>
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.href ? <AppLink className="group-link" to={step.href}>{step.copy}</AppLink> : step.copy}</p>
                <strong>{step.note}</strong>
              </li>
            ))}
          </ol>
          <div className="tier-strip">
            <p>
              <AppLink className="group-link" to="/contact">
                Ordering for a group? Contact us
              </AppLink>
            </p>
          </div>
        </div>
      </section>

      <section className="band" id="why">
        <div className="wrap">
          <p className="eyebrow eyebrow--gold">Designed For Early Childhood</p>
          <h2>Why Centers Order from Daykodee</h2>
          <p>We eliminate the typical headaches of ordering branded uniforms and student gear for multiple classrooms.</p>
          <div className="why-grid">
            {WHY.map(([title, copy, href]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{href ? <AppLink className="group-link" to={href}>{copy}</AppLink> : copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="family" id="about">
        <div className="family__media">
          <img src={`${MEDIA}poster-l1.webp`} alt="Children and a teacher smiling in a bright classroom" width="1280" height="720" />
        </div>
        <div className="family__copy">
          <p className="eyebrow">About Daykodee</p>
          <h2>Part of the Family Affair Community</h2>
          <ul>
            <li>Daykodee is the merchandise shop for Family Affair Child Care Centers locations.</li>
            <li>The franchise is built on its founders&apos; four decades in early childhood education.</li>
            <li>
              Daykodee helps every center carry that warm, family-first spirit onto the products kids and families use
              every day.
            </li>
          </ul>
          <AppLink to="/about">About Daykodee</AppLink>
        </div>
      </section>

      <section className="closer">
        <div className="wrap">
          <h2>Ready to Outfit Your Center for the New Term?</h2>
          <p>
            <AppLink className="group-link" to="/contact">
              Ordering for a group? Contact us
            </AppLink>
          </p>
          <div className="hero-actions" data-magnetic>
            <AppLink className="btn btn--gold" to="/shop">
              Browse 2025 Catalog
            </AppLink>
            <AppLink className="btn btn--ghost" to="/contact">
              Contact us
            </AppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
