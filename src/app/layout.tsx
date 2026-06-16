import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { buildPageMetadata } from "@/lib/seo/metadata";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = buildPageMetadata();

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${jetbrainsMono.className}`}>
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
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
