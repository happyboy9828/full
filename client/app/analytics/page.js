import ContentPage from "../../components/ContentPage/ContentPage";
import AnalyticsDashboard from "../../components/AnalyticsDashboard/AnalyticsDashboard";
import { toolMetadata } from "../../lib/pages";

export const metadata = toolMetadata("/analytics");

export default function AnalyticsPage() {
  return (
    <ContentPage
      title="Analytics Dashboard"
      eyebrow="Analytics"
      description="View website analytics and visitor insights."
    >
      <AnalyticsDashboard />
    </ContentPage>
  );
}