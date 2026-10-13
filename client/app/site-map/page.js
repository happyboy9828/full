import ContentPage from "../../components/ContentPage/ContentPage";
import { getCategories } from "../../lib/pages";
import Link from "next/link";

export const metadata = {
  title: "Site Map",
  description: "Complete HTML sitemap of all DocFix tools and pages. Find every tool in one place.",
};

export default function SiteMapPage() {
  const categories = getCategories();
  const totalTools = categories.reduce((sum, c) => sum + c.toolCount, 0);

  return (
    <ContentPage
      title="Site Map"
      description="A complete overview of every tool and page on DocFix."
      eyebrow="Sitemap"
    >
      <div className="prose">
        <h2>Tool Categories ({categories.length})</h2>
        <p>
          Browse all <strong>{totalTools} tools</strong> grouped by category. Every tool runs
          100% in your browser — no uploads, no sign-up, no install.
        </p>

        <div className="sitemap-grid">
          {categories.map((category) => (
            <div key={category.slug} className="sitemap-category">
              <h3 className="sitemap-category-title">
                <span className="sitemap-category-icon" aria-hidden="true">
                  {category.icon}
                </span>
                {category.name}
              </h3>
              <ul className="sitemap-tool-list">
                {category.tools.map((tool) => (
                  <li key={tool.href}>
                    <Link href={tool.href} className="sitemap-tool-link">
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: "2rem" }}>Support &amp; Legal</h2>
        <ul className="sitemap-support-list">
          <li><Link href="/about">About DocFix</Link></li>
          <li><Link href="/how-it-works">How It Works</Link></li>
          <li><Link href="/faq">FAQ</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><Link href="/docs">Documentation</Link></li>
          <li><Link href="/blog">Blog</Link></li>
        </ul>

        <ul className="sitemap-legal-list">
          <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><Link href="/terms">Terms of Service</Link></li>
          <li><Link href="/cookie-policy">Cookie Policy</Link></li>
          <li><Link href="/disclaimer">Disclaimer</Link></li>
          <li><Link href="/dmca">Copyright / DMCA</Link></li>
        </ul>
      </div>
    </ContentPage>
  );
}
