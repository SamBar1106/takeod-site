import { useEffect, useLayoutEffect, useRef } from "react";
import { HOME_TITLE, MEDIA } from "../config.js";
import { prefersReducedMotion, whenFontsReady } from "../lib/motion.js";
import { AppLink } from "../components/AppLink.jsx";
import { useHeroReel, useLifestyleVideo } from "../components/useHeroReel.js";
import { mountHomeMotion } from "./homeMotion.js";

const CATEGORIES = [
  {
    title: "Mugs",
    copy: "Cheerful ceramic mugs for teacher gifts, parent nights and keepsakes families hold on to.",
    href: "/category/mugs",
    label: "Shop Mugs",
    alt: "Branded ceramic mugs and water bottles",
    set: "c2",
  },
  {
    title: "Shirts",
    copy: "Soft, kid-friendly tees for field trips, picture day and showing center pride.",
    href: "/category/shirts",
    label: "Shop Shirts",
    alt: "Branded shirts and hats",
    set: "c1",
  },
  {
    title: "Bags",
    copy: "Sturdy totes for take-home folders, art projects and everything in between.",
    href: "/category/bags",
    label: "Shop Bags",
    alt: "Branded tote bags",
    set: "c3",
  },
  {
    title: "Water Bottles",
    copy: "Kid-sized bottles that make it easy to stay hydrated on the playground and on the go.",
    href: "/category/water-bottles",
    label: "Shop Bottles",
    alt: "Branded kid-sized water bottles",
    set: "c2",
  },
  {
    title: "Hats",
    copy: "Adjustable caps for outdoor play, summer programs and sunny-day outings.",
    href: "/category/hats",
    label: "Shop Hats",
    alt: "Branded adjustable caps",
    set: "c1",
  },
];

const MARQUEE = ["Mugs", "Shirts", "Bags", "Water Bottles", "Hats"];

function picture(set) {
  const src = (ext, width) => `${MEDIA}${set}-${width}.${ext}`;
  const sizes = "(min-width: 1100px) 30vw, (min-width: 768px) 46vw, 92vw";
  return { src, sizes };
}

