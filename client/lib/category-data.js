// Unified category data for the entire application
// This file is used by both server and client components

// Tool metadata - single source of truth for tool titles, descriptions, and icons
export const TOOL_METADATA = {
  // Image Tools
  "/img/FavIcon": {
    title: "Favicon Generator",
    description: "Build favicon.ico, PWA icons and a web manifest from one image, with a ready-made head snippet.",
    icon: "🌐",
  },
  "/img/ImageResizer": {
    title: "Image Resizer",
    description: "Resize photos to exact pixel dimensions or crop them to an aspect ratio, with unit, DPI and format control.",
    icon: "📐",
  },
  "/img/ImgCompresser": {
    title: "Compress Image",
    description: "Shrink image file sizes with a quality slider, a target size limit and batch ZIP download.",
    icon: "🗜️",
  },
  "/img/ImgToBase64": {
    title: "Image to Base64",
    description: "Encode an image as a data URL, HTML tag, CSS background or raw Base64 string.",
    icon: "🔤",
  },
  "/img/JpgPngConverter": {
    title: "JPG ⇄ PNG Converter",
    description: "Two-way converter between JPEG and PNG formats. Batch convert with quality control and transparency handling.",
    icon: "🔄",
  },
  "/img/WebpPngConverter": {
    title: "WebP ⇄ PNG Converter",
    description: "Two-way converter between WebP and PNG formats. Batch convert with quality control and transparency handling.",
    icon: "🔄",
  },
  "/img/Watermark": {
    title: "Watermark",
    description: "Protect your images with custom text or image watermarks.",
    icon: "💧",
  },

  // PDF Tools
  "/pdf-tools/SplitPDF": {
    title: "Split PDF",
    description: "Split PDF files by pages, ranges, or bookmarks. Extract specific pages into new PDF documents.",
    icon: "✂️",
  },
  "/pdf-tools/MergePDFFiles": {
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document. Reorder, rotate, and merge pages with ease.",
    icon: "📎",
  },
  "/pdf-tools/CompressPDF": {
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality. Optimize images and remove redundant data.",
    icon: "🗜️",
  },
  "/pdf-tools/PDFtoJPG": {
    title: "PDF to JPG",
    description: "Convert PDF pages to high-quality JPG images. Batch convert with customizable DPI and quality.",
    icon: "🖼️",
  },
  "/pdf-tools/RotatePDF": {
    title: "Rotate PDF",
    description: "Rotate PDF pages by 90, 180, or 270 degrees. Rotate individual pages or the entire document.",
    icon: "🔄",
  },
  "/pdf-tools/JPGtoPDF": {
    title: "JPG to PDF",
    description: "Convert JPG images to PDF documents. Combine multiple images into a single PDF file.",
    icon: "📄",
  },

  // Dev Tools
  "/dev-tools/CSSMinifier": {
    title: "CSS Minifier",
    description: "Compress CSS by stripping comments, whitespace and redundant code, with options for colour and shorthand conversion.",
    icon: "🎨",
  },
  "/dev-tools/HTMLMinifier": {
    title: "HTML Minifier",
    description: "Minify HTML markup by removing comments, collapsing whitespace and optimising inline CSS and JavaScript.",
    icon: "🌐",
  },
  "/dev-tools/PasswordGenerator": {
    title: "Strong Password Generator",
    description: "Generate cryptographically secure random passwords and memorable passphrases with a live strength meter.",
    icon: "🔐",
  },
  "/dev-tools/QRCodeGenerator": {
    title: "QR Code Generator",
    description: "Create custom high-resolution QR codes with logos, colour gradients and multiple export formats (PNG, SVG, EPS).",
    icon: "📱",
  },
  "/dev-tools/QRCodeScanner": {
    title: "QR Code Scanner",
    description: "Scan QR codes from your camera or uploaded images, with a scan history and smart payload actions.",
    icon: "📷",
  },

  // Text Tools
  "/writing-tool/CaseConverter": {
    title: "Case Converter",
    description: "Convert text between uppercase, lowercase, title case, sentence case, camelCase, snake_case, and more.",
    icon: "🔠",
  },
  "/writing-tool/LoremIpsum": {
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text for designs and layouts. Customize paragraphs, words, and characters.",
    icon: "📝",
  },
  "/writing-tool/ParagraphWriter": {
    title: "Paragraph Writer",
    description: "AI-powered paragraph generation. Create coherent paragraphs on any topic with customizable length and tone.",
    icon: "🤖",
  },
  "/writing-tool/RemoveDuplicateLines": {
    title: "Remove Duplicate Lines",
    description: "Remove duplicate lines from text while preserving order. Supports case-sensitive and case-insensitive modes.",
    icon: "🧹",
  },
  "/writing-tool/SortText": {
    title: "Sort Text",
    description: "Sort lines of text alphabetically, numerically, by length, or reverse order. Remove duplicates option included.",
    icon: "📋",
  },
  "/writing-tool/WordCounter": {
    title: "Word Counter",
    description: "Count words, characters, sentences, paragraphs, and reading time. Real-time stats as you type.",
    icon: "🔢",
  },
};

