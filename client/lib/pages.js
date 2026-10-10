import fs from "node:fs";
import path from "node:path";
import { TOOL_METADATA, CATEGORY_ROUTES, buildCategories, getAllCategorySlugs, getCategoryBySlug, getCategoryNameFromSlug } from "./category-data";

const PAGE_EXTENSIONS = new Set(["js", "jsx", "mjs", "ts", "tsx", "mts"]);
const APP_DIR = path.join(process.cwd(), "app");

// Canonical copy for each tool. Adding a route under app/ without an entry here
// still shows up in the nav, but with a title derived from its folder name.
const PAGE_META = {
  "/analytics": {
    title: "Analytics Dashboard",
    description: "View website analytics and visitor insights.",
  },
  ...TOOL_METADATA,
};

const isHiddenSegment = (segment) =>
  segment.startsWith("_") || segment.startsWith("@") || segment.startsWith("[") || /^\(.*\)$/.test(segment);

const toTitle = (href) => {
  const name = href.split("/").filter(Boolean).pop() ?? "Home";
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function collect(dir, segments = [], found = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (isHiddenSegment(entry.name)) continue;
      collect(path.join(dir, entry.name), [...segments, entry.name], found);
      continue;
    }

    const extension = path.extname(entry.name).slice(1);
    if (path.basename(entry.name, `.${extension}`) !== "page") continue;
    if (!PAGE_EXTENSIONS.has(extension)) continue;

    found.push(segments.join("/"));
  }

  return found;
}

// Routes are discovered from the filesystem, so a new app/<Tool>/page.js shows
// up in the nav and home page with no extra wiring.
export function getPages() {
  return collect(APP_DIR)
    .filter((route) => route !== "")
    .sort((a, b) => a.localeCompare(b))
    .map((route) => {
      const href = `/${route}`;
      return { href, ...describe(href) };
    });
}

function describe(href) {
  const meta = PAGE_META[href];
  const title = meta?.title ?? toTitle(href);
  return {
    title,
    description: meta?.description ?? `Open the ${title} page.`,
  };
}

// Tool pages are client components and so cannot export metadata themselves;
// each route's layout.js calls this instead.
export function toolMetadata(href) {
  const { title, description } = describe(href);
  return { title, description };
}

// Export category functions using shared category data
export { buildCategories, getAllCategorySlugs, getCategoryBySlug, getCategoryNameFromSlug, CATEGORY_ROUTES, TOOL_METADATA };

export function getCategories() {
  const pages = getPages();
  return buildCategories(pages);
}