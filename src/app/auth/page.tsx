"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl, appPath, demoPath } from "@/lib/paths";

function AuthForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(err === "auth" ? "Sign-in link expired or invalid. Request a new one." : decodeURIComponent(err));
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = getAuthCallbackUrl();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="w-full max-w-xs space-y-6">
      <div>
        <Link href={appPath("/")} className="text-xs font-semibold tracking-[0.18em]">
          VIGILANTE
        </Link>
        <p className="text-[11px] text-muted mt-1 tracking-wide">magic link sign in</p>
      </div>

      {sent ? (
        <p className="text-xs text-dim">
          Check <span className="text-fg">{email}</span> for your sign-in link.
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
              autoComplete="email"
            />
          </div>
          {error && <p className="text-xs text-dim" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "…" : "[ CONTINUE ]"}
          </button>
        </form>
      )}

      <Link href={demoPath()} className="block text-[11px] text-muted hover:text-fg tracking-wide">
        demo →
      </Link>

      <p className="text-[10px] text-faint leading-relaxed tracking-wide">
        By continuing, you agree to our{" "}
        <Link href={appPath("/legal/terms")} className="text-muted hover:text-fg no-underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href={appPath("/legal/privacy")} className="text-muted hover:text-fg no-underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 font-mono"
      style={{ background: "#000", color: "rgba(255,255,255,0.92)" }}
    >
      <Suspense fallback={<div className="text-xs text-dim">Loading…</div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
