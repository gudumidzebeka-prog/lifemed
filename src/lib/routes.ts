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
] as const;

export const AUTH_ROUTES = ["/login", "/signup"] as const;

export function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number]);
}
