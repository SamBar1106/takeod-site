import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MEDIA } from "../config.js";
import { getProducts } from "../lib/catalog.js";
import { prefersReducedMotion, whenFontsReady } from "../lib/motion.js";
import { AppLink } from "../components/AppLink.jsx";
import { mountHomeMotion } from "./homeMotion.js";

const CATEGORIES = [
  {
    title: "Mugs & Tumblers",
    copy: "Toddler spill-proof cups and teacher appreciation vacuum mugs.",
    href: "/category/mugs",
    label: "Explore Cups",
    badge: "8 Styles",
    image: "c2-800.webp",
    alt: "Branded ceramic mugs and water bottles",
  },
  {
    title: "T-Shirts & Apparel",
    copy: "Ultra-soft 100% ringspun cotton tees and durable staff embroidered polos.",
    href: "/category/shirts",
    label: "Explore Apparel",
    badge: "14 Colors",
    image: "c1-800.webp",
    alt: "Branded shirts and hats",
  },
  {
    title: "Backpacks & Totes",
    copy: "Field trip tote bags and mini cubby packs with clear nametag slots.",
    href: "/category/bags",
    label: "Explore Bags",
    badge: "Top Seller",
    image: "c3-800.webp",
    alt: "Branded tote bags",
  },
  {
    title: "Water Bottles",
    copy: "Double-wall stainless steel with easy-flip straws and silicone bases.",
    href: "/category/water-bottles",
    label: "Explore Bottles",
    badge: "Drop-Proof",
    image: "poster-h1-1280.webp",
    alt: "Branded water bottles",
  },
  {
    title: "Hats & Beanies",
    copy: "Sun-safe UV playground hats and cozy winter knit beanies.",
    href: "/category/hats",
    label: "Explore Hats",
    badge: "UV 50+",
    image: "poster-h2.webp",
    alt: "Branded caps",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Select Products & Bundles",
    copy: "Choose approved colors, toddler-specific sizing (2T through youth L), and your center campus custom logo options.",
    note: "100% Brand Compliant",
  },
  {
    n: "02",
    title: "Submit Roster or Bulk Count",
    copy: "Instant tiered volume discounts applied at 25+ and 50+ units (up to 40% off). Complimentary digital proof mockups delivered in 2 hours.",
    note: "Instant PO Auto-Gen",
  },
  {
    n: "03",
    title: "Direct Delivery by Classroom",
    copy: "Boxes arrive pre-sorted by room numbers (e.g., Infant A, Toddler B, Pre-K 1) with individual student tags ready for handoff.",
    note: "Zero Sorting Stress",
  },
];

const WHY = [
  ["Childcare-Grade Durability", "Double-stitched stress seams, stain-resistant coatings, and drop-proof silicone bases designed to withstand daily toddler energy."],
  ["Instant PO & Center Billing", "Net-30 payment terms and tax-exempt direct invoicing available immediately for verified Family Affair Center Directors."],
  ["Classroom-Ready Sorting", "Every shipment arrives pre-bagged and labeled by classroom room number and student name. Zero hours spent sorting laundry boxes."],
  ["Certified Non-Toxic Safety", "Every material is third-party certified 100% BPA, lead, phthalate, and PFAS-free meeting the strictest state early childhood standards."],
  ["Dedicated Campus Account Rep", "You get a dedicated gear specialist assigned to your campus who knows your center colors, room counts, and reorder cycles."],
];

