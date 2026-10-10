import { notFound } from "next/navigation";
import Link from "next/link";
import ContentPage from "./../../../components/ContentPage/ContentPage";
import { getCategoryBySlug, getAllCategorySlugs } from "./../../../lib/pages";

export async function generateStaticParams() {
  const slugs = getAllCategorySlugs();
  return slugs.map((slug) => ({
    'category-name': slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams['category-name']);
  const category = getCategoryBySlug(categoryName);
  
  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.name} - All Tools`,
    description: `Explore all ${category.toolCount} ${category.name.toLowerCase()} tools. ${category.description}`,
  };
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams['category-name']);
  const category = getCategoryBySlug(categoryName);

  if (!category) {
    notFound();
  }

  return (
    <ContentPage
      title={category.name}
      description={`${category.toolCount} tools for ${category.name.toLowerCase()}. ${category.description}`}
      eyebrow="Category"
    >
      <div className="tools-grid">
        {category.tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="tool-link-card">
            <span className="tool-link-title">
              {tool.title}
              <span aria-hidden="true">&rarr;</span>
            </span>
            <span className="tool-link-desc">{tool.description}</span>
            <span className="tool-link-href">{tool.href}</span>
          </Link>
        ))}
      </div>
    </ContentPage>
  );
}