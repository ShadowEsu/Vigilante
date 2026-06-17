"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { defaultPostAuthPath, appPath } from "@/lib/paths";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const supabase = createClient();
    const next =
      searchParams.get("next") ||
      searchParams.get("redirect") ||
      defaultPostAuthPath();

    async function finish() {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) {
          router.replace(`${appPath("/auth")}?error=${encodeURIComponent(error.message)}`);
          return;
        }
        router.replace(next);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace(`${appPath("/auth")}?error=${encodeURIComponent(error.message)}`);
          return;
        }
        router.replace(next);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.replace(`${appPath("/auth")}?error=auth`);
        return;
      }
      router.replace(next);
    }

    finish().catch((err) => {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setMessage(msg);
      router.replace(`${appPath("/auth")}?error=${encodeURIComponent(msg)}`);
    });
  }, [router, searchParams]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 font-mono"
      style={{ background: "#000", color: "rgba(255,255,255,0.92)" }}
    >
      <p className="text-sm text-dim">{message}</p>
      <Link href={appPath("/auth")} className="text-[11px] text-muted hover:text-fg">
        ← back to sign in
      </Link>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center font-mono" style={{ background: "#000" }}>
          <p className="text-sm text-dim">Signing you in…</p>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
