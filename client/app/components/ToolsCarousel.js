'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function ToolsCarousel({ categories, totalTools }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prev) => (prev === categories.length - 1 ? 0 : prev + 1));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [categories.length, isPaused]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? categories.length - 1 : prev - 1));
  }, [categories.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === categories.length - 1 ? 0 : prev + 1));
  }, [categories.length]);

  const currentCategory = categories[currentIndex];

  return (
    <section
      id="all-tools"
      className="directory-section"
      aria-labelledby="directory-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="directory-header">
        <h2 id="directory-heading" className="directory-title">
          Explore the Full Toolkit
        </h2>
      </div>

      <div className="category-carousel" role="region" aria-label="Tool categories carousel">
        <div className="category-track">
          {categories.map((category, index) => (
            <article
              key={category.slug}
              className={`category-card ${index === currentIndex ? "active" : ""}`}
              style={{ "--card-index": index }}
            >
              <div className="card-icon" aria-hidden="true">
                <span className="icon-wrapper">{category.icon}</span>
              </div>
              <h3 className="card-title">{category.name}</h3>
              <div className="card-content">
                <p className="card-desc">{category.description}</p>
                <ul className="tools-columns" role="list">
                  {currentCategory.tools.slice(0, 6).map((tool) => (
                    <li key={tool.href} className="tool-column-item">
                      <Link href={tool.href} className="tool-column-link">
                        {tool.title}
                      </Link>
                    </li>
                  ))}
                  {currentCategory.tools.length > 6 && (
                    <li className="tool-column-item more">
                      <Link href={`/category/${currentCategory.slug}`} className="tool-column-link">
                        + {currentCategory.tools.length - 6} more
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
              <div className="card-meta">
                <span className="tool-count">{category.toolCount} tools</span>
              </div>
              <Link href={`/category/${category.slug}`} className="card-cta">
                View all {category.name} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>

        <button
          className="carousel-btn carousel-btn-prev"
          aria-label="Previous category"
          onClick={goToPrev}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button
          className="carousel-btn carousel-btn-next"
          aria-label="Next category"
          onClick={goToNext}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        <div className="carousel-indicators" aria-label="Category navigation">
          {categories.map((category, index) => (
            <button
              key={category.slug}
              className={`indicator ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to ${category.name}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .category-carousel {
          position: relative;
          max-width: var(--tool-width);
          margin: 0 auto;
        }
        .directory-title {
          font-size: clamp(1.75rem, 3.5vw, 2.25rem);
          font-weight: 800;
          color: var(--tool-text);
          text-align: center;
          margin: 0 0 32px;
          letter-spacing: -0.02em;
        }
        .category-track {
          position: relative;
          min-height: 420px;
        }
        .category-card {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 32px;
          background: var(--tool-surface);
          border: 1px solid var(--tool-border);
          border-radius: 20px;
          opacity: 0;
          visibility: hidden;
          transform: translateX(60px) scale(0.95);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0.6s;
          z-index: 1;
          overflow: hidden;
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
          flex-shrink: 0;
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
        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: hidden;
          min-height: 0;
        }
        .card-desc {
          font-size: 1rem;
          color: var(--tool-text-muted);
          margin: 0;
          line-height: 1.6;
        }
        .tools-columns {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 24px;
          list-style: none;
          padding: 0;
          margin: 0;
          overflow-y: auto;
          max-height: 200px;
        }
        .tools-columns::-webkit-scrollbar {
          width: 6px;
        }
        .tools-columns::-webkit-scrollbar-track {
          background: transparent;
        }
        .tools-columns::-webkit-scrollbar-thumb {
          background: var(--tool-border);
          border-radius: 3px;
        }
        .tool-column-item {
          display: flex;
          align-items: center;
        }
        .tool-column-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--tool-surface-2);
          border: 1px solid var(--tool-border);
          border-radius: 10px;
          text-decoration: none;
          color: var(--tool-text);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .tool-column-link:hover {
          border-color: var(--tool-accent);
          background: var(--tool-tint);
          color: var(--tool-accent-text);
        }
        .tool-column-item.more .tool-column-link {
          background: color-mix(in srgb, var(--tool-accent) 10%, var(--tool-surface-2));
          border-color: var(--tool-accent);
          color: var(--tool-accent-text);
          font-weight: 600;
        }
        .card-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 12px;
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
        .card-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--tool-on-accent);
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

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--tool-surface);
          border: 1px solid var(--tool-border);
          border-radius: 50%;
          color: var(--tool-text);
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: var(--tool-shadow);
        }
        .carousel-btn:hover {
          background: var(--tool-tint-strong);
          border-color: var(--tool-accent);
          color: var(--tool-accent-text);
          transform: translateY(-50%) scale(1.05);
        }
        .carousel-btn:focus-visible {
          outline: 2px solid var(--tool-accent);
          outline-offset: 2px;
        }
        .carousel-btn-prev {
          left: -24px;
        }
        .carousel-btn-next {
          right: -24px;
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

        @media (prefers-reduced-motion: reduce) {
          .category-card {
            transition: none;
          }
          .icon-wrapper,
          .tool-column-link,
          .card-cta,
          .indicator {
            transition: none;
          }
        }
        @media (max-width: 768px) {
          .carousel-btn {
            display: none;
          }
          .category-track {
            min-height: auto;
          }
          .category-card {
            position: relative;
            padding: 24px;
            min-height: auto;
            opacity: 1;
            visibility: visible;
            transform: none;
          }
          .tools-columns {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .card-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}