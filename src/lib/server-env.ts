export function isServiceRoleConfigured() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(key && !key.includes("your-service-role"));
}

export function isOpenAIConfigured() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && !key.includes("your-openai"));
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
