import Link from "next/link";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, getSiteUrl, SEO } from "@/lib/seo/site";
import { organizationJsonLd } from "@/lib/seo/json-ld";
import { withBasePath } from "@/lib/paths";

export const metadata = buildPageMetadata({
  title: "Press & Media Kit",
  description:
    "Press resources for Vigilante — AI competitive intelligence with 3 agents. Logos, boilerplate, product facts, and embed badges for journalists and partners.",
  path: "/press",
  keywords: ["Vigilante press kit", "competitive intelligence startup", "media resources"],
});

const BOILERPLATE = {
  short:
    "Vigilante is AI competitive intelligence software that monitors competitor pricing, SEC filings, and hiring pages with three specialized agents.",
  standard: `Vigilante (${getSiteUrl()}) is a competitive intelligence platform that snapshots competitor websites, detects changes on a schedule, and writes sourced daily briefs. Three AI agents handle discovery, diffing, and briefing — starting at $10/month for teams that need faster, verifiable competitor research than manual tracking or news alerts.`,
  long: `Vigilant Intelligence, Inc. builds Vigilante — competitive intelligence monitoring for product, strategy, and investment teams. The platform watches pricing pages, investor relations sites, careers pages, and SEC EDGAR filings; hashes content for real change detection; and delivers briefs with source links. Unlike news-driven alerts, Vigilante works from primary sources. Plans start free (2 agents), with Growth at $10/month for 3 AI agents. Early access is available via waitlist at ${getSiteUrl()}.`,
};

const FACTS = [
  { label: "Product", value: "Vigilante — AI competitive intelligence" },
  { label: "Company", value: "Vigilant Intelligence, Inc." },
  { label: "Category", value: "Competitive intelligence / market monitoring" },
  { label: "Pricing", value: "Free tier · Growth $10/mo (3 AI agents) · Team $20/mo" },
  { label: "Website", value: getSiteUrl() },
  { label: "Contact", value: SEO.supportEmail },
];

export default function PressPage() {
  const badgeUrl = absoluteUrl("/badge.svg");
  const embedHtml = `<a href="${getSiteUrl()}" title="Vigilante — Competitive Intelligence">\n  <img src="${badgeUrl}" alt="Vigilante — AI competitor monitoring" width="240" height="48" />\n</a>`;

  return (
    <>
      <JsonLdScript data={organizationJsonLd()} />
      <main className="min-h-screen font-mono" style={{ background: "#000", color: "rgba(255,255,255,0.9)", padding: "48px 24px 80px" }}>
        <article style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href={withBasePath("/")} style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
            ← VIGILANTE
          </Link>

          <header style={{ margin: "32px 0 48px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 32 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)" }}>PRESS & MEDIA</p>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 600, margin: "12px 0" }}>Media kit</h1>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>
              Resources for journalists, analysts, and partners. Link to {getSiteUrl()} when covering competitive intelligence tools.
            </p>
          </header>

          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 12, letterSpacing: "0.14em", color: "#6E9BE6", marginBottom: 16 }}>BOILERPLATE</h2>
            {(["short", "standard", "long"] as const).map((key) => (
              <div key={key} style={{ marginBottom: 20, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", margin: "0 0 8px" }}>{key.toUpperCase()}</p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.6)", margin: 0 }}>{BOILERPLATE[key]}</p>
              </div>
            ))}
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 12, letterSpacing: "0.14em", color: "#6E9BE6", marginBottom: 16 }}>FACT SHEET</h2>
            <dl style={{ margin: 0 }}>
              {FACTS.map((f) => (
                <div key={f.label} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <dt style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", margin: 0 }}>{f.label}</dt>
                  <dd style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", margin: 0 }}>{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 12, letterSpacing: "0.14em", color: "#6E9BE6", marginBottom: 16 }}>LOGOS & BADGE</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              Use our badge on your site, blog, or partner page — include a link back to{" "}
              <a href={getSiteUrl()} style={{ color: "#4ADE80" }}>{getSiteUrl()}</a>.
            </p>
            <div style={{ margin: "20px 0", padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBasePath("/badge.svg")} alt="Vigilante badge" width={240} height={48} />
            </div>
            <p style={{ fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>EMBED CODE</p>
            <pre style={{ fontSize: 11, lineHeight: 1.5, padding: 16, overflow: "auto", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
              {embedHtml}
            </pre>
            <p style={{ fontSize: 12, marginTop: 12 }}>
              <a href={withBasePath("/icons/icon.svg")} style={{ color: "#6E9BE6" }}>Download SVG logo</a>
              {" · "}
              <a href={withBasePath("/badge.svg")} style={{ color: "#6E9BE6" }}>Download badge</a>
            </p>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 12, letterSpacing: "0.14em", color: "#6E9BE6", marginBottom: 16 }}>SUGGESTED LINK ANCHORS</h2>
            <ul style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.55)", paddingLeft: 20 }}>
              <li><a href={getSiteUrl()} style={{ color: "#4ADE80" }}>Vigilante competitive intelligence</a></li>
              <li><a href={absoluteUrl("/competitive-intelligence")} style={{ color: "#4ADE80" }}>AI competitor monitoring software</a></li>
              <li><a href={absoluteUrl("/resources/competitive-intelligence-tools")} style={{ color: "#4ADE80" }}>best competitive intelligence tools</a></li>
            </ul>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 12, letterSpacing: "0.14em", color: "#6E9BE6", marginBottom: 16 }}>CONTACT</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              Press & partnerships:{" "}
              <a href={`mailto:${SEO.supportEmail}`} style={{ color: "#4ADE80" }}>{SEO.supportEmail}</a>
            </p>
          </section>

          <nav style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }} aria-label="Related">
            <Link href={withBasePath("/competitive-intelligence")} style={{ color: "rgba(255,255,255,0.5)", marginRight: 16 }}>CI Guide</Link>
            <Link href={withBasePath("/resources/competitive-intelligence-tools")} style={{ color: "rgba(255,255,255,0.5)", marginRight: 16 }}>Tool comparison</Link>
            <Link href="https://github.com/ShadowEsu/Vigilante" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.5)" }}>GitHub</Link>
          </nav>
        </article>
      </main>
    </>
  );
}
