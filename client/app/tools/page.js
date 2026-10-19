import { getCategories } from "./../../lib/pages";
import { TOOL_METADATA } from "./../../lib/category-data";
import ToolsClient from "./ToolsClient";

export const metadata = {
  title: "All Tools",
  description:
    "Browse and search every Docstools tool — image, PDF, dev, and text utilities. All run 100% in your browser. No uploads, no install, no sign-up.",
};

export default function ToolsPage() {
  const categories = getCategories();

  const allTools = categories.flatMap((cat) =>
    cat.tools.map((tool) => ({
      ...tool,
      icon: TOOL_METADATA[tool.href]?.icon ?? "🔧",
      category: cat.name,
      categorySlug: cat.slug,
    }))
  );

  return <ToolsClient categories={categories} allTools={allTools} />;
}
