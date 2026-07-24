import { NextResponse } from "next/server";
import { AGENT_CONFIG } from "@/lib/agent/config";
import { aiEnabled, getLlmClient } from "@/lib/agent/llm-client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  if (!aiEnabled()) {
    return NextResponse.json(
      {
        error:
          "AI not configured — set ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN (FreeLLMAPI) or ANTHROPIC_API_KEY",
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      question?: string;
      context?: string;
      company?: string;
    };
    const question = body.question?.trim();
    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const client = getLlmClient()!;
    const model = AGENT_CONFIG.models.ask;
    const prompt = `You are Vigilante, a competitive intelligence analyst. Answer concisely in 2-4 sentences.
${body.company ? `Target company: ${body.company}` : ""}
${body.context ? `\nIndexed intel context:\n${body.context.slice(0, 6000)}` : ""}

Question: ${question}`;

    const response = await client.messages.create({
      model,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    return NextResponse.json({
      answer: text.trim(),
      model,
      tokens: response.usage.input_tokens + response.usage.output_tokens,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ask failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
