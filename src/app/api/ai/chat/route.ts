import { NextRequest, NextResponse } from "next/server";

const SYSTEM_MESSAGES = {
  board: {
    role: "system" as const,
    content:
      "You are a senior football tactical analyst embedded in a tactical-board app. The user will share a JSON representation of their tactical board (players with positions, balls, drawings, arrows, formations, team configs). Analyze the setup and discuss formations, defensive/offensive shape, weaknesses, opportunities, and tactical improvements. Reference specific players by their numbers/names from the JSON when relevant. Be concise but insightful. Use markdown for structure when it helps.",
  },
  general: {
    role: "system" as const,
    content:
      "You are Tactix AI, a knowledgeable football tactical assistant. Help the user with formations, pressing schemes, set pieces, build-up patterns, player roles, match analysis, and any other football tactics question. Treat each new conversation as a clean slate with no prior context — only respond to what the user has explicitly asked in the current conversation. Be concise but insightful. Use markdown for structure when it helps.",
  },
} as const;

type Mode = keyof typeof SYSTEM_MESSAGES;

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const baseURL = process.env.LLM_BASE_URL;
  const apiKey = process.env.LLM_API_KEY;

  let body: { messages?: ClientMessage[]; mode?: Mode };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const mode: Mode = body.mode === "general" ? "general" : "board";
  const systemMessage = SYSTEM_MESSAGES[mode];

  const url = `${(baseURL ?? "").replace(/\/$/, "")}/chat/completions`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "gemini-2.0-flash",
        stream: true,
        messages: [
          systemMessage,
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });
  } catch (err) {
    console.error("[ai/chat] upstream fetch failed:", err);
    return NextResponse.json(
      { error: "Upstream AI service unreachable" },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    console.error("[ai/chat] upstream error:", upstream.status, text);
    return NextResponse.json(
      { error: text || `Upstream error ${upstream.status}` },
      { status: upstream.status },
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
