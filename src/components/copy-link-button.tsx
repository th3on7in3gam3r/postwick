"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

export function CopyLinkButton({
  url,
  label = "Copy link",
  className,
  variant = "button",
}: {
  url: string;
  label?: string;
  className?: string;
  variant?: "button" | "text";
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  const defaultClass =
    variant === "text"
      ? "text-xs font-medium text-slate/80 underline-offset-2 transition hover:text-ink hover:underline"
      : "inline-flex items-center gap-2 rounded-full border border-ink/15 bg-fog px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30";

  return (
    <button type="button" onClick={onCopy} className={className ?? defaultClass}>
      {variant === "button" ? (
        <>
          {copied ? (
            <Check className="h-4 w-4 text-accent" aria-hidden />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden />
          )}
          {copied ? "Copied" : label}
        </>
      ) : (
        <>{copied ? "Copied" : label}</>
      )}
    </button>
  );
}
