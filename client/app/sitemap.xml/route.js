// Dynamic sitemap.xml — generated from the filesystem so every tool route,
// plus every static marketing route, is listed with proper lastmod and
// change frequency. No external packages required.
import { getPages, toolMetadata } from "../../lib/pages";

const BASE = "https://docstools.app";

const STATIC_PAGES = [
  { path: "", changefreq: "weekly", priority: 1.0, title: "Docstools — Free Private File Tools" },
  { path: "/tools", changefreq: "weekly", priority: 0.9, title: "All Tools — Browser-only image, PDF, dev and text utilities" },
  { path: "/about", changefreq: "monthly", priority: 0.8, title: "About Docstools — Mission & Team" },
  { path: "/how-it-works", changefreq: "monthly", priority: 0.8, title: "How It Works — 100% Browser-Based Processing" },
  { path: "/faq", changefreq: "weekly", priority: 0.8, title: "FAQ — Privacy, pricing and browser support" },
  { path: "/site-map", changefreq: "monthly", priority: 0.6, title: "Site Map — All Docstools tools and pages" },
  { path: "/blog", changefreq: "weekly", priority: 0.7, title: "Docstools Blog — Tutorials and updates" },
  { path: "/docs", changefreq: "monthly", priority: 0.7, title: "Documentation — Guides and best practices" },
  { path: "/contact", changefreq: "monthly", priority: 0.6, title: "Contact Docstools" },
  { path: "/pricing", changefreq: "monthly", priority: 0.6, title: "Pricing — Free Forever, No Limits" },
  { path: "/privacy", changefreq: "yearly", priority: 0.5, title: "Privacy Policy — No Data Logging" },
  { path: "/terms", changefreq: "yearly", priority: 0.4, title: "Terms of Service" },
  { path: "/cookie-policy", changefreq: "yearly", priority: 0.4, title: "Cookie Policy" },
  { path: "/disclaimer", changefreq: "yearly", priority: 0.4, title: "Disclaimer — File Processing Accuracy" },
  { path: "/dmca", changefreq: "yearly", priority: 0.3, title: "Copyright Policy & DMCA" },
];

