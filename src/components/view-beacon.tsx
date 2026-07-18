"use client";

import { useEffect } from "react";

export function ViewBeacon({
  brandSlug,
  postId,
  path,
}: {
  brandSlug?: string;
  postId?: string;
  path: string;
}) {
  useEffect(() => {
    const body = JSON.stringify({
      brandSlug: brandSlug || undefined,
      postId: postId || undefined,
      path,
    });
    const blob = new Blob([body], { type: "application/json" });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/view", blob);
      return;
    }
    void fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  }, [brandSlug, postId, path]);

  return null;
}
