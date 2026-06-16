"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJson } from "./api";

const AMBER = "#E3B341";
const DIM = "rgba(255,255,255,0.45)";
const WHITE = "rgba(255,255,255,0.92)";

type Phase = "input" | "searching" | "confirm" | "running" | "done";

interface TerminalLine {
  id: string;
  kind: "system" | "user" | "status" | "error";
  text: string;
  /** partial text while typewriter is running */
  display?: string;
  typing?: boolean;
}

interface DiscoverResult {
  name: string;
  domain: string;
  sources: string[];
}

export type { DiscoverResult };

interface TerminalSearchProps {
  compact?: boolean;
  /** Website demo — real discovery, simulated pipeline (no workspace writes). */
  demo?: boolean;
  /** Hide window chrome when embedded in launch browser frame. */
  embed?: boolean;
  onComplete?: (companyId: string, domain: string) => void;
  onDemoComplete?: (discovered: DiscoverResult) => void;
  onRefresh?: () => Promise<void>;
}

const PROMPT = "vigilante@intel";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function shortSourceLabel(url: string) {
  try {
    const u = new URL(url);
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${u.hostname}${path}`;
  } catch {
    return url;
  }
}

export function TerminalSearch({
  compact,
  demo = false,
  embed = false,
  onComplete,
  onDemoComplete,
  onRefresh,
}: TerminalSearchProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "boot",
      kind: "system",
      text: demo
        ? "Vigilante intel monitor v1.0 — type any company or URL for a live demo"
        : compact
          ? "Vigilante intel monitor v1.0 — type a company or URL"
          : "Vigilante intel monitor v1.0 — ready",
    },
  ]);
  const [phase, setPhase] = useState<Phase>("input");
  const [input, setInput] = useState("");
  const [discovered, setDiscovered] = useState<DiscoverResult | null>(null);
  const [pendingInput, setPendingInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollBottom = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = body.scrollHeight;
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [lines, phase, scrollBottom]);

  useEffect(() => {
    if (phase === "input" || phase === "confirm" || phase === "done") {
      try {
        inputRef.current?.focus({ preventScroll: true });
      } catch {
        inputRef.current?.focus();
      }
    }
  }, [phase]);

  const typeLine = useCallback(
    async (kind: TerminalLine["kind"], fullText: string, charMs = compact ? 8 : 12) => {
      const id = `${Date.now()}-${Math.random()}`;
      setLines((prev) => [...prev, { id, kind, text: fullText, display: "", typing: true }]);
      setIsTyping(true);
      for (let i = 1; i <= fullText.length; i++) {
        const slice = fullText.slice(0, i);
        setLines((prev) =>
          prev.map((l) => (l.id === id ? { ...l, display: slice } : l))
        );
        if (i % 3 === 0) scrollBottom();
        await sleep(charMs);
      }
      setLines((prev) =>
        prev.map((l) => (l.id === id ? { ...l, display: fullText, typing: false } : l))
      );
      setIsTyping(false);
      scrollBottom();
    },
    [compact, scrollBottom]
  );

  const pushInstant = useCallback((kind: TerminalLine["kind"], text: string) => {
    setLines((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, kind, text, display: text }]);
  }, []);

  const runDemoPipeline = useCallback(
    async (target: DiscoverResult) => {
      setPhase("running");
      await typeLine("status", "starting intel pipeline…");
      await sleep(320);
      await typeLine("status", `indexing ${target.sources.length} mapped sources…`);

      for (const url of target.sources.slice(0, 5)) {
        await typeLine("status", `indexed ${shortSourceLabel(url)}`, compact ? 6 : 8);
      }
      if (target.sources.length > 5) {
        await typeLine("status", `+ ${target.sources.length - 5} more sources queued`);
      }

      const hasInvestor = target.sources.some((s) => /investor|ir\/|sec\.gov|edgar|10-k|governance/i.test(s));
      if (hasInvestor) {
        await typeLine("status", "SEC: checking EDGAR filings…");
      }
      await typeLine("status", "intel: transcribing financial & corporate signals…");
      await typeLine(
        "system",
        demo
          ? `done — ${target.name} watchlist preview ready. check Overview, Insights, and Brief tabs.`
          : `done — target indexed. open Overview to review.`
      );
      setPhase("done");
      onDemoComplete?.(target);
    },
    [compact, demo, onDemoComplete, typeLine]
  );

  const runPipeline = useCallback(
    async (rawInput: string) => {
      setPhase("running");
      await typeLine("status", "starting intel pipeline…");

      try {
        const { ok, data } = await fetchJson<{ error?: string; steps?: string[]; run?: { steps?: string[] }; company?: { id: string; domain: string } }>(
          "/api/companies",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: rawInput }),
          }
        );
        if (!ok) throw new Error(data.error ?? "Pipeline failed");

        const steps: string[] = data.steps ?? data.run?.steps ?? [];
        for (const step of steps) {
          await typeLine("status", step, compact ? 6 : 10);
        }

        await typeLine("system", "done — target indexed. open Overview to review.");
        await onRefresh?.();
        setPhase("done");
        if (data.company?.id) onComplete?.(data.company.id, data.company.domain);
      } catch (err) {
        await typeLine("error", err instanceof Error ? err.message : "pipeline failed");
        setPhase("input");
      }
    },
    [compact, onComplete, onRefresh, typeLine]
  );

  const handleSubmit = useCallback(async () => {
    const val = input.trim();
    if (!val || isTyping) return;

    if (phase === "confirm") {
      const answer = val.toLowerCase();
      pushInstant("user", `${PROMPT} ~ % ${val}`);
      setInput("");
      if (answer === "yes" || answer === "y") {
        if (discovered) {
          if (demo) await runDemoPipeline(discovered);
          else await runPipeline(pendingInput);
        }
      } else if (answer === "no" || answer === "n") {
        await typeLine("status", "cancelled — enter another target");
        setDiscovered(null);
        setPhase("input");
      } else {
        await typeLine("status", "type yes or no");
      }
      return;
    }

    if (phase !== "input" && phase !== "done") return;

    pushInstant("user", `${PROMPT} ~ % ${val}`);
    setPendingInput(val);
    setInput("");
    setPhase("searching");
    await typeLine("status", "resolving domain and mapping sources…");

    try {
      const { ok, data } = await fetchJson<{
        error?: string;
        name: string;
        domain: string;
        sources?: string[];
      }>("/api/companies/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: val }),
      });
      if (!ok) throw new Error(data.error ?? "Discovery failed");
      setDiscovered({ name: data.name, domain: data.domain, sources: data.sources ?? [] });
      await typeLine("status", `target: ${data.name} (${data.domain})`);
      await typeLine("status", `${data.sources?.length ?? 0} URLs queued — pricing, careers, blog, investor`);
      await typeLine("system", "confirm target? (yes/no)");
      setPhase("confirm");
    } catch (err) {
      await typeLine("error", err instanceof Error ? err.message : "discovery failed");
      setPhase("input");
    }
  }, [demo, discovered, input, isTyping, pendingInput, phase, pushInstant, runDemoPipeline, runPipeline, typeLine]);

  const lineColor = (kind: TerminalLine["kind"]) => {
    if (kind === "status") return AMBER;
    if (kind === "error") return "#FC8C8C";
    if (kind === "user") return WHITE;
    return DIM;
  };

  const showInput = phase === "input" || phase === "confirm" || phase === "done";
  const title = compact ? "vigilante — monitor" : "vigilante@intel — zsh";

  return (
    <div
      className={`vigil-terminal ${embed ? "vigil-terminal--embed" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        height: compact ? "auto" : "100%",
        minHeight: compact ? 220 : embed ? 340 : undefined,
        maxHeight: compact ? 300 : embed ? 420 : undefined,
        fontSize: compact ? 10.5 : 12.5,
        lineHeight: 1.6,
        overflow: "hidden",
      }}
    >
      {!embed && (
        <div className="vigil-terminal-chrome">
          <span className="vigil-terminal-dot" style={{ background: "#ff5f57" }} />
          <span className="vigil-terminal-dot" style={{ background: "#febc2e" }} />
          <span className="vigil-terminal-dot" style={{ background: "#28c840" }} />
          <span style={{ flex: 1, textAlign: "center", fontSize: compact ? 9 : 10, color: DIM, letterSpacing: "0.06em" }}>
            {title}
          </span>
          <span style={{ width: 42 }} />
        </div>
      )}

      <div
        ref={bodyRef}
        className="vigil-terminal-body scrollthin"
        style={{ flex: 1, overflow: "auto", padding: compact ? "10px 12px 12px" : "16px 18px 18px" }}
        onClick={() => {
          try {
            inputRef.current?.focus({ preventScroll: true });
          } catch {
            inputRef.current?.focus();
          }
        }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={line.typing ? undefined : "vigil-terminal-line-typed"}
            style={{
              color: lineColor(line.kind),
              marginBottom: 3,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {line.kind === "status" && (
              <span style={{ color: DIM, marginRight: 6 }}>[</span>
            )}
            {line.display ?? line.text}
            {line.kind === "status" && (
              <span style={{ color: DIM, marginLeft: 6 }}>]</span>
            )}
          </div>
        ))}

        {showInput && (
          <div className="vigil-terminal-input-line">
            <span className="vigil-terminal-prompt">{PROMPT} ~ %</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={phase === "confirm" ? "yes / no" : phase === "done" ? "new target…" : "stripe.com"}
              disabled={isTyping}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              style={{ color: WHITE, marginLeft: 6, caretColor: WHITE }}
            />
          </div>
        )}

        {phase === "running" && !showInput && (
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 6, color: AMBER }}>
            <span className="vigil-terminal-prompt" style={{ marginRight: 6 }}>{PROMPT}</span>
            <span style={{ animation: "scanBeat 1.2s infinite" }}>running pipeline</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {phase === "done" && !compact && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            type="button"
            onClick={() => {
              setLines([{ id: "boot", kind: "system", text: "Enter another company name or website", display: "Enter another company name or website" }]);
              setPhase("input");
              setDiscovered(null);
              setInput("");
            }}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "7px 14px",
              font: "inherit",
              fontSize: 10,
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.75)",
              cursor: "pointer",
            }}
          >
            [ NEW TARGET ]
          </button>
        </div>
      )}
    </div>
  );
}
