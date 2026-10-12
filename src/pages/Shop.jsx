import { useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { getApiBaseUrl, getLocalProducts, getProducts } from "../lib/catalog.js";
import { prefersReducedMotion } from "../lib/motion.js";
import { AppLink } from "../components/AppLink.jsx";
import { MediaPicture } from "../components/MediaPicture.jsx";

gsap.registerPlugin(Flip);

const FILTERS = [
  { slug: "all", label: "Shop Products" },
  { slug: "mugs", label: "Mugs" },
  { slug: "shirts", label: "Shirts" },
  { slug: "bags", label: "Bags" },
  { slug: "water-bottles", label: "Water Bottles" },
  { slug: "hats", label: "Hats" },
];

function normalizeSlug(slug) {
  return FILTERS.some((item) => item.slug === slug) ? slug : "all";
}

export function Shop() {
  const { slug } = useParams();
  const [products, setProducts] = useState(() => (getApiBaseUrl() ? [] : getLocalProducts()));
  const [status, setStatus] = useState(getApiBaseUrl() ? "loading" : "ready");
  const [filter, setFilter] = useState(() => normalizeSlug(slug));
  const gridRef = useRef(null);
  const flipRef = useRef(null);
  const skipFlip = useRef(true);

  useLayoutEffect(() => {
    document.title = "Shop Products | Daykodee";
  }, []);

  useLayoutEffect(() => {
    setFilter(normalizeSlug(slug));
  }, [slug]);

  useLayoutEffect(() => {
    if (!getApiBaseUrl()) return undefined;
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
  }, [filter]);

  const choose = (next) => {
    if (next === filter) return;
    const grid = gridRef.current;
    if (grid && !prefersReducedMotion()) {
      flipRef.current = Flip.getState(grid.querySelectorAll(".product-card"));
    }
    setFilter(next);
  };

  return (
    <section className="section shop">
      <div className="section__stage">
        <div className="wrap">
          <h1>Shop Products</h1>
          {status === "error" ? <p className="placeholder-label">PLACEHOLDER</p> : null}
          <div className="filter-bar" role="group" aria-label="Shop Products">
            {FILTERS.map((item) => (
              <button key={item.slug} type="button" aria-pressed={filter === item.slug} onClick={() => choose(item.slug)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="product-grid" ref={gridRef}>
            {products.map((product) => {
              const visible = filter === "all" || filter === product.categorySlug;
              return (
                <article
                  className="card product-card"
                  key={product.id}
                  data-category={product.categorySlug}
                  style={{ display: visible ? undefined : "none" }}
                >
                  <AppLink className="product-card__link" to={`/shop/${product.id}`}>
                    <div className="card__media">
                      <MediaPicture image={product.images[0]} alt={product.images[0]?.alt} />
                      <span className="card__border" aria-hidden="true" />
                    </div>
                    <div className="card__body">
                      <h2>{product.name}</h2>
                      <p>{product.description}</p>
                    </div>
                  </AppLink>
                  <div className="quick-view">
                    <p className="quick-view__name">{product.name}</p>
                    <p className="quick-view__price">{product.priceLabel}</p>
                    <AppLink className="btn btn--gold" to={`/shop/${product.id}`}>
                      {product.shopLabel}
                      <span className="btn__sweep" aria-hidden="true" />
                    </AppLink>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
