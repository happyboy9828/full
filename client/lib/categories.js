// Static category data for client-side use (Navbar, etc.)
// This file doesn't use node:fs so it can be safely imported in client components.

import { CATEGORY_ROUTES, TOOL_METADATA, CATEGORY_SLUGS, CATEGORY_ICONS, CATEGORY_DESCRIPTIONS, buildCategories, getAllCategorySlugs, getCategoryBySlug } from "./category-data";

// Static categories for client-side use (Navbar)
export const STATIC_CATEGORIES = CATEGORY_ROUTES.map(({ name, routes }) => ({
  name,
  slug: CATEGORY_SLUGS[name],
  icon: CATEGORY_ICONS[name],
  description: CATEGORY_DESCRIPTIONS[name],
  tools: routes
    .map((route) => TOOL_METADATA[route] ? { href: route, ...TOOL_METADATA[route] } : null)
    .filter(Boolean),
}));

export function getCategories(pages) {
  return buildCategories(pages);
}

export function getToolMetadata(href) {
  const meta = TOOL_METADATA[href];
  const title = meta?.title ?? href.split("/").pop()?.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").trim().replace(/\b\w/g, (char) => char.toUpperCase()) ?? "Tool";
  return {
    title,
    description: meta?.description ?? `Open the ${title} page.`,
  };
}

// Re-export for backward compatibility
export { CATEGORY_ROUTES, TOOL_METADATA, CATEGORY_SLUGS, CATEGORY_ICONS, CATEGORY_DESCRIPTIONS, buildCategories, getAllCategorySlugs, getCategoryBySlug };