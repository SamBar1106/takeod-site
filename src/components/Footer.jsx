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
      { to: "/shop", label: "Bulk Ordering Matrix (25+ Units)" },
      { to: "/contact", label: "Custom Logo Quote Request" },
      { to: "/contact", label: "Center Director Account Portal" },
      { to: "/contact", label: "Tax-Exempt PO & Invoicing" },
      { to: "/contact", label: "Request Sample Sizing Kit" },
    ],
  },
  {
    title: "Help & Policies",
    links: [
      { to: "/shipping", label: "Direct-to-Center Shipping" },
      { to: "/shipping", label: "Returns & Defect Replacements" },
      { to: "/faq", label: "Frequently Asked Questions" },
      { to: "/privacy", label: "Privacy Policy & Terms" },
      { to: "/contact", label: "Dedicated Support Desk" },
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
          <p>
            Branded gear crafted exclusively for Family Affair Childcare Centers. Premium materials, durable embroidery,
            and seamless volume tier pricing for centers and families.
          </p>
          <AppLink className="pill" to="/contact">
            Official Partner Portal
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
        <p>© 2025 Daykodee Gear Co. Official licensed merchandiser for Family Affair Childcare Centers. All rights reserved.</p>
        <p>
          <AppLink to="/terms">Terms of Service</AppLink>
          <span aria-hidden="true"> · </span>
          <AppLink to="/privacy">Privacy Policy</AppLink>
          <span aria-hidden="true"> · </span>
          <AppLink to="/shipping">Child Safety Compliance</AppLink>
        </p>
      </div>
    </footer>
  );
}
