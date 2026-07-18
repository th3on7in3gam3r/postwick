import { createHash, randomBytes } from "node:crypto";

export const API_KEY_PREFIX = "pw_live_";

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(): {
  rawKey: string;
  keyPrefix: string;
  keyHash: string;
} {
  const secret = randomBytes(24).toString("base64url");
  const rawKey = `${API_KEY_PREFIX}${secret}`;
  return {
    rawKey,
    keyPrefix: rawKey.slice(0, 16),
    keyHash: hashApiKey(rawKey),
  };
}

export function extractApiKeyFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (token) return token;
  }

  const headerKey =
    req.headers.get("x-api-key")?.trim() ||
    req.headers.get("x-postwick-api-key")?.trim();
  return headerKey || null;
}

export function isPostwickApiKeyFormat(value: string): boolean {
  return (
    value.startsWith(API_KEY_PREFIX) &&
    value.length > API_KEY_PREFIX.length + 16
  );
}
