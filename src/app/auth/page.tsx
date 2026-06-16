"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSent(true);
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 font-mono"
      style={{ background: "#000", color: "rgba(255,255,255,0.92)" }}
    >
      <div className="w-full max-w-xs space-y-6">
        <div>
          <Link href="/" className="text-xs font-semibold tracking-[0.18em]">
            VIGILANTE
          </Link>
          <p className="text-[11px] text-muted mt-1 tracking-wide">magic link sign in</p>
        </div>

        {sent ? (
          <p className="text-xs text-dim">
            check <span className="text-fg">{email}</span>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-edge pb-2">
              <span className="text-dim">&gt;</span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 w-full border-none"
              />
            </div>
            {error && <p className="text-xs text-dim">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "…" : "[ CONTINUE ]"}
            </button>
          </form>
        )}

        <Link href="/preview" className="block text-[11px] text-muted hover:text-fg tracking-wide">
          demo →
        </Link>

        <p className="text-[10px] text-faint leading-relaxed tracking-wide">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" className="text-muted hover:text-fg no-underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="text-muted hover:text-fg no-underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
