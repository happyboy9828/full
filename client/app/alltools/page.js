import AllToolsCarousel from "./AllToolsCarousel";
import { getCategories } from "@/lib/pages";

export default function AllToolsPage() {
  const categories = getCategories();
  const totalTools = categories.reduce((sum, c) => sum + c.toolCount, 0);

  return (
    <AllToolsCarousel categories={categories} totalTools={totalTools} />
  );
}