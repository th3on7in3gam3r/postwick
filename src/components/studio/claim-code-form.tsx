"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClaimCodeForm({ kerygmaUrl }: { kerygmaUrl: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/studio/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not redeem claim code.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not redeem claim code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-ink/8 bg-white/80 p-8 shadow-soft">
      <h2 className="font-display text-2xl text-ink">Enter your claim code</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate">
        Generate a one-time code in Kerygma → Settings → Integrations → Postwick,
        then paste it here to link your brands.
      </p>
      <form onSubmit={onSubmit} className="mt-6 flex max-w-md flex-col gap-3">
        <label className="text-xs font-medium uppercase tracking-wide text-slate">
          Claim code
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="ABCD2345"
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-fog px-4 py-3 font-mono text-sm tracking-widest text-ink outline-none focus:border-accent"
            required
            minLength={6}
            maxLength={16}
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-fog transition hover:bg-ink/90 disabled:opacity-60"
        >
          {loading ? "Linking…" : "Link account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate">
        Need a code?{" "}
        <a
          href={`${kerygmaUrl}/settings/integrations`}
          className="font-medium text-ink underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Kerygma integrations
        </a>
      </p>
    </section>
  );
}
