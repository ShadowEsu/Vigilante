import Link from "next/link";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal/config";
import type { LegalDocument } from "@/lib/legal/types";

interface LegalDocumentViewProps {
  doc: LegalDocument;
}

export function LegalDocumentView({ doc }: LegalDocumentViewProps) {
  return (
    <article className="space-y-8">
      <header className="space-y-3 border-b border-edge pb-6">
        <p className="text-[10px] tracking-[0.2em] text-faint uppercase">
          {LEGAL.productDisplayName} · Legal
        </p>
        <h1 className="text-sm font-semibold tracking-[0.12em]">{doc.title.toUpperCase()}</h1>
        <p className="text-[11px] text-muted leading-relaxed">{doc.summary}</p>
        <p className="text-[10px] text-faint">
          Last updated {doc.lastUpdated} · Version {LEGAL.version}
        </p>
      </header>

      <div className="space-y-8">
        {doc.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-[11px] font-semibold tracking-wide text-dim">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-[11px] text-muted leading-relaxed">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-5 space-y-2 text-[11px] text-muted leading-relaxed">
                {section.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 40)}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}

export function LegalFooterLinks({ className = "" }: { className?: string }) {
  return (
    <nav
      className={`flex flex-wrap gap-x-4 gap-y-2 text-[10px] tracking-wide text-faint ${className}`}
      aria-label="Legal"
    >
      {LEGAL_LINKS.map((link) => (
        <Link key={link.slug} href={`/legal/${link.slug}`} className="hover:text-dim no-underline">
          {link.title}
        </Link>
      ))}
    </nav>
  );
}

export function LegalPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen font-mono"
      style={{ background: "#000", color: "rgba(255,255,255,0.92)" }}
    >
      <header
        className="border-b px-6 py-4 flex items-center justify-between gap-4"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Link href="/" className="text-xs font-semibold tracking-[0.18em] no-underline">
          {LEGAL.productName}
        </Link>
        <Link href="/legal" className="text-[10px] text-faint hover:text-dim tracking-wide no-underline">
          all legal →
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">{children}</main>

      <footer
        className="border-t px-6 py-8"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <LegalFooterLinks />
        <p className="text-[10px] text-faint mt-4 leading-relaxed">
          © {new Date().getFullYear()} {LEGAL.companyLegalName}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
