import { AnalyticsPageView } from "@/components/analytics/AnalyticsPageView";
import { MOCK_SCAN_LOG } from "@/lib/preview/mock-extended";
import {
  MOCK_ANALYSES,
  MOCK_SIGNALS,
} from "@/lib/preview/mock-data";

export default function PreviewAnalyticsPage() {
  return (
    <AnalyticsPageView
      analyses={MOCK_ANALYSES}
      signals={MOCK_SIGNALS}
      scanLog={MOCK_SCAN_LOG}
    />
  );
}
