import { notFound } from "next/navigation";

import { LegalDocumentView, LegalPageShell } from "@/components/legal/LegalPage";

import { getLegalDocument, LEGAL_SLUGS } from "@/lib/legal";

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getLegalDocument(slug);
  if (!doc) return { title: "Legal — Vigilante" };

  return {
    title: `${doc.title} — Vigilante`,
    description: doc.summary,
  };
}

export default async function LegalDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getLegalDocument(slug);
  if (!doc) notFound();

  return (
    <LegalPageShell>
      <LegalDocumentView doc={doc} />
    </LegalPageShell>
  );
}
