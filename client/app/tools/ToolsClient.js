"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const SEARCH_KEYS = ["title", "description"];

export default function ToolsClient({ categories, allTools }) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const cardRefs = useRef([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cardRefs.current.forEach((ref) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ref.style.setProperty("--mouse-x", `${x}px`);
        ref.style.setProperty("--mouse-y", `${y}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const filtered = allTools.filter((tool) => {
    const matchesSearch =
      search.trim() === "" ||
      SEARCH_KEYS.some((key) =>
        String(tool[key] ?? "")
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      );
    const matchesCategory =
      activeCategory === "all" || tool.categorySlug === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    count: c.tools.length,
  }));

  return (
    <div className="tools-section">
      <header className="tools-header">
        <h1 className="tools-title">All Tools</h1>
        <p className="tools-subtitle">
          {allTools.length} browser-only utilities across {categories.length} categories. No
          uploads, no install, no sign-up.
        </p>
      </header>

      <div className="tools-filter-bar">
        <div className="tools-search-wrap">
          <label htmlFor="tools-search" className="tools-search-label">
            Search tools
          </label>
          <input
            id="tools-search"
            type="search"
            className="tools-search"
            placeholder="Compress, convert, resize..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tools"
          />
          <span className="tools-search-icon" aria-hidden="true">
            🔍
          </span>
        </div>

        <div className="tools-category-filters" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`tools-filter-chip ${
              activeCategory === "all" ? "is-active" : ""
            }`}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>
          {categoryCounts.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`tools-filter-chip ${
                activeCategory === c.slug ? "is-active" : ""
              }`}
              onClick={() => setActiveCategory(c.slug)}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>
      </div>

      <p className="tools-results-count">
        {filtered.length} tool{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <p className="tool-empty">
          No tools match your search. Try adjusting your filters.
        </p>
      ) : (
        <ul className="tools-grid" role="list">
          {filtered.map((tool, index) => (
            <li
              key={tool.href}
              className={`tool-card-item ${mounted ? "animate-in" : ""}`}
              style={{ animationDelay: `${index * 30}ms` }}
              ref={(el) => (cardRefs.current[index] = el)}
            >
              <Link href={tool.href} className="tool-link-card">
                <span className="tool-link-icon" aria-hidden="true">
                  {tool.icon}
                </span>
                <span className="tool-link-title">
                  {tool.title}
                  <span aria-hidden="true">&rarr;</span>
                </span>
                <span className="tool-link-desc">{tool.description}</span>
                <span className="tool-link-href">{tool.href}</span>
                <span className="tool-link-category">{tool.category}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .tools-filter-bar {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 28px;
        }
        .tools-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          max-width: 420px;
        }
        .tools-search-label {
          position: absolute;
          left: -9999px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        .tools-search {
          width: 100%;
          padding: 10px 14px 10px 40px;
          font-size: 14px;
          color: var(--tool-text);
          background: var(--tool-surface);
          border: 1px solid var(--tool-border);
          border-radius: var(--tool-radius);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .tools-search:focus-visible {
          border-color: var(--tool-accent);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--tool-accent) 25%, transparent);
        }
        .tools-search-icon {
          position: absolute;
          left: 12px;
          font-size: 16px;
          opacity: 0.5;
          pointer-events: none;
        }
        .tools-category-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tools-filter-chip {
          appearance: none;
          border: 1px solid var(--tool-border);
          background: var(--background);
          color: var(--tool-muted);
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tools-filter-chip:hover {
          border-color: var(--tool-accent);
          color: var(--tool-accent-text);
        }
        .tools-filter-chip.is-active {
          background: var(--tool-accent);
          color: var(--tool-on-accent);
          border-color: var(--tool-accent);
        }
        .tools-results-count {
          font-size: 13px;
          color: var(--tool-muted);
          margin: 0 0 16px;
        }
        .tool-card-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .tool-card-item.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .tool-link-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: var(--tool-card-pad);
          background: var(--tool-surface);
          border: 1px solid var(--tool-border);
          border-radius: var(--tool-radius);
          text-decoration: none;
          color: inherit;
          height: 100%;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }
        .tool-link-card:hover {
          border-color: var(--tool-accent);
          box-shadow: 0 8px 24px
            color-mix(in srgb, var(--tool-accent) 12%, transparent);
          transform: translateY(-2px);
        }
        .tool-link-icon {
          font-size: 22px;
          line-height: 1;
        }
        .tool-link-category {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--tool-accent-text);
          background: color-mix(in srgb, var(--tool-accent) 12%, transparent);
          padding: 3px 8px;
          border-radius: 999px;
          opacity: 0.8;
        }
        @media (prefers-reduced-motion: reduce) {
          .tool-card-item {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .tool-link-card:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
