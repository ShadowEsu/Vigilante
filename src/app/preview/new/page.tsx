import { NewAnalysisForm } from "@/components/NewAnalysisForm";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { SectionHeader } from "@/components/terminal/ui";

export default function PreviewNewAnalysisPage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TerminalPanel className="flex-1">
        <SectionHeader num="07" title="NEW TARGET" />
        <p className="text-[13px] text-dim mb-6 font-mono">
          $ vigilant new-target <span className="text-fg animate-pulse">▌</span>
        </p>
        <NewAnalysisForm redirectTo="/preview" />
      </TerminalPanel>
    </div>
  );
}
