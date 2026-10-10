// Unified category data for the entire application
// This file is used by both server and client components

// Tool metadata - single source of truth for tool titles and descriptions
export const TOOL_METADATA = {
  // Image Tools
  "/img/BGRemove": {
    title: "Remove BG",
    description: "Remove an image background automatically, then refine it with erase and restore brushes.",
  },
  "/img/FavIcon": {
    title: "Favicon Generator",
    description: "Build favicon.ico, PWA icons and a web manifest from one image, with a ready-made head snippet.",
  },
  "/img/ImageResizer": {
    title: "Image Resizer",
    description: "Resize photos to exact pixel dimensions or crop them to an aspect ratio, with unit, DPI and format control.",
  },
  "/img/ImgCompresser": {
    title: "Compress Image",
    description: "Shrink image file sizes with a quality slider, a target size limit and batch ZIP download.",
  },
  "/img/ImgToBase64": {
    title: "Image to Base64",
    description: "Encode an image as a data URL, HTML tag, CSS background or raw Base64 string.",
  },
  "/img/JpgToPng": {
    title: "JPG to PNG",
    description: "Convert JPG images to lossless PNG, with optional 8-bit indexed colour and white edge removal.",
  },
  "/img/PngToJpg": {
    title: "PNG to JPG",
    description: "Convert PNG graphics to JPG, filling transparent areas with white, black or a custom hex colour.",
  },
  "/img/WebpToPng": {
    title: "WebP to PNG",
    description: "Convert WebP images to PNG in batches, preserving transparency or replacing it with a solid colour.",
  },
  "/img/Watermark": {
    title: "Watermark",
    description: "Protect your images with custom text or image watermarks.",
  },

  // PDF Tools
  "/pdf-tools/SplitPDF": {
    title: "Split PDF",
    description: "Split PDF files by pages, ranges, or bookmarks. Extract specific pages into new PDF documents.",
  },
  "/pdf-tools/MergePDFFiles": {
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document. Reorder, rotate, and merge pages with ease.",
  },
  "/pdf-tools/CompressPDF": {
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality. Optimize images and remove redundant data.",
  },
  "/pdf-tools/PDFtoJPG": {
    title: "PDF to JPG",
    description: "Convert PDF pages to high-quality JPG images. Batch convert with customizable DPI and quality.",
  },
  "/pdf-tools/RotatePDF": {
    title: "Rotate PDF",
    description: "Rotate PDF pages by 90, 180, or 270 degrees. Rotate individual pages or the entire document.",
  },
  "/pdf-tools/JPGtoPDF": {
    title: "JPG to PDF",
    description: "Convert JPG images to PDF documents. Combine multiple images into a single PDF file.",
  },

  // MS Office Tools
  "/msoffice-tool/WordnPDF": {
    title: "Word to PDF / PDF to Word",
    description: "Convert Word documents to PDF and PDF files to editable Word documents. Preserve formatting and layout.",
  },
  "/msoffice-tool/TXTnWord": {
    title: "TXT to Word / Word to TXT",
    description: "Convert plain text files to Word documents and Word documents to plain text. Batch conversion supported.",
  },
  "/msoffice-tool/ExcelnPDF": {
    title: "Excel to PDF / PDF to Excel",
    description: "Convert Excel spreadsheets to PDF and PDF tables to editable Excel files. Preserve data and formatting.",
  },
  "/msoffice-tool/PPTnPDF": {
    title: "PowerPoint to PDF / PDF to PowerPoint",
    description: "Convert PowerPoint presentations to PDF and PDF files to editable PowerPoint slides.",
  },
  "/msoffice-tool/HTMLnDOC": {
    title: "HTML to Word / Word to HTML",
    description: "Convert HTML files to Word documents and Word documents to clean HTML. Preserve styling and structure.",
  },
  "/msoffice-tool/CSVnPDF": {
    title: "CSV to Excel / Excel to CSV",
    description: "Convert CSV files to Excel spreadsheets and Excel files to CSV format. Handle large datasets efficiently.",
  },

  // Dev Tools
  "/dev-tools/CSSMinifier": {
    title: "CSS Minifier",
    description: "Compress CSS by stripping comments, whitespace and redundant code, with options for colour and shorthand conversion.",
  },
  "/dev-tools/HTMLMinifier": {
    title: "HTML Minifier",
    description: "Minify HTML markup by removing comments, collapsing whitespace and optimising inline CSS and JavaScript.",
  },
  "/dev-tools/PasswordGenerator": {
    title: "Strong Password Generator",
    description: "Generate cryptographically secure random passwords and memorable passphrases with a live strength meter.",
  },
  "/dev-tools/QRCodeGenerator": {
    title: "QR Code Generator",
    description: "Create custom high-resolution QR codes with logos, colour gradients and multiple export formats (PNG, SVG, EPS).",
  },
  "/dev-tools/QRCodeScanner": {
    title: "QR Code Scanner",
    description: "Scan QR codes from your camera or uploaded images, with a scan history and smart payload actions.",
  },

  // Text Tools
  "/writing-tool/CaseConverter": {
    title: "Case Converter",
    description: "Convert text between uppercase, lowercase, title case, sentence case, camelCase, snake_case, and more.",
  },
  "/writing-tool/LoremIpsum": {
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text for designs and layouts. Customize paragraphs, words, and characters.",
  },
  "/writing-tool/ParagraphWriter": {
    title: "Paragraph Writer",
    description: "AI-powered paragraph generation. Create coherent paragraphs on any topic with customizable length and tone.",
  },
  "/writing-tool/RemoveDuplicateLines": {
    title: "Remove Duplicate Lines",
    description: "Remove duplicate lines from text while preserving order. Supports case-sensitive and case-insensitive modes.",
  },
  "/writing-tool/SortText": {
    title: "Sort Text",
    description: "Sort lines of text alphabetically, numerically, by length, or reverse order. Remove duplicates option included.",
  },
  "/writing-tool/WordCounter": {
    title: "Word Counter",
    description: "Count words, characters, sentences, paragraphs, and reading time. Real-time stats as you type.",
  },
};

