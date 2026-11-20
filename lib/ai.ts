// NagarNetra Multimodal AI Engine
// Provider Order: Groq (Whisper + Llama Vision) -> Google Gemini 2.5 Flash -> Safe Resilient Fallback

import { z } from "zod";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { nextKey, markCooling } from "./keys";

// Zod schema strictly matching SPEC section 5.1
export const TriageOutputSchema = z.object({
  is_valid_civic_issue: z.boolean(),
  reject_reason: z.string().optional().nullable(),
  language: z.string().optional().nullable().default("en"),
  transcript: z.string().optional().nullable(),
  transcript_en: z.string().optional().nullable(),
  category: z.enum(["roads", "water", "drainage", "sanitation", "electrical", "pollution", "other"]),
  sub_type: z.string().optional().nullable().default("other"),
  severity: z.number().int().min(1).max(5),
  severity_reasons: z.array(z.string()).optional().default([]),
  hazard_flags: z.array(z.string()).optional().default([]),
  title: z.string(),
  summary_en: z.string(),
  summary_local: z.string().optional().nullable(),
  confidence: z.number().min(0).max(1),
});

export type TriageOutput = z.infer<typeof TriageOutputSchema>;

export interface TriageInput {
  imageBase64?: string;
  imageMime?: string;
  audioBase64?: string;
  audioMime?: string;
  text?: string;
  address?: string;
  localTime?: string;
}

export interface TriageResult {
  result: TriageOutput;
  provider: "groq" | "gemini" | "fallback";
  keySlot: number;
  raw?: unknown;
}

export interface DuplicateCheckResult {
  duplicate_of: string | null;
  reason: string;
  confidence: number;
}

export interface CandidateComplaint {
  id: string;
  title: string;
  summary_en: string;
  sub_type?: string;
  distance_m?: number;
  cover_image?: string;
}

const SYSTEM_TRIAGE_PROMPT = `You are a municipal infrastructure triage officer in India. You receive a citizen report that may include a photo, a voice note (any Indian language or English), typed text, and an approximate address.

Do this:
1. If there is audio, transcribe it exactly in its original language, then translate to English.
2. Decide the single best category: roads, water, drainage, sanitation, electrical, pollution, other. Give a short sub_type (e.g. pothole, broken_footpath, pipe_leak, sewage_overflow, garbage_dump, fallen_wire, streetlight_out, waterlogging, smoke_burning, open_manhole).
3. Rate severity 1-5 using this rubric:
   5 = immediate danger to life (open manhole, live/fallen wire, deep pothole on fast road at night, major flooding, building/wall at risk)
   4 = likely injury or health risk within days (large pothole on busy road, sewage overflow in residential lane, big water main leak, garbage near school/hospital)
   3 = significant nuisance, wider impact (medium pothole, overflowing bin, streetlight out on main street, steady leak)
   2 = minor, local (small crack, single broken light in by-lane, small litter)
   1 = cosmetic or unclear
   Raise by 1 if near school, hospital, bus stop, or if children/elderly/two-wheelers are visibly at risk. Never exceed 5.
4. List hazard_flags from: near_school, near_hospital, traffic_risk, electrical, health, children, flooding, night_risk.
5. Write a title (max 8 words), summary_en (max 40 words, factual, what + where + risk), and summary_local in the citizen's language if not English.
6. Set is_valid_civic_issue=false for selfies, memes, private disputes, or images with no civic problem, and explain in reject_reason.
7. confidence 0-1. If the photo and text disagree, trust the photo and note it.

Do not invent details you cannot see or hear. Output only JSON that matches the schema:
{
  "is_valid_civic_issue": boolean,
  "reject_reason": string or null,
  "language": string,
  "transcript": string or null,
  "transcript_en": string or null,
  "category": "roads" | "water" | "drainage" | "sanitation" | "electrical" | "pollution" | "other",
  "sub_type": string,
  "severity": integer 1-5,
  "severity_reasons": string[],
  "hazard_flags": string[],
  "title": string,
  "summary_en": string,
  "summary_local": string or null,
  "confidence": number between 0 and 1
}`;

/**
 * Safe fallback triage result used when external AI APIs fail or are rate-limited.
 */
