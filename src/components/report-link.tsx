"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReportLink({
  href,
  className,
  variant = "text",
}: {
  href: string;
  className?: string;
  variant?: "text" | "button";
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "opening">("idle");

  const defaultClass =
    variant === "button"
      ? "inline-flex items-center rounded-full border border-ink/15 bg-fog px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30"
      : "text-xs font-medium text-slate/80 underline-offset-2 transition hover:text-ink hover:underline";

  return (
    <button
      type="button"
      className={className ?? defaultClass}
      disabled={status === "opening"}
      onClick={() => {
        if (
          !window.confirm(
            "Report this post for review? You’ll open a short form next.",
          )
        ) {
          return;
        }
        setStatus("opening");
        router.push(href);
      }}
    >
      {status === "opening" ? "Opening report…" : "Report"}
    </button>
  );
}
