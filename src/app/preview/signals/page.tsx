import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { SignalsPanel } from "@/components/SignalsPanel";
import { MOCK_ANALYSIS_MAP, MOCK_SIGNALS } from "@/lib/preview/mock-data";

export default function PreviewSignalsPage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TerminalPanel className="flex-1">
        <SignalsPanel
          signals={MOCK_SIGNALS}
          analysisNames={MOCK_ANALYSIS_MAP}
          sectionNum="03"
        />
      </TerminalPanel>
    </div>
  );
}
