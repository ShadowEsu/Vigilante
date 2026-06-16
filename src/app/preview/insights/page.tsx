import { InsightsPageView } from "@/components/insights/InsightsPageView";
import { MOCK_INSIGHTS } from "@/lib/preview/mock-extended";

export default function PreviewInsightsPage() {
  return <InsightsPageView data={MOCK_INSIGHTS} />;
}