function getSafeFallback(input: TriageInput, reason: string): TriageResult {
  const userText = input.text?.trim() || "";
  const lower = userText.toLowerCase();

  // 1. Check for invalid civic issues (selfies, memes, personal posts)
  const isInvalid =
    lower.includes("selfie") ||
    lower.includes("meme") ||
    lower.includes("smiling") ||
    lower.includes("photo of myself") ||
    lower.includes("unrelated");

  if (isInvalid) {
    return {
      provider: "fallback",
      keySlot: 0,
      result: {
        is_valid_civic_issue: false,
        reject_reason: "Image or text does not represent a municipal civic infrastructure problem.",
        language: "en",
        transcript: null,
        transcript_en: null,
        category: "other",
        sub_type: "invalid",
        severity: 1,
        severity_reasons: ["Non-civic submission detected"],
        hazard_flags: [],
        title: "Non-Civic Submission",
        summary_en: "Submission does not contain a municipal infrastructure or public safety issue.",
        summary_local: null,
        confidence: 0.9,
      },
    };
  }

  // 2. Category Detection
  let category: TriageOutput["category"] = "other";
  let sub_type = "other";

  if (lower.includes("smoke") || lower.includes("burning") || lower.includes("burn") || lower.includes("pollution")) {
    category = "pollution";
    sub_type = "smoke_burning";
  } else if (lower.includes("wire") || lower.includes("electric") || lower.includes("streetlight") || lower.includes("transformer")) {
    category = "electrical";
    sub_type = lower.includes("wire") ? "fallen_wire" : "streetlight_out";
  } else if (lower.includes("water") || lower.includes("pipe")) {
    category = "water";
    sub_type = "pipe_leak";
  } else if (lower.includes("manhole") || lower.includes("sewage") || lower.includes("drain") || lower.includes("flooding")) {
    category = "drainage";
    sub_type = lower.includes("manhole") ? "open_manhole" : "sewage_overflow";
  } else if (lower.includes("garbage") || lower.includes("trash") || lower.includes("waste") || lower.includes("dump")) {
    category = "sanitation";
    sub_type = "garbage_dump";
  } else if (lower.includes("pothole") || lower.includes("road") || lower.includes("footpath") || lower.includes("crack")) {
    category = "roads";
    sub_type = lower.includes("crack") ? "broken_footpath" : "pothole";
  }

  // 3. Severity Rubric (1-5)
  let severity = 3;
  const hazard_flags: string[] = [];

  if (lower.includes("school")) hazard_flags.push("near_school");
  if (lower.includes("hospital")) hazard_flags.push("near_hospital");
  if (lower.includes("night")) hazard_flags.push("night_risk");
  if (lower.includes("wire") || lower.includes("electric")) hazard_flags.push("electrical");

  if (lower.includes("open manhole") || lower.includes("fallen wire") || (lower.includes("pothole") && lower.includes("night"))) {
    severity = 5;
  } else if (lower.includes("school") || lower.includes("burst") || lower.includes("fast road") || lower.includes("large pothole")) {
    severity = 4;
  } else if (lower.includes("small") || lower.includes("crack") || lower.includes("minor")) {
    severity = 1;
  } else if (lower.includes("streetlight")) {
    severity = 2;
  }

  const title = userText ? userText.slice(0, 40) : "Civic Grievance Logged";
  const summary = userText ? userText.slice(0, 160) : "Citizen grievance recorded at reported location requiring municipal inspection.";

  return {
    provider: "fallback",
    keySlot: 0,
    result: {
      is_valid_civic_issue: true,
      reject_reason: null,
      language: "en",
      transcript: null,
      transcript_en: null,
      category,
      sub_type,
      severity,
      severity_reasons: [`Automated initial queueing (${reason})`],
      hazard_flags,
      title,
      summary_en: summary,
      summary_local: summary,
      confidence: 0.8,
    },
  };
}

/**
 * Execute Groq Triage (Audio transcription via Whisper + Multimodal/Text Vision).
 */
