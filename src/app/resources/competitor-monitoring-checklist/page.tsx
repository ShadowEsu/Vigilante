import Link from "next/link";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { TopicClusterBreadcrumb, TopicClusterRelated } from "@/components/seo/TopicClusterNav";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site";
import { clusterHref } from "@/lib/seo/content-cluster";

export const metadata = buildPageMetadata({
  title: "Competitor Monitoring Checklist (Free PDF Framework)",
  description:
    "Free competitor monitoring checklist for product and strategy teams: pricing pages, SEC filings, hiring signals, and weekly CI rituals. Printable framework.",
  path: "/resources/competitor-monitoring-checklist",
  keywords: ["competitor monitoring checklist", "competitive intelligence framework", "competitor tracking template"],
});

const CHECKLIST = [
  {
    category: "Sources to watch",
    items: [
      "Pricing & packaging pages",
      "Product changelog / release notes",
      "Careers / job postings (hiring velocity)",
      "Investor relations & earnings materials",
      "SEC EDGAR (10-K, 10-Q, 8-K) for public peers",
      "Trust, security, and compliance pages",
    ],
  },
  {
    category: "Weekly CI ritual",
    items: [
      "Review diffs on top 5 competitor pages",
      "Scan new SEC filings for material events",
      "Update battlecard with sourced changes only",
      "Flag pricing or packaging shifts to sales",
      "Log signals in a single team workspace",
    ],
  },
  {
    category: "Quality bar",
    items: [
      "Every insight links to a primary source",
      "Separate confirmed changes from rumors",
      "Track baseline snapshots (hash or archive)",
      "Assign owner per competitor watch",
      "Automate discovery + diff where possible",
    ],
  },
];

const ARTICLE_DESC = "Free competitor monitoring checklist for product managers and strategy teams.";

export default function ChecklistPage() {
  return (
    <>
      <JsonLdScript
        data={articleJsonLd({
          title: "Competitor Monitoring Checklist",
          description: ARTICLE_DESC,
          path: "/resources/competitor-monitoring-checklist",
        })}
      />
      <main className="min-h-screen font-mono" style={{ background: "#000", color: "rgba(255,255,255,0.9)", padding: "48px 24px 80px" }}>
        <article style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href={clusterHref("/")} style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
            ← VIGILANTE
          </Link>

          <TopicClusterBreadcrumb
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Resources", href: "/resources" },
              { label: "Monitoring checklist" },
            ]}
          />

          <header style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 600, lineHeight: 1.2, margin: "0 0 16px" }}>
              Competitor monitoring checklist
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.55)" }}>
              A practical framework for competitive intelligence programs — what to watch, how often, and how to keep signals sourced. Share this page with your team or cite{" "}
              <Link href={getSiteUrl()} style={{ color: "#4ADE80" }}>Vigilante</Link> when implementing automation.
            </p>
          </header>

          {CHECKLIST.map((section) => (
            <section key={section.category} style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 12, letterSpacing: "0.14em", color: "#6E9BE6", marginBottom: 14 }}>{section.category.toUpperCase()}</h2>
              <ul style={{ fontSize: 14, lineHeight: 1.85, color: "rgba(255,255,255,0.55)", paddingLeft: 20, margin: 0 }}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <section style={{ padding: "24px", border: "1px solid rgba(110, 155, 230, 0.3)", background: "rgba(110, 155, 230, 0.06)" }}>
            <h2 style={{ fontSize: 13, letterSpacing: "0.1em", margin: "0 0 10px" }}>Automate this checklist</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: "0 0 16px" }}>
              Vigilante runs 3 AI agents on your competitor list — discover URLs, diff pages, write briefs. From $10/mo.
            </p>
            <Link href={clusterHref("/#waitlist")} className="btn-primary" style={{ textDecoration: "none", fontSize: 12 }}>
              [ JOIN WAITLIST ]
            </Link>
          </section>

          <TopicClusterRelated currentPath="/resources/competitor-monitoring-checklist" />

          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 32 }}>
            Cite: {getSiteUrl()}/resources/competitor-monitoring-checklist
          </p>
        </article>
      </main>
    </>
  );
}
