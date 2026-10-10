import Link from "next/link";
import { getCategories } from "./../../lib/pages";

export const metadata = {
  title: "All Tools",
  description:
    "Browse every DocFix tool in one place. Image, PDF, Office, Dev, and Text tools — all in your browser.",
};

export default function ToolsPage() {
  const categories = getCategories();

  return (
    <div className="tools-section">
      <header className="tools-header">
        <h1 className="tools-title">All Tools</h1>
        <p className="tools-subtitle">
          {categories.reduce((sum, c) => sum + c.toolCount, 0)} browser-only utilities across {categories.length} categories. No uploads, no install, no sign-up.
        </p>
      </header>

      <ul className="category-grid" role="list">
        {categories.map((category) => (
          <li key={category.slug} className="category-card-item">
            <Link href={`/category/${category.slug}`} className="category-card">
              <span className="category-card-icon" aria-hidden="true">{category.icon}</span>
              <h2 className="category-card-title">{category.name}</h2>
              <p className="category-card-count">{category.toolCount} tools</p>
              <p className="category-card-desc">{category.description}</p>
              <span className="category-card-cta">
                Explore <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
