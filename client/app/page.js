import Link from "next/link";

const ALL_TOOL_CATEGORIES = [
  {
    name: "Image & Format Tools",
    tools: [
      {
        title: "JPG to PNG",
        description: "Convert JPG images to lossless PNG with optional 8-bit indexed colour and white edge removal.",
        href: "/img/JpgToPng",
      },
      {
        title: "PNG to JPG",
        description: "Convert PNG graphics to JPG, filling transparent areas with white, black or a custom hex colour.",
        href: "/img/PngToJpg",
      },
      {
        title: "WebP to PNG",
        description: "Convert WebP images to PNG in batches, preserving transparency or replacing it with a solid colour.",
        href: "/img/WebpToPng",
      },
      {
        title: "Image to Base64",
        description: "Encode an image as a data URL, HTML tag, CSS background or raw Base64 string.",
        href: "/img/ImgToBase64",
      },
    ],
  },
  {
    name: "Optimization & Editing",
    tools: [
      {
        title: "Compress Image",
        description: "Shrink image file sizes with a quality slider, a target size limit and batch ZIP download.",
        href: "/img/ImgCompresser",
      },
      {
        title: "Remove BG",
        description: "Remove an image background automatically, then refine it with erase and restore brushes.",
        href: "/img/BGRemove",
      },
      {
        title: "Image Resizer",
        description: "Resize photos to exact pixel dimensions or crop them to an aspect ratio, with unit, DPI and format control.",
        href: "/img/ImageResizer",
      },
      {
        title: "Watermark",
        description: "Protect your images with custom text or image watermarks.",
        href: "/img/Watermark",
      },
      {
        title: "Favicon Generator",
        description: "Build favicon.ico, PWA icons and a web manifest from one image, with a ready-made head snippet.",
        href: "/img/FavIcon",
      },
    ],
  },
  {
    name: "PDF Tools",
    tools: [
      {
        title: "Split PDF",
        description: "Split PDF files by pages, ranges, or bookmarks. Extract specific pages into new PDF documents.",
        href: "/pdf-tools/SplitPDF",
      },
      {
        title: "Merge PDF",
        description: "Combine multiple PDF files into one document. Reorder, rotate, and merge pages with ease.",
        href: "/pdf-tools/MergePDFFiles",
      },
      {
        title: "Compress PDF",
        description: "Reduce PDF file size while maintaining quality. Optimize images and remove redundant data.",
        href: "/pdf-tools/CompressPDF",
      },
      {
        title: "PDF to JPG",
        description: "Convert PDF pages to high-quality JPG images. Batch convert with customizable DPI and quality.",
        href: "/pdf-tools/PDFtoJPG",
      },
      {
        title: "Rotate PDF",
        description: "Rotate PDF pages by 90, 180, or 270 degrees. Rotate individual pages or the entire document.",
        href: "/pdf-tools/RotatePDF",
      },
      {
        title: "JPG to PDF",
        description: "Convert JPG images to PDF documents. Combine multiple images into a single PDF file.",
        href: "/pdf-tools/JPGtoPDF",
      },
    ],
  },
  {
    name: "MS Office Tools",
    tools: [
      {
        title: "Word to PDF / PDF to Word",
        description: "Convert Word documents to PDF and PDF files to editable Word documents. Preserve formatting and layout.",
        href: "/msoffice-tool/WordnPDF",
      },
      {
        title: "TXT to Word / Word to TXT",
        description: "Convert plain text files to Word documents and Word documents to plain text. Batch conversion supported.",
        href: "/msoffice-tool/TXTnWord",
      },
      {
        title: "Excel to PDF / PDF to Excel",
        description: "Convert Excel spreadsheets to PDF and PDF tables to editable Excel files. Preserve data and formatting.",
        href: "/msoffice-tool/ExcelnPDF",
      },
      {
        title: "PowerPoint to PDF / PDF to PowerPoint",
        description: "Convert PowerPoint presentations to PDF and PDF files to editable PowerPoint slides.",
        href: "/msoffice-tool/PPTnPDF",
      },
      {
        title: "HTML to Word / Word to HTML",
        description: "Convert HTML files to Word documents and Word documents to clean HTML. Preserve styling and structure.",
        href: "/msoffice-tool/HTMLnDOC",
      },
      {
        title: "CSV to Excel / Excel to CSV",
        description: "Convert CSV files to Excel spreadsheets and Excel files to CSV format. Handle large datasets efficiently.",
        href: "/msoffice-tool/CSVnPDF",
      },
    ],
  },
  {
    name: "Dev Tools",
    tools: [
      {
        title: "CSS Minifier",
        description: "Compress CSS by stripping comments, whitespace and redundant code, with options for colour and shorthand conversion.",
        href: "/dev-tools/CSSMinifier",
      },
      {
        title: "HTML Minifier",
        description: "Minify HTML markup by removing comments, collapsing whitespace and optimising inline CSS and JavaScript.",
        href: "/dev-tools/HTMLMinifier",
      },
      {
        title: "Strong Password Generator",
        description: "Generate cryptographically secure random passwords and memorable passphrases with a live strength meter.",
        href: "/dev-tools/PasswordGenerator",
      },
      {
        title: "QR Code Generator",
        description: "Create custom high-resolution QR codes with logos, colour gradients and multiple export formats (PNG, SVG, EPS).",
        href: "/dev-tools/QRCodeGenerator",
      },
      {
        title: "QR Code Scanner",
        description: "Scan QR codes from your camera or uploaded images, with a scan history and smart payload actions.",
        href: "/dev-tools/QRCodeScanner",
      },
    ],
  },
  {
    name: "Text Tools",
    tools: [
      {
        title: "Case Converter",
        description: "Convert text between uppercase, lowercase, title case, sentence case, camelCase, snake_case, and more.",
        href: "/writing-tool/CaseConverter",
      },
      {
        title: "Lorem Ipsum Generator",
        description: "Generate placeholder text for designs and layouts. Customize paragraphs, words, and characters.",
        href: "/writing-tool/LoremIpsum",
      },
      {
        title: "Paragraph Writer",
        description: "AI-powered paragraph generation. Create coherent paragraphs on any topic with customizable length and tone.",
        href: "/writing-tool/ParagraphWriter",
      },
      {
        title: "Remove Duplicate Lines",
        description: "Remove duplicate lines from text while preserving order. Supports case-sensitive and case-insensitive modes.",
        href: "/writing-tool/RemoveDuplicateLines",
      },
      {
        title: "Sort Text",
        description: "Sort lines of text alphabetically, numerically, by length, or reverse order. Remove duplicates option included.",
        href: "/writing-tool/SortText",
      },
      {
        title: "Word Counter",
        description: "Count words, characters, sentences, paragraphs, and reading time. Real-time stats as you type.",
        href: "/writing-tool/WordCounter",
      },
    ],
  },
];

