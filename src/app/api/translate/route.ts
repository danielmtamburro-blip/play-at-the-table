import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

// English → Arabic for the venue dashboard. Signed-in venue owners only.
// Uses Claude when ANTHROPIC_API_KEY is set on the server; otherwise the free MyMemory service.

const MAX_FIELDS = 40;
const MAX_CHARS = 8000;

const SYSTEM = `You translate restaurant and café content from English into Modern Standard Arabic for guests in the UAE.
Keep it natural and concise, the way a Dubai restaurant would write it. Keep brand names, dish names that are usually left untranslated, prices, times and numbers as they are (use Western digits).
You receive a JSON object of id → English text. Reply with only a JSON object with the same ids mapped to the Arabic translations, and nothing else.`;

async function withClaude(texts: Record<string, string>): Promise<Record<string, string>> {
  const client = new Anthropic();
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: SYSTEM,
    messages: [{ role: "user", content: JSON.stringify(texts) }],
  });
  if (response.stop_reason === "refusal") throw new Error("The translation was declined.");
  const text = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const parsed = JSON.parse(json) as Record<string, unknown>;
  return Object.fromEntries(Object.keys(texts).map((k) => [k, typeof parsed[k] === "string" ? (parsed[k] as string) : ""]));
}

async function withMyMemory(texts: Record<string, string>): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await Promise.all(
    Object.entries(texts).map(async ([k, v]) => {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(v.slice(0, 480))}&langpair=en|ar`;
      const r = await fetch(url, { cache: "no-store" });
      const j = (await r.json()) as { responseData?: { translatedText?: string } };
      out[k] = j.responseData?.translatedText ?? "";
    }),
  );
  return out;
}

export async function POST(request: NextRequest) {
  const sb = await getServerClient();
  const user = sb ? (await sb.auth.getUser()).data.user : null;
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { texts?: Record<string, unknown> } | null;
  const texts = Object.fromEntries(
    Object.entries(body?.texts ?? {})
      .filter(([, v]) => typeof v === "string" && v.trim())
      .slice(0, MAX_FIELDS)
      .map(([k, v]) => [k.slice(0, 64), (v as string).trim()]),
  );
  if (!Object.keys(texts).length) return NextResponse.json({ translations: {} });
  if (Object.values(texts).join("").length > MAX_CHARS) return NextResponse.json({ error: "That's too much text at once." }, { status: 413 });

  try {
    const translations = process.env.ANTHROPIC_API_KEY ? await withClaude(texts) : await withMyMemory(texts);
    return NextResponse.json({ translations, engine: process.env.ANTHROPIC_API_KEY ? "claude" : "mymemory" });
  } catch (e) {
    console.error("translate", e);
    return NextResponse.json({ error: "Translation isn't available right now. Please type the Arabic or try again." }, { status: 502 });
  }
}
