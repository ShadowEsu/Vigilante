import { SectionHeader } from "@/components/terminal/ui";

const MOCK_NEWSLETTERS = [
  {
    title: "Acme Product Digest",
    date: "Jun 14",
    summary: "Introducing Pro tier — now m…",
    bullets: ["+ New pricing section added", "+ Hero changed to enterprise copy"],
  },
  {
    title: "Competitor Weekly",
    date: "Jun 11",
    summary: "Summer launch preview — pric…",
    bullets: ["+ Pricing removed from nav", "+ New enterprise page linked"],
  },
];

export function NewslettersPanel() {
  return (
    <>
      <SectionHeader num="06" title="NEWSLETTERS" />
      <div className="space-y-5">
        {MOCK_NEWSLETTERS.map((n) => (
          <div key={n.title} className="font-mono">
            <div className="flex items-baseline gap-3 text-[12.5px]">
              <span className="text-fg tracking-wide">{n.title}</span>
              <span className="text-muted text-[11px]">{n.date}</span>
            </div>
            <p className="text-[12px] text-dim mt-1">{n.summary}</p>
            <ul className="mt-2 space-y-1 text-[11px] text-muted">
              {n.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
