import { withBasePath } from "@/lib/paths";

/** Topic cluster for competitive intelligence — internal linking + DR distribution. */
export const CI_TOPIC_CLUSTER = {
  pillar: {
    href: "/competitive-intelligence",
    label: "Competitive intelligence guide",
    anchor: "competitive intelligence software",
  },
  hub: {
    href: "/resources",
    label: "Resources",
    anchor: "competitive intelligence resources",
  },
  pages: [
    {
      href: "/resources/competitive-intelligence-tools",
      label: "Best CI tools (2026)",
      anchor: "best competitive intelligence tools",
      description: "Compare Vigilante, Klue, Crayon, Kompyte",
    },
    {
      href: "/resources/competitor-monitoring-checklist",
      label: "Monitoring checklist",
      anchor: "competitor monitoring checklist",
      description: "Free framework for PM & strategy teams",
    },
    {
      href: "/press",
      label: "Press kit",
      anchor: "Vigilante press kit",
      description: "Logos, boilerplate, embed badge",
    },
  ],
} as const;

export function clusterHref(path: string) {
  return withBasePath(path);
}
