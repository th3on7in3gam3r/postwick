"use client";

import { SignOutButton } from "@clerk/nextjs";
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
    <div className="space-y-6">
      <section className="rounded-3xl border border-ink/8 bg-white/75 p-8 shadow-soft backdrop-blur-sm">
        <h2 className="font-display text-2xl text-ink">Link your Kerygma brand</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate">
          Studio is for brand owners only. Enter a one-time claim code from
          Kerygma to unlock editing shared posts and your display username.
        </p>

        <ol className="mt-5 max-w-lg space-y-2 text-sm text-slate">
          <li>
            <span className="font-medium text-ink">1.</span> In Kerygma, open
            Settings → Integrations → Postwick
          </li>
          <li>
            <span className="font-medium text-ink">2.</span> Generate a Postwick
            claim code and copy it
          </li>
          <li>
            <span className="font-medium text-ink">3.</span> Paste it below to
            link this account
          </li>
        </ol>

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

      <aside className="rounded-2xl border border-dashed border-ink/15 bg-white/50 px-5 py-4 text-sm text-slate">
        <p>
          Already linked this brand on a different Postwick login?{" "}
          <SignOutButton redirectUrl="/sign-in?redirect_url=/studio">
            <button
              type="button"
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Switch accounts
            </button>
          </SignOutButton>{" "}
          and sign in with the Clerk account that redeemed the claim code.
        </p>
      </aside>
    </div>
  );
}
