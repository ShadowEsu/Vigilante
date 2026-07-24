import { discoverCompanyUrls } from "@/lib/agent/search";
import { fetchPageText } from "@/lib/agent/fetch";
import { extractDocumentsFromText, fetchAndExtractDocuments, isDocumentUrl } from "@/lib/agent/documents";
import { extractInsiderFromCareers, isCareersUrl } from "@/lib/agent/insider";
import {
  extractNewsletterPosts,
  isNewsletterUrl,
} from "@/lib/agent/newsletter";
import { generateBrief } from "@/lib/agent/llm";
import { analyzePageChange, applyAgentAnalysis } from "@/lib/agent/agents";
import { aiEnabled } from "@/lib/agent/llm-client";
import { calculateCost } from "@/lib/agent/pricing";
import { eventId } from "@/lib/integrations/events";
import { dispatchEvent, pipelineVersion } from "@/lib/integrations/notify";
import { buildIntelBrief, pageIntelFromScrape } from "@/lib/agent/brief-build";
import { extractIntelFromText } from "@/lib/agent/intel-extract";
import { fetchRecentFilings } from "@/lib/agent/sec";
import { detectPageChange, hashNormalizedContent, pathLabel } from "@/lib/agent/snapshot";
import type { DetectedSignal } from "@/types/database";
import {
  addScanLog,
  createCompany,
  getCompany,
  getSnapshot,
  saveBrief,
  saveChanges,
  replaceIntelHighlights,
  saveSnapshot,
  updateCompany,
  upsertDocuments,
  upsertInsiderMoves,
  upsertNewsletters,
} from "./store";
import type { Company, CreateCompanyResult, IntelHighlight, PageChange, RunCompanyResult } from "./types";