// Featured categories for the 2-column homepage layout
const FEATURED_CATEGORIES = [
  {
    name: "PDF Tools",
    icon: "📄",
    description: "Split, merge, compress, convert, and rotate PDFs entirely in your browser.",
    href: "/tools#pdf-tools",
    tools: [
      { title: "Split PDF", href: "/pdf-tools/SplitPDF" },
      { title: "Merge PDF", href: "/pdf-tools/MergePDFFiles" },
      { title: "Compress PDF", href: "/pdf-tools/CompressPDF" },
      { title: "PDF to JPG", href: "/pdf-tools/PDFtoJPG" },
      { title: "Rotate PDF", href: "/pdf-tools/RotatePDF" },
      { title: "JPG to PDF", href: "/pdf-tools/JPGtoPDF" },
    ],
  },
  {
    name: "MS Office Tools",
    icon: "📊",
    description: "Convert between Word, Excel, PowerPoint, PDF, HTML, CSV and TXT formats.",
    href: "/tools#ms-office-tools",
    tools: [
      { title: "Word ↔ PDF", href: "/msoffice-tool/WordnPDF" },
      { title: "TXT ↔ Word", href: "/msoffice-tool/TXTnWord" },
      { title: "Excel ↔ PDF", href: "/msoffice-tool/ExcelnPDF" },
      { title: "PowerPoint ↔ PDF", href: "/msoffice-tool/PPTnPDF" },
      { title: "HTML ↔ Word", href: "/msoffice-tool/HTMLnDOC" },
      { title: "CSV ↔ Excel", href: "/msoffice-tool/CSVnPDF" },
    ],
  },
];

