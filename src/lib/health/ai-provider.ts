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

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

function normalizeHistory(history: ChatTurn[]) {
  const trimmed = history.slice(-16).filter((turn) => turn.content.trim());
  if (trimmed.length && trimmed[0].role === "assistant") {
    return trimmed.slice(1);
  }
  return trimmed;
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

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini ${params.model} HTTP ${res.status}: ${raw.slice(0, 300)}`);
  }

  const data = JSON.parse(raw) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    promptFeedback?: { blockReason?: string };
  };

  if (data.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked: ${data.promptFeedback.blockReason}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error(`Gemini ${params.model} returned empty text`);
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

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Groq ${params.model} HTTP ${res.status}: ${raw.slice(0, 300)}`);
  }

  const data = JSON.parse(raw) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error(`Groq ${params.model} returned empty text`);
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

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenAI HTTP ${res.status}: ${raw.slice(0, 300)}`);
  }

  const data = JSON.parse(raw) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI returned empty text");
  return text;
}

export async function testGeminiConnection() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return { ok: false as const, error: "GEMINI_API_KEY missing" };

  try {
    const text = await callGemini({
      apiKey,
      model: GEMINI_MODELS[0],
      systemPrompt: "Reply with exactly: OK",
      history: [],
      message: "ping",
    });
    return { ok: true as const, model: GEMINI_MODELS[0], sample: text.slice(0, 40) };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function generateAIResponse(params: {
  locale: Locale;
  message: string;
  history?: ChatTurn[];
  patientContext: string;
  medicalDisclaimer: string;
}): Promise<{ text: string; provider: AIProviderName }> {
  const history = normalizeHistory(params.history ?? []);
  const systemPrompt = buildSystemPrompt(params.locale, params.patientContext, params.medicalDisclaimer);
  const errors: string[] = [];

  const preferredGemini = process.env.GEMINI_MODEL?.trim();
  const geminiModels = preferredGemini
    ? [preferredGemini, ...GEMINI_MODELS.filter((model) => model !== preferredGemini)]
    : GEMINI_MODELS;

  const geminiKey = getGeminiApiKey();
  if (geminiKey) {
    for (const model of geminiModels) {
      try {
        const text = await callGemini({
          apiKey: geminiKey,
          model,
          systemPrompt,
          history,
          message: params.message,
        });
        return { text, provider: "gemini" };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(msg);
        console.error(`Gemini failed (${model}):`, msg);
      }
    }
  }

  const groqKey = getGroqApiKey();
  if (groqKey) {
    const preferredGroq = process.env.GROQ_MODEL?.trim();
    const groqModels = preferredGroq
      ? [preferredGroq, ...GROQ_MODELS.filter((model) => model !== preferredGroq)]
      : GROQ_MODELS;

    for (const model of groqModels) {
      try {
        const text = await callGroq({
          apiKey: groqKey,
          model,
          systemPrompt,
          history,
          message: params.message,
        });
        return { text, provider: "groq" };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(msg);
        console.error(`Groq failed (${model}):`, msg);
      }
    }
  }

  const openaiKey = getOpenAIApiKey();
  if (openaiKey) {
    try {
      const text = await callOpenAI({
        apiKey: openaiKey,
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        systemPrompt,
        history,
        message: params.message,
      });
      return { text, provider: "openai" };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(msg);
      console.error("OpenAI failed:", msg);
    }
  }

  throw new Error(errors.join(" | ") || "No AI provider configured");
}
