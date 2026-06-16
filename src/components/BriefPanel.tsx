import type { Brief } from "@/types/database";
import { SectionHeader } from "@/components/terminal/ui";
import { meter } from "@/lib/ui/ascii";

interface BriefPanelProps {
  brief: Brief | null;
  overview?: boolean;
}

export function BriefPanel({ brief, overview = false }: BriefPanelProps) {
  if (!brief) {
    return (
      <>
        <SectionHeader num="04" title="BRIEF" />
        <p className="text-xs text-muted">No brief yet.</p>
      </>
    );
  }

  const date = new Date(brief.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const time = new Date(brief.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const conf = meter(82, 10);

  return (
    <>
      <SectionHeader num="04" title="BRIEF" right={`${date} · ${time}`} />
      <h3 className="text-[15px] font-medium tracking-wide leading-snug mb-4 uppercase">
        {brief.title}
      </h3>
      <p
        className={`leading-[1.78] text-dim max-w-[52ch] font-mono ${overview ? "text-[13px] line-clamp-6" : "text-[13px]"}`}
      >
        {brief.body}
      </p>
      {overview && (
        <div className="flex items-center gap-5 mt-6 text-[11px] text-muted tracking-wide">
          <span>sources [ 4 ]</span>
          <span className="flex items-center gap-2">
            confidence{" "}
            <span className="tracking-wide">
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{conf.fill}</span>
              <span className="text-faint">{conf.track}</span>
            </span>{" "}
            82%
          </span>
        </div>
      )}
    </>
  );
}
