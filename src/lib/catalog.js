import localCatalog from "../data/products.json";
import { getCatalogVersion, getWixClient, isDemoMode, wixImage } from "./wix.js";

const V3_FIELDS = [
  "PLAIN_DESCRIPTION",
  "CURRENCY",
  "MEDIA_ITEMS_INFO",
  "VARIANT_OPTION_CHOICE_NAMES",
  "ALL_CATEGORIES_INFO",
  "THUMBNAIL",
];

const CATEGORIES = [
  { slug: "mugs", label: "Mugs & Drinkware", words: ["mug", "tumbler", "sippy", "drinkware"] },
  { slug: "shirts", label: "Shirts & Apparel", words: ["shirt", "tee", "apparel", "polo"] },
  { slug: "bags", label: "Backpacks & Bags", words: ["bag", "tote", "backpack"] },
  { slug: "water-bottles", label: "Water Bottles", words: ["bottle"] },
  { slug: "hats", label: "Hats & Beanies", words: ["hat", "beanie", "cap"] },
];

export { isDemoMode };

export function getLocalProducts() {
  return localCatalog.products;
}

function plainText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function safeColor(value) {
  return /^#[0-9a-fA-F]{3,8}$/.test(String(value || "")) ? value : "";
}

function wordHit(text, word) {
  return new RegExp(`\\b${word}\\b`, "i").test(text);
}

function classifyProduct(name, collections) {
  const text = [name, ...(collections || []).map((item) => item.label)].filter(Boolean).join(" ");
  const matched = CATEGORIES.filter((item) => item.words.some((word) => wordHit(text, word)));
  const categorySlugs = [...new Set([...matched.map((item) => item.slug), ...(collections || []).map((item) => item.slug)])];
  return {
    category: matched[0]?.label || collections?.[0]?.label || "",
    categorySlug: categorySlugs[0] || "",
    categorySlugs,
    collections: collections || [],
    shopLabel: "Add / Bulk Quote",
  };
}

function mediaSource(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item.image === "string") return item.image;
  if (item.image?.url) return item.image.url;
  return item.url || item.thumbnail?.url || "";
}

function stockFromStatus(status) {
  if (status === "IN_STOCK") return { stockStatus: "in_stock", stockLabel: "In stock" };
  if (status === "OUT_OF_STOCK") return { stockStatus: "out_of_stock", stockLabel: "Out of stock" };
  if (status === "PARTIALLY_OUT_OF_STOCK") return { stockStatus: "partial", stockLabel: "Partially out of stock" };
  return { stockStatus: "", stockLabel: "" };
}

function priceRangeLabel(range) {
  const min = range?.minValue?.formattedAmount || "";
  const max = range?.maxValue?.formattedAmount || "";
  if (min && max && min !== max) return `${min} – ${max}`;
  return min || max || "";
}

async function collectPages(first) {
  const items = [...(first?.items || [])];
  let page = first;
  for (let guard = 0; page?.hasNext?.() && guard < 4; guard += 1) {
    page = await page.next();
    items.push(...(page?.items || []));
  }
  return items;
}

function v1Images(product) {
  const items = product.media?.items?.length ? product.media.items : [product.media?.mainMedia].filter(Boolean);
  return items
    .map((item) => {
      const image = item?.image || item?.thumbnail;
      return wixImage(mediaSource(image) || mediaSource(item), image?.altText || item?.title || product.name || "");
    })
    .filter(Boolean);
}

function v3Images(product) {
  const listed = product.media?.itemsInfo?.items;
  const items = listed?.length ? listed : [product.media?.main].filter(Boolean);
  return items
    .map((item) => wixImage(mediaSource(item), item?.altText || product.name || ""))
    .filter(Boolean);
}

function normalizeV1(product, catalogCollections) {
  const joined = (product.collectionIds || [])
    .map((id) => catalogCollections.find((item) => item.id === id))
    .filter(Boolean);
  const price =
    product.priceData?.formatted?.discountedPrice ||
    product.price?.formatted?.discountedPrice ||
    product.priceData?.formatted?.price ||
    product.price?.formatted?.price ||
    "";
  const stock = stockFromStatus(product.stock?.inventoryStatus);
  return {
    id: product._id,
    slug: product.slug || product._id,
    name: product.name || "",
    description: plainText(product.description),
    priceLabel: price,
    images: v1Images(product),
    ...classifyProduct(product.name || "", joined),
    ...stock,
    catalogVersion: "v1",
    options: (product.productOptions || []).map((option) => ({
      name: option.name || "",
      key: option.name || "",
      choices: (option.choices || []).map((choice) => ({
        value: choice.value || choice.description || "",
        key: choice.value || choice.description || "",
        color: safeColor(choice.colorCode),
        inStock: choice.inStock !== false,
      })),
    })),
    variants: (product.variants || []).map((variant) => ({
      id: variant._id,
      choices: variant.choices || {},
      choiceKeys: variant.choices || {},
      priceLabel:
        variant.variant?.priceData?.formatted?.discountedPrice ||
        variant.variant?.convertedPriceData?.formatted?.discountedPrice ||
        variant.variant?.priceData?.formatted?.price ||
        "",
      inStock: variant.stock?.inStock !== false,
    })),
  };
}

