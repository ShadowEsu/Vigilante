import { createHmac } from "crypto";
import { AGENT_CONFIG } from "@/lib/agent/config";
import type { VigilanteEvent } from "./events";
import { formatBriefSlackMessage, postSlackWebhook } from "./slack";

function signingSecret(): string | null {
  const s = process.env.WEBHOOK_SIGNING_SECRET?.trim();
  return s || null;
}

function webhookUrl(): string | null {
  return process.env.WEBHOOK_URL?.trim() || null;
}

function slackWebhookUrl(): string | null {
  return process.env.VIGILANTE_SLACK_WEBHOOK_URL?.trim() || null;
}

function signBody(body: string): string | undefined {
  const secret = signingSecret();
  if (!secret) return undefined;
  return createHmac("sha256", secret).update(body).digest("hex");
}

/** Dispatch event to configured webhooks (non-blocking for callers). */
export async function dispatchEvent(event: VigilanteEvent): Promise<{ delivered: string[] }> {
  const delivered: string[] = [];
  const body = JSON.stringify(event);
  const signature = signBody(body);

  const genericUrl = webhookUrl();
  if (genericUrl) {
    try {
      const res = await fetch(genericUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Vigilante-Webhook/1.1",
          ...(signature ? { "X-Vigilante-Signature": signature } : {}),
        },
        body,
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) delivered.push("webhook");
    } catch {
      /* partner webhook optional */
    }
  }

  const slackUrl = slackWebhookUrl();
  if (slackUrl && event.type === "brief.created") {
    try {
      const msg = formatBriefSlackMessage({
        target: event.data.target,
        title: event.data.title,
        body: event.data.body,
        signalCount: event.data.signal_count,
        url: event.data.url,
      });
      await postSlackWebhook(slackUrl, msg);
      delivered.push("slack");
    } catch {
      /* slack optional */
    }
  }

  if (process.env.NODE_ENV === "development" && delivered.length === 0) {
    console.info("[vigilante:notify]", event.type, event.data);
  }

  return { delivered };
}

export function pipelineVersion(): string {
  return AGENT_CONFIG.pipeline;
}
