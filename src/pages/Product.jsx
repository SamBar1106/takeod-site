import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import { getLocalProducts, getProduct, isDemoMode } from "../lib/catalog.js";
import { finePointer, prefersReducedMotion } from "../lib/motion.js";
import { useCart } from "../context/CartContext.jsx";
import { AppLink } from "../components/AppLink.jsx";
import { MediaPicture } from "../components/MediaPicture.jsx";

function initialSelection(product) {
  const selected = {};
  for (const option of product?.options || []) {
    const available = (option.choices || []).find((choice) => choice.inStock !== false) || option.choices?.[0];
    if (option.name && available?.value) selected[option.name] = available.value;
  }
  return selected;
}

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
  const frameRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let live = true;
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
        setSelected(initialSelection(item));
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

  const onFrameClick = () => {
    if (finePointer()) return;
    setZoomed((value) => !value);
  };

  if (product === undefined) {
    return (
      <section className="section info">
        <div className="section__stage">
          <div className="wrap">
            <h1>PLACEHOLDER — Product</h1>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="section info">
        <div className="section__stage">
          <div className="wrap">
            <h1>PLACEHOLDER — Product</h1>
            <AppLink className="btn btn--gold" to="/shop">
              Shop Products
              <span className="btn__sweep" aria-hidden="true" />
            </AppLink>
          </div>
        </div>
      </section>
    );
  }

  const image = product.images?.[active] ?? product.images?.[0];
  const options = product.options || [];
  const variant = matchVariant(product, selected);
  const priceLabel = variant?.priceLabel || product.priceLabel;
  const stockLabel = variant ? (variant.inStock ? "In stock" : "Out of stock") : product.stockLabel;
  const needsVariant = options.length > 0 && (product.variants || []).length > 0;
  const canAdd = needsVariant ? Boolean(variant && variant.inStock !== false) : product.stockStatus !== "out_of_stock";

  return (
    <article className="section product-page">
      <div className="section__stage">
        <div className="wrap product-layout">
          <div className="gallery">
            <div
              className="gallery__frame"
              ref={frameRef}
              onPointerMove={onMove}
              onPointerLeave={onLeave}
              onClick={onFrameClick}
            >
              <MediaPicture
                key={`${product.id}-${active}`}
                ref={imgRef}
                image={image}
                loading="eager"
                sizes="(min-width: 768px) 56vw, 100vw"
                className={zoomed ? "is-zoomed" : undefined}
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
          <div className="product-side">
            <div className="product-copy">
              <h1>{product.name}</h1>
              <p>{product.description}</p>
              <p className="product-price">{priceLabel}</p>
              {stockLabel ? <p className="product-stock">{stockLabel}</p> : null}
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
                        {choice.value}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="buy">
              <p className="buy__name">{product.name}</p>
              <p className="buy__price">{priceLabel}</p>
              {stockLabel ? <p className="product-stock">{stockLabel}</p> : null}
              <button
                className="btn btn--gold"
                type="button"
                disabled={!canAdd}
                onClick={() => {
                  if (!canAdd) return;
                  add({ product, variant, quantity: 1 });
                }}
              >
                {canAdd ? "Add to Cart" : "Out of stock"}
                <span className="btn__sweep" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
