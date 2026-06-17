"use client";

import Link from "next/link";
import { ProductShowcase } from "@/website/components/ProductShowcase";
import { isStaticGithubPages, appPath } from "@/lib/paths";
import { VigilApp } from "@/vigil/VigilApp";

export default function PreviewPage() {
  if (isStaticGithubPages()) {
    return (
      <main
        className="min-h-screen font-mono"
        style={{ background: "#000", color: "rgba(255,255,255,0.92)", padding: "32px 24px 64px" }}
      >
        <Link
          href={appPath("/")}
          style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
        >
          ← VIGILANTE
        </Link>
        <div id="product" style={{ maxWidth: 960, margin: "32px auto 0" }}>
          <ProductShowcase />
        </div>
      </main>
    );
  }

  return <VigilApp />;
}