// Category route slugs for URL-friendly paths
export const CATEGORY_SLUGS = {
  "Image Tools": "img-tools",
  "PDF Tools": "pdf-tools",
  "MS Office Tools": "ms-office-tools",
  "Dev Tools": "dev-tools",
  "Text Tools": "text-tools",
};

// Category icons for display
export const CATEGORY_ICONS = {
  "Image Tools": "🖼️",
  "PDF Tools": "📄",
  "MS Office Tools": "📊",
  "Dev Tools": "⚙️",
  "Text Tools": "📝",
};

// Category descriptions
export const CATEGORY_DESCRIPTIONS = {
  "Image Tools": "Convert, compress, resize, and edit images entirely in your browser.",
  "PDF Tools": "Split, merge, compress, convert, and rotate PDFs with zero uploads.",
  "MS Office Tools": "Convert between Word, Excel, PowerPoint, PDF, HTML, CSV and TXT formats.",
  "Dev Tools": "Minify code, generate passwords, create QR codes, and scan barcodes.",
  "Text Tools": "Convert case, generate Lorem Ipsum, write paragraphs, sort and count text.",
};

// Core category definitions with routes
export const CATEGORY_ROUTES = [
  {
    name: "Image Tools",
    routes: [
      "/img/BGRemove",
      "/img/FavIcon",
      "/img/ImageResizer",
      "/img/ImgCompresser",
      "/img/ImgToBase64",
      "/img/JpgToPng",
      "/img/PngToJpg",
      "/img/WebpToPng",
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
    name: "MS Office Tools",
    routes: [
      "/msoffice-tool/WordnPDF",
      "/msoffice-tool/TXTnWord",
      "/msoffice-tool/ExcelnPDF",
      "/msoffice-tool/PPTnPDF",
      "/msoffice-tool/HTMLnDOC",
      "/msoffice-tool/CSVnPDF",
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