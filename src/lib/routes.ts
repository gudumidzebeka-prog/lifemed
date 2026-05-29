export const PROTECTED_ROUTES = [
  "/dashboard",
  "/timeline",
  "/documents",
  "/categories",
  "/ai-assistant",
  "/share",
  "/family",
  "/profile",
  "/settings",
  "/emergency",
  "/appointments",
  "/trackers",
  "/conditions",
  "/insights",
  "/wellness",
  "/health-report",
] as const;

export const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"] as const;

export function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number]);
}
