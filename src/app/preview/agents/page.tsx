import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { AgentsPanel } from "@/components/AgentsPanel";
import { MOCK_ANALYSES } from "@/lib/preview/mock-data";

export default function PreviewAgentsPage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TerminalPanel className="flex-1">
        <AgentsPanel analyses={MOCK_ANALYSES} sectionNum="02" />
      </TerminalPanel>
    </div>
  );
}
