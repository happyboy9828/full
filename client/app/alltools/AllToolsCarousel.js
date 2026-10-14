'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

const TOOL_METADATA = {
  "/img/FavIcon": { icon: "🌐" },
  "/img/ImageResizer": { icon: "📐" },
  "/img/ImgCompresser": { icon: "🗜️" },
  "/img/ImgToBase64": { icon: "🔤" },
  "/img/JpgPngConverter": { icon: "🔄" },
  "/img/WebpPngConverter": { icon: "🔄" },
  "/img/Watermark": { icon: "💧" },
  "/pdf-tools/SplitPDF": { icon: "✂️" },
  "/pdf-tools/MergePDFFiles": { icon: "📎" },
  "/pdf-tools/CompressPDF": { icon: "🗜️" },
  "/pdf-tools/PDFtoJPG": { icon: "🖼️" },
  "/pdf-tools/RotatePDF": { icon: "🔄" },
  "/pdf-tools/JPGtoPDF": { icon: "📄" },
  "/dev-tools/CSSMinifier": { icon: "🎨" },
  "/dev-tools/HTMLMinifier": { icon: "🌐" },
  "/dev-tools/PasswordGenerator": { icon: "🔐" },
  "/dev-tools/QRCodeGenerator": { icon: "📱" },
  "/dev-tools/QRCodeScanner": { icon: "📷" },
  "/writing-tool/CaseConverter": { icon: "🔠" },
  "/writing-tool/LoremIpsum": { icon: "📝" },
  "/writing-tool/ParagraphWriter": { icon: "🤖" },
  "/writing-tool/RemoveDuplicateLines": { icon: "🧹" },
  "/writing-tool/SortText": { icon: "📋" },
  "/writing-tool/WordCounter": { icon: "🔢" },
};

