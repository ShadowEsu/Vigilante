"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TargetType } from "@/types/database";
import {
  CADENCE_OPTIONS,
  MODEL_OPTIONS,
  TARGET_TYPE_OPTIONS,
} from "@/types/database";
import { createAnalysis } from "@/app/actions/analysis";

interface NewAnalysisFormProps {
  redirectTo?: string;
}

export function NewAnalysisForm({ redirectTo = "/app" }: NewAnalysisFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await createAnalysis({
      name: form.get("name") as string,
      target_type: form.get("target_type") as TargetType,
      target: form.get("target") as string,
      source_url: form.get("source_url") as string,
      model: form.get("model") as string,
      budget_cap_usd: parseFloat(form.get("budget_cap_usd") as string),
      cadence_minutes: parseInt(form.get("cadence_minutes") as string, 10),
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-0 text-[13px]">
      <FormRow label="NAME">
        <input name="name" required placeholder="ACME CORP — PRICING" className="w-full" />
      </FormRow>
      <FormRow label="TARGET">
        <input name="target" required placeholder="Acme Corp" className="w-full" />
      </FormRow>
      <FormRow label="SOURCE URL">
        <div className="flex items-center gap-2 border-b border-edge pb-2 w-full">
          <span className="text-dim">&gt;</span>
          <input
            name="source_url"
            type="url"
            required
            placeholder="https://competitor.com/pricing"
            className="flex-1 border-none"
          />
        </div>
      </FormRow>
      <FormRow label="TYPE">
        <select name="target_type" required className="w-full border-b border-edge">
          {TARGET_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow label="CADENCE">
        <select name="cadence_minutes" required className="w-full border-b border-edge">
          {CADENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow label="BUDGET">
        <div className="flex items-center gap-2">
          <span className="text-dim">$</span>
          <input
            name="budget_cap_usd"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue="10"
            required
            className="w-16 text-center border-b border-edge"
          />
          <span className="text-muted">/ month</span>
        </div>
      </FormRow>
      <FormRow label="MODEL">
        <select name="model" required className="w-full border-b border-edge">
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormRow>

      {error && <p className="text-xs text-dim py-2">{error}</p>}

      <div className="flex items-center gap-4 pt-6">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "…" : "[ CREATE WATCH ]"}
        </button>
        <span className="text-[11px] text-faint tracking-wide">esc to cancel</span>
      </div>
    </form>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-6 py-4 border-b"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="w-[130px] text-[10px] tracking-[0.16em] text-muted pt-1 shrink-0">
        {label}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
