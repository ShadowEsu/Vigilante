import type { MetadataRoute } from "next";
import { LEGAL_SLUGS } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/competitive-intelligence"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/legal"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    ...LEGAL_SLUGS.map((slug) => ({
      url: absoluteUrl(`/legal/${slug}`),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  return pages;
}
