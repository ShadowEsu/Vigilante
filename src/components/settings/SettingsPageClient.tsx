"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SettingsPageView } from "@/components/settings/SettingsPageView";

export function SettingsPageClient({ email }: { email?: string }) {
  const [resolvedEmail, setResolvedEmail] = useState(email);

  useEffect(() => {
    if (!email) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) setResolvedEmail(data.user.email);
      });
    }
  }, [email]);

  return <SettingsPageView email={resolvedEmail} />;
}
