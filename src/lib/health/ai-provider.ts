import type { Locale } from "@/lib/i18n";
import {
  getGeminiApiKey,
  getGroqApiKey,
  getOpenAIApiKey,
  type AIProviderName,
} from "@/lib/server-env";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const LOCALE_LANGUAGE: Record<Locale, string> = {
  ka: "Georgian",
  ru: "Russian",
  en: "English",
};

function cleanEnvKey(value: string | undefined) {
  if (!value) return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

export function resolveAIProvider(): { provider: AIProviderName; model: string } | null {
  const gemini = getGeminiApiKey();
  if (gemini) {
    return { provider: "gemini", model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash" };
  }

  const groq = getGroqApiKey();
  if (groq) {
    return { provider: "groq", model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile" };
  }

  const openai = getOpenAIApiKey();
  if (openai) {
    return { provider: "openai", model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini" };
  }

  return null;
}

function buildSystemPrompt(locale: Locale, patientContext: string, medicalDisclaimer: string) {
  const language = LOCALE_LANGUAGE[locale];

  return `You are LifeMed AI — a warm, knowledgeable health companion (similar in tone to ChatGPT).

Rules:
- Always respond in ${language}, unless the user clearly writes in another language.
- Be conversational, clear, and helpful — not robotic or template-like.
- Use the patient's health records below when relevant; if data is missing, say so honestly and guide them to add records in LifeMed.
- Explain medical terms in plain language. Use short paragraphs and bullet lists when helpful.
- You may answer general health education questions, summarize records, suggest questions for a doctor, and help organize health information.
- NEVER diagnose, prescribe, or tell the user to stop/start medication. Encourage seeing a qualified clinician for medical decisions.
- If unsure, say you are not sure and recommend professional care.

${medicalDisclaimer}

Patient records (JSON):
${patientContext}`;
}

async function callGemini(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  history: ChatTurn[];
  message: string;
}) {
  const contents = [
    ...params.history.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    })),
    { role: "user", parts: [{ text: params.message }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(params.model)}:generateContent?key=${encodeURIComponent(params.apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: params.systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
          topP: 0.95,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

async function callGroq(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  history: ChatTurn[];
  message: string;
}) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: "system", content: params.systemPrompt },
        ...params.history.map((turn) => ({ role: turn.role, content: turn.content })),
        { role: "user", content: params.message },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq returned an empty response");
  return text;
}

async function callOpenAI(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  history: ChatTurn[];
  message: string;
}) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: "system", content: params.systemPrompt },
        ...params.history.map((turn) => ({ role: turn.role, content: turn.content })),
        { role: "user", content: params.message },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI returned an empty response");
  return text;
}

export async function generateAIResponse(params: {
  locale: Locale;
  message: string;
  history?: ChatTurn[];
  patientContext: string;
  medicalDisclaimer: string;
}): Promise<{ text: string; provider: AIProviderName } | null> {
  const resolved = resolveAIProvider();
  if (!resolved) return null;

  const history = (params.history ?? []).slice(-16);
  const systemPrompt = buildSystemPrompt(params.locale, params.patientContext, params.medicalDisclaimer);

  const geminiKey = getGeminiApiKey();
  const groqKey = getGroqApiKey();
  const openaiKey = getOpenAIApiKey();

  if (resolved.provider === "gemini" && geminiKey) {
    const text = await callGemini({
      apiKey: geminiKey,
      model: resolved.model,
      systemPrompt,
      history,
      message: params.message,
    });
    return { text, provider: "gemini" };
  }

  if (resolved.provider === "groq" && groqKey) {
    const text = await callGroq({
      apiKey: groqKey,
      model: resolved.model,
      systemPrompt,
      history,
      message: params.message,
    });
    return { text, provider: "groq" };
  }

  if (resolved.provider === "openai" && openaiKey) {
    const text = await callOpenAI({
      apiKey: openaiKey,
      model: resolved.model,
      systemPrompt,
      history,
      message: params.message,
    });
    return { text, provider: "openai" };
  }

  return null;
}

export function isPlaceholderKey(value: string) {
  const normalized = cleanEnvKey(value).toLowerCase();
  return (
    !normalized ||
    normalized.includes("your-") ||
    normalized.includes("paste_") ||
    normalized.includes("example")
  );
}
