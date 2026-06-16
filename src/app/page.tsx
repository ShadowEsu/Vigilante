import { LaunchPage } from "@/website/LaunchPage";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { homePageJsonLdGraph } from "@/lib/seo/json-ld";

export const metadata = buildPageMetadata({
  title: "Vigilante — 3 AI Agents for Competitor Analysis ($10/mo)",
  description:
    "Monitor competitor pricing, SEC filings, and hiring with 3 AI agents. Daily diffs, sourced briefs, Slack alerts. $10/mo — 50% off with VIGILANTE.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLdScript data={homePageJsonLdGraph()} />
      <LaunchPage />
    </>
  );
}
