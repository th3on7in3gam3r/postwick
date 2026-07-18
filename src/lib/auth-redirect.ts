/**
 * Only allow same-app relative paths for post-auth redirects
 * (blocks open redirects to external hosts).
 */
export function safeAuthRedirectPath(
  value: string | string[] | undefined | null,
  fallback = "/studio",
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== "string") return fallback;

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("\0")) return fallback;
  // Block protocol-relative / scheme injection via encoded tricks
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return fallback;

  return trimmed;
}

export function signInRedirectUrl(reqUrl: string, returnPath: string) {
  const signIn = new URL("/sign-in", reqUrl);
  signIn.searchParams.set("redirect_url", returnPath);
  return signIn;
}
