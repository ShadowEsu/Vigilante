export interface SlackMessage {
  text: string;
  channel?: string;
  blocks?: unknown[];
}

export function formatBriefSlackMessage(opts: {
  target: string;
  title: string;
  body: string;
  signalCount?: number;
  url?: string;
}): SlackMessage {
  const preview = opts.body.length > 400 ? `${opts.body.slice(0, 397)}…` : opts.body;
  const lines = [
    `*${opts.title}*`,
    `Target: *${opts.target}*`,
    opts.signalCount != null ? `Signals: ${opts.signalCount}` : null,
    preview,
    opts.url ? `<${opts.url}|Open in Vigilante>` : null,
  ].filter(Boolean);

  return { text: lines.join("\n") };
}

export async function postSlackWebhook(webhookUrl: string, message: SlackMessage): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: message.text,
      ...(message.channel ? { channel: message.channel } : {}),
      ...(message.blocks ? { blocks: message.blocks } : {}),
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(errText || `Slack HTTP ${res.status}`);
  }
}
