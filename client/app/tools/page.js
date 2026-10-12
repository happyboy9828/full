import { getCategories } from "./../../lib/pages";
import ToolsClient from "./ToolsClient";

export const metadata = {
  title: "All Tools",
  description:
    "Browse every DocFix tool in one place. Image, PDF, Dev, and Text tools — all in your browser. No uploads, no install, no sign-up.",
};

export default function ToolsPage() {
  const categories = getCategories();

  return <ToolsClient categories={categories} />;
}