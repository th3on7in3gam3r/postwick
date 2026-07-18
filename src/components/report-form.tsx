"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supportEmail } from "@/lib/brand";

export function ReportForm() {
  const searchParams = useSearchParams();
  const [postUrl, setPostUrl] = useState(searchParams.get("url") ?? "");
  const [brandSlug, setBrandSlug] = useState(searchParams.get("slug") ?? "");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "opening">("idle");

  const mailtoHref = useMemo(() => {
    const to = supportEmail();
    const subject = encodeURIComponent("Postwick content report");
    const body = encodeURIComponent(
      [
        "I would like to report content on Postwick.",
        "",
        `Post URL: ${postUrl.trim() || "(not provided)"}`,
        `Brand slug: ${brandSlug.trim() || "(not provided)"}`,
        "",
        "Reason:",
        reason.trim() || "(not provided)",
      ].join("\n"),
    );
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }, [postUrl, brandSlug, reason]);

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setStatus("opening");
        window.location.href = mailtoHref;
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Post or page URL</span>
        <input
          type="url"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          placeholder="https://…/b/brand-slug"
          className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none ring-accent focus:ring-2"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Brand slug (optional)</span>
        <input
          type="text"
          value={brandSlug}
          onChange={(e) => setBrandSlug(e.target.value)}
          placeholder="brand-name-abcd1234"
          className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none ring-accent focus:ring-2"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Reason</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          required
          placeholder="Why should this be reviewed or removed?"
          className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none ring-accent focus:ring-2"
        />
      </label>
      <button
        type="submit"
        disabled={status === "opening"}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-fog transition hover:bg-ink/90 disabled:opacity-60"
      >
        {status === "opening" ? "Opening email…" : "Open email to report"}
      </button>
      {status === "opening" ? (
        <p className="text-sm font-medium text-accent" role="status">
          Opening your email app to finish the report…
        </p>
      ) : null}
      <p className="text-xs text-slate">
        Opens your mail app to{" "}
        <a
          href={`mailto:${supportEmail()}`}
          className="underline-offset-2 hover:underline"
        >
          {supportEmail()}
        </a>
        . Brand owners can also unshare posts from Kerygma History.
      </p>
      <p className="pt-2 text-sm">
        <Link href="/" className="text-ink underline-offset-2 hover:underline">
          ← Feed
        </Link>
      </p>
    </form>
  );
}
