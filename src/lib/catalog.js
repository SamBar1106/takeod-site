import localCatalog from "../data/products.json";

/**
 * Catalog access for a future Wix proxy.
 * Set VITE_API_BASE_URL to that proxy's origin (no trailing slash).
 * An empty base reads the local placeholder JSON.
 * This module never stores keys and never calls Wix itself.
 */
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getLocalProducts() {
  return localCatalog.products;
}

export async function getProducts() {
  if (!API_BASE_URL) return getLocalProducts();
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error(`Catalog request failed (${response.status})`);
  }
  const data = await response.json();
  if (Array.isArray(data)) return data;
  return data.products ?? [];
}

export async function getProduct(id) {
  const products = await getProducts();
  return products.find((item) => item.id === id) ?? null;
}
