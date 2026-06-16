import { LEGAL } from "@/lib/legal/config";
import { LAUNCH_FAQ } from "@/website/seo-faq";
import { absoluteUrl, getSiteUrl, SEO } from "./site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO.legalName,
    alternateName: SEO.siteName,
    url: getSiteUrl(),
    logo: absoluteUrl("/icons/icon.svg"),
    email: SEO.supportEmail,
    description: SEO.defaultDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: "251 Little Falls Drive",
      addressLocality: "Wilmington",
      addressRegion: "DE",
      postalCode: "19808",
      addressCountry: "US",
    },
    sameAs: ["https://github.com/ShadowEsu/Vigilante"],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO.siteName,
    url: getSiteUrl(),
    description: SEO.defaultDescription,
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SEO.siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: getSiteUrl(),
    description: SEO.defaultDescription,
    offers: {
      "@type": "Offer",
      price: "10",
      priceCurrency: "USD",
      description: "3 AI agents for competitor analysis — $10/mo, 50% off with promo code VIGILANTE",
    },
    featureList: [
      "Competitor page monitoring",
      "Pricing change detection",
      "SEC EDGAR filing alerts",
      "AI-generated intelligence briefs",
      "Multi-agent competitor analysis",
    ],
  };
}

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: LAUNCH_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function homePageJsonLdGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { ...organizationJsonLd(), "@id": `${getSiteUrl()}/#organization` },
      webSiteJsonLd(),
      softwareApplicationJsonLd(),
      faqPageJsonLd(),
    ],
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    datePublished: input.datePublished ?? LEGAL.effectiveDate,
    dateModified: LEGAL.effectiveDate,
    author: {
      "@type": "Organization",
      name: SEO.legalName,
    },
    publisher: {
      "@type": "Organization",
      name: SEO.legalName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icons/icon.svg"),
      },
    },
    mainEntityOfPage: absoluteUrl(input.path),
  };
}
