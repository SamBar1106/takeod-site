import { createClient, EMPTY_TOKENS, OAuthStrategy, media } from "@wix/sdk";
import { catalogVersioning, collections, products, productsV3 } from "@wix/stores";
import { currentCart } from "@wix/ecom";
import { redirects } from "@wix/redirects";

const CLIENT_ID = String(import.meta.env.VITE_WIX_CLIENT_ID || "").trim();
const SESSION_KEY = "wixSession";
const CANONICAL_ORIGIN = "https://sambar1106.github.io";

export const STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

export function isDemoMode() {
  return CLIENT_ID.length === 0;
}

export function thankYouUrl() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${CANONICAL_ORIGIN}${base}/thank-you`;
}

function readStoredTokens() {
  if (typeof localStorage === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed?.refreshToken?.value && !parsed?.accessToken?.value) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function tokenStorage() {
  return {
    getTokens() {
      return readStoredTokens() ?? EMPTY_TOKENS;
    },
    setTokens(tokens) {
      if (typeof localStorage === "undefined" || !tokens) return;
      localStorage.setItem(SESSION_KEY, JSON.stringify(tokens));
    },
  };
}

let clientPromise;

export function getWixClient() {
  if (isDemoMode()) return Promise.resolve(null);
  if (!clientPromise) clientPromise = createReadyClient();
  return clientPromise;
}

async function createReadyClient() {
  const storage = tokenStorage();
  const client = createClient({
    modules: { products, productsV3, catalogVersioning, collections, currentCart, redirects },
    auth: OAuthStrategy({ clientId: CLIENT_ID, tokenStorage: storage }),
  });
  const existing = readStoredTokens();
  const tokens = await client.auth.generateVisitorTokens(existing);
  client.auth.setTokens(tokens);
  return client;
}

let versionPromise;

export async function getCatalogVersion(client) {
  if (!versionPromise) {
    versionPromise = client.catalogVersioning
      .getCatalogVersion()
      .then((response) => response?.catalogVersion || "V1_CATALOG")
      .catch(() => "V1_CATALOG");
  }
  return versionPromise;
}

const WIX_MEDIA_HOST = "https://static.wixstatic.com/media/";
const IMAGE_WIDTHS = [600, 800, 1200, 1600];

function fitUrl(fileId, width) {
  return `${WIX_MEDIA_HOST}${fileId}/v1/fit/w_${width},h_${width},q_90/file.jpg`;
}

function imageWidths(originWidth) {
  const cap = originWidth > 80 ? Math.min(originWidth, 1600) : 1600;
  const widths = IMAGE_WIDTHS.filter((width) => width <= cap);
  if (cap >= 600 && !widths.includes(cap)) widths.push(cap);
  return widths.length ? widths.sort((a, b) => a - b) : [800];
}

export function wixImage(value, alt, width, height) {
  if (!value) return null;
  const source = typeof value === "string" ? value : value.url || value.image || "";
  if (!source) return null;
  if (source.startsWith("wix:") || source.startsWith(WIX_MEDIA_HOST)) {
    try {
      const parsed = media.getImageUrl(source);
      if (!parsed?.id) return null;
      const originWidth = source.startsWith("wix:") && parsed.width > 80 ? parsed.width : width > 80 ? width : 0;
      const originHeight = source.startsWith("wix:") && parsed.height > 80 ? parsed.height : height > 80 ? height : 0;
      const widths = imageWidths(originWidth);
      const target = widths.find((item) => item >= 800) || widths[widths.length - 1];
      return {
        url: fitUrl(parsed.id, target),
        srcSet: widths.map((item) => `${fitUrl(parsed.id, item)} ${item}w`).join(", "),
        alt: alt || parsed.altText || "",
        width: originWidth || 1280,
        height: originHeight || 720,
      };
    } catch {
      return null;
    }
  }
  if (/^https?:\/\//.test(source)) {
    return {
      url: source,
      alt: alt || "",
      width: width || 1280,
      height: height || 720,
    };
  }
  return null;
}

function isMissingCart(error) {
  const status = error?.status || error?.response?.status || error?.httpStatus;
  const code = error?.details?.applicationError?.code || error?.applicationError?.code || "";
  const message = `${error?.message || ""} ${code}`;
  return status === 404 || /not.?found|OWNED_CART|CART_NOT_FOUND/i.test(message);
}

function lineAmount(item) {
  const total = item.lineItemPrice?.convertedAmount || item.lineItemPrice?.amount;
  if (total != null && total !== "" && Number.isFinite(Number(total))) return Number(total);
  const unit = Number(item.price?.convertedAmount || item.price?.amount);
  if (Number.isFinite(unit)) return unit * (item.quantity || 1);
  return null;
}

function formatAmount(amount, currency, sample) {
  if (!Number.isFinite(amount)) return "";
  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
    } catch {
      /* use the sample or a plain number */
    }
  }
  if (sample && /\d/.test(sample)) {
    const formatted = amount.toFixed(2);
    return sample.replace(/\d[\d,]*(?:\.\d+)?/, formatted);
  }
  return amount.toFixed(2);
}

export function mapCartLine(item) {
  const name = item.productName?.translated || item.productName?.original || "";
  const unit = item.price?.formattedConvertedAmount || item.price?.formattedAmount || "";
  const lineTotal = item.lineItemPrice?.formattedConvertedAmount || item.lineItemPrice?.formattedAmount || "";
  const optionsLabel = (item.descriptionLines || [])
    .map((line) => {
      const label = line.name?.translated || line.name?.original || "";
      const value =
        line.plainText?.translated ||
        line.plainText?.original ||
        line.colorInfo?.translated ||
        line.colorInfo?.original ||
        "";
      return [label, value].filter(Boolean).join(": ");
    })
    .filter(Boolean)
    .join(", ");
  return {
    id: item._id,
    productId: item.catalogReference?.catalogItemId || item.rootCatalogItemId || "",
    name,
    quantity: item.quantity || 1,
    priceLabel: unit,
    lineTotalLabel: lineTotal || unit,
    optionsLabel,
    image: item.image ? wixImage(item.image, name) : null,
    amount: lineAmount(item),
  };
}

function cartPayload(cart) {
  const lines = (cart?.lineItems || []).map(mapCartLine).filter((line) => line.id);
  return { lines, currency: cart?.currency || cart?.conversionCurrency || "" };
}

export async function readCurrentCart() {
  const client = await getWixClient();
  if (!client) return null;
  try {
    const cart = await client.currentCart.getCurrentCart();
    const payload = cartPayload(cart);
    payload.subtotalLabel = await readSubtotal(client, payload);
    return payload;
  } catch (error) {
    if (isMissingCart(error)) return { lines: [], currency: "", subtotalLabel: "" };
    throw error;
  }
}

async function readSubtotal(client, payload) {
  try {
    const estimate = await client.currentCart.estimateCurrentCartTotals({
      calculateTax: false,
      calculateShipping: false,
      calculateAdditionalFees: false,
    });
    const subtotal = estimate?.priceSummary?.subtotal;
    const formatted = subtotal?.formattedConvertedAmount || subtotal?.formattedAmount;
    if (formatted) return formatted;
  } catch {
    /* line items still carry a price */
  }
  const amounts = payload.lines.map((line) => line.amount).filter((amount) => Number.isFinite(amount));
  if (!amounts.length || amounts.length !== payload.lines.length) return "";
  const sample = payload.lines.find((line) => line.lineTotalLabel)?.lineTotalLabel;
  return formatAmount(
    amounts.reduce((sum, amount) => sum + amount, 0),
    payload.currency,
    sample,
  );
}

export function catalogReferenceFor(product, variant) {
  const reference = {
    appId: STORES_APP_ID,
    catalogItemId: product.id,
  };
  if (product.catalogVersion === "v3") {
    const options = {};
    if (variant?.id) options.variantId = variant.id;
    if (variant?.choiceKeys && Object.keys(variant.choiceKeys).length) options.options = variant.choiceKeys;
    if (Object.keys(options).length) reference.options = options;
    return reference;
  }
  if (variant?.id) reference.options = { variantId: variant.id };
  else if (variant?.choices && Object.keys(variant.choices).length) reference.options = { options: variant.choices };
  return reference;
}

export async function addToCurrentCart(product, variant, quantity = 1) {
  const client = await getWixClient();
  const cart = await client.currentCart.addToCurrentCart({
    lineItems: [
      {
        catalogReference: catalogReferenceFor(product, variant),
        quantity,
      },
    ],
  });
  const payload = cartPayload(cart?.cart || cart);
  payload.subtotalLabel = await readSubtotal(client, payload);
  return payload;
}

export async function updateCurrentCartQuantity(lineId, quantity) {
  const client = await getWixClient();
  const response = await client.currentCart.updateCurrentCartLineItemQuantity([{ _id: lineId, quantity }]);
  const payload = cartPayload(response?.cart || response);
  payload.subtotalLabel = await readSubtotal(client, payload);
  return payload;
}

export async function removeCurrentCartLines(lineIds) {
  const client = await getWixClient();
  const response = await client.currentCart.removeLineItemsFromCurrentCart(lineIds);
  const payload = cartPayload(response?.cart || response);
  payload.subtotalLabel = await readSubtotal(client, payload);
  return payload;
}

export async function redirectToCheckout() {
  const client = await getWixClient();
  if (!client) return { demo: true };
  const { checkoutId } = await client.currentCart.createCheckoutFromCurrentCart({
    channelType: currentCart.ChannelType.WEB,
  });
  const returnUrl = thankYouUrl();
  const session = await client.redirects.createRedirectSession({
    ecomCheckout: { checkoutId },
    callbacks: {
      postFlowUrl: returnUrl,
      thankYouPageUrl: returnUrl,
    },
  });
  const url = session?.redirectSession?.fullUrl;
  if (!url) throw new Error("Checkout redirect was not returned");
  window.location.assign(url);
  return { demo: false };
}
