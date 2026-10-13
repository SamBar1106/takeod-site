import { MEDIA } from "../config.js";
import { AppLink } from "./AppLink.jsx";

const COLUMNS = [
  {
    title: "Product Categories",
    links: [
      { to: "/category/mugs", label: "Center Mugs & Tumblers" },
      { to: "/category/shirts", label: "Staff & Toddler Shirts" },
      { to: "/category/bags", label: "Backpacks & Totes" },
      { to: "/category/water-bottles", label: "Water Bottles & Sippies" },
      { to: "/category/hats", label: "Sun Hats & Beanies" },
    ],
  },
  {
    title: "Center Director Resources",
    links: [
      { to: "/contact", label: "Ordering for a group? Contact us" },
      { to: "/shop", label: "Shop Products" },
      { to: "/about", label: "About Daykodee" },
      { to: "/faq", label: "Frequently Asked Questions" },
    ],
  },
  {
    title: "Help & Policies",
    links: [
      { to: "/shipping", label: "Direct-to-Center Shipping" },
      { to: "/faq", label: "Frequently Asked Questions" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__grid">
        <div>
          <AppLink className="brand brand--footer" to="/">
            <img className="brand__img" src={`${MEDIA}logo.webp`} alt="" width="720" height="473" />
            <span className="brand__word">Daykodee</span>
          </AppLink>
          <p>Daykodee is the merchandise shop for Family Affair Child Care Centers locations.</p>
          <AppLink className="pill" to="/contact">
            Contact us
          </AppLink>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2>{column.title}</h2>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <AppLink to={link.to}>{link.label}</AppLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="wrap site-footer__legal">
        <p>© 2025 Daykodee Gear Co. All rights reserved.</p>
        <p>
          <AppLink to="/terms">Terms of Service</AppLink>
          <span aria-hidden="true"> · </span>
          <AppLink to="/privacy">Privacy Policy</AppLink>
          <span aria-hidden="true"> · </span>
          <AppLink to="/shipping">Shipping</AppLink>
        </p>
      </div>
    </footer>
  );
}
