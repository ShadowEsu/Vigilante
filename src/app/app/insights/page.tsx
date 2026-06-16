import { InsightsPageView } from "@/components/insights/InsightsPageView";
import { MOCK_INSIGHTS } from "@/lib/preview/mock-extended";

export default function InsightsPage() {
  return <InsightsPageView data={MOCK_INSIGHTS} />;
}
