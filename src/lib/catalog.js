import localCatalog from "../data/products.json";
import { getCatalogVersion, getWixClient, isDemoMode, wixImage } from "./wix.js";

const V3_FIELDS = [
  "PLAIN_DESCRIPTION",
  "CURRENCY",
  "MEDIA_ITEMS_INFO",
  "VARIANT_OPTION_CHOICE_NAMES",
  "BREADCRUMBS_INFO",
  "THUMBNAIL",
];

const CATEGORIES = [
  { slug: "mugs", label: "Mugs", shopLabel: "Shop Mugs" },
  { slug: "shirts", label: "Shirts", shopLabel: "Shop Shirts" },
  { slug: "bags", label: "Bags", shopLabel: "Shop Bags" },
  { slug: "water-bottles", label: "Water Bottles", shopLabel: "Shop Bottles" },
  { slug: "hats", label: "Hats", shopLabel: "Shop Hats" },
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

function categoryFromNames(names) {
  const blob = names.filter(Boolean).join(" ").toLowerCase();
  const match = CATEGORIES.find(
    (item) => blob.includes(item.label.toLowerCase()) || blob.includes(item.slug.replaceAll("-", " ")),
  );
  if (!match) {
    return {
      category: names.find(Boolean) || "",
      categorySlug: "",
      shopLabel: "Shop Products",
    };
  }
  return { category: match.label, categorySlug: match.slug, shopLabel: match.shopLabel };
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
      return wixImage(image?.url, image?.altText || item?.title || product.name || "", image?.width, image?.height);
    })
    .filter(Boolean);
}

function v3Images(product) {
  const listed = product.media?.itemsInfo?.items;
  const items = listed?.length ? listed : [product.media?.main].filter(Boolean);
  return items
    .map((item) =>
      wixImage(
        item?.url || item?.thumbnail?.url,
        item?.altText || product.name || "",
        item?.thumbnail?.width,
        item?.thumbnail?.height,
      ),
    )
    .filter(Boolean);
}

function normalizeV1(product, collectionNames) {
  const names = (product.collectionIds || []).map((id) => collectionNames?.get(id)).filter(Boolean);
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
    ...categoryFromNames(names),
    ...stock,
    catalogVersion: "v1",
    options: (product.productOptions || []).map((option) => ({
      name: option.name || "",
      key: option.name || "",
      choices: (option.choices || []).map((choice) => ({
        value: choice.value || choice.description || "",
        key: choice.value || choice.description || "",
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

function normalizeV3(product) {
  const crumb = product.breadcrumbsInfo?.breadcrumbs?.at(-1)?.categoryName;
  const stock = stockFromStatus(product.inventory?.availabilityStatus);
  const options = product.options || [];
  return {
    id: product._id,
    slug: product.slug || product._id,
    name: product.name || "",
    description: plainText(product.plainDescription),
    priceLabel: priceRangeLabel(product.actualPriceRange),
    images: v3Images(product),
    ...categoryFromNames([crumb]),
    ...stock,
    catalogVersion: "v3",
    options: options.map((option) => ({
      name: option.name || "",
      key: option.key || option.name || "",
      choices: (option.choicesSettings?.choices || []).map((choice) => ({
        value: choice.name || "",
        key: choice.key || choice.name || "",
        inStock: choice.inStock !== false,
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

async function collectionNameMap(client) {
  try {
    const found = await client.collections.queryCollections().limit(100).find();
    const names = new Map();
    for (const collection of found.items || []) {
      if (collection?._id && collection.name) names.set(collection._id, collection.name);
    }
    return names;
  } catch {
    return new Map();
  }
}

async function loadV1Products(client) {
  const [found, names] = await Promise.all([
    client.products.queryProducts().limit(100).find(),
    collectionNameMap(client),
  ]);
  const items = await collectPages(found);
  return items.filter((item) => item?.visible !== false).map((item) => normalizeV1(item, names));
}

async function loadV3Products(client) {
  const found = await client.productsV3.queryProducts({ fields: V3_FIELDS }).limit(100).find();
  const items = await collectPages(found);
  return items.filter((item) => item?.visible !== false).map((item) => normalizeV3(item));
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
  const [response, names] = await Promise.all([client.products.getProduct(id), collectionNameMap(client)]);
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
  return normalizeV1({ ...product, variants }, names);
}

async function loadV3Product(client, id) {
  const product = await client.productsV3.getProduct(id, { fields: V3_FIELDS });
  const record = product?.product ?? product;
  if (!record?._id) return null;
  return normalizeV3(record);
}

export async function getProduct(id) {
  if (isDemoMode()) return getLocalProducts().find((item) => item.id === id) ?? null;
  const client = await getWixClient();
  const version = await getCatalogVersion(client);
  if (version === "V3_CATALOG") return loadV3Product(client, id);
  if (version === "STORES_NOT_INSTALLED") return null;
  return loadV1Product(client, id);
}
