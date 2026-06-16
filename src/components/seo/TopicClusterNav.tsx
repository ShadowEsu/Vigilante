import Link from "next/link";
import { CI_TOPIC_CLUSTER, clusterHref } from "@/lib/seo/content-cluster";
import { JsonLdScript } from "./JsonLdScript";
import { absoluteUrl } from "@/lib/seo/site";

type Crumb = { label: string; href?: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: c.href ? absoluteUrl(c.href) : undefined,
    })),
  };
}

export function TopicClusterBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd(crumbs)} />
      <nav aria-label="Breadcrumb" style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginTop: 24, marginBottom: 24 }}>
        {crumbs.map((c, i) => (
          <span key={c.label}>
            {i > 0 && " · "}
            {c.href ? (
              <Link href={clusterHref(c.href)} style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                {c.label}
              </Link>
            ) : (
              c.label
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

export function TopicClusterRelated({ currentPath }: { currentPath: string }) {
  const others = CI_TOPIC_CLUSTER.pages.filter((p) => p.href !== currentPath);

  return (
    <aside
      style={{
        marginTop: 48,
        padding: "24px 20px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <p style={{ fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", margin: "0 0 16px" }}>
        COMPETITIVE INTELLIGENCE RESOURCES
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <li style={{ marginBottom: 14 }}>
          <Link
            href={clusterHref(CI_TOPIC_CLUSTER.pillar.href)}
            title={CI_TOPIC_CLUSTER.pillar.anchor}
            style={{ fontSize: 13, color: currentPath === CI_TOPIC_CLUSTER.pillar.href ? "#4ADE80" : "rgba(255,255,255,0.6)", textDecoration: "none" }}
          >
            {CI_TOPIC_CLUSTER.pillar.label}
          </Link>
        </li>
        {others.map((p) => (
          <li key={p.href} style={{ marginBottom: 14 }}>
            <Link
              href={clusterHref(p.href)}
              title={p.anchor}
              style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
            >
              {p.label}
            </Link>
            <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{p.description}</span>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 11, margin: "16px 0 0", color: "rgba(255,255,255,0.35)" }}>
        <Link href={clusterHref("/#waitlist")} style={{ color: "#6E9BE6" }}>
          Join the Vigilante waitlist →
        </Link>
      </p>
    </aside>
  );
}

/** Breadcrumb at top + related links block (use split components when content goes between). */
export function TopicClusterNav({
  currentPath,
  crumbs,
}: {
  currentPath: string;
  crumbs: Crumb[];
}) {
  return (
    <>
      <TopicClusterBreadcrumb crumbs={crumbs} />
      <TopicClusterRelated currentPath={currentPath} />
    </>
  );
}
