import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { MediaPicture } from "./MediaPicture.jsx";

function QtyField({ item, busy, setQuantity }) {
  const [value, setValue] = useState(String(item.quantity));

  useEffect(() => {
    setValue(String(item.quantity));
  }, [item.quantity]);

  return (
    <input
      type="number"
      min="1"
      inputMode="numeric"
      aria-label={`Quantity for ${item.name}`}
      value={value}
      disabled={busy}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => {
        const next = Math.max(1, Math.floor(Number(value) || item.quantity));
        setValue(String(next));
        if (next !== item.quantity) setQuantity(item.id, next);
      }}
    />
  );
}

export function CartLines({ items }) {
  const { setQuantity, remove, busy } = useCart();

  if (!items.length) return null;

  return (
    <ul className="cart-lines">
      {items.map((item) => (
        <li key={item.id} className="cart-line">
          {item.image ? (
            <MediaPicture image={item.image} alt={item.image.alt || item.name} sizes="88px" />
          ) : (
            <span className="cart-line__media" aria-hidden="true" />
          )}
          <div className="cart-line__copy">
            <p className="cart-line__name">{item.name}</p>
            {item.optionsLabel ? <p className="cart-line__options">{item.optionsLabel}</p> : null}
            <p className="cart-line__price">{item.lineTotalLabel || item.priceLabel}</p>
            <div className="cart-line__qty">
              <button
                type="button"
                aria-label={`Decrease quantity for ${item.name}`}
                disabled={busy || item.quantity <= 1}
                onClick={() => setQuantity(item.id, item.quantity - 1)}
              >
                −
              </button>
              <QtyField item={item} busy={busy} setQuantity={setQuantity} />
              <button
                type="button"
                aria-label={`Increase quantity for ${item.name}`}
                disabled={busy}
                onClick={() => setQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <button type="button" className="cart-line__remove" disabled={busy} onClick={() => remove(item.id)}>
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
