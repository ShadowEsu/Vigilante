import { notFound } from "next/navigation";

import { LegalDocumentView, LegalPageShell } from "@/components/legal/LegalPage";

import { getLegalDocument, LEGAL_SLUGS } from "@/lib/legal";



export function generateStaticParams() {

  return LEGAL_SLUGS.map((slug) => ({ slug }));

}



export function generateMetadata({ params }: { params: { slug: string } }) {

  const doc = getLegalDocument(params.slug);

  if (!doc) return { title: "Legal — Vigilante" };

  return {

    title: `${doc.title} — Vigilante`,

    description: doc.summary,

  };

}



export default function LegalDocPage({ params }: { params: { slug: string } }) {

  const doc = getLegalDocument(params.slug);

  if (!doc) notFound();



  return (

    <LegalPageShell>

      <LegalDocumentView doc={doc} />

    </LegalPageShell>

  );

}


