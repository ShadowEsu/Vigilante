import Link from "next/link";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site";
import { TopicClusterBreadcrumb, TopicClusterRelated } from "@/components/seo/TopicClusterNav";
import { clusterHref } from "@/lib/seo/content-cluster";

export const metadata = buildPageMetadata({
  title: "Best Competitive Intelligence Tools (2026 Comparison)",
  description:
    "Compare the best competitive intelligence tools in 2026: Vigilante, Klue, Crayon, Kompyte, and manual research. Features, pricing, and when to use AI agent monitoring.",
  path: "/resources/competitive-intelligence-tools",
  keywords: [
    "best competitive intelligence tools",
    "competitive intelligence tools comparison",
    "Klue alternative",
    "Crayon alternative",
    "competitor monitoring software",
  ],
});

const TOOLS = [
  {
    name: "Vigilante",
    url: getSiteUrl(),
    bestFor: "Teams wanting source-level monitoring with 3 AI agents at $10/mo",
    highlights: ["Page-level diffs (pricing, IR, careers)", "SEC EDGAR integration", "Multi-agent AI briefs", "Free tier + $10/mo Growth"],
    pricing: "Free · $10/mo (3 AI agents) · $20/mo Team",
  },
  {
    name: "Klue",
    url: "https://klue.com",
    bestFor: "Enterprise CI programs with battlecard workflows",
    highlights: ["Battlecards", "Sales enablement focus", "Enterprise integrations"],
    pricing: "Enterprise (custom)",
  },
  {
    name: "Crayon",
    url: "https://www.crayon.co",
    bestFor: "Large marketing and CI teams needing broad market monitoring",
    highlights: ["Market intelligence feeds", "Competitive dashboards", "Enterprise scale"],
    pricing: "Enterprise (custom)",
  },
  {
    name: "Kompyte",
    url: "https://kompyte.com",
    bestFor: "Automated competitor tracking for mid-market sales teams",
    highlights: ["Website change tracking", "Sales alerts", "Competitive landscapes"],
    pricing: "Tiered SaaS",
  },
  {
    name: "Manual research",
    url: null,
    bestFor: "Very early stage or single-competitor tracking",
    highlights: ["Spreadsheets", "Google Alerts", "Ad hoc page checks"],
    pricing: "Time cost only",
  },
];

const ARTICLE_DESC =
  "Compare the best competitive intelligence tools in 2026 including Vigilante, Klue, Crayon, and Kompyte.";

export default function CompetitiveIntelligenceToolsPage() {
  return (
    <>
      <JsonLdScript
        data={articleJsonLd({
          title: "Best Competitive Intelligence Tools (2026 Comparison)",
          description: ARTICLE_DESC,
          path: "/resources/competitive-intelligence-tools",
        })}
      />
      <main className="min-h-screen font-mono" style={{ background: "#000", color: "rgba(255,255,255,0.9)", padding: "48px 24px 80px" }}>
        <article style={{ maxWidth: 760, margin: "0 auto" }}>
          <Link href={clusterHref("/")} style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
            ← VIGILANTE
          </Link>

          <TopicClusterBreadcrumb
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Resources", href: "/resources" },
              { label: "CI tools comparison" },
            ]}
          />

          <header style={{ margin: "0 0 40px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)" }}>RESOURCES · 2026</p>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 600, lineHeight: 1.2, margin: "12px 0" }}>
              Best competitive intelligence tools compared
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.55)" }}>
              An honest comparison of CI platforms for product managers, strategy teams, and investors — updated for AI-native monitoring and source-level diffs.
            </p>
          </header>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 12, letterSpacing: "0.14em", color: "#6E9BE6", marginBottom: 20 }}>HOW TO CHOOSE</h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.55)" }}>
              Enterprise platforms excel at battlecards and org-wide rollout. AI-native tools like{" "}
              <Link href={getSiteUrl()} style={{ color: "#4ADE80" }}>Vigilante</Link> focus on verifying changes at the source — pricing pages, filings, and careers — with lower overhead for startups and growth teams. Match budget, watchlist size, and whether you need sales enablement vs. primary-source monitoring.
            </p>
          </section>

          {TOOLS.map((tool) => (
            <section
              key={tool.name}
              style={{
                marginBottom: 28,
                padding: "24px 20px",
                border: tool.name === "Vigilante" ? "1px solid rgba(74, 222, 128, 0.35)" : "1px solid rgba(255,255,255,0.08)",
                background: tool.name === "Vigilante" ? "rgba(74, 222, 128, 0.04)" : "transparent",
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>
                {tool.url ? (
                  <a href={tool.url} style={{ color: "inherit", textDecoration: "none" }} rel={tool.name === "Vigilante" ? undefined : "noopener noreferrer"}>
                    {tool.name}
                  </a>
                ) : (
                  tool.name
                )}
              </h2>
              <p style={{ fontSize: 12, color: "#6E9BE6", margin: "0 0 12px" }}>Best for: {tool.bestFor}</p>
              <ul style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", paddingLeft: 20 }}>
                {tool.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p style={{ fontSize: 11, letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", margin: 0 }}>Pricing: {tool.pricing}</p>
            </section>
          ))}

          <section style={{ marginTop: 48, padding: "24px", border: "1px solid rgba(110, 155, 230, 0.3)", background: "rgba(110, 155, 230, 0.06)" }}>
            <h2 style={{ fontSize: 13, letterSpacing: "0.12em", margin: "0 0 12px" }}>Try Vigilante free</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: "0 0 16px" }}>
              3 AI agents · $10/mo · 50% off with VIGILANTE. Join the waitlist or run the live demo.
            </p>
            <Link href={clusterHref("/#waitlist")} className="btn-primary" style={{ textDecoration: "none", fontSize: 12, marginRight: 12 }}>
              [ JOIN WAITLIST ]
            </Link>
            <Link href={clusterHref("/press")} style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              Press kit →
            </Link>
          </section>

          <TopicClusterRelated currentPath="/resources/competitive-intelligence-tools" />

          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 32, lineHeight: 1.6 }}>
            Cite this page: {getSiteUrl()}/resources/competitive-intelligence-tools — maintained by Vigilant Intelligence, Inc.
          </p>
        </article>
      </main>
    </>
  );
}
