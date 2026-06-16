"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RunNowButtonProps {
  analysisId: string;
}

export function RunNowButton({ analysisId }: RunNowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    try {
      await fetch(`/api/analyses/${analysisId}/run`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRun}
      disabled={loading}
      className="bg-transparent border-none p-0 pl-3 font-mono text-[11px] cursor-pointer"
      style={{ color: loading ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)" }}
    >
      {loading ? "··· run" : "run →"}
    </button>
  );
}
