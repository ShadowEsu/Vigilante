import Link from "next/link";

import { LegalPageShell } from "@/components/legal/LegalPage";

import { LEGAL, LEGAL_LINKS } from "@/lib/legal/config";

import { getLegalDocument } from "@/lib/legal";



export const metadata = {

  title: "Legal — Vigilante",

  description: "Terms, privacy, and other legal documents for Vigilante.",

};



export default function LegalIndexPage() {

  return (

    <LegalPageShell>

      <div className="space-y-8">

        <header className="space-y-3 border-b border-edge pb-6">

          <p className="text-[10px] tracking-[0.2em] text-faint uppercase">Legal index</p>

          <h1 className="text-sm font-semibold tracking-[0.12em]">DOCUMENTS</h1>

          <p className="text-[11px] text-muted leading-relaxed">

            {LEGAL.companyLegalName} · {LEGAL.productDisplayName} ({LEGAL.productName}) — {LEGAL.tagline}.

            Effective {LEGAL.effectiveDate}.

          </p>

        </header>



        <div className="space-y-2">

          {LEGAL_LINKS.map((link) => {

            const doc = getLegalDocument(link.slug);

            return (

              <Link

                key={link.slug}

                href={`/legal/${link.slug}`}

                className="block border border-edge px-5 py-4 no-underline hover:border-white/20 transition-colors"

              >

                <div className="text-[11px] tracking-wide text-fg mb-1">{link.title}</div>

                {doc && (

                  <p className="text-[11px] text-muted leading-relaxed">{doc.summary}</p>

                )}

              </Link>

            );

          })}

        </div>



        <div className="border-t border-edge pt-6 space-y-3">

          <p className="text-[11px] text-muted leading-relaxed">

            Legal:{" "}

            <a href={`mailto:${LEGAL.legalEmail}`} className="text-dim hover:text-fg">

              {LEGAL.legalEmail}

            </a>

            {" · "}

            Privacy:{" "}

            <a href={`mailto:${LEGAL.privacyEmail}`} className="text-dim hover:text-fg">

              {LEGAL.privacyEmail}

            </a>

          </p>

          <p className="text-[10px] text-faint leading-relaxed">

            Source code is proprietary. See LICENSE and THIRD_PARTY_NOTICES in the repository.

          </p>

        </div>

      </div>

    </LegalPageShell>

  );

}


