import fs from "node:fs";
import path from "node:path";

const PAGE_EXTENSIONS = new Set(["js", "jsx", "mjs", "ts", "tsx", "mts"]);
const APP_DIR = path.join(process.cwd(), "app");

// Canonical copy for each tool. Adding a route under app/ without an entry here
// still shows up in the nav, but with a title derived from its folder name.
const PAGE_META = {
  "/BGRemove": {
    title: "Remove BG",
    description: "Remove an image background automatically, then refine it with erase and restore brushes.",
  },
  "/FavIcon": {
    title: "Favicon Generator",
    description: "Build favicon.ico, PWA icons and a web manifest from one image, with a ready-made head snippet.",
  },
  "/ImageResizer": {
    title: "Image Resizer",
    description: "Resize photos to exact pixel dimensions or crop them to an aspect ratio, with unit, DPI and format control.",
  },
  "/ImgCompresser": {
    title: "Compress Image",
    description: "Shrink image file sizes with a quality slider, a target size limit and batch ZIP download.",
  },
  "/ImgToBase64": {
    title: "Image to Base64",
    description: "Encode an image as a data URL, HTML tag, CSS background or raw Base64 string.",
  },
  "/JpgToPng": {
    title: "JPG to PNG",
    description: "Convert JPG images to lossless PNG, with optional 8-bit indexed colour and white edge removal.",
  },
  "/PngToJpg": {
    title: "PNG to JPG",
    description: "Convert PNG graphics to JPG, filling transparent areas with white, black or a custom hex colour.",
  },
  "/WebpToPng": {
    title: "WebP to PNG",
    description: "Convert WebP images to PNG in batches, preserving transparency or replacing it with a solid colour.",
  },
  "/Watermark": {
    title: "Watermark",
    description: "Protect your images with custom text or image watermarks.",
  },
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

const isHiddenSegment = (segment) =>
  segment.startsWith("_") || segment.startsWith("@") || /^\(.*\)$/.test(segment);

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

// Category map for the footer's "Popular Category" column. Tool order
// matches the navbar dropdowns; categories with no routes yet are still
// listed and render as "Under Build".
const CATEGORY_ROUTES = [
  {
    name: "Image Tools",
    routes: [
      "/BGRemove",
      "/FavIcon",
      "/ImageResizer",
      "/ImgCompresser",
      "/ImgToBase64",
      "/JpgToPng",
      "/PngToJpg",
      "/WebpToPng",
      "/Watermark",
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

export function getCategories() {
  const pages = getPages();
  return CATEGORY_ROUTES.map(({ name, routes }) => ({
    name,
    tools: routes
      .map((route) => pages.find((page) => page.href === route))
      .filter(Boolean),
  }));
}