// Tool-specific metadata for richer sitemap entries.
// Keys match the full route href returned by getPages().
const TOOL_META = {
  "/img/FavIcon": {
    title: "Favicon Generator — Create favicon.ico and PWA icons",
    desc: "Build favicon.ico, PWA icons and a web manifest from one image.",
  },
  "/img/ImageResizer": {
    title: "Image Resizer — Resize and crop images online",
    desc: "Resize photos to exact pixel dimensions or crop to an aspect ratio.",
  },
  "/img/ImgCompresser": {
    title: "Compress Image — Reduce file size without losing quality",
    desc: "Shrink image file sizes with a quality slider and batch ZIP download.",
  },
  "/img/ImgToBase64": {
    title: "Image to Base64 — Encode images as data URLs",
    desc: "Encode an image as a data URL, HTML tag, CSS background or raw Base64 string.",
  },
  "/img/JpgPngConverter": {
    title: "JPG ⇄ PNG Converter — Two-Way Image Format Converter",
    desc: "Convert between JPEG and PNG formats with batch processing, quality control and transparency handling.",
  },
  "/img/WebpPngConverter": {
    title: "WebP ⇄ PNG Converter — Two-Way Image Format Converter",
    desc: "Convert between WebP and PNG formats with batch processing, quality control and transparency handling.",
  },
  "/img/Watermark": {
    title: "Add Watermark to Images — Text & Logo Watermarks",
    desc: "Protect your images with custom text or image watermarks. 100% browser-based.",
  },
  "/pdf-tools/SplitPDF": {
    title: "Split PDF — Extract Pages from PDF Online",
    desc: "Split PDF files by pages, ranges, or bookmarks. Zero uploads, runs in your browser.",
  },
  "/pdf-tools/MergePDFFiles": {
    title: "Merge PDF — Combine PDF Files Online",
    desc: "Combine multiple PDF files into one document. Reorder, rotate, and merge pages.",
  },
  "/pdf-tools/CompressPDF": {
    title: "Compress PDF — Reduce PDF File Size Online",
    desc: "Reduce PDF file size while maintaining quality. Zero uploads required.",
  },
  "/pdf-tools/PDFtoJPG": {
    title: "PDF to JPG — Convert PDF Pages to JPG Images",
    desc: "Convert PDF pages to high-quality JPG images. Batch convert with customizable DPI.",
  },
  "/pdf-tools/RotatePDF": {
    title: "Rotate PDF — Rotate PDF Pages Online",
    desc: "Rotate PDF pages by 90, 180, or 270 degrees. Works in your browser.",
  },
  "/pdf-tools/JPGtoPDF": {
    title: "JPG to PDF — Convert JPG Images to PDF Online",
    desc: "Convert JPG images to PDF documents. Combine multiple images into one PDF.",
  },
  "/dev-tools/CSSMinifier": {
    title: "CSS Minifier — Compress CSS Code Online",
    desc: "Minify CSS by stripping comments, whitespace and redundant code.",
  },
  "/dev-tools/HTMLMinifier": {
    title: "HTML Minifier — Minify HTML Code Online",
    desc: "Minify HTML markup by removing comments and collapsing whitespace.",
  },
  "/dev-tools/PasswordGenerator": {
    title: "Password Generator — Strong Random Passwords",
    desc: "Generate cryptographically secure random passwords and passphrases.",
  },
  "/dev-tools/QRCodeGenerator": {
    title: "QR Code Generator — Create Custom QR Codes",
    desc: "Create high-resolution QR codes with logos and colour gradients.",
  },
  "/dev-tools/QRCodeScanner": {
    title: "QR Code Scanner — Scan QR Codes Online",
    desc: "Scan QR codes from your camera or uploaded images.",
  },
  "/writing-tool/CaseConverter": {
    title: "Case Converter — Convert Text Case Online",
    desc: "Convert text between uppercase, lowercase, title case, camelCase, and more.",
  },
  "/writing-tool/LoremIpsum": {
    title: "Lorem Ipsum Generator — Placeholder Text Generator",
    desc: "Generate placeholder text for designs and layouts.",
  },
  "/writing-tool/ParagraphWriter": {
    title: "Paragraph Writer — AI-Powered Text Generation",
    desc: "Generate coherent paragraphs on any topic with customizable length and tone.",
  },
  "/writing-tool/RemoveDuplicateLines": {
    title: "Remove Duplicate Lines — Deduplicate Text Online",
    desc: "Remove duplicate lines from text while preserving order.",
  },
  "/writing-tool/SortText": {
    title: "Sort Text — Sort Lines of Text Online",
    desc: "Sort lines alphabetically, numerically, by length, or reverse order.",
  },
  "/writing-tool/WordCounter": {
    title: "Word Counter — Count Words and Characters Online",
    desc: "Count words, characters, sentences, paragraphs, and reading time.",
  },
};

// Only tool routes belong in the sitemap as "tool" entries.
// Non-tool pages (legal, blog, docs, about, contact, footer-only) are listed
// explicitly in STATIC_PAGES above to avoid duplicate or broken URLs.
const TOOL_PREFIXES = ["/img/", "/pdf-tools/", "/dev-tools/", "/writing-tool/"];
const isToolRoute = (href) => TOOL_PREFIXES.some((p) => href.startsWith(p));

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const today = new Date().toISOString().split("T")[0];
  const pages = getPages();

  const toolEntries = pages
    .filter((page) => isToolRoute(page.href))
    .map((page) => {
      const meta = TOOL_META[page.href] ?? {
        title: `${page.title} — Free Online Tool`,
        desc: page.description,
      };
      return {
        path: page.href,
        changefreq: "weekly",
        priority: 0.85,
        title: meta.title,
      };
    });

  const urls = [
    ...STATIC_PAGES.map((p) => ({
      path: p.path,
      changefreq: p.changefreq,
      priority: p.priority,
      title: p.title,
    })),
    ...toolEntries,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(BASE + u.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
    <title>${escapeXml(u.title)}</title>
  </url>`
    )
    .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
