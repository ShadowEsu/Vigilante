import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { CI_TOPIC_CLUSTER, clusterHref } from "@/lib/seo/content-cluster";

export const metadata = buildPageMetadata({
  title: "Competitive Intelligence Resources",
  description:
    "Free guides, tool comparisons, and checklists for competitive intelligence teams. Learn competitor monitoring best practices and compare CI software.",
  path: "/resources",
  keywords: ["competitive intelligence resources", "competitor analysis guides"],
});

export default function ResourcesHubPage() {
  return (
    <main className="min-h-screen font-mono" style={{ background: "#000", color: "rgba(255,255,255,0.9)", padding: "48px 24px 80px" }}>
      <article style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href={clusterHref("/")} style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
          ← VIGILANTE
        </Link>

        <header style={{ margin: "32px 0 40px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)" }}>RESOURCES</p>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 600, margin: "12px 0" }}>
            Competitive intelligence resources
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.55)" }}>
            Guides and frameworks for product, strategy, and investment teams — built by{" "}
            <Link href={clusterHref("/")} style={{ color: "#4ADE80" }}>Vigilante</Link>.
          </p>
        </header>

        <section style={{ marginBottom: 32, padding: "20px", border: "1px solid rgba(74, 222, 128, 0.3)", background: "rgba(74, 222, 128, 0.04)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>
            <Link href={clusterHref(CI_TOPIC_CLUSTER.pillar.href)} style={{ color: "inherit", textDecoration: "none" }}>
              {CI_TOPIC_CLUSTER.pillar.label}
            </Link>
          </h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            Pillar guide — how AI agent monitoring, page diffs, and SEC filings fit into a modern CI program.
          </p>
        </section>

        <div style={{ display: "grid", gap: 16 }}>
          {CI_TOPIC_CLUSTER.pages.map((p) => (
            <Link
              key={p.href}
              href={clusterHref(p.href)}
              style={{
                display: "block",
                padding: "20px",
                border: "1px solid rgba(255,255,255,0.08)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: "rgba(255,255,255,0.85)" }}>{p.label}</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>{p.description}</p>
            </Link>
          ))}
        </div>
      </article>
    </main>
  );
}
