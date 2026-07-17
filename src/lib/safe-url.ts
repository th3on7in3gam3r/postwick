/**
 * Sanitize outbound URLs shown on the public feed.
 * Only http(s) — blocks javascript:, data:, etc.
 */

const BLOCKED_HOST_SUFFIXES = [".local", ".internal", ".localhost"];

function isPrivateOrLocalHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".localhost")
  ) {
    return true;
  }
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return true;
  }
  // Basic private IPv4 ranges
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}

export function safeHttpUrl(
  value: string | null | undefined,
  options?: { allowRelative?: boolean },
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (options?.allowRelative && trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    // Relative app paths / generated assets — only same-origin relative paths
    if (trimmed.includes("\\") || trimmed.includes("\0")) return null;
    return trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  if (isPrivateOrLocalHostname(parsed.hostname)) {
    return null;
  }

  return parsed.toString();
}

export function safeImageUrl(value: string | null | undefined): string | null {
  return safeHttpUrl(value, { allowRelative: true });
}