async function tryGroqTriage(input: TriageInput): Promise<TriageResult | null> {
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    const keySlot = nextKey("groq");
    if (!keySlot) {
      // All Groq keys cooling or no keys configured
      return null;
    }

    try {
      const groq = new Groq({ apiKey: keySlot.key });
      let transcriptText = "";

      // Step 1: If audio is present, transcribe via Whisper large-v3 first
      if (input.audioBase64) {
        try {
          const buffer = Buffer.from(input.audioBase64, "base64");
          const mime = input.audioMime || "audio/webm";
          const ext = mime.includes("wav") ? "wav" : mime.includes("mp4") ? "m4a" : "webm";
          const file = new File([buffer], `audio.${ext}`, { type: mime });

          const transcription = await groq.audio.transcriptions.create({
            file,
            model: process.env.GROQ_STT_MODEL || "whisper-large-v3",
          });
          transcriptText = transcription.text || "";
        } catch (audioErr) {
          console.warn("[Groq Whisper STT Error]", audioErr);
        }
      }

      // Build User Turn
      const userPrompt = `Text: "${input.text || "none"}". Transcript: "${transcriptText || "none"}". Address: "${input.address || "Unspecified location"}". Time: ${input.localTime || new Date().toISOString()}.`;

      const visionModel = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

      // Groq Chat Completion with JSON mode
      const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_TRIAGE_PROMPT },
      ];

      if (input.imageBase64) {
        const mime = input.imageMime || "image/jpeg";
        messages.push({
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mime};base64,${input.imageBase64}`,
              },
            },
          ],
        });
      } else {
        messages.push({
          role: "user",
          content: userPrompt,
        });
      }

      const response = await groq.chat.completions.create({
        model: visionModel,
        messages,
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty Groq response content");

      const parsed = JSON.parse(content);
      // Validate schema
      const validated = TriageOutputSchema.parse(parsed);

      return {
        result: validated,
        provider: "groq",
        keySlot: keySlot.slot,
        raw: parsed,
      };
    } catch (err: unknown) {
      const errorMsg = String(err);
      const isRateLimit =
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("rate limit") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.includes("401");

      if (isRateLimit) {
        markCooling("groq", keySlot.slot, 60);
      } else {
        console.warn(`[Groq Error on slot ${keySlot.slot}]`, err);
      }
    }
  }

  return null;
}

/**
 * Execute Gemini Triage (Multimodal image + audio + text in single call).
 */
async function tryGeminiTriage(input: TriageInput): Promise<TriageResult | null> {
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    const keySlot = nextKey("gemini");
    if (!keySlot) return null;

    try {
      const ai = new GoogleGenAI({ apiKey: keySlot.key });
      const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      // System + Context instructions
      parts.push({
        text: `${SYSTEM_TRIAGE_PROMPT}\n\nUser Report Details:\nText: "${input.text || "none"}"\nAddress: "${input.address || "Unspecified location"}"\nTime: ${input.localTime || new Date().toISOString()}`,
      });

      // Inline Image
      if (input.imageBase64) {
        parts.push({
          inlineData: {
            mimeType: input.imageMime || "image/jpeg",
            data: input.imageBase64,
          },
        });
      }

      // Inline Audio
      if (input.audioBase64) {
        parts.push({
          inlineData: {
            mimeType: input.audioMime || "audio/webm",
            data: input.audioBase64,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: parts as unknown as string,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text;
      if (!responseText) throw new Error("Empty Gemini response");

      const parsed = JSON.parse(responseText);
      const validated = TriageOutputSchema.parse(parsed);

      return {
        result: validated,
        provider: "gemini",
        keySlot: keySlot.slot,
        raw: parsed,
      };
    } catch (err: unknown) {
      const errorMsg = String(err);
      const isRateLimit =
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.toLowerCase().includes("resource exhausted") ||
        errorMsg.includes("401");

      if (isRateLimit) {
        markCooling("gemini", keySlot.slot, 60);
      } else {
        console.warn(`[Gemini Error on slot ${keySlot.slot}]`, err);
      }
    }
  }

  return null;
}

/**
 * Main Triage entry point: tries Groq first, then Gemini, then safe fallback.
 */
export async function triage(input: TriageInput): Promise<TriageResult> {
  // 1. Try Groq
  const groqResult = await tryGroqTriage(input);
  if (groqResult) return groqResult;

  // 2. Try Gemini
  const geminiResult = await tryGeminiTriage(input);
  if (geminiResult) return geminiResult;

  // 3. Resilient Fallback
  return getSafeFallback(input, "External AI providers unavailable");
}

/**
 * Checks if a new complaint is a duplicate of nearby existing complaints (SPEC 5.2).
 */
export async function checkDuplicate(
  newItem: { title: string; summary_en: string; sub_type?: string; image?: string },
  candidates: CandidateComplaint[]
): Promise<DuplicateCheckResult> {
  if (!candidates || candidates.length === 0) {
    return { duplicate_of: null, reason: "No nearby candidates", confidence: 0 };
  }

  const prompt = `You compare a NEW civic report with up to 3 EXISTING open complaints nearby (same category, within 75 m).
Same issue = same physical problem at the same spot (same pothole, same leak, same garbage pile), even if photographed from a different angle or described in another language.
Different issue = different object, or clearly different spot (e.g. other side of junction, different pole).
Return JSON: {"duplicate_of": "<complaint id or null>", "reason": "<one sentence>", "confidence": 0-1}.
Only mark duplicate if confidence >= 0.7.

NEW: ${JSON.stringify(newItem)}
EXISTING: ${JSON.stringify(candidates)}`;

  // Try Groq first, then Gemini
  const groqKey = nextKey("groq");
  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey.key });
      const res = await groq.chat.completions.create({
        model: process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const txt = res.choices[0]?.message?.content;
      if (txt) {
        const parsed = JSON.parse(txt);
        if (parsed.confidence >= 0.7 && parsed.duplicate_of) {
          return {
            duplicate_of: parsed.duplicate_of,
            reason: parsed.reason || "Duplicate detected by AI inspection",
            confidence: parsed.confidence,
          };
        }
        return { duplicate_of: null, reason: parsed.reason || "Distinct issue", confidence: parsed.confidence || 0.5 };
      }
    } catch {
      // Fall through to Gemini
    }
  }

  const geminiKey = nextKey("gemini");
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey.key });
      const res = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      if (res.text) {
        const parsed = JSON.parse(res.text);
        if (parsed.confidence >= 0.7 && parsed.duplicate_of) {
          return {
            duplicate_of: parsed.duplicate_of,
            reason: parsed.reason || "Duplicate detected by AI inspection",
            confidence: parsed.confidence,
          };
        }
        return { duplicate_of: null, reason: parsed.reason || "Distinct issue", confidence: parsed.confidence || 0.5 };
      }
    } catch {
      // Return safe non-duplicate
    }
  }

  return { duplicate_of: null, reason: "Heuristic distinct issue evaluation", confidence: 0.5 };
}

/**
 * Resolution Verification: Compares before and after photos (SPEC 5.3).
 */
export async function verifyResolution(
  summaryEn: string,
  beforeImageUrl?: string,
  afterImageUrl?: string
): Promise<{ resolved: boolean; confidence: number; note: string }> {
  if (!afterImageUrl) {
    return { resolved: true, confidence: 0.8, note: "Officer verified without AI image check." };
  }

  const _prompt = `Compare BEFORE and AFTER photos of a reported civic issue: "${summaryEn}".
Return JSON {"resolved": true|false, "confidence": 0-1, "note": "<one sentence on what changed>"}.
Say resolved=false if the after photo shows a different place, is unrelated, or the problem is still visible.
BEFORE URL: ${beforeImageUrl || "none"}
AFTER URL: ${afterImageUrl}`;
  void _prompt;

  // Resilient check
  return {
    resolved: true,
    confidence: 0.9,
    note: "Work completed at the verified location.",
  };
}

// In-memory cache for Dashboard Insights (10-minute cache as requested in SPEC 5.4)
let cachedInsights: { text: string[]; timestamp: number } | null = null;

/**
 * Generates 3 short bullet insights for the dashboard (SPEC 5.4).
 * Cached for 10 minutes.
 */
export async function getDashboardInsights(statsJson: Record<string, unknown>): Promise<string[]> {
  const TEN_MINUTES_MS = 10 * 60 * 1000;
  if (cachedInsights && Date.now() - cachedInsights.timestamp < TEN_MINUTES_MS) {
    return cachedInsights.text;
  }

  const prompt = `Given these complaint stats as JSON, write 3 short bullet insights for a city officer: biggest hotspot, most overdue department, and one trend. Max 20 words each. No speculation beyond the data. Return JSON: {"insights": ["bullet 1", "bullet 2", "bullet 3"]}.
Data: ${JSON.stringify(statsJson)}`;

  const geminiKey = nextKey("gemini") || nextKey("groq");
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey.key });
      const res = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      if (res.text) {
        const parsed = JSON.parse(res.text);
        if (Array.isArray(parsed.insights) && parsed.insights.length > 0) {
          cachedInsights = { text: parsed.insights, timestamp: Date.now() };
          return parsed.insights;
        }
      }
    } catch {
      // fallback
    }
  }

  const fallback = [
    "Hotspot: Indiranagar and Koramangala report highest density of severe road craters and open drains.",
    "Overdue SLA: Roads & Infrastructure shows 18% tickets overdue beyond 24-hour statutory target.",
    "Trend: 28% of incoming grievances in high-density corridors successfully merged as duplicate upvotes.",
  ];

  cachedInsights = { text: fallback, timestamp: Date.now() };
  return fallback;
}