function formatLogTime(d: Date) {
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function sourceCategory(url: string): string {
  const u = url.toLowerCase();
  if (/g2\.com|trustpilot|capterra|gartner/.test(u)) return "REVIEWS";
  if (/pricing|plans|billing/.test(u)) return "PRICING";
  if (/career|jobs|hiring/.test(u)) return "CAREERS";
  if (/investor|ir\/|sec\.gov|edgar|10-k|annual|governance|proxy/.test(u)) return "INVESTOR";
  if (/blog|news|press|newsletter|newsroom/.test(u)) return "NEWS";
  if (/about|company/.test(u)) return "CORPORATE";
  return "SITE";
}

export async function onboardCompany(input: string): Promise<CreateCompanyResult> {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Company name or URL required", steps: [] };

  const steps: string[] = [];
  steps.push(`Resolving target: ${trimmed}`);
  const discovered = await discoverCompanyUrls(trimmed);
  steps.push(`Discovery complete — ${discovered.sources.length} URLs mapped for ${discovered.domain}`);

  const company = await createCompany({
    name: discovered.name,
    domain: discovered.domain,
    input: trimmed,
    sources: discovered.sources,
    status: "scanning",
    spend_usd: 0,
    budget_usd: 5,
    pages_indexed: 0,
    last_scraped_at: null,
  });

  const run = await runCompanyScrape(company.id, steps);
  if (!run.ok) {
    return { ok: true, company, discovered: discovered.sources, error: run.error, steps: run.steps };
  }

  const updated = await getCompany(company.id);
  return {
    ok: true,
    company: updated ?? company,
    discovered: discovered.sources,
    steps: run.steps,
    run,
  };
}

export async function runCompanyScrape(
  companyId: string,
  existingSteps: string[] = []
): Promise<RunCompanyResult> {
  const company = await getCompany(companyId);
  if (!company) return { ok: false, error: "Company not found", steps: existingSteps };

  const steps = [...existingSteps];
  await updateCompany(companyId, { status: "scanning" });
  const started = Date.now();

  let newslettersFound = 0;
  let documentsFound = 0;
  let insiderMovesFound = 0;
  let changesFound = 0;
  let sourcesScraped = 0;
    let briefGenerated = false;
    let lastBrief: { title: string; body: string } | null = null;
  let costUsd = 0;
  const changeSummaries: DetectedSignal[] = [];
  const pendingChanges: Omit<PageChange, "id">[] = [];
  const scrapedPages: ReturnType<typeof pageIntelFromScrape>[] = [];
  const reachableSources: string[] = [];
  const documentTypes = new Set<string>();
  const secForms: string[] = [];
  const intelBuffer: Omit<IntelHighlight, "id" | "company_id">[] = [];
  const agentRuns: string[] = [];

  try {
    steps.push(`Starting full intel pass on ${company.domain} (${company.sources.length} sources)`);

    // SEC EDGAR filings for public companies
    try {
      const secFilings = await fetchRecentFilings(company.name, company.domain, 6);
      if (secFilings.length > 0) {
        const nowIso = new Date().toISOString();
        for (const f of secFilings) secForms.push(f.form);
        await upsertDocuments(
          secFilings.map((f) => ({
            company_id: companyId,
            title: f.title,
            doc_type: f.form,
            category: "SEC filing",
            url: f.url,
            excerpt: `Filed ${f.filed} · ${f.form} · SEC EDGAR`,
            scraped_at: nowIso,
          }))
        );
        documentsFound += secFilings.length;
        for (const f of secFilings) documentTypes.add(f.form);
        steps.push(`SEC: ${secFilings.length} recent filing(s) from EDGAR`);
      }
    } catch {
      steps.push(`SEC: EDGAR lookup skipped`);
    }

    for (const sourceUrl of company.sources) {
      let newText: string;
      try {
        newText = await fetchPageText(sourceUrl);
        sourcesScraped++;
        reachableSources.push(sourceUrl);
        scrapedPages.push(
          pageIntelFromScrape(sourceUrl, newText, sourceCategory(sourceUrl))
        );
        const label = pathLabel(sourceUrl);
        for (const item of extractIntelFromText(newText, label)) {
          intelBuffer.push({
            category: item.category,
            title: item.title,
            detail: item.detail,
            amount: item.amount,
            source_url: sourceUrl,
            source_label: label,
            scraped_at: new Date().toISOString(),
          });
        }
        steps.push(`Indexed ${label}`);
      } catch {
        steps.push(`Skipped unreachable: ${pathLabel(sourceUrl)}`);
        continue;
      }

      const prev = await getSnapshot(companyId, sourceUrl);
      const prevText = prev?.raw_text ?? null;
      let detected = detectPageChange(sourceUrl, prevText, newText, company.name);
      const nowIso = new Date().toISOString();

      // Hand real diffs to the agent that owns this page. Baselines are skipped
      // — there is nothing to compare yet, and it would burn free-tier quota on
      // every source during onboarding.
      if (detected && !detected.is_baseline && prevText) {
        const analysis = await analyzePageChange({
          sourceUrl,
          oldText: prevText,
          newText,
          companyName: company.name,
        });
        if (analysis) {
          detected = applyAgentAnalysis(detected, analysis);
          agentRuns.push(analysis.agentLabel);
          costUsd += calculateCost(
            analysis.usage.model,
            analysis.usage.inputTokens,
            analysis.usage.outputTokens
          );
          steps.push(
            `${analysis.agentLabel}: ${analysis.signals.length} signal(s) on ${pathLabel(sourceUrl)}`
          );
        }
      }

      if (detected) {
        pendingChanges.push({
          company_id: companyId,
          source_url: sourceUrl,
          source_label: pathLabel(sourceUrl),
          change_type: detected.change_type,
          title: detected.title,
          summary: detected.summary,
          bullets: detected.bullets,
          severity: detected.severity,
          is_baseline: detected.is_baseline,
          hash_before: detected.hash_before,
          hash_after: detected.hash_after,
          detected_at: nowIso,
        });
        changesFound++;

        if (detected.is_baseline) {
          steps.push(`Snapshot: baseline stored for ${pathLabel(sourceUrl)}`);
        } else {
          steps.push(`Changes: ${detected.change_type} update on ${pathLabel(sourceUrl)}`);
          changeSummaries.push({
            type: detected.change_type as DetectedSignal["type"],
            title: detected.title,
            detail: detected.summary,
            severity: detected.severity === "high" ? "high" : "med",
          });
        }
      }

      await saveSnapshot({
        company_id: companyId,
        source_url: sourceUrl,
        content_hash: hashNormalizedContent(newText),
        raw_text: newText,
        fetched_at: nowIso,
      });

      if (isDocumentUrl(sourceUrl) || /sec|investor|filing|annual|10-k/i.test(newText)) {
        const docs = await fetchAndExtractDocuments(sourceUrl, company.name, newText);
        if (docs.length > 0) {
          await upsertDocuments(
            docs.map((d) => ({
              company_id: companyId,
              title: d.title,
              doc_type: d.docType,
              category: d.category,
              url: d.url,
              excerpt: d.excerpt,
              scraped_at: nowIso,
            }))
          );
          documentsFound += docs.length;
          for (const d of docs) documentTypes.add(d.docType);
          steps.push(`Documents: ${docs.length} filing(s) on ${pathLabel(sourceUrl)}`);
        }
      }

      if (isNewsletterUrl(sourceUrl)) {
        const posts = await extractNewsletterPosts(sourceUrl, company.name);
        if (posts.length > 0) {
          const received = formatLogTime(new Date());
          await upsertNewsletters(
            posts.map((p) => ({
              company_id: companyId,
              name: `${company.name} — Blog`,
              subject: p.excerpt.slice(0, 120),
              url: p.url,
              excerpt: p.excerpt,
              changes: [p.excerpt],
              received: received.date,
              scraped_at: nowIso,
            }))
          );
          newslettersFound += posts.length;
          steps.push(`Newsletter: ${posts.length} post(s) from ${pathLabel(sourceUrl)}`);
        }
      }

      if (isCareersUrl(sourceUrl)) {
        const moves = extractInsiderFromCareers(newText, company.name);
        if (moves.length > 0) {
          await upsertInsiderMoves(
            moves.map((m) => ({
              company_id: companyId,
              person: m.person,
              role: m.role,
              move_type: m.moveType,
              note: m.note,
              date: formatLogTime(new Date()).date,
              scraped_at: nowIso,
            }))
          );
          insiderMovesFound += moves.length;
          steps.push(`Insider intel: ${moves.length} org movement(s) from careers`);
        }
      }
    }

    if (pendingChanges.length > 0) {
      await saveChanges(pendingChanges);
    }

    const realChanges = pendingChanges.filter((c) => !c.is_baseline).length;
    steps.push(`Analytics: ${sourcesScraped} pages snapshotted · ${realChanges} change(s) detected`);

    if (agentRuns.length > 0) {
      const byAgent = agentRuns.reduce<Record<string, number>>((acc, label) => {
        acc[label] = (acc[label] ?? 0) + 1;
        return acc;
      }, {});
      const summary = Object.entries(byAgent)
        .map(([label, n]) => `${label} ×${n}`)
        .join(", ");
      steps.push(`Agents: ${summary}`);
    } else if (realChanges > 0 && !aiEnabled()) {
      steps.push(`Agents: skipped — no LLM backend configured`);
    }

    if (reachableSources.length > 0 && reachableSources.length !== company.sources.length) {
      await updateCompany(companyId, { sources: reachableSources });
      steps.push(`Sources: pruned to ${reachableSources.length} reachable URL(s)`);
    }

    const seenIntel = new Set<string>();
    const uniqueIntel = intelBuffer.filter((h) => {
      const key = h.detail.slice(0, 80).toLowerCase();
      if (seenIntel.has(key)) return false;
      seenIntel.add(key);
      return true;
    });
    const savedIntel = await replaceIntelHighlights(companyId, uniqueIntel);
    if (savedIntel.length > 0) {
      steps.push(`Intel: ${savedIntel.length} financial & activity signal(s) transcribed`);
    }

    const highlightPayload = savedIntel.map((h) => ({
      category: h.category,
      title: h.title,
      detail: h.detail,
      amount: h.amount,
    }));

    if (sourcesScraped > 0) {
      if (realChanges === 0 || changeSummaries.length === 0) {
        const intelBrief = await buildIntelBrief({
          companyName: company.name,
          domain: company.domain,
          pages: scrapedPages,
          documentCount: documentsFound,
          documentTypes: Array.from(documentTypes),
          secForms,
          newsletterCount: newslettersFound,
          insiderCount: insiderMovesFound,
          highlights: highlightPayload,
        });
        lastBrief = { title: intelBrief.title, body: intelBrief.body };
        await saveBrief({
          company_id: companyId,
          title: intelBrief.title,
          body: intelBrief.body,
          confidence: intelBrief.confidence,
          sources: sourcesScraped,
          created_at: new Date().toISOString(),
        });
        briefGenerated = true;
        steps.push(`Brief: baseline intel summary (${sourcesScraped} sources, ${documentsFound} docs)`);
      } else if (aiEnabled()) {
        try {
          const brief = await generateBrief(changeSummaries, company.name, "claude-sonnet");
          lastBrief = { title: brief.title, body: brief.body };
          await saveBrief({
            company_id: companyId,
            title: brief.title,
            body: brief.body,
            confidence: 78,
            sources: sourcesScraped,
            created_at: new Date().toISOString(),
          });
          // Was a flat 0.01 guess; use the real token usage so free-tier runs cost 0.
          costUsd += calculateCost(
            brief.usage.model,
            brief.usage.inputTokens,
            brief.usage.outputTokens
          );
          briefGenerated = true;
          steps.push(`Brief: change summary generated (${realChanges} updates)`);
        } catch {
          const intelBrief = await buildIntelBrief({
            companyName: company.name,
            domain: company.domain,
            pages: scrapedPages,
            documentCount: documentsFound,
            documentTypes: Array.from(documentTypes),
            secForms,
            newsletterCount: newslettersFound,
            insiderCount: insiderMovesFound,
            highlights: highlightPayload,
          });
          lastBrief = { title: intelBrief.title, body: intelBrief.body };
          await saveBrief({
            company_id: companyId,
            title: intelBrief.title,
            body: intelBrief.body,
            confidence: intelBrief.confidence,
            sources: sourcesScraped,
            created_at: new Date().toISOString(),
          });
          briefGenerated = true;
          steps.push(`Brief: summary written from indexed pages`);
        }
      } else {
        const summaryBody = changeSummaries.map((c) => c.detail).join(" ");
        lastBrief = { title: `${company.name} — Intel Update`, body: summaryBody };
        await saveBrief({
          company_id: companyId,
          title: `${company.name} — Intel Update`,
          body: summaryBody,
          confidence: 65,
          sources: sourcesScraped,
          created_at: new Date().toISOString(),
        });
        briefGenerated = true;
        steps.push(`Brief: change summary saved`);
      }
    }

    const findings = newslettersFound + documentsFound + insiderMovesFound + realChanges;
    const elapsed = Date.now() - started;
    const now = new Date();
    const { date, time } = formatLogTime(now);

    await addScanLog({
      company_id: companyId,
      date,
      time,
      watch: `${company.name} — FULL SCAN`,
      findings,
      ms: `${(elapsed / 1000).toFixed(1)}s`,
      cost: `$${costUsd.toFixed(2)}`,
      created_at: now.toISOString(),
    });

    await updateCompany(companyId, {
      status: "live",
      last_scraped_at: now.toISOString(),
      pages_indexed: sourcesScraped,
      spend_usd: company.spend_usd + costUsd,
    });

    steps.push(`Watchlist: ${company.name} is live — ${findings} intel items indexed`);
    steps.push(`Done — open Overview or Changes Feed to review`);

    const nowIso = now.toISOString();
    if (briefGenerated && lastBrief) {
      await dispatchEvent({
        id: eventId(),
        type: "brief.created",
        created_at: nowIso,
        pipeline_version: pipelineVersion(),
        data: {
          target: company.name,
          title: lastBrief.title,
          body: lastBrief.body,
          source: "company",
          company_id: companyId,
          signal_count: realChanges,
          url: `${appBaseUrl()}/preview`,
        },
      });
    }

    await dispatchEvent({
      id: eventId(),
      type: "company.scrape.completed",
      created_at: nowIso,
      pipeline_version: pipelineVersion(),
      data: {
        company_id: companyId,
        company_name: company.name,
        domain: company.domain,
        sources_scraped: sourcesScraped,
        changes: realChanges,
        brief_generated: briefGenerated,
      },
    });

    return {
      ok: true,
      steps,
      newslettersFound,
      documentsFound,
      insiderMovesFound,
      changesFound: realChanges,
      sourcesScraped,
      briefGenerated,
    };
  } catch (err) {
    await updateCompany(companyId, { status: "live" });
    const message = err instanceof Error ? err.message : "Index run failed";
    steps.push(`Error: ${message}`);
    return { ok: false, error: message, steps };
  }
}

export async function rediscoverCompany(companyId: string): Promise<Company | null> {
  const company = await getCompany(companyId);
  if (!company) return null;
  const discovered = await discoverCompanyUrls(company.input || company.domain);
  return updateCompany(companyId, {
    sources: discovered.sources,
    domain: discovered.domain,
    name: discovered.name,
  });
}
