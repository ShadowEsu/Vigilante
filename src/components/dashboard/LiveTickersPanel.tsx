import { SectionHeader } from "@/components/terminal/ui";
import { sparkline } from "@/lib/ui/ascii";

const MOCK_TICKERS = [
  { symbol: "NVDA", price: 124.5, change: 3.2, up: true, note: "insider buy Jun 1" },
  { symbol: "CRM", price: 278.1, change: -1.1, up: false, note: "earnings Jun 12" },
  { symbol: "MSFT", price: 442.0, change: 0.8, up: true, note: "52w high" },
];

export function LiveTickersPanel() {
  return (
    <>
      <SectionHeader num="05" title="LIVE TICKERS" right={`${MOCK_TICKERS.length} TRACKED`} />
      <div className="space-y-4">
        {MOCK_TICKERS.map((t) => {
          const spark = sparkline([2, 3, 2, 4, 5, 4, 6, 7, 6, 7, 8, 7, 8, 9]);
          return (
            <div key={t.symbol} className="flex items-center gap-3 text-[12px] font-mono flex-wrap">
              <span className="font-medium tracking-wide">{t.symbol}</span>
              <span className="tabular-nums">${t.price.toFixed(2)}</span>
              <span style={{ color: t.up ? "#6FCF8E" : "#D178C9" }}>
                {t.up ? "▲" : "▼"} {t.up ? "+" : ""}
                {t.change}%
              </span>
              <span className="tracking-[2px] text-[11px]">
                {spark.map((c, i) => (
                  <span
                    key={i}
                    style={{ color: c.dim ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.65)" }}
                  >
                    {c.ch}
                  </span>
                ))}
              </span>
              <span className="text-muted text-[10px] ml-auto">{t.note}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
