"use client";

import Link from "next/link";
import { useState } from "react";
import { LAUNCH } from "../copy";
import { appPath, demoPath } from "@/lib/paths";

const LINKS: { href: string; label: string; route?: boolean }[] = [
  { href: "#product", label: "Demo" },
  { href: "#how", label: "How" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: appPath("/competitive-intelligence"), label: "Guide", route: true },
  { href: "#waitlist", label: "Waitlist" },
];

export function LaunchNav({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);

  const scrollToSection = (href: string) => {
    setOpen(false);
    if (!href.startsWith("#")) return;
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className={`launch-nav ${scrolled ? "launch-nav--scrolled" : ""}`} aria-label="Primary">
      <Link href="/" className="launch-nav-brand" onClick={() => setOpen(false)}>
        <span className="launch-nav-logo" aria-hidden>
          V
        </span>
        <span>{LAUNCH.brand}</span>
      </Link>

      <button
        type="button"
        className="launch-nav-toggle"
        aria-expanded={open}
        aria-controls="launch-nav-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>

      <div id="launch-nav-menu" className={`launch-nav-links ${open ? "launch-nav-links--open" : ""}`}>
        {LINKS.map((link) =>
          link.route ? (
            <Link key={link.label} href={link.href} className="launch-nav-link" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ) : (
            <a
              key={link.label}
              href={link.href}
              className="launch-nav-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
            >
              {link.label}
            </a>
          )
        )}
        <Link href={appPath("/auth")} className="btn-ghost launch-nav-cta" onClick={() => setOpen(false)}>
          Sign in
        </Link>
        <Link href={demoPath()} className="btn-primary launch-nav-cta launch-nav-cta--primary" onClick={() => setOpen(false)}>
          Live demo
        </Link>
      </div>
    </nav>
  );
}
