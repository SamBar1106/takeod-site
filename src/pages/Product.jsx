import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import gsap from "gsap";
import { getApiBaseUrl, getLocalProducts, getProduct } from "../lib/catalog.js";
import { finePointer, prefersReducedMotion } from "../lib/motion.js";
import { useCart } from "../context/CartContext.jsx";
import { AppLink } from "../components/AppLink.jsx";
import { MediaPicture } from "../components/MediaPicture.jsx";

export function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState(() => {
    if (getApiBaseUrl()) return undefined;
    return getLocalProducts().find((item) => item.id === productId) ?? null;
  });
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const frameRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let live = true;
    if (!getApiBaseUrl()) {
      const local = getLocalProducts().find((item) => item.id === productId) ?? null;
      setProduct(local);
      setActive(0);
      document.title = local ? `${local.name} | Daykodee` : "PLACEHOLDER — Product | Daykodee";
      return undefined;
    }
    setProduct(undefined);
    getProduct(productId)
      .then((item) => {
        if (!live) return;
        setProduct(item);
        setActive(0);
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

  const image = product.images[active] ?? product.images[0];

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
              {product.images.map((shot, index) => (
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
              <p className="product-price">{product.priceLabel}</p>
            </div>
            <div className="buy">
              <p className="buy__name">{product.name}</p>
              <p className="buy__price">{product.priceLabel}</p>
              <button
                className="btn btn--gold"
                type="button"
                onClick={() => {
                  add(product);
                  navigate("/checkout");
                }}
              >
                Start an Order
                <span className="btn__sweep" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