export function Home() {
  const rootRef = useRef(null);
  useHeroReel(rootRef);
  useLifestyleVideo(rootRef);

  useEffect(() => {
    document.title = HOME_TITLE;
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
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__media">
          <img
            className="hero__poster"
            src={`${MEDIA}poster-h1-1280.webp`}
            srcSet={`${MEDIA}poster-h1-640.webp 640w, ${MEDIA}poster-h1-1280.webp 1280w`}
            sizes="100vw"
            alt=""
            width="1280"
            height="720"
            fetchPriority="high"
            decoding="sync"
          />
          <video
            className="hero__video is-active"
            muted
            playsInline
            autoPlay
            preload="auto"
            src={`${MEDIA}h1-bottles.mp4`}
            aria-hidden="true"
          />
          <video className="hero__video" muted playsInline preload="none" aria-hidden="true" />
          <div className="hero__overlay" />
          <div className="hero__shade" />
        </div>
        <AppLink className="hero__mark" to="/#main">
          <img src={`${MEDIA}logo.webp`} alt="Daykodee" width="720" height="473" />
        </AppLink>
        <div className="wrap hero__content">
          <div className="hero__layout">
            <div className="hero__copy">
              <h1 className="hero__title pop" id="hero-title">
                Branded Kids' Gear, Made for Family Affair Centers
              </h1>
              <p className="hero__sub">
                Mugs, shirts, bags, water bottles and hats with your center's look, in one simple online store built for Family Affair franchise owners and directors.
              </p>
              <div className="hero__actions">
                <AppLink className="btn btn--primary" to="/shop">
                  Shop Products
                  <span className="btn__sweep" aria-hidden="true" />
                </AppLink>
                <AppLink className="btn btn--gold" to="/contact">
                  Request a Quote
                  <span className="btn__sweep" aria-hidden="true" />
                </AppLink>
              </div>
              <button className="hero__play btn btn--primary" type="button">
                Play hero video
                <span className="btn__sweep" aria-hidden="true" />
              </button>
            </div>
            <div className="spline-slot" data-spline-slot="hero" data-spline-url="">
              <p className="spline-slot__label">Spline 3D slot</p>
              <div className="spline-slot__stage">
                <img
                  className="spline-slot__img"
                  src={`${MEDIA}float-hero.webp`}
                  alt="Branded mugs and water bottles"
                  width="640"
                  height="360"
                  decoding="async"
                  fetchPriority="low"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section categories" id="categories" aria-labelledby="categories-title">
        <div className="section__stage">
          <div className="wrap">
            <h2 className="pop" id="categories-title">
              Shop by Category
            </h2>
            <p className="section__intro">
              Everyday items your families will use and your kids will love, all ready to carry your center's name.
            </p>
            <div className="cards">
              {CATEGORIES.map((category) => {
                const shot = picture(category.set);
                return (
                  <article className="card" key={category.title}>
                    <div className="card__media">
                      <picture>
                        <source
                          type="image/avif"
                          srcSet={`${shot.src("avif", 480)} 480w, ${shot.src("avif", 800)} 800w, ${shot.src("avif", 1280)} 1280w`}
                          sizes={shot.sizes}
                        />
                        <source
                          type="image/webp"
                          srcSet={`${shot.src("webp", 480)} 480w, ${shot.src("webp", 800)} 800w, ${shot.src("webp", 1280)} 1280w`}
                          sizes={shot.sizes}
                        />
                        <img
                          src={shot.src("webp", 800)}
                          alt={category.alt}
                          width="1280"
                          height="720"
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                      <span className="card__border" aria-hidden="true" />
                    </div>
                    <div className="card__body">
                      <h3>{category.title}</h3>
                      <p>{category.copy}</p>
                      <AppLink className="btn btn--gold" to={category.href}>
                        {category.label}
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

      <section className="section ordering" id="ordering" aria-labelledby="ordering-title">
        <div className="section__stage">
          <div className="wrap">
            <div className="ordering__head">
              <h2 className="pop" id="ordering-title">
                How Ordering Works
              </h2>
              <p className="section__intro">Three steps from browsing to delivery.</p>
            </div>
            <div className="steps">
              <span className="steps__line" aria-hidden="true">
                <span className="steps__line-bar" />
              </span>
              <ol className="steps__list">
              <li className="step">
                <span className="step__num pop" aria-hidden="true">
                  01
                </span>
                <h3>Choose your products.</h3>
                <p>Browse the catalog, pick sizes and colors, and add items to your cart or quote request.</p>
              </li>
              <li className="step">
                <span className="step__num pop" aria-hidden="true">
                  02
                </span>
                <h3>Add your center details.</h3>
                <p>
                  Tell us your center name and location, and upload artwork if needed. We'll confirm the design before anything is printed.{" "}
                  <span className="note">[NEEDS DWIGHT: proof approval step]</span>
                </p>
              </li>
              <li className="step">
                <span className="step__num pop" aria-hidden="true">
                  03
                </span>
                <h3>We produce and ship.</h3>
                <p>
                  Your order is made and shipped straight to your center.{" "}
                  <span className="note">[NEEDS DWIGHT: turnaround and shipping method]</span>
                </p>
              </li>
              </ol>
            </div>
            <AppLink className="btn btn--gold" to="/shop">
              Start an Order
              <span className="btn__sweep" aria-hidden="true" />
            </AppLink>
          </div>
        </div>
      </section>

      <section className="section why" id="why" aria-labelledby="why-title">
        <div className="section__stage">
          <div className="wrap why__grid">
            <div>
              <h2 className="pop" id="why-title">
                Why Centers Order from Daykodee
              </h2>
              <ul className="why__list">
                <li className="why__item">
                  <span className="why__num" aria-hidden="true">
                    01
                  </span>
                  <div>
                    <h3>Made for the Family Affair family.</h3>
                    <p>One store built around the needs of Family Affair centers, so you never have to hunt for vendors.</p>
                  </div>
                </li>
                <li className="why__item">
                  <span className="why__num" aria-hidden="true">
                    02
                  </span>
                  <div>
                    <h3>Consistent brand standards.</h3>
                    <p>The same look in every center, so families recognize it everywhere.</p>
                  </div>
                </li>
                <li className="why__item">
                  <span className="why__num" aria-hidden="true">
                    03
                  </span>
                  <div>
                    <h3>Kid-friendly picks.</h3>
                    <p>Products chosen for little hands, busy classrooms and active play.</p>
                  </div>
                </li>
                <li className="why__item">
                  <span className="why__num" aria-hidden="true">
                    04
                  </span>
                  <div>
                    <h3>Simple ordering.</h3>
                    <p>Clear options, one checkout and a real person to help when you need one.</p>
                  </div>
                </li>
                <li className="why__item">
                  <span className="why__num" aria-hidden="true">
                    05
                  </span>
                  <div>
                    <h3>Bulk-friendly.</h3>
                    <p>
                      Order for a classroom, a whole center or a big event.{" "}
                      <span className="note">[NEEDS DWIGHT: minimums and volume pricing]</span>
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="spline-slot" data-spline-slot="why" data-spline-url="">
              <p className="spline-slot__label">Spline 3D slot</p>
              <div className="spline-slot__stage">
                <img
                  className="spline-slot__img"
                  src={`${MEDIA}float-why.webp`}
                  alt="Branded tote bags"
                  width="640"
                  height="360"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials stay hidden until real, approved quotes exist. */}

      <section className="section about" id="about" aria-labelledby="about-title">
        <div className="section__stage">
          <div className="wrap about__grid">
            <div className="about__copy">
              <h2 className="pop" id="about-title">
                Part of the Family Affair Family
              </h2>
              <p>
                Daykodee is the merchandise shop for Family Affair Child Care Centers locations. The franchise is built on its founders' four decades in early childhood education. Daykodee helps every center carry that warm, family-first spirit onto the products kids and families use every day.
              </p>
              <AppLink className="btn btn--gold" to="/about">
                Learn About Us
                <span className="btn__sweep" aria-hidden="true" />
              </AppLink>
            </div>
            <div className="about__media">
              <div className="about__parallax">
                <img
                  className="about__poster"
                  src={`${MEDIA}poster-l1.webp`}
                  alt="Children and a teacher smiling in a bright classroom"
                  width="1280"
                  height="720"
                  loading="lazy"
                  decoding="async"
                />
                <video className="about__video" muted playsInline preload="none" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta" id="ready" aria-labelledby="ready-title">
        <div className="section__stage">
          <div className="cta__blocks" aria-hidden="true">
            <span className="cta__block cta__block--a" />
            <span className="cta__block cta__block--b" />
            <span className="cta__block cta__block--c" />
          </div>
          <div className="wrap cta__inner">
            <h2 className="pop" id="ready-title">
              Ready to Outfit Your Center?
            </h2>
            <p>Browse the catalog, or tell us what you need and we'll put together a quote.</p>
            <div className="cta__actions">
              <AppLink className="btn btn--primary" to="/shop">
                Shop Products
                <span className="btn__sweep" aria-hidden="true" />
              </AppLink>
              <span className="magnet" data-magnetic>
                <AppLink className="btn btn--gold" to="/contact">
                  Contact Us
                  <span className="btn__sweep" aria-hidden="true" />
                </AppLink>
              </span>
            </div>
          </div>
          <div className="marquee" aria-hidden="true">
            <div className="marquee__track">
              {[0, 1].map((copy) => (
                <div className={copy === 1 ? "marquee__group marquee__clone" : "marquee__group"} key={copy}>
                  {MARQUEE.map((item) => (
                    <span key={`${copy}-${item}`}>{item}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
