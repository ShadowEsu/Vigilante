import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vigilante — Competitive Intelligence Monitoring",
  description: "Watch competitors' pricing, filings, governance, and product changes. Daily briefs, SEC EDGAR, Slack alerts.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vigilante",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${jetbrainsMono.className}`}>
      <body
        className="font-mono min-h-screen"
        style={{
          backgroundColor: "#000",
          color: "rgba(255,255,255,0.92)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