export default function AllToolsCarousel({ categories, totalTools }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [categories.length]);

  if (!mounted) {
    return (
      <div className="alltools-container">
        <div className="card-carousel skeleton">
          <div className="card-skeleton" />
        </div>
      </div>
    );
  }

  const currentCategory = categories[currentIndex];

  return (
    <div className="alltools-container">
      <header className="alltools-header">
        <h1>All Tools</h1>
        <p>
          {totalTools} browser-only utilities across {categories.length} categories
        </p>
      </header>

      <div className="card-carousel" role="region" aria-label="Tool categories carousel">
        <div className="card-track">
          {categories.map((category, index) => (
            <article
              key={category.slug}
              className={`category-card ${index === currentIndex ? "active" : ""}`}
              style={{ "--card-index": index }}
            >
              <div className="card-icon" aria-hidden="true">
                <span className="icon-wrapper">{category.icon}</span>
              </div>
              <h2 className="card-title">{category.name}</h2>
              <p className="card-desc">{category.description}</p>
              <div className="card-meta">
                <span className="tool-count">{category.toolCount} tools</span>
              </div>
              <ul className="tools-list" role="list">
                {category.tools.map((tool) => (
                  <li key={tool.href} className="tool-item">
                    <Link href={tool.href} className="tool-link">
                      <span className="tool-icon" aria-hidden="true">{TOOL_METADATA[tool.href]?.icon || "🔧"}</span>
                      <span className="tool-name">{tool.title}</span>
                    </Link>
                    <p className="tool-desc">{tool.description}</p>
                  </li>
                ))}
              </ul>
              <Link href={`/category/${category.slug}`} className="card-cta">
                View all {category.name} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>

        <div className="carousel-indicators" aria-label="Category navigation">
          {categories.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to ${categories[index].name}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .alltools-container {
          min-height: 100vh;
          background: var(--tool-bg);
          padding: 48px 24px;
        }
        .alltools-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 48px;
        }
        .alltools-header h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          color: var(--tool-text);
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }
        .alltools-header p {
          font-size: 1.125rem;
          color: var(--tool-text-muted);
          margin: 0;
        }

        .card-carousel {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
        }
        .card-track {
          position: relative;
          min-height: 520px;
        }
        .category-card {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 32px;
          background: var(--tool-surface);
          border: 1px solid var(--tool-border);
          border-radius: 20px;
          opacity: 0;
          visibility: hidden;
          transform: translateX(40px) scale(0.96);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0.5s;
          z-index: 1;
        }
        .category-card.active {
          opacity: 1;
          visibility: visible;
          transform: translateX(0) scale(1);
          z-index: 2;
        }
        .card-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: color-mix(in srgb, var(--tool-accent) 12%, var(--tool-surface));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-wrapper {
          font-size: 28px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .category-card:hover .icon-wrapper {
          transform: scale(1.15) rotate(5deg);
        }
        .card-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--tool-text);
          margin: 0;
        }
        .card-desc {
          font-size: 1rem;
          color: var(--tool-text-muted);
          margin: 0;
          line-height: 1.6;
        }
        .card-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 8px;
          border-top: 1px solid var(--tool-border);
        }
        .tool-count {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--tool-accent);
          background: color-mix(in srgb, var(--tool-accent) 12%, var(--tool-surface));
          padding: 6px 14px;
          border-radius: 999px;
        }
        .tools-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          overflow-y: auto;
          padding-right: 8px;
        }
        .tools-list::-webkit-scrollbar {
          width: 6px;
        }
        .tools-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .tools-list::-webkit-scrollbar-thumb {
          background: var(--tool-border);
          border-radius: 3px;
        }
        .tool-item {
          padding: 14px 16px;
          background: var(--tool-bg);
          border: 1px solid var(--tool-border);
          border-radius: 12px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .tool-item:hover {
          border-color: var(--tool-accent);
          transform: translateX(4px);
        }
        .tool-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--tool-text);
        }
        .tool-icon {
          font-size: 20px;
          flex-shrink: 0;
        }
        .tool-name {
          font-weight: 600;
          font-size: 0.9375rem;
        }
        .tool-desc {
          font-size: 0.8125rem;
          color: var(--tool-text-muted);
          margin: 8px 0 0 44px;
          line-height: 1.5;
        }
        .card-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--tool-text);
          text-decoration: none;
          background: var(--tool-accent);
          border-radius: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
          width: fit-content;
        }
        .card-cta:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 24px color-mix(in srgb, var(--tool-accent) 30%, transparent);
        }
        .card-cta:active {
          transform: translateX(0);
        }

        .carousel-indicators {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 24px;
        }
        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          background: var(--tool-border);
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .indicator:hover {
          background: var(--tool-accent);
          transform: scale(1.2);
        }
        .indicator.active {
          background: var(--tool-accent);
          transform: scale(1.2);
        }
        .indicator:focus-visible {
          outline: 2px solid var(--tool-accent);
          outline-offset: 3px;
        }

        .skeleton {
          display: flex;
          justify-content: center;
        }
        .card-skeleton {
          width: 100%;
          max-width: 900px;
          height: 520px;
          background: var(--tool-surface);
          border: 1px solid var(--tool-border);
          border-radius: 20px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { background: var(--tool-surface-2); }
          50% { background: var(--tool-tint); }
        }

        @media (prefers-reduced-motion: reduce) {
          .category-card {
            transition: none;
          }
          .icon-wrapper,
          .tool-item,
          .card-cta,
          .indicator {
            transition: none;
          }
          .card-skeleton {
            animation: none;
          }
        }
        @media (max-width: 640px) {
          .alltools-container {
            padding: 32px 16px;
          }
          .category-card {
            padding: 24px;
            min-height: 560px;
          }
          .card-title {
            font-size: 1.5rem;
          }
          .tools-list {
            gap: 10px;
          }
          .tool-item {
            padding: 12px;
          }
          .tool-desc {
            margin-left: 36px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}