export function Home() {
  const rootRef = useRef(null);
  const [catalogCount, setCatalogCount] = useState(null);

  useEffect(() => {
    document.title = "Daykodee | Branded Kids' Gear for Family Affair Centers";
  }, []);

  useEffect(() => {
    let live = true;
    getProducts()
      .then((items) => {
        if (live) setCatalogCount(Array.isArray(items) ? items.length : null);
      })
      .catch(() => {
        if (live) setCatalogCount(null);
      });
    return () => {
      live = false;
    };
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
              Official Licensed Merchandiser
            </p>
            <h1 data-hero>
              Branded Kids’ Gear, Made for <span>Family Affair Centers</span>
            </h1>
            <p className="lede" data-hero>
              Durable, high-energy apparel and gear customized for Family Affair childcare classrooms, field trips, and
              everyday adventures. Built tough for little hands, loved by directors and parents.
            </p>
            <div className="hero-actions" data-hero>
              <AppLink className="btn btn--gold" to="/shop">
                Shop Products
              </AppLink>
              <AppLink className="btn btn--ghost" to="/contact">
                Request a Quote
              </AppLink>
            </div>
            <ul className="pills" data-hero>
              <li>Dishwasher Safe</li>
              <li>100% BPA Free</li>
              <li>Fade-Proof Stitching</li>
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
              14oz Steel Sippers
            </p>
            <p className="float-card float-card--b">4.9 / 5 Director Rating</p>
          </div>
        </div>
        <div className="wrap trust">
          <p>
            <strong>140+</strong>
            Family Affair Campuses Trusted
          </p>
          <p>
            <strong>45,000+</strong>
            Little Learners Equipped
          </p>
          <p>
            <strong>99.4%</strong>
            On-Time Classroom Delivery
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
            <AppLink to="/shop">{catalogCount == null ? "View all products" : `View All ${catalogCount} Products`}</AppLink>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((item) => (
              <article className="cat-card" key={item.title}>
                <AppLink to={item.href}>
                  <span className="cat-card__media">
                    <img src={`${MEDIA}${item.image}`} alt={item.alt} width="800" height="800" />
                    <span className="badge">{item.badge}</span>
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
          <p className="lede">Simple bulk ordering engineered specifically for busy early childcare administrators.</p>
          <ol className="steps">
            {STEPS.map((step) => (
              <li key={step.n}>
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
                <strong>{step.note}</strong>
              </li>
            ))}
          </ol>
          <div className="tier-strip">
            <p>Quick Center Bulk Savings</p>
            <p>See your automated director discounts instantly on 25+ unit packs.</p>
            <ul>
              <li>
                <strong>20% Off</strong> 25-49 Units
              </li>
              <li>
                <strong>30% Off</strong> 50-99 Units
              </li>
              <li>
                <strong>40% Off</strong> 100+ Units
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="band" id="why">
        <div className="wrap">
          <p className="eyebrow eyebrow--gold">Designed For Early Childhood</p>
          <h2>Why Centers Order from Daykodee</h2>
          <p>We eliminate the typical headaches of ordering branded uniforms and student gear for multiple classrooms.</p>
          <div className="why-grid">
            {WHY.map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
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
          <p className="eyebrow">Director Endorsement</p>
          <h2>Part of the Family Affair Community</h2>
          <blockquote>
            “Daykodee made our fall semester orientation completely effortless. The shirts arrived meticulously labeled by
            room number and survived over 100 industrial wash cycles without cracking or peeling. Parents constantly ask
            where they can buy extra tumblers!”
          </blockquote>
          <p className="byline">Ms. Evelyn Carter · Director, Family Affair West Campus</p>
          <ul>
            <li>
              <strong>100+ Washes</strong> Tested zero-fade guarantee
            </li>
            <li>
              <strong>2-Day Shipping</strong> Direct to center campuses
            </li>
          </ul>
          <AppLink to="/about">Read 40+ More Director Stories</AppLink>
        </div>
      </section>

      <section className="closer">
        <div className="wrap">
          <h2>Ready to Outfit Your Center for the New Term?</h2>
          <p>
            Get instant volume pricing, custom student rosters sorted, and a free sample sizing kit sent to your campus
            office.
          </p>
          <div className="hero-actions" data-magnetic>
            <AppLink className="btn btn--gold" to="/shop">
              Browse 2025 Catalog
            </AppLink>
            <AppLink className="btn btn--ghost" to="/contact">
              Download Director PDF Catalog
            </AppLink>
          </div>
          <p className="help-line">Need a custom sample box? Call Director Support: (800) 555-DAYK</p>
        </div>
      </section>
    </div>
  );
}
