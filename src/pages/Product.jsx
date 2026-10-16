import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import { getLocalProducts, getProduct, isDemoMode } from "../lib/catalog.js";
import { finePointer, prefersReducedMotion } from "../lib/motion.js";
import { useCart } from "../context/CartContext.jsx";
import { AppLink } from "../components/AppLink.jsx";
import { MediaPicture } from "../components/MediaPicture.jsx";
import { Accordion } from "../components/Accordion.jsx";

function matchVariant(product, selected) {
  const variants = product?.variants || [];
  if (!variants.length) return null;
  return (
    variants.find((variant) =>
      Object.entries(variant.choices || {}).every(([name, value]) => selected[name] === value),
    ) || null
  );
}

export function Product() {
  const { productId } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(() => {
    if (!isDemoMode()) return undefined;
    return getLocalProducts().find((item) => item.id === productId) ?? null;
  });
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [selected, setSelected] = useState({});
  const [quantity, setQuantity] = useState(1);
  const frameRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let live = true;
    setQuantity(1);
    if (isDemoMode()) {
      const local = getLocalProducts().find((item) => item.id === productId) ?? null;
      setProduct(local);
      setActive(0);
      setSelected({});
      document.title = local ? `${local.name} | Daykodee` : "PLACEHOLDER — Product | Daykodee";
      return undefined;
    }
    setProduct(undefined);
    getProduct(productId)
      .then((item) => {
        if (!live) return;
        setProduct(item);
        setActive(0);
        setSelected({});
        document.title = item ? `${item.name} | Daykodee` : "PLACEHOLDER — Product | Daykodee";
      })
      .catch(() => {
        if (!live) return;
        setProduct(null);
        document.title = "PLACEHOLDER — Product | Daykodee";
      });
    return () => {
      live = false;
    };
  }, [productId]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return undefined;
    gsap.set(img, { scale: zoomed ? 1.6 : 1, transformOrigin: "50% 50%" });
    return undefined;
  }, [zoomed, active, product]);

  const onMove = (event) => {
    if (!finePointer() || prefersReducedMotion()) return;
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    const box = frame.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    gsap.to(img, {
      scale: 1.65,
      transformOrigin: `${x}% ${y}%`,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const onLeave = () => {
    const img = imgRef.current;
    if (!img || prefersReducedMotion()) return;
    gsap.to(img, { scale: 1, duration: 0.35, ease: "power2.out", overwrite: "auto" });
  };

  if (product === undefined) {
    return (
      <section className="page-hero">
        <div className="wrap">
          <h1>PLACEHOLDER — Product</h1>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="page-hero">
        <div className="wrap">
          <h1>PLACEHOLDER — Product</h1>
          <AppLink className="btn btn--gold" to="/shop">
            Shop Products
          </AppLink>
        </div>
      </section>
    );
  }

  const image = product.images?.[active] ?? product.images?.[0];
  const options = (product.options || []).filter((option) => option.choices?.length);
  const variant = matchVariant(product, selected);
  const priceLabel = variant?.priceLabel || product.priceLabel;
  const stockLabel = variant ? (variant.inStock ? "In stock" : "Out of stock") : product.stockLabel;
  const needsOptions = options.length > 0;
  const selectionComplete = options.every((option) => selected[option.name]);
  const canAdd = needsOptions
    ? Boolean(selectionComplete && variant && variant.inStock !== false)
    : product.stockStatus !== "out_of_stock";
  const addLabel = canAdd ? "Add to Order & Apply Bulk Tier" : needsOptions && !selectionComplete ? "Select options" : "Out of stock";
  const related = isDemoMode() ? getLocalProducts().filter((item) => item.id !== product.id).slice(0, 3) : [];

  return (
    <article className="product-page">
      <div className="wrap product-layout">
        <div className="gallery">
          <div
            className="gallery__frame"
            ref={frameRef}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            onClick={() => {
              if (finePointer()) return;
              setZoomed((value) => !value);
            }}
          >
            <MediaPicture
              key={`${product.id}-${active}`}
              ref={imgRef}
              image={image}
              loading="eager"
              sizes="(min-width: 768px) 48vw, 100vw"
            />
          </div>
          <div className="gallery__thumbs">
            {(product.images || []).map((shot, index) => (
              <button
                key={`${product.id}-${index}`}
                type="button"
                aria-pressed={index === active}
                onClick={() => {
                  setActive(index);
                  setZoomed(false);
                }}
              >
                <MediaPicture image={shot} sizes="88px" />
              </button>
            ))}
          </div>
        </div>
        <div className="buy-panel">
          <p className="eyebrow">{product.category || "Center Gear"}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          {product.rating ? <p className="stars">★ {product.rating}</p> : null}
          {options.map((option) => (
            <fieldset key={option.name} className="product-option">
              <legend>{option.name}</legend>
              <div className="product-option__choices">
                {option.choices.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    aria-pressed={selected[option.name] === choice.value}
                    disabled={choice.inStock === false}
                    onClick={() => setSelected((current) => ({ ...current, [option.name]: choice.value }))}
                  >
                    {choice.color ? <span className="swatch" style={{ background: choice.color }} aria-hidden="true" /> : null}
                    {choice.value}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="qty">
            <span>Order Quantity</span>
            <div className="cart-line__qty">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                −
              </button>
              <input readOnly value={quantity} aria-label="Quantity" />
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}>
                +
              </button>
            </div>
          </div>
          <p className="product-price">{priceLabel}</p>
          {product.tierPrice ? (
            <p className="tier-note">
              {product.tierLabel} {product.tierPrice}
            </p>
          ) : null}
          {stockLabel ? <p className="product-stock">{stockLabel}</p> : null}
          <button
            className="btn btn--gold"
            type="button"
            disabled={!canAdd}
            onClick={() => {
              if (!canAdd) return;
              add({ product, variant, quantity });
            }}
          >
            {addLabel}
          </button>
          <AppLink className="btn btn--line" to="/contact">
            Request Free Campus Sample
          </AppLink>
          <ul className="assure">
            {/\bmugs?\b|\btumblers?\b|\bdrinkware\b|\bcups?\b/i.test(
              `${product.name} ${product.category} ${(product.categorySlugs || []).join(" ")}`,
            ) ? (
              <li>Dishwasher Safe Rack</li>
            ) : null}
            <li>BPA & Lead Free</li>
            <li>Fast Center Dispatch</li>
          </ul>
        </div>
      </div>
      <div className="wrap spec-grid">
        <Accordion heading="Product Specs & Durability">
          <p>{product.description}</p>
        </Accordion>
        <Accordion heading="Bulk Pricing Matrix">
          <p>
            {product.priceLabel} single unit
            {product.tierPrice ? `. ${product.tierLabel} ${product.tierPrice}.` : "."} Volume pricing activates on
            verified center accounts.
          </p>
        </Accordion>
        <Accordion heading="Sanitation & Dishwasher Care">
          <p>Fully approved for commercial high-heat spray washers. Top-rack placement recommended for silicone seals.</p>
        </Accordion>
        <Accordion heading="Director Reviews">
          <p>
            Campus directors order this gear for classrooms that need labeled, durable pieces that survive daily wash
            cycles.
          </p>
        </Accordion>
      </div>
      {related.length ? (
        <div className="wrap related">
          <h2>Frequently Outfitted Together</h2>
          <div className="related-grid">
            {related.map((item) => (
              <AppLink className="related-card" key={item.id} to={`/shop/${item.id}`}>
                <MediaPicture image={item.images?.[0]} alt={item.images?.[0]?.alt || item.name} sizes="240px" />
                <strong>{item.name}</strong>
                <span>{item.priceLabel}</span>
              </AppLink>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
