import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { getLocalProducts, getProducts, isDemoMode } from "../lib/catalog.js";
import { prefersReducedMotion } from "../lib/motion.js";
import { useCart } from "../context/CartContext.jsx";
import { AppLink } from "../components/AppLink.jsx";
import { MediaPicture } from "../components/MediaPicture.jsx";

gsap.registerPlugin(Flip);

const FILTERS = [
  { slug: "all", label: "All Products" },
  { slug: "mugs", label: "Mugs & Drinkware" },
  { slug: "shirts", label: "Shirts & Apparel" },
  { slug: "bags", label: "Backpacks & Bags" },
  { slug: "water-bottles", label: "Water Bottles" },
  { slug: "hats", label: "Hats & Beanies" },
];

function normalizeSlug(slug) {
  return FILTERS.some((item) => item.slug === slug) ? slug : "all";
}

export function Shop() {
  const { slug } = useParams();
  const { add } = useCart();
  const [products, setProducts] = useState(() => (isDemoMode() ? getLocalProducts() : []));
  const [status, setStatus] = useState(isDemoMode() ? "ready" : "loading");
  const [filter, setFilter] = useState(() => normalizeSlug(slug));
  const [sort, setSort] = useState("match");
  const gridRef = useRef(null);
  const flipRef = useRef(null);
  const skipFlip = useRef(true);

  useLayoutEffect(() => {
    document.title = "Official Family Affair Gear Catalog | Daykodee";
  }, []);

  useLayoutEffect(() => {
    setFilter(normalizeSlug(slug));
  }, [slug]);

  useLayoutEffect(() => {
    if (isDemoMode()) return undefined;
    let live = true;
    getProducts()
      .then((items) => {
        if (!live) return;
        setProducts(items);
        setStatus("ready");
      })
      .catch(() => {
        if (!live) return;
        setStatus("error");
      });
    return () => {
      live = false;
    };
  }, []);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return undefined;
    const cards = [...grid.querySelectorAll(".product-card")].filter((card) => card.style.display !== "none");
    if (!cards.length) return undefined;
    const tween = gsap.from(cards, {
      y: 28,
      opacity: 0,
      stagger: 0.06,
      duration: 0.55,
      ease: "power3.out",
      immediateRender: false,
      onComplete: () => gsap.set(cards, { clearProps: "opacity,transform" }),
    });
    const timer = window.setTimeout(() => gsap.set(cards, { clearProps: "opacity,transform" }), 2400);
    return () => {
      tween.kill();
      window.clearTimeout(timer);
    };
  }, [products]);

  useLayoutEffect(() => {
    if (skipFlip.current) {
      skipFlip.current = false;
      return undefined;
    }
    const state = flipRef.current;
    flipRef.current = null;
    if (!state || prefersReducedMotion()) return undefined;
    const tween = Flip.from(state, {
      duration: 0.55,
      ease: "power2.inOut",
      absolute: true,
      stagger: 0.04,
      onEnter: (elements) => gsap.fromTo(elements, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }),
      onLeave: (elements) => gsap.to(elements, { opacity: 0, y: 12, duration: 0.3 }),
    });
    return () => tween?.kill();
  }, [filter, sort]);

  const choose = (next) => {
    if (next === filter) return;
    const grid = gridRef.current;
    if (grid && !prefersReducedMotion()) {
      flipRef.current = Flip.getState(grid.querySelectorAll(".product-card"));
    }
    setFilter(next);
  };

  const ordered = useMemo(() => {
    const list = [...products];
    if (sort === "low" || sort === "high") {
      const amount = (product) => Number(String(product.priceLabel || "").replace(/[^0-9.]/g, "")) || 0;
      list.sort((a, b) => (sort === "low" ? amount(a) - amount(b) : amount(b) - amount(a)));
    }
    return list;
  }, [products, sort]);

  const counts = useMemo(() => {
    const tally = { all: products.length };
    for (const product of products) tally[product.categorySlug] = (tally[product.categorySlug] || 0) + 1;
    return tally;
  }, [products]);

  return (
    <div className="catalog">
      <section className="catalog-hero">
        <div className="wrap catalog-hero__grid">
          <div>
            <p className="eyebrow">Official Center Merchandise Portal</p>
            <h1>Official Family Affair Gear Catalog</h1>
            <p>
              Equip classrooms, staff, and little learners with durable, campus-certified gear. Enjoy automated tiered
              bulk pricing and expedited center fulfillment.
            </p>
          </div>
          <aside className="savings-ticket">
            <p>Automated Tiered Savings</p>
            <ul>
              <li>
                <span>12+ items</span>
                <strong>Save 15%</strong>
              </li>
              <li>
                <span>25+ items</span>
                <strong>Save 25%</strong>
              </li>
              <li>
                <span>50+ items</span>
                <strong>Save 40%</strong>
              </li>
            </ul>
          </aside>
        </div>
      </section>
      <div className="wrap catalog-layout" id="catalog">
        <aside className="filters">
          <h2>Filters</h2>
          {status === "error" ? <p className="cart-note">The catalog could not be loaded.</p> : null}
          <fieldset>
            <legend>Product Categories</legend>
            {FILTERS.map((item) => (
              <button key={item.slug} type="button" aria-pressed={filter === item.slug} onClick={() => choose(item.slug)}>
                <span>{item.label}</span>
                <span>{counts[item.slug] || 0}</span>
              </button>
            ))}
          </fieldset>
          <div className="filter-note">
            <h3>Price Range</h3>
            <p>$8 – $45</p>
          </div>
          <div className="filter-help">
            <h3>Need Tax-Exempt PO?</h3>
            <p>Center directors can submit custom logo requests or upload purchase orders directly.</p>
            <AppLink to="/contact">Open PO Invoice Form</AppLink>
          </div>
        </aside>
        <div>
          <div className="catalog-bar">
            <p>
              Catalog Items <strong>{filter === "all" ? products.length : counts[filter] || 0} Items Found</strong>
            </p>
            <label>
              Sort by:
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="match">Popularity & Best Match</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </label>
          </div>
          <div className="product-grid" ref={gridRef}>
            {ordered.map((product) => {
              const visible = filter === "all" || filter === product.categorySlug;
              return (
                <article
                  className="card product-card"
                  key={product.id}
                  data-category={product.categorySlug}
                  style={{ display: visible ? undefined : "none" }}
                >
                  <AppLink className="product-card__media" to={`/shop/${product.id}`}>
                    <MediaPicture image={product.images?.[0]} alt={product.images?.[0]?.alt || product.name} />
                    {product.badge ? <span className="badge">{product.badge}</span> : null}
                  </AppLink>
                  <div className="product-card__body">
                    {product.rating ? <p className="stars">★ {product.rating}</p> : null}
                    <h2>
                      <AppLink to={`/shop/${product.id}`}>{product.name}</AppLink>
                    </h2>
                    <p>{product.description}</p>
                    <div className="price-row">
                      <p>
                        <span>Single Unit</span>
                        <strong>{product.priceLabel}</strong>
                      </p>
                      {product.tierPrice ? (
                        <p>
                          <span>{product.tierLabel || "Tier 25+"}</span>
                          <strong>{product.tierPrice}</strong>
                        </p>
                      ) : null}
                    </div>
                    {product.stockLabel ? <p className="stock">{product.stockLabel}</p> : null}
                    <button className="btn btn--gold" type="button" onClick={() => add({ product, quantity: 1 })}>
                      {product.shopLabel || "Add / Bulk Quote"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      <section className="closer closer--slim">
        <div className="wrap">
          <h2>Planning an All-Campus Order or Center Uniform Refresh?</h2>
          <p>We provide custom colorways, teacher name personalization, and direct monthly invoice billing for multi-center networks.</p>
          <div className="hero-actions">
            <AppLink className="btn btn--gold" to="/contact">
              Request Custom Center Quote
            </AppLink>
            <AppLink className="btn btn--ghost" to="/contact">
              Download PDF Catalog
            </AppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
