import Link from "next/link";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { TopicClusterBreadcrumb, TopicClusterRelated } from "@/components/seo/TopicClusterNav";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd } from "@/lib/seo/json-ld";
import { clusterHref } from "@/lib/seo/content-cluster";

export const metadata = buildPageMetadata({
  title: "Competitive Intelligence Software — How AI Monitoring Works",
  description:
    "Learn how modern competitive intelligence software monitors competitor pricing, SEC filings, and hiring pages. Compare approaches and see why multi-agent AI analysis changes competitor research.",
  path: "/competitive-intelligence",
  keywords: [
    "competitive intelligence software",
    "competitor monitoring best practices",
    "automated competitor analysis",
  ],
});

const sections = [
  {
    title: "What is competitive intelligence?",
    body: `Competitive intelligence (CI) is the practice of collecting and analyzing information about competitors, markets, and industry moves to support product, sales, and strategy decisions. Strong CI programs track primary sources — pricing pages, investor relations, careers sites, product documentation, and regulatory filings — rather than relying on news aggregators alone.`,
  },
  {
    title: "Why monitor competitor websites directly?",
    body: `Pricing tiers, packaging, and hiring velocity often change on competitor-owned pages days or weeks before they appear in press coverage. Automated page snapshots and content hashing detect real changes at the source. Vigilante indexes reachable URLs, stores baselines, and diffs on your cadence so your team acts on verified signals.`,
  },
  {
    title: "How AI agents improve competitor analysis",
    body: `Traditional CI workflows split research across analysts and spreadsheets. Vigilante runs three specialized AI agents in parallel: one discovers and maps competitor URLs, one snapshots and diffs content (including SEC EDGAR for public companies), and one writes a sourced daily brief. This multi-agent architecture reduces manual research while improving coverage and consistency.`,
  },
  {
    title: "SEC EDGAR and public company monitoring",
    body: `For listed competitors, material events often land in 8-K filings before marketing pages update. Combining EDGAR monitoring with web page diffs gives a fuller picture of competitive moves — partnerships, leadership changes, risk factors, and product shifts.`,
  },
  {
    title: "Who benefits from competitor intelligence tools?",
    body: `Product managers tracking feature and pricing moves, corporate development teams evaluating markets, investors monitoring portfolio competition, and revenue teams arming sellers with timely battlecards all benefit from continuous monitoring instead of quarterly manual sweeps. Use our free competitor monitoring checklist to operationalize the workflow.`,
  },
  {
    title: "Vigilante pricing for CI teams",
    body: `Vigilante offers a free tier for two monitoring agents, a Growth plan at $10/month for three AI agents with full competitor analysis, and Team plans for larger watchlists. Promo code VIGILANTE provides 50% off. Compare tools in our competitive intelligence software roundup or join the waitlist on the homepage for early access.`,
  },
];

export default function CompetitiveIntelligencePage() {
  const articleDescription =
    "Learn how modern competitive intelligence software monitors competitor pricing, SEC filings, and hiring pages. Compare approaches and see why multi-agent AI analysis changes competitor research.";

  return (
    <>
      <JsonLdScript
        data={articleJsonLd({
          title: "Competitive Intelligence Software — How AI Monitoring Works",
          description: articleDescription,
          path: "/competitive-intelligence",
        })}
      />
      <main
        className="min-h-screen font-mono"
        style={{ background: "#000", color: "rgba(255,255,255,0.9)", padding: "48px 24px 80px" }}
      >
        <article style={{ maxWidth: 720, margin: "0 auto" }}>
          <header style={{ marginBottom: 48, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 32 }}>
            <Link href={clusterHref("/")} style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
              ← VIGILANTE
            </Link>
            <TopicClusterBreadcrumb
              crumbs={[
                { label: "Home", href: "/" },
                { label: "Competitive intelligence guide" },
              ]}
            />
            <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
              COMPETITIVE INTELLIGENCE GUIDE
            </p>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 600, lineHeight: 1.2, margin: "16px 0" }}>
              Competitive intelligence software for modern product &amp; strategy teams
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>
              How automated competitor monitoring, page-level diffs, and multi-agent AI briefs replace manual research — and what to look for in a CI platform.
            </p>
          </header>

          {sections.map((section) => (
            <section key={section.title} style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 13, letterSpacing: "0.14em", color: "#6E9BE6", marginBottom: 12 }}>{section.title}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.55)", margin: 0 }}>{section.body}</p>
            </section>
          ))}

          <section
            style={{
              marginTop: 48,
              padding: "28px 24px",
              border: "1px solid rgba(74, 222, 128, 0.35)",
              background: "rgba(74, 222, 128, 0.06)",
            }}
          >
            <h2 style={{ fontSize: 13, letterSpacing: "0.14em", margin: "0 0 12px" }}>Try Vigilante</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: "0 0 20px" }}>
              3 AI agents · $10/mo · 50% off with code VIGILANTE. Join the waitlist or run a live demo on any company.
            </p>
            <Link href={clusterHref("/#waitlist")} className="btn-primary" style={{ textDecoration: "none", fontSize: 12, marginRight: 12 }}>
              [ JOIN WAITLIST ]
            </Link>
            <Link href={clusterHref("/resources/competitor-monitoring-checklist")} className="btn-ghost" style={{ textDecoration: "none", fontSize: 12, marginRight: 12 }}>
              [ CHECKLIST ]
            </Link>
            <Link href={clusterHref("/preview")} className="btn-ghost" style={{ textDecoration: "none", fontSize: 12 }}>
              [ LIVE DEMO ]
            </Link>
          </section>

          <TopicClusterRelated currentPath="/competitive-intelligence" />
        </article>
      </main>
    </>
  );
}
