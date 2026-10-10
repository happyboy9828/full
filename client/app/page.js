import Link from "next/link";
import { getCategories } from "../lib/pages";

const FEATURED_CATEGORIES = [
  {
    name: "PDF Tools",
    icon: "📄",
    description: "Split, merge, compress, convert, and rotate PDFs entirely in your browser.",
    href: "/category/pdf-tools",
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
    href: "/category/ms-office-tools",
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
  const categories = getCategories();
  const totalTools = categories.reduce((sum, c) => sum + c.toolCount, 0);

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
            href="/tools"
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

      
      {/* Section 2: Most Popular Tools — directly below the hero */}
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

      {/* Section 3: Why Choose DocFix? — feature/benefit highlights */}
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

      {/* Section 4: Core Tool Categories (2-column featured) */}
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
            Our two most comprehensive tool collections for document and image workflows.
          </p>
        </div>

        <ul className="core-tools-grid" role="list">
          {FEATURED_CATEGORIES.map((category) => (
            <li key={category.name} className="core-tool-card">
              <div className="core-tool-link">
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
                        <span>{tool.title}</span>
                        <span className="core-tool-arrow" aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={category.href} className="core-tool-cta">
                  View All {category.name} <span className="core-tool-cta-arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
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
            All {totalTools} browser-only utilities, organized by what you need.
          </p>
        </div>

        <div className="directory-accordion">
          {categories.map((category) => (
            <details key={category.slug} className="directory-category">
              <summary className="directory-category-head">
                <span className="directory-category-name">{category.name}</span>
                <span className="directory-category-count">{category.toolCount} tools</span>
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

     
    </div>
  );
}
