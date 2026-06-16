import type { Signal } from "@/types/database";
import { SectionHeader } from "@/components/terminal/ui";
import { HIGH_SEV_COLOR, typeColor } from "@/lib/ui/type-colors";

interface SignalsPanelProps {
  signals: Signal[];
  analysisNames: Map<string, string>;
  overview?: boolean;
  sectionNum?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SignalsPanel({
  signals,
  analysisNames,
  overview = false,
  sectionNum = "03",
}: SignalsPanelProps) {
  const shown = overview ? signals.slice(0, 5) : signals;

  return (
    <>
      <SectionHeader
        num={sectionNum}
        title="SIGNALS"
        right={`${signals.length} NEW`}
      />
      {!shown.length ? (
        <p className="text-xs text-muted">No signals.</p>
      ) : (
        <div className="mt-1">
          {shown.map((signal) => {
            const high = signal.severity === "high";
            const color = typeColor(signal.type);
            return (
              <div
                key={signal.id}
                className="flex gap-3.5 py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <span
                  className="text-[11px] w-2.5 text-center shrink-0"
                  style={{ color: high ? HIGH_SEV_COLOR : "rgba(255,255,255,0.3)" }}
                >
                  {high ? "▲" : "·"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] leading-snug font-mono">{signal.title}</div>
                  {!overview && (
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">{signal.detail}</p>
                  )}
                  <div className="text-[10.5px] mt-1 tracking-wide text-muted font-mono">
                    <span className="uppercase" style={{ color }}>
                      {signal.type}
                    </span>
                    <span> · {analysisNames.get(signal.analysis_id)} · {formatTime(signal.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
