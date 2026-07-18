"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { kerygmaUrl } from "@/lib/brand";

export function AddBrandClaimForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const response = await fetch("/api/studio/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await response.json()) as {
        error?: string;
        addedBrands?: string[];
      };
      if (!response.ok) {
        setError(data.error || "Could not redeem claim code.");
        return;
      }
      const added = data.addedBrands?.length ?? 0;
      setMessage(
        added > 0
          ? `Added ${added} brand${added === 1 ? "" : "s"} to this Studio account.`
          : "Brand linked.",
      );
      setCode("");
      router.refresh();
    } catch {
      setError("Could not redeem claim code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 border-t border-ink/5 pt-5">
      <h3 className="text-sm font-medium text-ink">Add another brand</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate">
        Generate a claim code for the other brand in Kerygma Integrations, then
        paste it here to merge it into this Studio account.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-3 flex max-w-md flex-wrap items-end gap-2"
      >
        <label className="min-w-[10rem] flex-1 text-xs font-medium uppercase tracking-wide text-slate">
          Claim code
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="ABCD2345"
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-fog px-3 py-2 font-mono text-sm tracking-widest text-ink outline-none focus:border-accent"
            required
            minLength={6}
            maxLength={16}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-fog disabled:opacity-60"
        >
          {loading ? "Adding…" : "Add brand"}
        </button>
      </form>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-2 text-sm text-accent" role="status">
          {message}
        </p>
      ) : null}
      <a
        href={`${kerygmaUrl()}/settings/integrations`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex text-xs font-medium text-ink underline-offset-2 hover:underline"
      >
        Open Kerygma integrations
      </a>
    </div>
  );
}