// Category route slugs for URL-friendly paths
export const CATEGORY_SLUGS = {
  "Image Tools": "img-tools",
  "PDF Tools": "pdf-tools",
  "Dev Tools": "dev-tools",
  "Text Tools": "text-tools",
};

// Category icons for display
export const CATEGORY_ICONS = {
  "Image Tools": "🖼️",
  "PDF Tools": "📄",
  "Dev Tools": "⚙️",
  "Text Tools": "📝",
};

// Category descriptions
export const CATEGORY_DESCRIPTIONS = {
  "Image Tools": "Convert, compress, resize, and edit images entirely in your browser.",
  "PDF Tools": "Split, merge, compress, convert, and rotate PDFs with zero uploads.",
  "Dev Tools": "Minify code, generate passwords, create QR codes, and scan barcodes.",
  "Text Tools": "Convert case, generate Lorem Ipsum, write paragraphs, sort and count text.",
};

// Core category definitions with routes
export const CATEGORY_ROUTES = [
  {
    name: "Image Tools",
    routes: [
      "/img/FavIcon",
      "/img/ImageResizer",
      "/img/ImgCompresser",
      "/img/ImgToBase64",
      "/img/JpgPngConverter",
      "/img/WebpPngConverter",
      "/img/Watermark",
    ],
  },
  {
    name: "PDF Tools",
    routes: [
      "/pdf-tools/SplitPDF",
      "/pdf-tools/MergePDFFiles",
      "/pdf-tools/CompressPDF",
      "/pdf-tools/PDFtoJPG",
      "/pdf-tools/RotatePDF",
      "/pdf-tools/JPGtoPDF",
    ],
  },
  {
    name: "Dev Tools",
    routes: [
      "/dev-tools/CSSMinifier",
      "/dev-tools/HTMLMinifier",
      "/dev-tools/PasswordGenerator",
      "/dev-tools/QRCodeGenerator",
      "/dev-tools/QRCodeScanner",
    ],
  },
  {
    name: "Text Tools",
    routes: [
      "/writing-tool/CaseConverter",
      "/writing-tool/LoremIpsum",
      "/writing-tool/ParagraphWriter",
      "/writing-tool/RemoveDuplicateLines",
      "/writing-tool/SortText",
      "/writing-tool/WordCounter",
    ],
  },
];

// Get category slug from name
export function getCategorySlug(name) {
  return CATEGORY_SLUGS[name] || name.toLowerCase().replace(/\s+/g, '-');
}

// Get category name from slug
export function getCategoryNameFromSlug(slug) {
  const entry = Object.entries(CATEGORY_SLUGS).find(([, v]) => v === slug);
  return entry ? entry[0] : null;
}

// Build categories with full tool metadata
export function buildCategories(pages = null) {
  const pageMap = pages ? new Map(pages.map(p => [p.href, p])) : null;

  return CATEGORY_ROUTES.map(({ name, routes }) => {
    const tools = routes.map((route) => {
      const meta = TOOL_METADATA[route];
      const page = pageMap?.get(route);
      return {
        href: route,
        title: meta?.title ?? page?.title ?? route.split("/").pop()?.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").trim().replace(/\b\w/g, (char) => char.toUpperCase()) ?? "Tool",
        description: meta?.description ?? page?.description ?? `Open the ${meta?.title ?? route} page.`,
      };
    }).filter(Boolean);

    return {
      name,
      slug: getCategorySlug(name),
      icon: CATEGORY_ICONS[name],
      description: CATEGORY_DESCRIPTIONS[name],
      tools,
      toolCount: tools.length,
    };
  });
}

// Get a single category by slug
export function getCategoryBySlug(slug, pages = null) {
  const categories = buildCategories(pages);
  return categories.find(c => c.slug === slug) || null;
}

// Get all category slugs for static generation
export function getAllCategorySlugs() {
  return CATEGORY_ROUTES.map(({ name }) => getCategorySlug(name));
}