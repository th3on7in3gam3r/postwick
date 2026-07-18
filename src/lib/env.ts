import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_KERYGMA_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().optional(),
});

export type EnvStatus = {
  databaseUrl: boolean;
  appUrl: boolean;
  kerygmaUrl: boolean;
  supportEmail: boolean;
  okForDb: boolean;
};

export function getEnvStatus(): EnvStatus {
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL || undefined,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
    NEXT_PUBLIC_KERYGMA_URL: process.env.NEXT_PUBLIC_KERYGMA_URL || undefined,
    NEXT_PUBLIC_SUPPORT_EMAIL:
      process.env.NEXT_PUBLIC_SUPPORT_EMAIL || undefined,
  });

  const data = parsed.success ? parsed.data : {};
  const databaseUrl = Boolean(data.DATABASE_URL ?? process.env.DATABASE_URL);
  const appUrl = Boolean(
    data.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  );
  const kerygmaUrl = Boolean(
    data.NEXT_PUBLIC_KERYGMA_URL ?? process.env.NEXT_PUBLIC_KERYGMA_URL,
  );
  const supportEmail = Boolean(
    data.NEXT_PUBLIC_SUPPORT_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  );

  return {
    databaseUrl,
    appUrl,
    kerygmaUrl,
    supportEmail,
    okForDb: databaseUrl,
  };
}

export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

/** Niche query param: trim and cap length. */
export function sanitizeNiche(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 64);
}

/** City query param: trim and cap length. */
export function sanitizeCity(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 80);
}

/** Search query: trim, cap length, strip ILIKE wildcards. */
export function sanitizeSearchQuery(
  value: string | null | undefined,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const cleaned = trimmed.replace(/[%_]/g, "").slice(0, 80).trim();
  return cleaned || undefined;
}

/** Normalize for fuzzy filter matching (case / punctuation insensitive). */
export function normalizeFilterKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[&+/]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Map a URL filter param to a canonical option from the known list.
 * Exact (case-insensitive) wins; otherwise unique substring / word match.
 */
export function resolveActiveFilter(
  param: string | null | undefined,
  options: string[],
): string | undefined {
  const raw = param?.trim();
  if (!raw || options.length === 0) return undefined;

  const key = normalizeFilterKey(raw);
  if (!key) return undefined;

  const exact = options.find((opt) => normalizeFilterKey(opt) === key);
  if (exact) return exact;

  const partial = options.filter((opt) => {
    const optKey = normalizeFilterKey(opt);
    return optKey.includes(key) || key.includes(optKey);
  });
  if (partial.length === 1) return partial[0];

  return undefined;
}
