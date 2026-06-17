import { NextResponse } from "next/server";
import { postSlackWebhook } from "@/lib/integrations/slack";

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

    await postSlackWebhook(webhookUrl, {
      text,
      ...(body.channel?.trim() ? { channel: body.channel.trim() } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Slack test failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
