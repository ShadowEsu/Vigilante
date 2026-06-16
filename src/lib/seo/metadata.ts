import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl, SEO } from "./site";

type PageMetaInput = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description = SEO.defaultDescription,
  path = "/",
  keywords,
  noIndex = false,
}: PageMetaInput = {}): Metadata {
  const pageTitle = title ?? SEO.defaultTitle;
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl("/og.svg");

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: SEO.defaultTitle,
      template: `%s — ${SEO.siteName}`,
    },
    description,
    keywords: [...SEO.keywords, ...(keywords ?? [])],
    authors: [{ name: SEO.legalName, url: getSiteUrl() }],
    creator: SEO.legalName,
    publisher: SEO.legalName,
    category: "technology",
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: SEO.locale,
      url: canonical,
      siteName: SEO.siteName,
      title: pageTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${SEO.siteName} — ${SEO.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
      creator: SEO.twitterHandle,
    },
  };
}
