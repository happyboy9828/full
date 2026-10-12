"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ToolsClient({ categories }) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRefs = useRef([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Mouse tracking for glow effect
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

  if (!mounted) {
    return (
      <div className="tools-section">
        <header className="tools-header">
          <h1 className="tools-title">All Tools</h1>
          <p className="tools-subtitle">Loading tools...</p>
        </header>
        <ul className="category-grid" role="list" aria-busy="true">
          {categories.map((category) => (
            <li key={category.slug} className="category-card-item skeleton">
              <div className="category-card skeleton-card">
                <div className="category-card-icon skeleton-icon" />
                <div className="skeleton-title" />
                <div className="skeleton-count" />
                <div className="skeleton-desc" />
                <div className="skeleton-desc-short" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="tools-section">
      <header className={`tools-header ${isVisible ? "animate-in" : ""}`}>
        <h1 className="tools-title">All Tools</h1>
        <p className="tools-subtitle">
          {categories.reduce((sum, c) => sum + c.toolCount, 0)} browser-only utilities across {categories.length} categories. No uploads, no install, no sign-up.
        </p>
      </header>

      <ul className="category-grid" role="list">
        {categories.map((category, index) => (
          <li
            key={category.slug}
            className={`category-card-item ${isVisible ? "animate-in" : ""}`}
            style={{ animationDelay: `${index * 80}ms` }}
            ref={(el) => (cardRefs.current[index] = el)}
          >
            <Link href={`/category/${category.slug}`} className="category-card">
              <span className="category-card-icon" aria-hidden="true">
                <span className="icon-wrapper">{category.icon}</span>
              </span>
              <h2 className="category-card-title">{category.name}</h2>
              <p className="category-card-count">{category.toolCount} tools</p>
              <p className="category-card-desc">{category.description}</p>
              <span className="category-card-cta">
                Explore <span aria-hidden="true" className="cta-arrow">→</span>
              </span>
            </Link>
            <div className="category-glow" aria-hidden="true" />
          </li>
        ))}
      </ul>

      <style jsx>{`
        .tools-header {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tools-header.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .category-card-item {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .category-card-item.animate-in {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .category-card {
          position: relative;
          overflow: hidden;
        }
        .icon-wrapper {
          display: inline-block;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .category-card:hover .icon-wrapper,
        .category-card:focus-visible .icon-wrapper {
          transform: scale(1.15) rotate(5deg);
        }
        .category-card:active .icon-wrapper {
          transform: scale(0.95);
        }
        .cta-arrow {
          display: inline-block;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .category-card:hover .cta-arrow,
        .category-card:focus-visible .cta-arrow {
          transform: translateX(6px) scale(1.1);
        }
        .category-glow {
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: radial-gradient(
            circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            color-mix(in srgb, var(--tool-accent) 15%, transparent) 0%,
            transparent 70%
          );
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        .category-card:hover .category-glow,
        .category-card:focus-visible .category-glow {
          opacity: 1;
        }
        .skeleton {
          animation: pulse 1.5s ease-in-out infinite;
        }
        .skeleton-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 24px;
          background: var(--tool-surface);
          border: 1px solid var(--tool-border);
          border-radius: var(--tool-radius);
          height: 100%;
        }
        .skeleton-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--tool-radius-sm);
        }
        .skeleton-title {
          height: 24px;
          width: 60%;
          border-radius: 4px;
        }
        .skeleton-count {
          height: 16px;
          width: 30%;
          border-radius: 4px;
        }
        .skeleton-desc {
          height: 16px;
          width: 100%;
          border-radius: 4px;
        }
        .skeleton-desc-short {
          height: 16px;
          width: 70%;
          border-radius: 4px;
        }
        @keyframes pulse {
          0%, 100% { background: var(--tool-surface-2); }
          50% { background: var(--tool-tint); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tools-header,
          .category-card-item {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .icon-wrapper,
          .cta-arrow,
          .category-glow {
            transition: none;
          }
          .skeleton {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}