// Homepage showcase: the six most-used tools as interactive cards.
// The full catalogue (every route under app/) lives at /tools.
const FEATURED_TOOLS = [
  {
    title: "Compress Image",
    description:
      "Shrink image file sizes with a quality slider and target size limit.",
    href: "/img/ImgCompresser",
  },
  {
    title: "Remove BG",
    description:
      "Automatically remove backgrounds, then refine with brushes.",
    href: "/img/BGRemove",
  },
  {
    title: "Image Resizer",
    description:
      "Resize photos to exact pixel dimensions or crop to aspect ratios.",
    href: "/img/ImageResizer",
  },
  {
    title: "JPG to PNG / WebP Converter",
    description: "Batch convert image formats instantly.",
    href: "/img/JpgToPng",
  },
  {
    title: "Favicon Generator",
    description: "Build favicon.ico, PWA icons, and web manifests.",
    href: "/img/FavIcon",
  },
  {
    title: "Watermark",
    description: "Protect your images with custom text or image watermarks.",
    href: "/img/Watermark",
  },
];

export default function Home() {
  return (
    <div className="home-shell">
      {/* Section 1: Hero */}
      <header className="hero">
        <div className="hero-badge" aria-label="Privacy badge">
          <span className="badge-icon" aria-hidden="true">🔒</span>
          <span>100% Private • Zero Server Uploads</span>
        </div>

        <h1 className="hero-title">
          Fast, Secure Tools Right in Your Browser.
        </h1>

        <p className="hero-subtitle">
          Compress, convert, edit, and process files instantly. Everything runs locally
          on your device—your data never touches a cloud server.
        </p>

        <div className="hero-cta">
          <Link
            href="/img/ImgCompresser"
            className="btn btn-primary"
            aria-label="Start compressing an image for free"
          >
            Compress an Image Free →
          </Link>
          <Link
            href="#tools"
            className="btn btn-secondary"
            aria-label="Explore all available tools"
          >
            Explore All Tools ↓
          </Link>
        </div>

        <div className="hero-trust" role="list" aria-label="Trust indicators">
          <div className="trust-item" role="listitem">
            <span className="trust-icon" aria-hidden="true">⚡</span>
            <span className="trust-text">Lightning Fast (Client-Side WASM/JS)</span>
          </div>
          <div className="trust-item" role="listitem">
            <span className="trust-icon" aria-hidden="true">🛡️</span>
            <span className="trust-text">No Data Logging</span>
          </div>
          <div className="trust-item" role="listitem">
            <span className="trust-icon" aria-hidden="true">📂</span>
            <span className="trust-text">Images, PDFs, Office, Code & Text</span>
          </div>
        </div>
      </header>

      {/* Section 2: Core Tool Categories — 2-column on desktop, 1 on mobile */}
      <section
        id="core-tools"
        className="core-tools-section"
        aria-labelledby="core-tools-heading"
      >
        <div className="tools-header">
          <h2 id="core-tools-heading" className="tools-title">
            Core Tool Suites
          </h2>
          <p className="tools-subtitle">
            The two most powerful tool families for document workflows.
            All processing happens locally — no uploads, no limits.
          </p>
        </div>

        <div className="core-tools-grid" role="list">
          {FEATURED_CATEGORIES.map((category) => (
            <article key={category.name} className="core-tool-card" role="listitem">
              <Link href={category.href} className="core-tool-link">
                <div className="core-tool-header">
                  <span className="core-tool-icon" aria-hidden="true">{category.icon}</span>
                  <div>
                    <h3 className="core-tool-title">{category.name}</h3>
                    <p className="core-tool-desc">{category.description}</p>
                  </div>
                </div>
                <ul className="core-tool-list" role="list">
                  {category.tools.map((tool) => (
                    <li key={tool.href} className="core-tool-item">
                      <Link href={tool.href} className="core-tool-sub-link">
                        {tool.title}
                        <span className="core-tool-arrow" aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="core-tool-cta">
                  <span>View all {category.tools.length} tools</span>
                  <span className="core-tool-cta-arrow" aria-hidden="true">→</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Section 3: Most Popular Tools — directly below the hero */}
      <section
        id="tools"
        className="popular-section"
        aria-labelledby="popular-heading"
      >
        <div className="tools-header">
          <h2 id="popular-heading" className="tools-title">
            Most Popular Tools
          </h2>
          <p className="tools-subtitle">
            The six tools our users reach for most. No installs. No uploads.
            No limits.
          </p>
        </div>

        <ul className="popular-grid" role="list">
          {FEATURED_TOOLS.map((tool) => (
            <li key={tool.href} className="popular-card-item">
              <Link href={tool.href} className="popular-card">
                <span className="popular-card-title">{tool.title}</span>
                <span className="popular-card-desc">{tool.description}</span>
                <span className="popular-card-cta">
                  Open Tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 4: Why Choose DocFix? — feature/benefit highlights */}
      <section
        id="why"
        className="why-section"
        aria-labelledby="why-heading"
      >
        <div className="why-header">
          <h2 id="why-heading" className="why-title">
            Why Developers & Designers Choose DocFix
          </h2>
          <p className="why-subtitle">
            Built for people who care about their data and their time.
          </p>
        </div>

        <div className="why-grid">
          <article className="why-card">
            <span className="why-icon" aria-hidden="true">🛡️</span>
            <h3 className="why-card-title">Absolute Privacy</h3>
            <p className="why-card-desc">
              Because processing happens 100% locally in your browser, no uploads
              leave your device. Perfect for sensitive or proprietary files.
            </p>
          </article>

          <article className="why-card">
            <span className="why-icon" aria-hidden="true">🚀</span>
            <h3 className="why-card-title">Instant Speed</h3>
            <p className="why-card-desc">
              No waiting for files to upload to a remote server or download back.
              Results render in milliseconds using client-side processing.
            </p>
          </article>

          <article className="why-card">
            <span className="why-icon" aria-hidden="true">💸</span>
            <h3 className="why-card-title">Free & No Friction</h3>
            <p className="why-card-desc">
              No bloated sign-ups or hidden fees for basic tasks. Open the
              browser tab and get to work.
            </p>
          </article>
        </div>
      </section>

      {/* Section 5: Complete Directory / All Tools */}
      <section
        id="all-tools"
        className="directory-section"
        aria-labelledby="directory-heading"
      >
        <div className="directory-header">
          <h2 id="directory-heading" className="directory-title">
            Explore the Full Toolkit
          </h2>
          <p className="directory-subtitle">
            All {ALL_TOOL_CATEGORIES.reduce((n, c) => n + c.tools.length, 0)} browser-only utilities, organized by what you need.
          </p>
        </div>

        <div className="directory-accordion">
          {ALL_TOOL_CATEGORIES.map((category) => (
            <details key={category.name} className="directory-category">
              <summary className="directory-category-head">
                <span className="directory-category-name">{category.name}</span>
                <span className="directory-category-count">{category.tools.length} tools</span>
                <span className="directory-chevron" aria-hidden="true">▾</span>
              </summary>
              <ul className="directory-tools-list" role="list">
                {category.tools.map((tool) => (
                  <li key={tool.href} className="directory-tool-item">
                    <Link href={tool.href} className="directory-tool-card">
                      <span className="directory-tool-title">{tool.title}</span>
                      <span className="directory-tool-desc">{tool.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      {/* Section 6: Final CTA & Trust Footer */}
      <section
        id="cta"
        className="cta-section"
        aria-labelledby="cta-heading"
      >
        <div className="cta-box">
          <h2 id="cta-heading" className="cta-title">
            Ready to process your files securely?
          </h2>
          <p className="cta-subtitle">
            No uploads. No sign-up. No limits on basic tasks.
          </p>
          <Link
            href="/img/ImgCompresser"
            className="cta-btn"
            aria-label="Get started with a free tool"
          >
            Get Started Now — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}
