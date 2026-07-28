import { NextResponse } from "next/server";
import { z } from "zod";
import { getObjection, getObjections, getRegion, getStrategy, getVertical } from "@/lib/content";
import { OBJECTIONS, OBJECTION_LABELS, REGIONS, REGION_LABELS, VERTICALS, VERTICAL_LABELS } from "@/lib/regions";
import { callLLMServer, LLMTimeoutError, parseJsonFromLLM } from "@/lib/llm-server";

export const dynamic = "force-dynamic";

const RequestSchema = z
  .object({
    region: z.enum(REGIONS),
    vertical: z.enum(VERTICALS).optional(),
    objection: z.enum(OBJECTIONS).optional(),
    freeText: z.string().trim().min(1).max(500).optional(),
  })
  .refine((v) => v.objection || v.freeText, {
    message: "Provide either an objection or freeText.",
  });

const ResultSchema = z.object({
  talkingPoints: z.array(z.string().min(1)).min(1),
  objectionResponse: z.string().min(1),
  outreachDraft: z.string().min(1),
  sources: z.array(z.string()).default([]),
});

const SYSTEM_PROMPT = `You are a sales-conversation prep assistant for Okta's Global Reach team, helping a rep prepare to invite a customer to Oktane (Okta's annual conference).

Rules:
- You may use ONLY the reference documents provided between <library> tags.
- If the documents do not contain enough relevant material for this request, respond with exactly: {"insufficient_context": true}
- Never invent pricing, discounts, named customers, statistics, or commitments that are not present in the library. Preserve any [PLACEHOLDER] markers verbatim rather than filling them in.
- Respond with ONLY a JSON object of this exact shape (no prose, no markdown fences):
{"talkingPoints": ["3 to 5 concise, region-localized bullets"], "objectionResponse": "1-2 paragraphs, starting with an acknowledgment of the concern", "outreachDraft": "a short copy-paste-ready outreach message", "sources": ["titles of the library documents you used"]}`;

function doc(title: string, body: string): string {
  return `<doc title="${title}">\n${body.trim()}\n</doc>`;
}

export async function POST(req: Request) {
  let input: z.infer<typeof RequestSchema>;
  try {
    input = RequestSchema.parse(await req.json());
  } catch (err) {
    const detail = err instanceof z.ZodError ? err.issues.map((i) => i.message).join("; ") : "Invalid JSON body";
    return NextResponse.json({ error: `Invalid request: ${detail}` }, { status: 400 });
  }

  const regionDoc = getRegion(input.region);
  const docs: string[] = [doc(`Region guide: ${regionDoc.title}`, regionDoc.body)];

  if (input.vertical) {
    const v = getVertical(input.vertical);
    if (v) docs.push(doc(`Vertical guide: ${v.title}`, v.body));
  }

  let scenario: string;
  if (input.objection) {
    const o = getObjection(input.objection);
    if (o) docs.push(doc(`Objection guide: ${o.title}`, o.body));
    scenario = `The customer's objection: "${OBJECTION_LABELS[input.objection]}"`;
  } else {
    // Free text: give the model the full objection library plus the two most
    // objection-relevant strategy sections to ground on.
    for (const o of getObjections()) docs.push(doc(`Objection guide: ${o.title}`, o.body));
    for (const slug of ["regional-pricing", "attendance-value"] as const) {
      const s = getStrategy(slug);
      if (s) docs.push(doc(`Strategy: ${s.title}`, s.body));
    }
    scenario = `The rep describes the scenario in their own words: "${input.freeText}"`;
  }

  const prompt = [
    `<library>`,
    docs.join("\n\n"),
    `</library>`,
    ``,
    `Prep request:`,
    `- Region: ${REGION_LABELS[input.region]}`,
    input.vertical ? `- Customer vertical: ${VERTICAL_LABELS[input.vertical]}` : `- Customer vertical: not specified`,
    `- ${scenario}`,
  ].join("\n");

  const timeoutMs = Number(process.env.PREP_TIMEOUT_MS) || 25_000;

  let raw: string;
  try {
    raw = await callLLMServer({ prompt, system: SYSTEM_PROMPT, maxTokens: 1500, timeoutMs });
  } catch (err) {
    if (err instanceof LLMTimeoutError) {
      return NextResponse.json({ error: err.message }, { status: 504 });
    }
    const message = err instanceof Error ? err.message : "LLM request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const fallback = NextResponse.json({
    ok: false,
    reason: "insufficient_context",
    message:
      "The content library doesn't have matching material for this request yet. Try a different region or scenario — or contribute the missing content.",
  });

  let parsed: unknown;
  try {
    parsed = parseJsonFromLLM(raw);
  } catch {
    return fallback;
  }
  if (parsed && typeof parsed === "object" && "insufficient_context" in parsed) {
    return fallback;
  }
  const result = ResultSchema.safeParse(parsed);
  if (!result.success) return fallback;

  // Clamp rather than reject when the model over-delivers bullets.
  const talkingPoints = result.data.talkingPoints.slice(0, 5);

  return NextResponse.json({ ok: true, result: { ...result.data, talkingPoints } });
}