function normalizeV3(product, catalogCollections) {
  const ids = new Set((product.allCategoriesInfo?.categories || []).map((item) => item._id));
  const joined = catalogCollections.filter((item) => ids.has(item.id));
  const stock = stockFromStatus(product.inventory?.availabilityStatus);
  const options = product.options || [];
  return {
    id: product._id,
    slug: product.slug || product._id,
    name: product.name || "",
    description: plainText(product.plainDescription),
    priceLabel: priceRangeLabel(product.actualPriceRange),
    images: v3Images(product),
    ...classifyProduct(product.name || "", joined),
    ...stock,
    catalogVersion: "v3",
    options: options.map((option) => ({
      name: option.name || "",
      key: option.key || option.name || "",
      choices: (option.choicesSettings?.choices || []).map((choice) => ({
        value: choice.name || "",
        key: choice.key || choice.name || "",
        color: safeColor(choice.colorCode),
        inStock: choice.inStock !== false && choice.visible !== false,
      })),
    })),
    variants: (product.variantsInfo?.variants || []).map((variant) => {
      const choices = {};
      const choiceKeys = {};
      for (const choice of variant.choices || []) {
        const name = choice.optionChoiceNames?.optionName;
        const value = choice.optionChoiceNames?.choiceName;
        if (name && value) choices[name] = value;
        const option = options.find((item) => item._id === choice.optionChoiceIds?.optionId);
        const selected = option?.choicesSettings?.choices?.find(
          (item) => item.choiceId === choice.optionChoiceIds?.choiceId,
        );
        if (option?.key && selected?.key) choiceKeys[option.key] = selected.key;
      }
      return {
        id: variant._id,
        choices,
        choiceKeys,
        priceLabel:
          variant.price?.priceAfterDiscount?.formattedAmount || variant.price?.actualPrice?.formattedAmount || "",
        inStock: variant.inventoryStatus?.inStock !== false,
      };
    }),
  };
}

async function catalogCollections(client) {
  try {
    const found = await client.collections.queryCollections().limit(100).find();
    return (found.items || [])
      .filter((collection) => collection?.visible !== false && collection?._id && collection.name)
      .map((collection) => ({
        id: collection._id,
        slug: collection.slug || collection._id,
        label: String(collection.name).trim(),
      }))
      .filter((collection) => collection.slug !== "all-products" && !/^all products$/i.test(collection.label));
  } catch {
    return [];
  }
}

async function loadV1Products(client) {
  const [found, collections] = await Promise.all([
    client.products.queryProducts().limit(100).find(),
    catalogCollections(client),
  ]);
  const items = await collectPages(found);
  return items.filter((item) => item?.visible !== false).map((item) => normalizeV1(item, collections));
}

async function loadV3Products(client) {
  const [found, collections] = await Promise.all([
    client.productsV3.queryProducts({ fields: V3_FIELDS }).limit(100).find(),
    catalogCollections(client),
  ]);
  const items = await collectPages(found);
  return items.filter((item) => item?.visible !== false).map((item) => normalizeV3(item, collections));
}

export async function getProducts() {
  if (isDemoMode()) return getLocalProducts();
  const client = await getWixClient();
  const version = await getCatalogVersion(client);
  if (version === "STORES_NOT_INSTALLED") return [];
  if (version === "V3_CATALOG") return loadV3Products(client);
  return loadV1Products(client);
}

async function loadV1Product(client, id) {
  const [response, collections] = await Promise.all([client.products.getProduct(id), catalogCollections(client)]);
  const product = response?.product ?? response;
  if (!product?._id) return null;
  let variants = product.variants;
  if (!variants?.length && product.productOptions?.length) {
    try {
      const variantResponse = await client.products.queryProductVariants(id);
      variants = variantResponse?.variants || [];
    } catch {
      variants = [];
    }
  }
  return normalizeV1({ ...product, variants }, collections);
}

async function loadV3Product(client, id) {
  const [product, collections] = await Promise.all([
    client.productsV3.getProduct(id, { fields: V3_FIELDS }),
    catalogCollections(client),
  ]);
  const record = product?.product ?? product;
  if (!record?._id) return null;
  return normalizeV3(record, collections);
}

export async function getProduct(id) {
  if (isDemoMode()) return getLocalProducts().find((item) => item.id === id) ?? null;
  const client = await getWixClient();
  const version = await getCatalogVersion(client);
  if (version === "V3_CATALOG") return loadV3Product(client, id);
  if (version === "STORES_NOT_INSTALLED") return null;
  return loadV1Product(client, id);
}
