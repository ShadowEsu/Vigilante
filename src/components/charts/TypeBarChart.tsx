import { typeColor } from "@/lib/ui/type-colors";

const DEFAULT_TYPES = [
  "pricing",
  "hiring",
  "promo",
  "site",
  "newsletter",
  "patent",
  "insider",
] as const;

interface TypeBarChartProps {
  rows: { label: string; value: number }[];
  maxSegments?: number;
  showZeros?: boolean;
}

export function TypeBarChart({
  rows,
  maxSegments = 16,
  showZeros = false,
}: TypeBarChartProps) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  const ordered = DEFAULT_TYPES.map((type) => {
    const found = rows.find((r) => r.label.toLowerCase() === type);
    return { label: type, value: found?.value ?? 0 };
  }).filter((r) => showZeros || r.value > 0);

  const extra = rows.filter(
    (r) => !DEFAULT_TYPES.includes(r.label.toLowerCase() as (typeof DEFAULT_TYPES)[number])
  );

  const allRows = [...ordered, ...extra];

  if (!allRows.length) {
    return <span className="text-muted text-xs font-mono">—</span>;
  }

  return (
    <div className="flex flex-col gap-3 font-mono">
      {allRows.map((t) => {
        const filled = Math.round((t.value / max) * maxSegments);
        const color = typeColor(t.label);
        return (
          <div key={t.label} className="flex items-center gap-4">
            <span
              className="w-[88px] shrink-0 text-[11px] tracking-wide uppercase"
              style={{ color }}
            >
              {t.label}
            </span>
            <SegmentedBar filled={filled} total={maxSegments} accent={color} />
            <span className="w-6 text-right text-[11px] tabular-nums text-muted shrink-0">
              {t.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SegmentedBar({
  filled,
  total,
  accent,
}: {
  filled: number;
  total: number;
  accent: string;
}) {
  return (
    <div
      className="flex-1 flex items-center gap-[3px] min-w-[120px] py-[1px]"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "6px 6px",
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 11,
            flexShrink: 0,
            background: i < filled ? "rgba(255,255,255,0.58)" : "transparent",
            boxShadow: i < filled ? `inset 0 0 0 1px ${accent}33` : undefined,
            opacity: i < filled ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}
