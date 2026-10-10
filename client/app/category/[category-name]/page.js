import { notFound } from "next/navigation";
import Link from "next/link";
import ContentPage from "./../../../components/ContentPage/ContentPage";
import { getCategories } from "./../../../lib/pages";

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    categoryName: category.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export function generateMetadata({ params }) {
  const categoryName = decodeURIComponent(params.categoryName);
  const category = getCategories().find(
    (c) => c.name.toLowerCase().replace(/\s+/g, '-') === categoryName
  );
  
  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.name} - All Tools`,
    description: `Explore all ${category.tools.length} ${category.name.toLowerCase()} tools. ${getCategoryDescription(category.name)}`,
  };
}

export default function CategoryPage({ params }) {
  const categoryName = decodeURIComponent(params.categoryName);
  const categories = getCategories();
  
  const category = categories.find(
    (c) => c.name.toLowerCase().replace(/\s+/g, '-') === categoryName
  );

  if (!category) {
    notFound();
  }

  return (
    <ContentPage
      title={category.name}
      description={`${category.tools.length} tools for ${category.name.toLowerCase()}. ${getCategoryDescription(category.name)}`}
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

function getCategoryDescription(name) {
  const descriptions = {
    "Image Tools": "Convert, compress, resize, and edit images entirely in your browser.",
    "PDF Tools": "Split, merge, compress, convert, and rotate PDFs with zero uploads.",
    "MS Office Tools": "Convert between Word, Excel, PowerPoint, PDF, HTML, CSV and TXT formats.",
    "Dev Tools": "Minify code, generate passwords, create QR codes, and scan barcodes.",
    "Text Tools": "Convert case, generate Lorem Ipsum, write paragraphs, sort and count text.",
  };
  return descriptions[name] || "A collection of useful browser-based utilities.";
}