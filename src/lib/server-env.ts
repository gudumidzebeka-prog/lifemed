export type AIProviderName = "gemini" | "groq" | "openai";

function cleanEnv(value: string | undefined) {
  if (!value) return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function isValidKey(value: string | undefined, placeholders: string[]) {
  const key = cleanEnv(value);
  if (!key) return false;
  const lower = key.toLowerCase();
  return !placeholders.some((p) => lower.includes(p));
}

export function isServiceRoleConfigured() {
  return isValidKey(process.env.SUPABASE_SERVICE_ROLE_KEY, ["your-service-role"]);
}

export function getGeminiApiKey() {
  const key = cleanEnv(process.env.GEMINI_API_KEY);
  return isValidKey(key, ["your-gemini", "paste"]) ? key : "";
}

export function getGroqApiKey() {
  const key = cleanEnv(process.env.GROQ_API_KEY);
  return isValidKey(key, ["your-groq", "paste"]) ? key : "";
}

export function getOpenAIApiKey() {
  const key = cleanEnv(process.env.OPENAI_API_KEY);
  return isValidKey(key, ["your-openai", "paste"]) ? key : "";
}

export function isGeminiConfigured() {
  return Boolean(getGeminiApiKey());
}

export function isGroqConfigured() {
  return Boolean(getGroqApiKey());
}

export function isOpenAIConfigured() {
  return Boolean(getOpenAIApiKey());
}

export function isAIConfigured() {
  return isGeminiConfigured() || isGroqConfigured() || isOpenAIConfigured();
}

export function getAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return raw.trim().replace(/\/+$/, "");
}
