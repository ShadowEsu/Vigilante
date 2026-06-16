import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      webhookUrl?: string;
      channel?: string;
      message?: string;
      company?: string;
    };

    const webhookUrl = body.webhookUrl?.trim();
    if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com/")) {
      return NextResponse.json(
        { ok: false, error: "Valid Slack incoming webhook URL required (https://hooks.slack.com/...)" },
        { status: 400 }
      );
    }

    const text =
      body.message?.trim() ||
      `Vigilante test — competitive intel alerts for ${body.company ?? "your watchlist"} are configured.`;

    const payload: Record<string, unknown> = { text };
    if (body.channel?.trim()) {
      payload.channel = body.channel.trim();
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: errText || `Slack returned HTTP ${res.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Slack test failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
