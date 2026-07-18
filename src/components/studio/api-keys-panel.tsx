"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, Loader2, Trash2 } from "lucide-react";
import { cadenceSettingsUrl } from "@/lib/brand";
import { cn } from "@/lib/utils";

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/studio/api-keys");
      const data = (await response.json()) as {
        error?: string;
        keys?: ApiKeyRow[];
      };
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to load keys",
        );
      }
      setKeys(Array.isArray(data.keys) ? data.keys : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  async function createKey() {
    setCreating(true);
    setError(null);
    setCopied(false);
    try {
      const response = await fetch("/api/studio/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Cadence" }),
      });
      const data = (await response.json()) as {
        error?: string;
        rawKey?: string;
        notice?: string;
      };
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not create API key",
        );
      }
      setRawKey(typeof data.rawKey === "string" ? data.rawKey : null);
      setNotice(
        typeof data.notice === "string"
          ? data.notice
          : "Copy this key now — it won’t be shown again.",
      );
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create API key");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(keyId: string) {
    if (!window.confirm("Revoke this API key? Cadence will stop using it.")) {
      return;
    }
    setError(null);
    try {
      const response = await fetch("/api/studio/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not revoke key",
        );
      }
      if (rawKey) setRawKey(null);
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke key");
    }
  }

  async function copyRawKey() {
    if (!rawKey) return;
    try {
      await navigator.clipboard.writeText(rawKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this API key", rawKey);
    }
  }

  return (
    <section className="rounded-3xl border border-ink/8 bg-white/75 p-6 shadow-soft backdrop-blur-sm md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">API keys</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate">
            Generate a key to paste into Cadence → Settings → Growth stack API
            keys → Postwick.
          </p>
        </div>
        <button
          type="button"
          disabled={creating || loading}
          onClick={() => void createKey()}
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-fog px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30 disabled:opacity-60"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <KeyRound className="h-4 w-4" aria-hidden />
          )}
          Create key
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <p className="text-sm text-slate">
          Keys start with{" "}
          <code className="rounded bg-fog px-1.5 py-0.5 text-xs text-ink">
            pw_live_
          </code>
          . Paste the full key into{" "}
          <a
            href={cadenceSettingsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline-offset-2 hover:underline"
          >
            Cadence Settings
          </a>
          .
        </p>

        {rawKey ? (
          <div className="rounded-2xl border border-accent/25 bg-accent-soft/40 p-4">
            <p className="text-sm font-medium text-ink">Your new API key</p>
            {notice ? (
              <p className="mt-1 text-xs text-slate">{notice}</p>
            ) : null}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="block min-w-0 flex-1 truncate rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs text-ink">
                {rawKey}
              </code>
              <button
                type="button"
                onClick={() => void copyRawKey()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-fog"
              >
                <Copy className="h-4 w-4" aria-hidden />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-slate">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading
            keys…
          </p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-slate">
            No active keys yet. Create one for Cadence.
          </p>
        ) : (
          <ul className="space-y-2">
            {keys.map((key) => (
              <li
                key={key.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-fog/50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {key.name}{" "}
                    <span className="font-normal text-slate">
                      · {key.keyPrefix}…
                    </span>
                  </p>
                  <p className="text-xs text-slate">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsedAt
                      ? ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                      : " · Never used"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void revokeKey(key.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium",
                    "text-red-700 transition hover:bg-red-50",
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
